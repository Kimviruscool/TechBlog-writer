# gemini api

import os
from google import genai
from dotenv import load_dotenv

def get_client():
    # api 클라이언트 초기화 및 유효성 검사
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("[ERROR] .env 파일에서 GEMINI_API_KEY를 찾을 수 없습니다.")
        return None

    try :
        client = genai.GenaiClient(api_key=api_key)
        return client
    except Exception as e:
        print(f"[Error] 클라이언트 생성 실패 {e}")
        return None
