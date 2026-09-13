from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class RepositoryBase(BaseModel):
    full_name: str
    name: str
    owner_name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    url: str

class RepositoryCreate(BaseModel):
    full_name: str

class RepositoryResponse(RepositoryBase):
    id: int
    user_id: int
    default_branch: str
    last_analyzed_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RepositorySearch(BaseModel):
    query: str

class GitHubRepoInfo(RepositoryBase):
    default_branch: str
