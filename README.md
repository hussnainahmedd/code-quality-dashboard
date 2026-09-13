# Code Quality Dashboard

A full-stack web application that analyzes GitHub repositories and visualizes comprehensive code quality metrics with interactive dashboards.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?logo=tailwindcss)

## Features

- **GitHub Integration** — Connect your GitHub account or use demo mode
- **Code Analysis** — Analyze Python files with Radon (cyclomatic complexity, maintainability index, Halstead metrics)
- **Interactive Dashboards** — Visualize metrics with Recharts (bar charts, radar charts, pie charts, line charts)
- **Historical Tracking** — Track quality metrics over time across multiple analysis runs
- **Repository Comparison** — Compare code quality metrics between two repositories side-by-side
- **Report Generation** — Generate and download comprehensive analysis reports as JSON
- **Multi-Language Stats** — Basic file statistics for JavaScript, TypeScript, Java, Go, Rust, and more

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Axios |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, Radon |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | GitHub OAuth2 + JWT |
| Charts | Recharts (Bar, Radar, Pie, Line, Area) |

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Open the App

1. Navigate to `http://localhost:5173`
2. Click **"Try Demo Mode"** to explore with sample data (no GitHub account needed)
3. Or click **"Sign in with GitHub"** if you've configured OAuth credentials

## GitHub OAuth Setup (Optional)

To use real GitHub integration:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set the callback URL to `http://localhost:5173/auth/callback`
4. Copy the Client ID and Client Secret
5. Update `backend/.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   DEMO_MODE=False
   ```

## Project Structure

```
Code Quality Dashboard/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── core/            # Security, analyzers
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── utils/           # Helpers
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/github/url` | Get GitHub OAuth URL |
| POST | `/api/auth/github/callback` | Exchange OAuth code |
| POST | `/api/auth/demo-login` | Demo mode login |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/repos/search` | Search GitHub repos |
| POST | `/api/repos/` | Add repository |
| GET | `/api/repos/` | List repositories |
| POST | `/api/repos/{id}/analyze` | Trigger analysis |
| GET | `/api/analysis/{id}/latest` | Latest analysis |
| GET | `/api/analysis/{id}/history` | Analysis history |
| GET | `/api/analysis/compare` | Compare repositories |
| POST | `/api/reports/{id}/generate` | Generate report |
| GET | `/api/reports/{id}/download` | Download report |

## Docker Deployment

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## License

MIT
