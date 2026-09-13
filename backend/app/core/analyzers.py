from radon.complexity import cc_visit, cc_rank
from radon.metrics import mi_visit, mi_rank, h_visit
from radon.raw import analyze as raw_analyze

def analyze_python_file(code: str, file_path: str = "") -> dict:
    """Full Radon analysis on a Python source file."""
    try:
        # 1. Raw metrics
        raw = raw_analyze(code)
        raw_metrics = {"loc": raw.loc, "lloc": raw.lloc, "sloc": raw.sloc, 
                       "comments": raw.comments, "multi": raw.multi, "blank": raw.blank}
        
        # 2. Maintainability Index
        mi_score = mi_visit(code, multi=True)
        mi_grade = mi_rank(mi_score)
        
        # 3. Cyclomatic Complexity
        cc_blocks = cc_visit(code)
        blocks = []
        for b in cc_blocks:
            blocks.append({
                "type": getattr(b, 'letter', 'F'),
                "name": b.name,
                "lineno": b.lineno,
                "complexity": b.complexity,
                "rank": cc_rank(b.complexity)
            })
        avg_cc = sum(b["complexity"] for b in blocks) / len(blocks) if blocks else 0
        max_cc = max((b["complexity"] for b in blocks), default=0)
        overall_cc_rank = cc_rank(avg_cc)
        
        # 4. Halstead metrics
        halstead = {}
        try:
            h_result = h_visit(code)
            if h_result and hasattr(h_result, 'total') and h_result.total:
                halstead = {
                    "volume": round(h_result.total.volume, 2) if h_result.total.volume else 0,
                    "difficulty": round(h_result.total.difficulty, 2) if h_result.total.difficulty else 0,
                    "effort": round(h_result.total.effort, 2) if h_result.total.effort else 0,
                    "time": round(h_result.total.time, 2) if h_result.total.time else 0,
                    "bugs": round(h_result.total.bugs, 4) if h_result.total.bugs else 0,
                }
        except Exception:
            halstead = {}
        
        return {
            "file_path": file_path,
            "status": "success",
            "maintainability_score": round(mi_score, 2),
            "maintainability_rank": mi_grade,
            "avg_complexity": round(avg_cc, 2),
            "max_complexity": max_cc,
            "complexity_rank": overall_cc_rank,
            "loc": raw.loc,
            "sloc": raw.sloc,
            "comments": raw.comments,
            "blank": raw.blank,
            "raw_metrics": raw_metrics,
            "halstead": halstead,
            "complexity_blocks": blocks,
        }
    except SyntaxError as e:
        lines = code.splitlines()
        return {"file_path": file_path, "status": "syntax_error", "error": str(e),
                "loc": len(lines), "sloc": 0, "comments": 0, "blank": 0,
                "avg_complexity": 0, "max_complexity": 0, "maintainability_score": 0,
                "maintainability_rank": "C", "complexity_rank": "A",
                "raw_metrics": {}, "halstead": {}, "complexity_blocks": []}
    except Exception as e:
        lines = code.splitlines()
        return {"file_path": file_path, "status": "error", "error": str(e),
                "loc": len(lines), "sloc": 0, "comments": 0, "blank": 0,
                "avg_complexity": 0, "max_complexity": 0, "maintainability_score": 0,
                "maintainability_rank": "C", "complexity_rank": "A",
                "raw_metrics": {}, "halstead": {}, "complexity_blocks": []}

def analyze_generic_file(code: str, file_path: str = "") -> dict:
    """Basic metrics for non-Python files."""
    lines = code.splitlines()
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())
    comment_markers = ["//", "#", "/*", "*", "<!--"]
    comments = sum(1 for l in lines if l.strip() and any(l.strip().startswith(m) for m in comment_markers))
    sloc = total - blank - comments
    return {
        "file_path": file_path, "status": "success",
        "loc": total, "sloc": max(sloc, 0), "comments": comments, "blank": blank,
        "avg_complexity": 0, "max_complexity": 0,
        "maintainability_score": 50.0, "maintainability_rank": "B",
        "complexity_rank": "A",
        "raw_metrics": {"loc": total, "sloc": max(sloc, 0), "comments": comments, "blank": blank},
        "halstead": {}, "complexity_blocks": []
    }

def get_complexity_grade(avg_complexity: float) -> str:
    if avg_complexity <= 5: return "A"
    elif avg_complexity <= 10: return "B"
    elif avg_complexity <= 20: return "C"
    elif avg_complexity <= 30: return "D"
    elif avg_complexity <= 40: return "E"
    else: return "F"

def get_maintainability_grade(mi_score: float) -> str:
    if mi_score >= 20: return "A"
    elif mi_score >= 10: return "B"
    else: return "C"
