from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db.models import Customer, Order, Message

# Statuses considered "active" — an existing order in these states will be
# updated instead of creating a new card.
ACTIVE_STATUSES = ("pending", "confirmed")


def get_or_create_customer(db: Session, name: str, phone: str = None) -> Customer:
    """Find existing customer by name (case-insensitive) or create new."""
    customer = db.query(Customer).filter(
        Customer.name.ilike(name.strip())
    ).first()
    if not customer:
        customer = Customer(
            name=name.strip(),
            phone=phone,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(customer)
        db.flush()
    elif phone and not customer.phone:
        # Back-fill phone if we now know it
        customer.phone = phone
    return customer


def _find_active_order(db: Session, customer_id: int) -> Order | None:
    """Return the most-recent non-delivered order for this customer, if any."""
    return (
        db.query(Order)
        .filter(
            Order.customer_id == customer_id,
            Order.status.in_(ACTIVE_STATUSES),
        )
        .order_by(Order.created_at.desc())
        .first()
    )


def save_extracted_orders(
    db: Session, extracted: list, source_msg: str = None
) -> list[Order]:
    """Upsert extracted orders.

    For each extracted item:
    - Find the customer (create if new).
    - Look for an existing active (pending/confirmed) order for that customer.
    - If found: update its fields with any non-null values from Gemini output
      and stamp updated_at.
    - If not found: create a new order.

    This ensures one live card per customer that keeps being updated as new
    WhatsApp messages arrive.
    """
    now = datetime.now(timezone.utc).isoformat()
    saved = []

    for item in extracted:
        customer = get_or_create_customer(
            db, item.get("customer_name", "Unknown")
        )

        existing = _find_active_order(db, customer.id)

        if existing:
            # ── Update existing card ──────────────────────────────────────────
            new_item        = item.get("item")
            new_item_action = item.get("item_action")  # "new" | "add" | "replace" | None
            new_amount      = item.get("amount")
            new_notes       = item.get("notes")
            new_paid        = item.get("paid")

            if new_item:
                if new_item_action == "add":
                    # Append the add-on to the existing item list
                    existing_items = existing.item or ""
                    if existing_items.strip():
                        existing.item = existing_items.rstrip(", ") + ", " + new_item
                    else:
                        existing.item = new_item
                else:
                    # "replace", "new", or no action — overwrite
                    existing.item = new_item

            if new_amount is not None:
                existing.amount = new_amount
            if new_notes:
                existing.notes = new_notes
            # Only auto-mark paid if Gemini is confident (True), never revert
            if new_paid is True and not existing.paid:
                existing.payment_claimed = True  # flag for staff to verify
            existing.source_msg = source_msg
            existing.updated_at = now
            saved.append(existing)
        else:
            # ── Create new card ───────────────────────────────────────────────
            new_paid = item.get("paid")
            order = Order(
                customer_id=customer.id,
                item=item.get("item", ""),
                amount=item.get("amount"),
                # If Gemini says paid, set payment_claimed so staff can verify
                payment_claimed=True if new_paid is True else False,
                paid=False,
                status="pending",
                notes=item.get("notes"),
                source_msg=source_msg,
                created_at=now,
                updated_at=now,
            )
            db.add(order)
            saved.append(order)

    db.commit()
    for o in saved:
        db.refresh(o)
    return saved


def save_message(
    db: Session,
    raw_content: str,
    media_type: str = "text",
    customer_id: int = None,
    source: str = "whatsapp",
) -> Message:
    msg = Message(
        customer_id=customer_id,
        raw_content=raw_content,
        media_type=media_type,
        source=source,
        processed=False,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
