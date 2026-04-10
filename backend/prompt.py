# backend/prompt.py

def build_prompt(topic: str) -> str:
    """주제를 받아 Gemini에게 전달할 프롬프트를 생성합니다."""
    prompt = f"""
당신은 IT 전문 테크 블로거입니다.
다음 주제에 대해 독자들이 이해하기 쉽고 전문적인 기술 블로그 포스팅을 작성해 주세요.

주제: {topic}

조건:
1. 서론, 본론, 결론의 구조를 갖출 것
2. 핵심 내용은 강조할 것
3. 친절하고 가독성 좋은 문체를 사용할 것
4. 반드시 아래의 HTML 구조로만 출력할 것 (다른 텍스트, 마크다운 코드블럭 없이 순수 HTML만 출력)

출력 형식 (이 구조를 반드시 준수):
<article>
  <h1>제목</h1>
  <section>
    <h2>서론</h2>
    <p>내용...</p>
  </section>
  <section>
    <h2>본론</h2>
    <p>내용...</p>
    <ul>
      <li>항목</li>
    </ul>
  </section>
  <section>
    <h2>결론</h2>
    <p>내용...</p>
  </section>
</article>
"""
    return prompt