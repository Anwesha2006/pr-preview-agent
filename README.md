# Patchwork — AI PR Review Agent

<div align="center">

**Autonomous AI-Powered GitHub Pull Request Reviews with a Premium Developer Dashboard**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash_Lite-4285F4.svg?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![Celery](https://img.shields.io/badge/Celery-5.7.0-37814A.svg?style=flat&logo=celery)](https://docs.celeryq.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)

</div>

---

## Overview

**Patchwork** is a production-grade developer platform that autonomously reviews GitHub pull requests. By combining GitHub App webhooks, asynchronous Celery task queues, the Google Gemini API, and PostgreSQL persistence, Patchwork parses code diffs, detects logic bugs and security flaws, and automatically submits inline code reviews with actionable fixes directly on GitHub.

The platform includes a modern developer dashboard built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Recharts**, featuring an elegant Linear/Vercel-inspired dark theme (`#0A0A0A` canvas with `#F5840C` saffron accents).

---

## Architecture

```mermaid
flowchart LR
    subgraph GitHub ["GitHub Infrastructure"]
        PR[Developer opens/updates PR]
        GHApp[GitHub App Webhook]
        PR -->|Trigger| GHApp
    end

    subgraph Backend ["FastAPI & Worker Service"]
        API[FastAPI Server]
        Redis[(Redis Queue & Cache)]
        Worker[Celery Task Worker]
        Gemini[Google Gemini API]
        DB[(PostgreSQL Database)]

        GHApp -->|HMAC Verified POST| API
        API -->|Enqueue Task| Redis
        Redis -->|Dequeue| Worker
        Worker -->|Fetch PR & Diff| GHApp
        Worker -->|Analyze & Detect Bugs| Gemini
        Worker -->|Post Review Comments| GHApp
        Worker -->|Persist Review & Findings| DB
    end

    subgraph Dashboard ["Next.js App Router Frontend"]
        UI[Patchwork SaaS Dashboard]
        DB -.->|Read Stats & History| API
        API -->|REST Endpoints| UI
    end
```

---

## Features

### AI Review Engine
* **Automated Triggering**: Automatically executes reviews when pull requests are opened or synchronized (`pull_request.opened`, `pull_request.synchronize`).
* **Deep Code Inspection**: Evaluates syntax, edge conditions, potential regressions, performance bottlenecks, and security vulnerabilities.
* **Inline Suggested Fixes**: Posts GitHub review comments containing diff-ready replacement code suggestions.
* **Idempotency & Deduplication**: Redis-backed delivery tracking prevents duplicate webhook executions.
* **Asynchronous Pipeline**: Webhook endpoints respond immediately with `200 OK`; resource-intensive AI reviews run asynchronously in background Celery workers.

### Premium Developer Dashboard
* **Overview KPI Metrics**: Live counts of total reviews, detected bugs, high-severity defects, and success rates.
* **Review History**: Real-time search across repositories, PR numbers, and titles with dynamic status and severity filters.
* **Review Details Inspector**: Line-by-line inspection cards detailing defect descriptions, file paths, line tags, and one-click copyable fix snippets.
* **Analytics & Trends**: Interactive Recharts visualizations displaying 30-day review volume, defect distribution by severity, and repository rankings.
* **Repository Health**: Real-time listing of active repositories derived from actual database records.
* **Zero-Secret Client Exposure**: Sensitive credentials (GitHub App private keys, webhook secrets, Gemini tokens, database URIs) remain securely isolated in the backend.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Worker & Queue** | Celery 5.7, Redis 8.1 |
| **AI Model** | Google Gemini (`google-genai` SDK, `Gemini 3.1 Flash Lite`) |
| **Database** | PostgreSQL, `psycopg` (binary) |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Custom Dark SaaS Design System |
| **Data Visualization** | Recharts 3 |

---

## Project Structure

```text
pr-preview-agent/
├── app/                           # Backend application
│   ├── api/
│   │   └── webhooks.py            # GitHub webhook receiver & HMAC verification
│   ├── database/
│   │   ├── connection.py          # SQLAlchemy engine & session factory
│   │   ├── init_db.py             # Database table initialization
│   │   ├── models.py              # Review and Finding ORM models
│   │   └── repository.py          # Database queries & persistence methods
│   ├── routes/
│   │   └── dashboard.py           # REST endpoints for stats, reviews & analytics
│   ├── agent_tools.py             # Helper tools for AST parsing & diff tools
│   ├── ai_agent.py                # Review workflow coordinator
│   ├── ai_reviewer.py             # Gemini prompt orchestration & analysis
│   ├── celery_app.py              # Celery task queue configuration
│   ├── config.py                  # Environment variable parser
│   ├── github_client.py           # GitHub REST API client (PyJWT auth)
│   ├── logging_config.py          # Structured logging
│   ├── main.py                    # FastAPI root application & CORS configuration
│   └── tasks.py                   # Celery review tasks
│
├── frontend/                      # Next.js 16 App Router frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── analytics/         # /analytics
│   │   │   ├── repositories/      # /repositories
│   │   │   ├── reviews/           # /reviews & /reviews/[id]
│   │   │   ├── settings/          # /settings
│   │   │   ├── globals.css        # Saffron & Dark Theme Design System
│   │   │   ├── layout.tsx         # Root HTML layout with AppShell
│   │   │   └── page.tsx           # Overview dashboard entry
│   │   ├── components/            # Modular UI components
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── app-shell.tsx      # Sidebar & Topbar application frame
│   │   │   ├── dashboard.tsx      # Backwards-compatible router exports
│   │   │   ├── health-indicator.tsx # Live API connectivity pill
│   │   │   ├── overview-dashboard.tsx
│   │   │   ├── repositories-view.tsx
│   │   │   ├── review-details-view.tsx
│   │   │   ├── review-history.tsx
│   │   │   ├── settings-view.tsx
│   │   │   └── ui-components.tsx  # Shared primitives (PageHeader, Badges)
│   │   └── lib/
│   │       └── api.ts             # Typed REST API client & resilient fallback
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── secrets/                       # Vault for GitHub App private key PEM
├── tests/                         # Pytest test suite
├── .env.example                   # Backend environment template
├── requirements.txt               # Python package dependencies
└── README.md                      # Documentation
```

---

## Getting Started

### Prerequisites

Ensure you have installed:
* **Python 3.10+**
* **Node.js 18+** & **npm**
* **Redis** (running locally or cloud instance)
* **PostgreSQL** database (local or hosted, e.g., Supabase / Neon / Render)
* A configured **GitHub App** with:
  * Read access to repository contents and pull requests
  * Write access to pull request review comments
  * Webhook events: `Pull request` and `Pull request review comment`
* A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/pr-preview-agent.git
   cd pr-preview-agent
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   WEBHOOK_SECRET=your_github_webhook_secret
   GITHUB_APP_ID=your_github_app_id
   GITHUB_INSTALLATION_ID=your_installation_id
   GITHUB_PRIVATE_KEY_PATH=secrets/github-app-private-key.pem
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   REDIS_URL=redis://localhost:6379/0
   ```
   Place your GitHub App private key PEM file into the `secrets/` directory.

5. **Initialize database tables**:
   ```bash
   python -m app.database.init_db
   ```

6. **Start the Celery worker**:
   ```bash
   # On Linux / macOS:
   celery -A app.celery_app.celery_app worker --loglevel=info
   # On Windows:
   celery -A app.celery_app.celery_app worker --loglevel=info -P solo
   ```

7. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   The backend will be live at `http://127.0.0.1:8000`. You can inspect interactive documentation at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local`:
   ```env
   # Point to your FastAPI backend
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_AI_MODEL=Gemini 3.1 Flash Lite
   ```

4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health probe returning service connectivity status. |
| `POST` | `/webhooks/github` | Ingests GitHub webhook events with HMAC signature validation. |
| `GET` | `/api/dashboard/stats` | Aggregated statistics (total reviews, findings, high/medium/low severity counts). |
| `GET` | `/api/dashboard/recent-reviews?limit=5` | List of recent reviews with repository and status metadata. |
| `GET` | `/api/dashboard/reviews/{id}` | Full review details including commit SHA, AI summary, and individual findings. |
| `GET` | `/api/dashboard/analytics` | 30-day daily review counts, severity breakdowns, and top repositories. |

---

## Running Tests

Run the test suite with `pytest`:

```bash
pytest
```

---

## Security & Privacy

* **Zero-Secret Client Footprint**: The Next.js frontend never receives or displays private keys, webhook secrets, database connection strings, or Gemini API keys.
* **HMAC Payload Verification**: Inbound GitHub webhooks are validated using cryptographic HMAC-SHA256 signatures before processing.
* **Payload Size Constraints**: Incoming webhook requests exceeding 1 MB are rejected to prevent denial-of-service vulnerabilities.
* **CORS Protection**: The FastAPI backend restricts cross-origin resource sharing to authorized frontend origins.

---

## License

This project is licensed under the MIT License.

