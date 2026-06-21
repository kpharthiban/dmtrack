from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional
import httpx
import os
from db.database import get_db
from services.gemini import extract_orders_from_text, extract_orders_from_audio
from services.parser import save_extracted_orders, save_message

router = APIRouter()

BRIDGE_INTERNAL_URL = os.getenv("BRIDGE_INTERNAL_URL", "http://localhost:3001")


class WebhookTextPayload(BaseModel):
    sender: Optional[str] = "Unknown"
    message: str
    media_type: Optional[str] = "text"
    source: Literal["whatsapp", "simulator"] = "whatsapp"
    session_id: Optional[str] = None


@router.post("/webhook")
def receive_webhook(payload: WebhookTextPayload, db: Session = Depends(get_db)):
    """Receive a WhatsApp text message, extract orders, store everything."""
    msg = save_message(db, raw_content=payload.message, media_type=payload.media_type, source=payload.source, session_id=payload.session_id)

    try:
        extracted = extract_orders_from_text(
            f"{payload.sender}: {payload.message}"
        )
    except Exception as e:
        return {"status": "stored", "message_id": msg.id, "gemini_error": str(e)}

    saved = save_extracted_orders(
        db, extracted, source_msg=payload.message[:500], session_id=payload.session_id
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
def whatsapp_status(session: Optional[str] = None):
    try:
        params = {"session": session} if session else {}
        resp = httpx.get(f"{BRIDGE_INTERNAL_URL}/status", params=params, timeout=3.0)
        return resp.json()
    except Exception as e:
        return {"connected": False, "error": f"Bridge not running: {str(e)}"}


@router.get("/whatsapp/qr")
def whatsapp_qr(session: Optional[str] = None):
    try:
        params = {"session": session} if session else {}
        resp = httpx.get(f"{BRIDGE_INTERNAL_URL}/qr", params=params, timeout=5.0)
        return resp.json()
    except Exception as e:
        return {"connected": False, "qr": None, "error": f"Bridge not running: {str(e)}"}


@router.post("/webhook/audio")
async def receive_audio_webhook(
    sender: str = Form("Unknown"),
    session_id: Optional[str] = Form(None),
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
        session_id=session_id,
    )

    try:
        extracted = extract_orders_from_audio(audio_bytes, mime_type)
    except Exception as e:
        return {"status": "stored", "message_id": msg.id, "gemini_error": str(e)}

    saved = save_extracted_orders(db, extracted, source_msg=f"audio:{audio.filename}", session_id=session_id)
    msg.processed = True
    db.commit()

    return {
        "status": "processed",
        "message_id": msg.id,
        "orders_extracted": len(saved),
    }
