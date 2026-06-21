from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from db.database import get_db
from db.models import Customer, Order, Message

router = APIRouter()


def customer_summary(c: Customer) -> dict:
    total_orders = len(c.orders)
    total_spend = sum(o.amount or 0 for o in c.orders)
    outstanding = sum(o.amount or 0 for o in c.orders if not o.paid)
    last_order = max((o.created_at for o in c.orders), default=None)
    return {
        "id": c.id,
        "name": c.name,
        "phone": c.phone,
        "total_orders": total_orders,
        "total_spend": round(total_spend, 2),
        "outstanding": round(outstanding, 2),
        "last_order_at": last_order,
        "created_at": c.created_at,
    }


@router.get("/customers")
def list_customers(session_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer)
    if session_id:
        query = query.filter(Customer.session_id == session_id)
    return [customer_summary(c) for c in query.all()]


@router.get("/customers/{customer_id}")
def get_customer(customer_id: int, session_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer).filter(Customer.id == customer_id)
    if session_id:
        query = query.filter(Customer.session_id == session_id)
    c = query.first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    summary = customer_summary(c)
    summary["orders"] = [
        {
            "id": o.id,
            "item": o.item,
            "amount": o.amount,
            "paid": o.paid,
            "status": o.status,
            "notes": o.notes,
            "created_at": o.created_at,
        }
        for o in sorted(c.orders, key=lambda x: x.created_at, reverse=True)
    ]
    return summary


@router.get("/messages")
def list_messages(session_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Message)
    if session_id:
        query = query.filter(Message.session_id == session_id)
    msgs = query.order_by(Message.created_at.desc()).limit(50).all()
    return [
        {
            "id": m.id,
            "customer_id": m.customer_id,
            "raw_content": m.raw_content,
            "media_type": m.media_type,
            "source": m.source,
            "processed": m.processed,
            "created_at": m.created_at,
        }
        for m in msgs
    ]
