from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class FileAnalysis(BaseModel):
    file_path: str
    status: str
    maintainability_score: float = 0.0
    maintainability_rank: str = "C"
    avg_complexity: float = 0.0
    max_complexity: float = 0.0
    complexity_rank: str = "A"
    loc: int = 0
    sloc: int = 0
    comments: int = 0
    blank: int = 0
    halstead: Optional[Dict[str, Any]] = None
    complexity_blocks: Optional[List[Dict[str, Any]]] = None
    raw_metrics: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: int
    repository_id: int
    status: str
    commit_sha: Optional[str] = None
    total_files: int
    total_lines: int
    python_files: int
    avg_complexity: Optional[float] = None
    max_complexity: Optional[float] = None
    avg_maintainability: Optional[float] = None
    complexity_grade: Optional[str] = None
    maintainability_grade: Optional[str] = None
    language_breakdown: Optional[Dict[str, Any]] = None
    file_results: Optional[List[Dict[str, Any]]] = None
    raw_metrics: Optional[Dict[str, Any]] = None
    halstead_metrics: Optional[Dict[str, Any]] = None
    summary: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalysisSummary(BaseModel):
    id: int
    status: str
    avg_complexity: Optional[float] = None
    avg_maintainability: Optional[float] = None
    complexity_grade: Optional[str] = None
    maintainability_grade: Optional[str] = None
    total_files: int
    total_lines: int
    created_at: datetime

class ComparisonResponse(BaseModel):
    repo1: AnalysisResponse
    repo2: AnalysisResponse
