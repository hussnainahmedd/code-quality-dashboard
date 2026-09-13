import random
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.models.analysis import AnalysisResult
from app.models.repository import Repository
from app.config import settings
from app.services.github_service import get_file_tree, get_file_content
from app.core.analyzers import analyze_python_file, analyze_generic_file, get_complexity_grade, get_maintainability_grade

ANALYZABLE_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rb", ".rs", ".cpp", ".c", ".h"}

async def analyze_repository(db: AsyncSession, repo_id: int, github_token: Optional[str] = None) -> AnalysisResult:
    result = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise ValueError("Repository not found")

    analysis = AnalysisResult(repository_id=repo_id, status="running")
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    try:
        if settings.DEMO_MODE and (not github_token or github_token == "demo_token"):
            demo_data = generate_demo_analysis(repo_id)
            for key, value in demo_data.items():
                setattr(analysis, key, value)
            analysis.status = "completed"
        else:
            files = get_file_tree(github_token, repo.full_name, repo.default_branch)
            analyzable_files = [f for f in files if any(f["path"].endswith(ext) for ext in ANALYZABLE_EXTENSIONS)]
            analyzable_files = analyzable_files[:100]  # Limit to 100 to avoid rate limits
            
            file_results = []
            language_breakdown = {}
            for f in analyzable_files:
                ext = f["path"].split(".")[-1]
                language_breakdown[ext] = language_breakdown.get(ext, 0) + 1
                
                content = get_file_content(github_token, repo.full_name, f["path"], repo.default_branch)
                if not content:
                    continue
                
                if f["path"].endswith(".py"):
                    res = analyze_python_file(content, f["path"])
                else:
                    res = analyze_generic_file(content, f["path"])
                file_results.append(res)
            
            total_files = len(file_results)
            total_lines = sum(r.get("loc", 0) for r in file_results)
            python_files = sum(1 for r in file_results if r["file_path"].endswith(".py"))
            
            valid_complexities = [r["avg_complexity"] for r in file_results if r["status"] == "success"]
            avg_comp = sum(valid_complexities) / len(valid_complexities) if valid_complexities else 0
            max_comp = max(valid_complexities, default=0)
            
            valid_mi = [r["maintainability_score"] for r in file_results if r["status"] == "success"]
            avg_mi = sum(valid_mi) / len(valid_mi) if valid_mi else 0
            
            analysis.total_files = total_files
            analysis.total_lines = total_lines
            analysis.python_files = python_files
            analysis.avg_complexity = avg_comp
            analysis.max_complexity = max_comp
            analysis.avg_maintainability = avg_mi
            analysis.complexity_grade = get_complexity_grade(avg_comp)
            analysis.maintainability_grade = get_maintainability_grade(avg_mi)
            analysis.language_breakdown = language_breakdown
            analysis.file_results = file_results
            analysis.status = "completed"
            
            # Aggregate raw metrics
            raw_metrics = {"loc": 0, "sloc": 0, "comments": 0, "blank": 0}
            for r in file_results:
                rm = r.get("raw_metrics", {})
                for k in raw_metrics:
                    raw_metrics[k] += rm.get(k, 0)
            analysis.raw_metrics = raw_metrics
            
            # Aggregate halstead
            halstead = {"volume": 0, "difficulty": 0, "effort": 0, "time": 0, "bugs": 0}
            count = 0
            for r in file_results:
                h = r.get("halstead", {})
                if h:
                    for k in halstead:
                        halstead[k] += h.get(k, 0)
                    count += 1
            if count > 0:
                for k in halstead:
                    halstead[k] = round(halstead[k] / count, 2)
            analysis.halstead_metrics = halstead

        repo.last_analyzed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(analysis)
        return analysis

    except Exception as e:
        analysis.status = "failed"
        analysis.error_message = str(e)
        await db.commit()
        await db.refresh(analysis)
        raise e

def generate_demo_analysis(repo_id: int) -> Dict[str, Any]:
    num_files = random.randint(15, 25)
    file_results = []
    
    extensions = [".py", ".js", ".html", ".css"]
    weights = [0.70, 0.15, 0.10, 0.05]
    
    total_loc = 0
    total_sloc = 0
    total_comments = 0
    
    for i in range(num_files):
        ext = random.choices(extensions, weights=weights, k=1)[0]
        loc = random.randint(50, 500)
        sloc = int(loc * random.uniform(0.6, 0.9))
        comments = loc - sloc - int(loc * 0.1)
        
        comp = random.uniform(1.0, 15.0)
        mi = random.uniform(40.0, 95.0)
        
        total_loc += loc
        total_sloc += sloc
        total_comments += comments
        
        file_results.append({
            "file_path": f"src/module_{i}{ext}",
            "status": "success",
            "maintainability_score": round(mi, 2),
            "maintainability_rank": "A" if mi >= 80 else "B" if mi >= 60 else "C",
            "avg_complexity": round(comp, 2),
            "max_complexity": comp + random.uniform(0, 5),
            "complexity_rank": "A" if comp < 5 else "B" if comp < 10 else "C",
            "loc": loc,
            "sloc": sloc,
            "comments": comments,
            "blank": loc - sloc - comments,
            "raw_metrics": {"loc": loc, "sloc": sloc, "comments": comments, "blank": loc - sloc - comments},
            "halstead": {"volume": random.uniform(10, 100), "difficulty": random.uniform(1, 20), "effort": random.uniform(50, 500)},
            "complexity_blocks": []
        })
        
    avg_comp = sum(r["avg_complexity"] for r in file_results) / num_files
    max_comp = max(r["max_complexity"] for r in file_results)
    avg_mi = sum(r["maintainability_score"] for r in file_results) / num_files
    
    return {
        "total_files": num_files,
        "total_lines": total_loc,
        "python_files": sum(1 for r in file_results if r["file_path"].endswith(".py")),
        "avg_complexity": avg_comp,
        "max_complexity": max_comp,
        "avg_maintainability": avg_mi,
        "complexity_grade": get_complexity_grade(avg_comp),
        "maintainability_grade": get_maintainability_grade(avg_mi),
        "language_breakdown": {"py": int(num_files * 0.7), "js": int(num_files * 0.15), "html": int(num_files * 0.10), "css": int(num_files * 0.05)},
        "file_results": file_results,
        "raw_metrics": {"loc": total_loc, "sloc": total_sloc, "comments": total_comments, "blank": total_loc - total_sloc - total_comments},
        "halstead_metrics": {"volume": 45.2, "difficulty": 12.1, "effort": 320.5, "time": 15.2, "bugs": 0.02},
    }
