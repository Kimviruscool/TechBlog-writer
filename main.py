# main.py
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

# 파이프라인 컨트롤러 불러오기
from backend.controller import execute_blog_automation

# FastAPI 호출 및 타이틀 제목 설정
app = FastAPI(title="TechBlog-Writer")

# 정적 파일 경로
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# 요청 데이터를 받을 모델
class BlogRequest(BaseModel):
    topic: str

# 웹페이지 매핑
@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 블로그 생성 API 엔드포인트
@app.post("/api/generate")
async def generate_blog_api(request: BlogRequest):
    result = execute_blog_automation(request.topic)
    if result["status"] == "success":
        return {"message": "포스팅 완료", "topic": result["topic"]}
    else:
        return {"message": "포스팅 실패", "error": result.get("message")}

# 초기화 및 실행
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)