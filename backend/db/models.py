from sqlalchemy import Column, Integer, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    phone = Column(Text, nullable=True)
    created_at = Column(Text, nullable=False)

    orders = relationship("Order", back_populates="customer")
    messages = relationship("Message", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    item = Column(Text, nullable=False)
    amount = Column(Float, nullable=True)
    paid = Column(Boolean, default=False)
    payment_claimed = Column(Boolean, default=False)
    status = Column(Text, default="pending")  # pending / confirmed / delivered
    notes = Column(Text, nullable=True)
    source_msg = Column(Text, nullable=True)
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=True)  # stamped on every upsert

    customer = relationship("Customer", back_populates="orders")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    raw_content = Column(Text, nullable=False)
    media_type = Column(Text, default="text")  # text / audio / image
    source = Column(Text, default="whatsapp")  # "whatsapp" | "simulator"
    processed = Column(Boolean, default=False)
    created_at = Column(Text, nullable=False)

    customer = relationship("Customer", back_populates="messages")
