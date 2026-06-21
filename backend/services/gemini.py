import os
import json
import re
from google import genai
from google.genai import types

MODEL_NAME = "gemini-2.5-flash"

EXTRACTION_PROMPT = """You are an order extraction assistant for a small business. Given a WhatsApp chat or message, extract ALL order-related information.

This includes:
- New orders being placed
- Add-ons to an existing order (e.g. "also add X", "tambah Y lagi", "can I also get Z", "plus 1 more", "and also")
- Replacements / changes to an existing order (e.g. "change to X", "actually I want Y instead", "replace with", "tukar")
- Price or amount corrections (e.g. "the total is RM25")
- Payment claims (e.g. "I already paid", "dah bayar", "payment done", "I transferred", "dah transfer")
- Additional notes or delivery instructions

Return ONLY a valid JSON array. Each object must have:
- customer_name (string — use the sender name if only one person is speaking)
- item (string — the item name/description being ordered, added, or changed; null if the message is only about payment or notes)
- item_action (string — MUST be one of:
    "new"     → first-time order, no previous order mentioned
    "add"     → customer is adding on top of an existing order
    "replace" → customer is changing/replacing their existing order
    null      → no item mentioned in this message)
- amount (number or null if unknown or not mentioned)
- paid (true if the customer explicitly claims they have already paid, false if clearly unpaid, null if unclear or not mentioned)
- notes (string — delivery date, special requests, address, or any other context; null if none)

Rules for item_action:
- Use "add" for: "also", "tambah", "add on", "plus", "and also", "boleh tambah", "extra"
- Use "replace" for: "change", "tukar", "actually", "instead", "replace", "cancel that, I want"
- Use "new" when there is no indication this relates to a prior order
- If item is null, item_action must also be null

Other rules:
- Only set paid=true if the customer is explicitly claiming they have already paid.
- Do not invent amounts — use null if price is not stated.
- If no order-related information is found, return an empty array [].
- Do not include any explanation, only the JSON array.

Chat:
{chat_text}"""


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def _clean_json(text: str) -> list:
    """Extract JSON array from Gemini response, robust to preamble/postamble text."""
    match = re.search(r'\[.*\]', text.strip(), re.DOTALL)
    if not match:
        return []
    return json.loads(match.group())


def extract_orders_from_text(chat_text: str) -> list:
    """Call Gemini to extract orders from raw chat text."""
    client = _get_client()
    prompt = EXTRACTION_PROMPT.format(chat_text=chat_text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )
    return _clean_json(response.text)


def extract_orders_from_audio(audio_bytes: bytes, mime_type: str = "audio/ogg") -> list:
    """Call Gemini with an audio blob to transcribe and extract orders."""
    client = _get_client()
    audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)
    prompt_text = (
        "You are an order extraction assistant for a small business. "
        "This is a WhatsApp voice note. Transcribe the audio and extract all order-related information, "
        "including new orders, add-ons to existing orders, replacements, payment claims, and delivery notes. "
        "Return ONLY a valid JSON array where each object has: "
        "customer_name (string), "
        "item (string or null if only a payment claim), "
        "item_action (one of: 'new', 'add', 'replace', or null — "
        "use 'add' if customer says also/tambah/plus/extra, "
        "use 'replace' if customer says change/tukar/actually/instead, "
        "use 'new' for a fresh order, null if no item mentioned), "
        "amount (number or null), "
        "paid (true if customer explicitly claims they paid, false if clearly unpaid, null if unclear), "
        "notes (string or null). "
        "If no order-related information found, return []."
    )
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[prompt_text, audio_part],
    )
    return _clean_json(response.text)
