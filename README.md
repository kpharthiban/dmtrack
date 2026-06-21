# Invisible CRM — WhatsApp-Native Order Brain

An AI agent that passively reads WhatsApp Business messages and auto-builds a structured order board, customer history, and payment tracker. Zero behavior change required from the vendor.

**Target users:** Home bakers, tailors, small traders managing 50-200 customers over WhatsApp.

---

## Demo Flows

### Flow 1 — Paste & Extract
1. Go to the **Paste & Extract** tab.
2. Paste a raw WhatsApp chat export (see `sample_data/sample_chat.txt`).
3. Click **Extract Orders**.
4. Gemini parses the chat → structured order board updates instantly.

### Flow 2 — Live Webhook Simulation
1. Start the backend (see below).
2. Run the simulator: `python -m backend.simulator.send_messages`
3. Watch the **Live Feed** tab update in real-time every 3 seconds.

---

## Quick Start

### 1. Set your Gemini API key

Edit `.env` in the project root:
```
GEMINI_API_KEY=your_actual_key_here
```
Get a free key at https://aistudio.google.com/apikey

### 2. Start the backend

```powershell
# From invisible-crm/ directory
.\start-backend.ps1
```

Or manually:
```powershell
$env:GEMINI_API_KEY = "your_key_here"
.\backend\venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Start the frontend

```powershell
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Run the simulator (optional)

In a third terminal:
```powershell
$env:GEMINI_API_KEY = "your_key_here"
.\backend\venv\Scripts\python.exe -m backend.simulator.send_messages
```

---

## Project Structure

```
invisible-crm/
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt
│   ├── venv/                     # Python virtual environment
│   ├── routes/
│   │   ├── webhook.py            # POST /webhook, POST /webhook/audio
│   │   ├── extract.py            # POST /extract
│   │   ├── orders.py             # GET /orders, PATCH /orders/{id}
│   │   └── customers.py         # GET /customers, GET /customers/{id}, GET /messages
│   ├── services/
│   │   ├── gemini.py             # Gemini 2.0 Flash client (text + audio)
│   │   └── parser.py             # DB persistence helpers
│   ├── db/
│   │   ├── database.py           # SQLite via SQLAlchemy
│   │   └── models.py             # Customer, Order, Message ORM models
│   └── simulator/
│       └── send_messages.py      # Sends realistic test messages
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api/client.js         # Axios API calls
│       └── components/
│           ├── OrderBoard.jsx    # Kanban: Pending / Confirmed / Delivered
│           ├── CustomerList.jsx  # Customer sidebar with spend summary
│           ├── PaymentTracker.jsx # Summary cards: Revenue, Collected, Outstanding
│           ├── PasteExtract.jsx  # Paste chat + extract button
│           └── LiveFeed.jsx      # Auto-polling message feed
├── sample_data/
│   └── sample_chat.txt           # Realistic WhatsApp chat for demo
├── .env                          # GEMINI_API_KEY goes here
└── start-backend.ps1             # PowerShell startup helper
```

---

## API Endpoints

| Method | Endpoint          | Description                                  |
|--------|-------------------|----------------------------------------------|
| POST   | /webhook          | Receive simulated WhatsApp text message      |
| POST   | /webhook/audio    | Receive simulated WhatsApp voice note        |
| POST   | /extract          | Paste chat text → extract & store orders     |
| GET    | /orders           | List all orders (filter by status/customer)  |
| PATCH  | /orders/{id}      | Update order status or payment               |
| GET    | /customers        | List customers with spend summary            |
| GET    | /customers/{id}   | Full order history for one customer          |
| GET    | /messages         | Last 50 incoming messages (for Live Feed)    |

---

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4 + Axios
- **Backend:** Python + FastAPI + SQLAlchemy
- **LLM:** Google Gemini 2.0 Flash (text + audio)
- **Database:** SQLite
