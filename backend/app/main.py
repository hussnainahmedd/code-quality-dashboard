from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, repositories, analysis, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Code Quality Dashboard API",
    description="Analyze GitHub repositories for code quality metrics",
    version="1.0.0",
    lifespan=lifespan
)

from app.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(repositories.router)
app.include_router(analysis.router)
app.include_router(reports.router)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
