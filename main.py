# main.py
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# 파이프라인 컨트롤러 불러오기
from backend.controller import execute_blog_automation
from backend.api.claude_ai import refine_blog_post             # Claude 2차 수정 함수

# =====================================================
# FastAPI 앱 초기화
# =====================================================
app = FastAPI(title="TechBlog-Writer")

# 정적 파일 및 템플릿 경로 설정
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# =====================================================
# 요청 모델 정의
# =====================================================

class BlogRequest(BaseModel):
    """Gemini 블로그 생성 요청 모델"""
    topic: str                                                     # 블로그 주제
    notes: str = ""                                                # 추가 메모 (선택)

class RefineRequest(BaseModel):
    """Claude 2차 수정 요청 모델"""
    html_content: str                                              # 수정할 HTML 내용
    instructions: str = ""                                         # 추가 수정 지시사항 (선택)

# =====================================================
# 라우터 정의
# =====================================================

@app.get("/")
async def index(request: Request):
    """메인 대시보드 페이지를 반환합니다."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/generate")
async def generate_blog_api(request: BlogRequest):
    """
    Gemini를 통해 블로그 초안을 생성합니다.
    topic과 notes를 결합하여 파이프라인을 실행합니다.
    """
    full_topic = request.topic
    if request.notes.strip():                                      # 추가 메모가 있으면 주제에 합산
        full_topic = f"{request.topic}\n\n참고 사항: {request.notes}"

    result = execute_blog_automation(full_topic)

    if result["status"] in ("success", "partial"):
        return {
            "status":  result["status"],
            "message": "Gemini 초안 생성 완료",
            "topic":   request.topic,
            "content": result.get("content", ""),
        }
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": result.get("message", "알 수 없는 오류")},
    )


@app.post("/api/refine")
async def refine_blog_api(request: RefineRequest):
    """
    Claude를 통해 Gemini 초안을 2차 수정합니다.
    사용자가 편집한 HTML을 받아 Claude가 다듬어 반환합니다.
    """
    if not request.html_content.strip():                           # 빈 내용 방어 처리
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "수정할 내용이 없습니다."},
        )

    refined = refine_blog_post(request.html_content, request.instructions)

    if refined:
        return {
            "status":  "success",
            "message": "Claude 2차 수정 완료",
            "content": refined,
        }
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Claude 수정 중 오류가 발생했습니다."},
    )


# =====================================================
# 앱 실행
# =====================================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)