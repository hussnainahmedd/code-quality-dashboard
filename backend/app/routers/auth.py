from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.config import settings
from app.schemas.user import TokenResponse, UserResponse
from app.core.security import create_access_token, get_current_user
from app.models.user import User
from app.services.auth_service import exchange_code_for_token, get_github_user, create_or_update_user, create_demo_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/github/url")
async def get_github_url():
    url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={settings.GITHUB_REDIRECT_URI}&scope=read:user user:email repo"
    return {"url": url}

@router.post("/github/callback", response_model=TokenResponse)
async def github_callback(code: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    token = await exchange_code_for_token(code)
    github_user = await get_github_user(token)
    user = await create_or_update_user(db, github_user, token)
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=user)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(db: AsyncSession = Depends(get_db)):
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=400, detail="Demo mode is not enabled")
    
    user = await create_demo_user(db)
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=user)
