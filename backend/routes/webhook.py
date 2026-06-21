from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional
import httpx
import os
from ..db.database import get_db
from ..services.gemini import extract_orders_from_text, extract_orders_from_audio
from ..services.parser import save_extracted_orders, save_message

router = APIRouter()

BRIDGE_INTERNAL_URL = os.getenv("BRIDGE_INTERNAL_URL", "http://localhost:3001")


class WebhookTextPayload(BaseModel):
    sender: Optional[str] = "Unknown"
    message: str
    media_type: Optional[str] = "text"
    source: Literal["whatsapp", "simulator"] = "whatsapp"


@router.post("/webhook")
def receive_webhook(payload: WebhookTextPayload, db: Session = Depends(get_db)):
    """Receive a WhatsApp text message, extract orders, store everything."""
    msg = save_message(db, raw_content=payload.message, media_type=payload.media_type, source=payload.source)

    try:
        extracted = extract_orders_from_text(
            f"{payload.sender}: {payload.message}"
        )
    except Exception as e:
        return {"status": "stored", "message_id": msg.id, "gemini_error": str(e)}

    saved = save_extracted_orders(
        db, extracted, source_msg=payload.message[:500]
    )
    msg.processed = True
    db.commit()

    return {
        "status": "processed",
        "message_id": msg.id,
        "orders_extracted": len(saved),
        "orders": [
            {"id": o.id, "item": o.item, "amount": o.amount, "paid": o.paid}
            for o in saved
        ],
    }


@router.get("/whatsapp/status")
def whatsapp_status():
    """
    Proxy to the Baileys bridge status endpoint.
    Returns { connected: bool, phone: str|null }.
    Returns { connected: false, error: str } if the bridge is not running.
    """
    try:
        resp = httpx.get(f"{BRIDGE_INTERNAL_URL}/status", timeout=3.0)
        return resp.json()
    except Exception as e:
        return {"connected": False, "error": f"Bridge not running: {str(e)}"}


@router.get("/whatsapp/qr")
def whatsapp_qr():
    """Proxy to the Baileys bridge /qr endpoint."""
    try:
        resp = httpx.get(f"{BRIDGE_INTERNAL_URL}/qr", timeout=5.0)
        return resp.json()
    except Exception as e:
        return {"connected": False, "qr": None, "error": f"Bridge not running: {str(e)}"}


@router.post("/webhook/audio")
async def receive_audio_webhook(
    sender: str = Form("Unknown"),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Receive a WhatsApp audio message."""
    audio_bytes = await audio.read()
    mime_type = audio.content_type or "audio/ogg"

    msg = save_message(
        db,
        raw_content=f"[Audio from {sender}: {audio.filename}]",
        media_type="audio",
    )

    try:
        extracted = extract_orders_from_audio(audio_bytes, mime_type)
    except Exception as e:
        return {"status": "stored", "message_id": msg.id, "gemini_error": str(e)}

    saved = save_extracted_orders(db, extracted, source_msg=f"audio:{audio.filename}")
    msg.processed = True
    db.commit()

    return {
        "status": "processed",
        "message_id": msg.id,
        "orders_extracted": len(saved),
    }
