# backend/preprocess.py
def clean_text(text: str) -> str:
    if not text:
        return ""
    # 필요에 따라 불필요한 마크다운 기호 제거 등 로직 추가
    cleaned_text = text.replace("--", "")
    return cleaned_text