# backend/api/notion_api.py
import os
import requests
from dotenv import load_dotenv


def upload_to_notion(title: str, content: str):
    load_dotenv()
    token = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")

    if not token or not database_id:
        return False

    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }

    paragraphs = content.split('\n\n')
    children_blocks = []

    for p in paragraphs:
        if p.strip():
            children_blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": p[:2000]}}]
                }
            })

    data = {
        "parent": {"database_id": database_id},
        "properties": {
            "이름": {
                "title": [{"text": {"content": title}}]
            }
        },
        "children": children_blocks[:100]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[ERROR] 노션 업로드 실패: {e}")
        return False