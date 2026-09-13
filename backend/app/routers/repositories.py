from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.schemas.repository import RepositoryCreate, RepositoryResponse, GitHubRepoInfo
from app.core.security import get_current_user
from app.services.github_service import search_repositories, get_repository_info, get_my_repositories
from app.services.analysis_service import analyze_repository
from app.schemas.analysis import AnalysisResponse

router = APIRouter(prefix="/api/repos", tags=["Repositories"])

@router.get("/search", response_model=List[GitHubRepoInfo])
async def search_repos(q: str, current_user: User = Depends(get_current_user)):
    results = search_repositories(current_user.github_token, q)
    return results

@router.get("/mine", response_model=List[GitHubRepoInfo])
async def get_my_repos(current_user: User = Depends(get_current_user)):
    if current_user.github_id == 0:
        return [
            {"full_name": "demo_user/demo-project", "name": "demo-project", "owner_name": "demo_user", "description": "Demo project", "language": "Python", "stars": 10, "forks": 2, "url": "https://github.com/demo_user/demo-project", "default_branch": "main", "open_issues": 0},
            {"full_name": "demo_user/react-app", "name": "react-app", "owner_name": "demo_user", "description": "Frontend react demo", "language": "JavaScript", "stars": 5, "forks": 1, "url": "https://github.com/demo_user/react-app", "default_branch": "main", "open_issues": 1}
        ]
    results = get_my_repositories(current_user.github_token)
    return results

@router.post("/", response_model=RepositoryResponse)
async def add_repository(repo_in: RepositoryCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).where(
        Repository.full_name == repo_in.full_name,
        Repository.user_id == current_user.id
    ))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
        
    try:
        repo_info = get_repository_info(current_user.github_token, repo_in.full_name)
    except HTTPException:
        if current_user.github_id == 0:  # Demo user fallback
            repo_info = {
                "full_name": repo_in.full_name,
                "name": repo_in.full_name.split("/")[-1],
                "owner_name": repo_in.full_name.split("/")[0],
                "description": "Demo repository",
                "language": "Python",
                "stars": 100,
                "forks": 20,
                "url": f"https://github.com/{repo_in.full_name}",
                "default_branch": "main",
                "open_issues": 5
            }
        else:
            raise
    
    new_repo = Repository(
        full_name=repo_info["full_name"],
        name=repo_info["name"],
        owner_name=repo_info["owner_name"],
        description=repo_info.get("description"),
        language=repo_info.get("language"),
        stars=repo_info.get("stars", 0),
        forks=repo_info.get("forks", 0),
        open_issues=repo_info.get("open_issues", 0),
        url=repo_info["url"],
        default_branch=repo_info.get("default_branch", "main"),
        user_id=current_user.id
    )
    db.add(new_repo)
    await db.commit()
    await db.refresh(new_repo)
    return new_repo

@router.get("/", response_model=List[RepositoryResponse])
async def list_repositories(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).where(Repository.user_id == current_user.id))
    return result.scalars().all()

@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo

@router.delete("/{repo_id}")
async def delete_repository(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    await db.delete(repo)
    await db.commit()
    return {"status": "deleted"}

@router.post("/{repo_id}/analyze", response_model=AnalysisResponse)
async def analyze_repo(repo_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository).where(Repository.id == repo_id, Repository.user_id == current_user.id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    analysis = await analyze_repository(db, repo.id, current_user.github_token)
    return analysis
