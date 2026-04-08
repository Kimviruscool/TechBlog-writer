# discord api

import os
import requests
from dotenv import load_dotenv

def send_discord_alert(message):
    load_dotenv()
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if webhook_url:
        requests.post(webhook_url, json={"content": message})