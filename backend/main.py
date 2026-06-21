import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from .db.database import engine
from .db import models
from .routes import webhook, orders, customers

models.Base.metadata.create_all(bind=engine)

# Safe migrations: add columns to existing databases without data loss
def _safe_add_column(conn, sql: str):
    try:
        conn.execute(text(sql))
        conn.commit()
    except OperationalError as e:
        msg = str(e).lower()
        if "duplicate column name" not in msg and "already exists" not in msg:
            raise

with engine.connect() as conn:
    _safe_add_column(conn, "ALTER TABLE orders ADD COLUMN payment_claimed BOOLEAN DEFAULT 0")
    _safe_add_column(conn, "ALTER TABLE orders ADD COLUMN updated_at TEXT")

app = FastAPI(title="Invisible CRM API", version="1.0.0")

_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allow_origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router)
app.include_router(orders.router)
app.include_router(customers.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Invisible CRM API running"}
