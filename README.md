# Track DealOS Property Analyzer v2

A production-grade real estate deal analysis platform powered by Claude AI.

## Quick Start

### 1. Clone and configure
```bash
git clone <repo>
cd Real-estate-filter-
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, DATABASE_URL, and email settings
```

### 2. Docker (recommended)
```bash
docker-compose up
```
Frontend: http://localhost:5173  
Backend: http://localhost:3001

### 3. Manual setup
```bash
# Backend
cd backend
npm install
npx prisma db push
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Stack
- React + Vite (frontend)
- Node.js + Express (backend)
- PostgreSQL + Prisma ORM
- Anthropic Claude API with web_search
- Tailwind CSS dark theme
