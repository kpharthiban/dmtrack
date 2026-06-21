"""
Simulator: sends realistic WhatsApp-style messages to the local webhook.
Run from the project root:  python -m backend.simulator.send_messages
"""
import time
import httpx
import os

BASE_URL = os.getenv("API_URL", "http://localhost:8000")
DELAY = 2  # seconds between messages

MESSAGES = [
    {
        "sender": "Auntie Rosnah",
        "message": "Hi kak, I want to order 2 dozen chocolate cupcakes for this Saturday. "
                   "How much ah? My daughter birthday.",
        "source": "simulator",
    },
    {
        "sender": "Puan Hafiza",
        "message": "Assalamualaikum, boleh tempah 1 tier vanilla sponge cake? "
                   "untuk RM 85. Nak pickup Jumaat petang.",
        "source": "simulator",
    },
    {
        "sender": "Auntie Rosnah",
        "message": "Ok kak I dah transfer RM 60 for the cupcakes. Please check.",
        "source": "simulator",
    },
    {
        "sender": "Encik Farid",
        "message": "Same as last time please. 3 dozen red velvet. Urgent, need by Sunday.",
        "source": "simulator",
    },
    {
        "sender": "Kak Mimi",
        "message": "Hi, nak order 2 biji marble cake RM 45 each. Dah bayar via maybank.",
        "source": "simulator",
    },
    {
        "sender": "Puan Hafiza",
        "message": "Kak, I change my mind - can add fresh strawberries on top? "
                   "Extra charge ok. Thank you!",
        "source": "simulator",
    },
    {
        "sender": "Uncle Raj",
        "message": "Order 50 pcs mini brownies for office event next Wednesday. "
                   "Budget around RM 80. Can?",
        "source": "simulator",
    },
    {
        "sender": "Auntie Rosnah",
        "message": "Kak cupcakes dah ready? I come pick up at 3pm today.",
        "source": "simulator",
    },
]


def main():
    print(f"Sending {len(MESSAGES)} simulated WhatsApp messages to {BASE_URL}/webhook")
    print("Press Ctrl+C to stop.\n")
    for i, msg in enumerate(MESSAGES, 1):
        try:
            resp = httpx.post(
                f"{BASE_URL}/webhook",
                json=msg,
                timeout=15,
            )
            data = resp.json()
            print(
                f"[{i}/{len(MESSAGES)}] {msg['sender']}: "
                f"status={data.get('status')} orders={data.get('orders_extracted', 0)}"
            )
        except Exception as e:
            print(f"[{i}] ERROR: {e}")
        time.sleep(DELAY)
    print("\nSimulation complete.")


if __name__ == "__main__":
    main()
