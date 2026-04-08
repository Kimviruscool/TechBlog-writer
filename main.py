from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from pydantic import BaseModel
from backend.controller import execute_blog_automation

#FastAPI 호출 및 타이틀 제목 설정
app = FastAPI(title="TechBlog-Writer")

# 정적 파일 경로
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

templates = Jinja2Templates(directory="frontend/templates")

#매핑
@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

class BlogRequest(BaseModel):
    topic: str

@app.post("/api/generate")
async def generate_blog(request: BlogRequest):
    # 컨트롤러의 자동화 파이프라인 실행
    result = execute_blog_automation(request.topic)
    return result

#초기화 및 실행
if __name__ == "__main__": #초기화
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)