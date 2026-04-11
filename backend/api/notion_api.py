# backend/api/notion_api.py
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv


def upload_to_notion(title: str, content: str) -> bool:
    """
    노션 DB에 블로그 글을 업로드합니다.

    노션 DB 컬럼 구조:
        내용  (title)  - 블로그 주제/제목
        번호  (number) - 자동 증가 번호 (Notion 자동 처리, 전송 불필요)
        날짜  (date)   - 작성 날짜 (오늘 날짜 자동 입력)
        주소  (rich_text or url) - 페이지 URL (생성 후 Notion이 부여)
    """
    load_dotenv()

    token       = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")

    # ── 환경변수 누락 체크 ──────────────────────────────
    if not token:
        print("[ERROR] .env 에 NOTION_API_KEY 가 없습니다.")
        return False
    if not database_id:
        print("[ERROR] .env 에 NOTION_DATABASE_ID 가 없습니다.")
        return False

    # ── 디버그: 실제 사용 중인 DB ID 출력 ─────────────────
    print(f"[INFO] 노션 업로드 시작 → DB ID: {database_id}")

    url     = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization":  f"Bearer {token}",
        "Content-Type":   "application/json",
        "Notion-Version": "2022-06-28",                              # Notion API 버전
    }

    # ── 본문 블록 생성 (2000자 제한 분할) ─────────────────
    children_blocks = _build_children_blocks(content)

    # ── 오늘 날짜 (ISO 8601) ───────────────────────────
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")         # 날짜 컬럼용

    # ── 노션 페이지 데이터 ─────────────────────────────
    data = {
        "parent": {"database_id": database_id},
        "properties": {
            "내용": {                                               # 제목 컬럼 (title 타입)
                "title": [
                    {"type": "text", "text": {"content": title}}
                ]
            },
            "날짜": {                                               # 날짜 컬럼 (date 타입)
                "date": {"start": today}
            },
            # 번호 컬럼: Notion formula/auto-number 이므로 직접 전송 불필요
            # 주소 컬럼: 페이지 생성 후 Notion이 자동 부여
        },
        "children": children_blocks,
    }

    # ── API 요청 ───────────────────────────────────────
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)

        # 실패 시 노션 응답 상세 출력
        if not response.ok:
            print(f"[ERROR] 노션 응답 코드: {response.status_code}")
            print(f"[ERROR] 노션 응답 내용: {response.text}")
            response.raise_for_status()

        page_url = response.json().get("url", "")                   # 생성된 페이지 URL
        print(f"[INFO] 노션 업로드 성공 → {page_url}")
        return True

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] 노션 HTTP 오류: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] 노션 업로드 실패: {e}")
        return False


def _build_children_blocks(content: str) -> list:
    """
    긴 텍스트를 Notion 단락 블록 리스트로 변환합니다.
    Notion 블록 하나당 최대 2000자 제한을 준수합니다.
    """
    blocks = []
    for paragraph in content.split("\n\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        # 2000자 초과 시 분할
        for i in range(0, len(paragraph), 2000):
            blocks.append({
                "object": "block",
                "type":   "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"type": "text", "text": {"content": paragraph[i:i+2000]}}
                    ]
                },
            })
    return blocks[:100]                                              # Notion 블록 최대 100개 제한