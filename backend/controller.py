# backend/controller.py
from backend.prompt import build_prompt
from backend.preprocess import clean_text
from backend.api.gemini import generate_blog_post
from backend.api.notion_api import upload_to_notion
from backend.api.discord_api import send_discord_alert


def execute_blog_automation(topic: str):
    """블로그 자동화 파이프라인 전체를 실행합니다."""
    print(f"[{topic}] 파이프라인 시작...")

    # 1. 프롬프트 생성
    prompt = build_prompt(topic)

    # 2. AI 글쓰기 (Gemini)
    print("AI 글 작성 중...")
    raw_content = generate_blog_post(prompt)
    if not raw_content:
        send_discord_alert(f"❌ '{topic}' AI 글쓰기 실패")
        return {"status": "error", "message": "AI generation failed"}

    # 3. 데이터 전처리
    clean_content = clean_text(raw_content)

    # 4. 블로그 (노션) 업로드
    print("노션 업로드 중...")
    upload_success = upload_to_notion(topic, clean_content)

    # 5. 디스코드 알림 및 결과 반환
    if upload_success:
        send_discord_alert(f"✅ TechBlog-Writer: '{topic}' 포스팅이 노션에 성공적으로 업로드되었습니다!")
        print("파이프라인 완료!")
        return {"status": "success", "topic": topic, "content": clean_content}  # content 반환 추가
    else:
        send_discord_alert(f"⚠️ TechBlog-Writer: '{topic}' 글쓰기는 완료되었으나 노션 업로드에 실패했습니다.")
        return {"status": "partial", "topic": topic, "content": clean_content}  # 업로드 실패여도 content 반환