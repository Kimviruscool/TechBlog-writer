# blog-api > notion-api 이름 및 메인 기능 변경

import os
import requests
from dotenv import load_dotenv


def upload_to_notion(title, content):
    load_dotenv()
    token = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    # 노션 페이지 생성 API 호출 로직 구성...
    pass