from github import Github, GithubException, Auth
from fastapi import HTTPException
from typing import List, Dict, Any

def get_github_client(token: str = None) -> Github:
    if token and token != "demo_token":
        auth = Auth.Token(token)
        return Github(auth=auth)
    return Github()

def check_rate_limit(g: Github):
    if g.get_rate_limit().rate.remaining < 100:
        raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded.")

def get_repository_info(token: str, full_name: str) -> Dict[str, Any]:
    try:
        g = get_github_client(token)
        repo = g.get_repo(full_name)
        return {
            "full_name": repo.full_name,
            "name": repo.name,
            "owner_name": repo.owner.login,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "url": repo.html_url,
            "default_branch": repo.default_branch,
            "open_issues": repo.open_issues_count
        }
    except GithubException as e:
        raise HTTPException(status_code=e.status, detail=e.data.get("message", "Error fetching repo info"))

def get_file_tree(token: str, full_name: str, branch: str = None) -> List[Dict[str, Any]]:
    try:
        g = get_github_client(token)
        check_rate_limit(g)
        repo = g.get_repo(full_name)
        if not branch:
            branch = repo.default_branch
        
        tree = repo.get_git_tree(branch, recursive=True)
        files = []
        ignore_dirs = {".git", "node_modules", "venv", "__pycache__", "build", "dist"}
        for item in tree.tree:
            if item.type == "blob":
                path_parts = item.path.split("/")
                if not any(part in ignore_dirs for part in path_parts):
                    files.append({
                        "path": item.path,
                        "sha": item.sha,
                        "size": item.size
                    })
        return files
    except GithubException as e:
        raise HTTPException(status_code=e.status, detail=e.data.get("message", "Error fetching file tree"))

def get_file_content(token: str, full_name: str, path: str, ref: str = None) -> str:
    try:
        g = get_github_client(token)
        repo = g.get_repo(full_name)
        file_content = repo.get_contents(path, ref=ref)
        if file_content.size > 500 * 1024:
            return ""
        return file_content.decoded_content.decode('utf-8')
    except Exception as e:
        return ""

def search_repositories(token: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
    try:
        g = get_github_client(token)
        check_rate_limit(g)
        repos = g.search_repositories(query=query)
        results = []
        for i, repo in enumerate(repos):
            if i >= limit:
                break
            results.append({
                "full_name": repo.full_name,
                "name": repo.name,
                "owner_name": repo.owner.login,
                "description": repo.description,
                "language": repo.language,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "url": repo.html_url,
                "default_branch": repo.default_branch,
                "open_issues": repo.open_issues_count
            })
        return results
    except GithubException as e:
        raise HTTPException(status_code=e.status, detail=e.data.get("message", "Error searching repos"))

def get_my_repositories(token: str, limit: int = 50) -> List[Dict[str, Any]]:
    try:
        g = get_github_client(token)
        check_rate_limit(g)
        user = g.get_user()
        repos = user.get_repos(sort="updated", direction="desc")
        results = []
        for i, repo in enumerate(repos):
            if i >= limit:
                break
            results.append({
                "full_name": repo.full_name,
                "name": repo.name,
                "owner_name": repo.owner.login,
                "description": repo.description,
                "language": repo.language,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "url": repo.html_url,
                "default_branch": repo.default_branch,
                "open_issues": repo.open_issues_count
            })
        return results
    except GithubException as e:
        raise HTTPException(status_code=e.status, detail=e.data.get("message", "Error fetching user repos"))
