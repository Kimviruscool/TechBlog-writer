# backend/api/claude_ai.py
import os
from anthropic import Anthropic
from dotenv import load_dotenv

# =====================================================
# 클라이언트 초기화
# =====================================================

def get_client() -> Anthropic:
    """Anthropic 클라이언트를 반환합니다."""
    load_dotenv()                                                    # .env 파일 로드
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("[ERROR] .env 파일에서 ANTHROPIC_API_KEY를 찾을 수 없습니다.")
    return Anthropic(api_key=api_key)

# =====================================================
# 블로그 글 2차 수정 (Claude Refine)
# =====================================================

def refine_blog_post(html_content: str, instructions: str = "") -> str:
    """
    Gemini가 작성한 HTML 블로그 글을 Claude가 2차 수정합니다.

    Args:
        html_content: Gemini가 생성한 HTML 형식의 블로그 글
        instructions: 사용자 추가 수정 지시사항 (선택)

    Returns:
        수정된 HTML 문자열, 실패 시 빈 문자열
    """
    client = get_client()

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
        message = client.messages.create(
            model="claude-opus-4-6",                                 # 사용 모델
            max_tokens=4096,                                         # 최대 토큰 수
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text                               # 텍스트 블록 반환
    except Exception as e:
        print(f"[ERROR] Claude 수정 실패: {e}")
        return ""