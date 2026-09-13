import json
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from sqlalchemy import select
from app.core.security import get_current_user
from app.services.report_service import generate_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/{repo_id}/generate")
async def generate_report_endpoint(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo_res = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    if not repo_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found")
    
    try:
        report = await generate_report(db, repo_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{repo_id}/download")
async def download_report(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo_res = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    if not repo_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found")
    
    try:
        report = await generate_report(db, repo_id)
        report_bytes = json.dumps(report, indent=2).encode('utf-8')
        
        return StreamingResponse(
            BytesIO(report_bytes),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=report_repo_{repo_id}.json"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
