# backend/api/claude_ai.py
# pip install ollama
import os
import ollama                                                         # Ollama 공식 Python 패키지
from dotenv import load_dotenv

# =====================================================
# Ollama 클라이언트 초기화
# =====================================================

def get_client() -> ollama.Client:
    """
    .env 에서 설정을 읽어 Ollama 클라이언트를 생성하고 반환합니다.

    .env 설정값:
        OLLAMA_HOST  : Ollama 서버 주소 (기본값: http://localhost:11434)
        OLLAMA_API_KEY: API 키 - 외부 호스팅 서비스 또는 인증이 필요한 경우 설정
    """
    load_dotenv()                                                    # .env 파일 로드

    host    = os.getenv("OLLAMA_HOST",    "http://localhost:11434") # 서버 주소
    api_key = os.getenv("OLLAMA_API_KEY", "")                       # API 키 (없으면 빈 문자열)

    # API 키가 있으면 Authorization 헤더에 포함하여 클라이언트 생성
    if api_key:
        client = ollama.Client(
            host=host,
            headers={"Authorization": f"Bearer {api_key}"},         # API 키 인증 헤더
        )
    else:
        client = ollama.Client(host=host)                           # 로컬 환경 (인증 없음)

    return client


def get_model() -> str:
    """
    .env 에서 사용할 모델명을 반환합니다.
    OLLAMA_MODEL 이 없으면 기본값 llama3 를 사용합니다.
    """
    load_dotenv()
    return os.getenv("OLLAMA_MODEL", "llama3")                      # 사용 모델명

# =====================================================
# 블로그 글 2차 수정 (Ollama Refine)
# =====================================================

def refine_blog_post(html_content: str, instructions: str = "") -> str:
    """
    Gemini가 작성한 HTML 블로그 글을 Ollama 모델이 2차 수정합니다.

    Args:
        html_content : Gemini가 생성한 HTML 형식의 블로그 글
        instructions : 사용자 추가 수정 지시사항 (선택)

    Returns:
        수정된 HTML 문자열, 실패 시 빈 문자열
    """
    client = get_client()                                            # 클라이언트 생성
    model  = get_model()                                             # 모델명 읽기

    extra = f"\n\n추가 수정 지시사항:\n{instructions}" if instructions.strip() else ""  # 추가 지시 삽입

    prompt = f"""당신은 IT 전문 에디터입니다.
아래는 Gemini AI가 작성한 HTML 형식의 기술 블로그 포스팅입니다.

다음 기준으로 글을 개선해 주세요:
1. 문장을 더 자연스럽고 유려하게 다듬을 것
2. 기술적 정확성을 높이고 불명확한 표현을 수정할 것
3. 제목과 소제목을 더 흥미롭게 바꿀 것
4. 불필요한 반복을 제거하고 핵심을 강조할 것
5. HTML 구조(<article>, <section>, <h1>, <h2>, <p>, <ul>, <li>)는 그대로 유지할 것
6. 순수 HTML만 출력할 것 (마크다운 코드블럭, 설명 텍스트 없이){extra}

원본 HTML:
{html_content}

수정된 HTML만 출력하세요:"""

    try:
        response = client.generate(                                  # Ollama generate API 호출
            model=model,                                             # 사용 모델
            prompt=prompt,                                           # 프롬프트 전달
        )
        return response.response                                     # 응답 텍스트 반환

    except ollama.ResponseError as e:
        print(f"[ERROR] Ollama 응답 오류 (status {e.status_code}): {e.error}")
        return ""
    except Exception as e:
        print(f"[ERROR] Ollama 호출 실패: {e}")
        return ""