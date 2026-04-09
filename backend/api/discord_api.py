# backend/api/discord_api.py
import os
import requests
from dotenv import load_dotenv


def send_discord_alert(message: str):
    load_dotenv()
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

    if not webhook_url:
        return False

    try:
        response = requests.post(webhook_url, json={"content": message})
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[ERROR] 디스코드 알림 전송 실패: {e}")
        return False