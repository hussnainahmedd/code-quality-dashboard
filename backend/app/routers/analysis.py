from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.analysis import AnalysisResult
from app.models.repository import Repository
from app.models.user import User
from app.schemas.analysis import AnalysisResponse, AnalysisSummary, ComparisonResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

# Static routes MUST come before parameterized routes to avoid path conflicts

@router.get("/compare", response_model=ComparisonResponse)
async def compare_repos(repo1_id: int, repo2_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Compare latest analyses of two repositories side-by-side."""
    res1 = await _get_latest_for_repo(repo1_id, current_user, db)
    res2 = await _get_latest_for_repo(repo2_id, current_user, db)
    return ComparisonResponse(repo1=res1, repo2=res2)

@router.get("/detail/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(analysis_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get full details of a specific analysis run."""
    result = await db.execute(
        select(AnalysisResult)
        .join(Repository)
        .where(AnalysisResult.id == analysis_id, Repository.user_id == current_user.id)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.get("/{repo_id}/latest", response_model=AnalysisResponse)
async def get_latest_analysis(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get the most recent analysis for a repository."""
    return await _get_latest_for_repo(repo_id, current_user, db)

@router.get("/{repo_id}/history", response_model=List[AnalysisSummary])
async def get_analysis_history(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get all historical analyses for a repository."""
    repo_res = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    if not repo_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found")
        
    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.repository_id == repo_id)
        .order_by(AnalysisResult.created_at.desc())
    )
    return result.scalars().all()


async def _get_latest_for_repo(repo_id: int, current_user: User, db: AsyncSession) -> AnalysisResult:
    """Helper to fetch the latest analysis for a repo, with ownership check."""
    repo_res = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    if not repo_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found")

    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.repository_id == repo_id)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")
    return analysis
