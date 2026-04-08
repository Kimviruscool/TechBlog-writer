# backend/api/gemini.py
import os
from google import genai
from dotenv import load_dotenv

def get_client():
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("[ERROR] .env 파일에서 GEMINI_API_KEY를 찾을 수 없습니다.")
        return None
    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception as e:
        print(f"[Error] 클라이언트 생성 실패 {e}")
        return None

def generate_blog_post(prompt_text):
    client = get_client()
    if client:
        # 실제 제미나이 API 호출 로직
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_text,
        )
        return response.text
    return ""