# backend/prompt.py
def build_prompt(topic: str) -> str:
    prompt = f"""
당신은 IT 전문 테크 블로거입니다.
다음 주제에 대해 독자들이 이해하기 쉽고 전문적인 기술 블로그 포스팅을 작성해 주세요.

주제: {topic}

조건:
1. 서론, 본론, 결론의 구조를 갖출 것
2. 핵심 내용은 강조할 것
3. 친절하고 가독성 좋은 문체를 사용할 것
"""
    return prompt