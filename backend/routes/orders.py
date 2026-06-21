from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from ..db.database import get_db
from ..db.models import Order, Customer

router = APIRouter()


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    paid: Optional[bool] = None
    payment_claimed: Optional[bool] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


def order_to_dict(o: Order) -> dict:
    return {
        "id": o.id,
        "customer_id": o.customer_id,
        "customer_name": o.customer.name if o.customer else "Unknown",
        "customer_phone": o.customer.phone if o.customer else None,
        "item": o.item,
        "amount": o.amount,
        "paid": o.paid,
        "payment_claimed": o.payment_claimed,
        "status": o.status,
        "notes": o.notes,
        "source_msg": o.source_msg,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
    }


@router.get("/orders")
def list_orders(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    orders = query.order_by(Order.created_at.desc()).all()
    return [order_to_dict(o) for o in orders]


@router.patch("/orders/{order_id}")
def update_order(
    order_id: int, update: OrderUpdate, db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Reject nonsensical combination: reverting paid while simultaneously asserting a claim
    # skips the required Unpaid (State 1) intermediate and corrupts payment state
    if update.paid is False and update.payment_claimed is True:
        raise HTTPException(
            status_code=400,
            detail="Cannot claim payment while reverting paid status in the same request.",
        )
    if update.status is not None:
        order.status = update.status
    if update.payment_claimed is not None:
        order.payment_claimed = update.payment_claimed
    if update.paid is not None:
        order.paid = update.paid
        if update.paid:
            order.payment_claimed = False  # confirm paid: auto-clear claim
        else:
            order.payment_claimed = False  # revert paid: also clear claim, force State 1
    if update.amount is not None:
        order.amount = update.amount
    if update.notes is not None:
        order.notes = update.notes
    db.commit()
    db.refresh(order)
    return order_to_dict(order)
