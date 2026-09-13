from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Float, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    repository_id: Mapped[int] = mapped_column(ForeignKey("repositories.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    commit_sha: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    total_files: Mapped[int] = mapped_column(default=0)
    total_lines: Mapped[int] = mapped_column(default=0)
    python_files: Mapped[int] = mapped_column(default=0)
    avg_complexity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_complexity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avg_maintainability: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    complexity_grade: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    maintainability_grade: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    language_breakdown: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    file_results: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    raw_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    halstead_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    repository: Mapped["Repository"] = relationship(back_populates="analyses")
