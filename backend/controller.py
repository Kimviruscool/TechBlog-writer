# JS DATA > controller

# backend/controller.py
from backend.api.gemini import generate_blog_post
from backend.api.notion_api import upload_to_notion
from backend.api.discord_api import send_discord_alert


# from backend.prompt import build_prompt
# from backend.preprocess import clean_text

def execute_blog_automation(topic):
    # 1. 프롬프트 생성 (prompt.py 활용)
    # prompt = build_prompt(topic)
    prompt = f"{topic}에 대한 기술 블로그 글을 작성해줘."

    # 2. AI 글쓰기 (gemini.py 호출)
    raw_content = generate_blog_post(prompt)

    # 3. 데이터 전처리 (preprocess.py 활용)
    # clean_content = clean_text(raw_content)
    clean_content = raw_content

    # 4. 블로그 업로드 (notion-api.py 호출)
    upload_success = upload_to_notion(topic, clean_content)

    # 5. 디스코드 알림 (discord-api.py 호출)
    if upload_success:
        send_discord_alert(f"✅ '{topic}' 블로그 포스팅이 완료되었습니다!")
    else:
        send_discord_alert(f"❌ '{topic}' 블로그 포스팅 실패.")

    return {"status": "success", "topic": topic}