from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.analysis import AnalysisResult

def get_recommendations(analysis: AnalysisResult) -> List[str]:
    recs = []
    if analysis.avg_complexity and analysis.avg_complexity > 15:
        recs.append("Average cyclomatic complexity is high. Consider refactoring complex functions into smaller, more manageable pieces.")
    
    if analysis.avg_maintainability and analysis.avg_maintainability < 50:
        recs.append("Maintainability index is low. Increase documentation, reduce file sizes, and simplify logical flows.")
        
    if analysis.max_complexity and analysis.max_complexity > 40:
        recs.append("Some functions have extremely high complexity (>40). These are high risk and should be broken down immediately.")
        
    if analysis.raw_metrics:
        comments = analysis.raw_metrics.get("comments", 0)
        sloc = analysis.raw_metrics.get("sloc", 1) # avoid div by zero
        if (comments / max(sloc, 1)) < 0.1:
            recs.append("Code-to-comment ratio is low. Adding meaningful comments can improve readability.")

    if not recs:
        recs.append("Codebase metrics are within acceptable ranges. Continue following current best practices.")
        
    return recs

async def generate_report(db: AsyncSession, repo_id: int) -> Dict[str, Any]:
    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.repository_id == repo_id)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise ValueError("No analysis found for this repository")

    return {
        "summary": {
            "status": analysis.status,
            "total_files": analysis.total_files,
            "total_lines": analysis.total_lines,
            "complexity_grade": analysis.complexity_grade,
            "maintainability_grade": analysis.maintainability_grade,
            "date": analysis.created_at.isoformat()
        },
        "metrics_overview": {
            "avg_complexity": analysis.avg_complexity,
            "max_complexity": analysis.max_complexity,
            "avg_maintainability": analysis.avg_maintainability,
            "language_breakdown": analysis.language_breakdown,
            "raw_metrics": analysis.raw_metrics,
            "halstead_metrics": analysis.halstead_metrics
        },
        "file_details": analysis.file_results,
        "recommendations": get_recommendations(analysis)
    }
