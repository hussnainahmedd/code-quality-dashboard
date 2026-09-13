import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.config import settings
from app.models.user import User

async def exchange_code_for_token(code: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI
            },
            headers={"Accept": "application/json"}
        )
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error_description"])
        return data["access_token"]

async def get_github_user(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not fetch user profile")
        return response.json()

async def create_or_update_user(db: AsyncSession, github_user: dict, github_token: str) -> User:
    github_id = github_user["id"]
    result = await db.execute(select(User).where(User.github_id == github_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.username = github_user["login"]
        user.email = github_user.get("email")
        user.avatar_url = github_user.get("avatar_url")
        user.github_token = github_token
    else:
        user = User(
            github_id=github_id,
            username=github_user["login"],
            email=github_user.get("email"),
            avatar_url=github_user.get("avatar_url"),
            github_token=github_token
        )
        db.add(user)
    
    await db.commit()
    await db.refresh(user)
    return user

async def create_demo_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.github_id == 0))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            github_id=0,
            username="demo_user",
            email="demo@example.com",
            avatar_url="https://avatars.githubusercontent.com/u/9919?s=200&v=4",
            github_token="demo_token"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
