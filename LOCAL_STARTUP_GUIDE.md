# Local Development Startup Guide

## System Requirements ✓

- Node.js 25.7.0+ ✓
- npm 11.18.0+ ✓
- Python 3.14.6+ ✓
- PostgreSQL 15 (optional - can run in Docker or use local instance)

---

## Quick Start (3 Terminals)

### Terminal 1: Backend Server

```bash
cd "c:\dev\E-Commerce Platform\server"
npm install
npm run dev
```

**Expected Output:**
```
[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): src/**/*
Server running on http://localhost:5000
Database connection established
```

**Health Check:** 
```bash
curl http://localhost:5000/health
```

---

### Terminal 2: Frontend Application

```bash
cd "c:\dev\E-Commerce Platform\client"
npm install
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Open Browser:** http://localhost:5173

---

### Terminal 3: AI Service

```bash
cd "c:\dev\E-Commerce Platform\ai-service"
python -m pip install -r requirements.txt
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

**API Docs:** http://localhost:8000/docs

---

## Database Setup

### Option A: PostgreSQL in Docker (Recommended)

```bash
docker pull postgres:15-alpine
docker run --name ecommerce-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

### Option B: Local PostgreSQL Installation (Windows)

Open **PowerShell as Administrator**, then install PostgreSQL 15:

```powershell
winget install --id PostgreSQL.PostgreSQL.15 --exact --accept-source-agreements --accept-package-agreements
```

During the installer, keep port `5432`, remember the `postgres` password, and allow the PostgreSQL service to start.

Then open a normal PowerShell and create the application role/database. Replace `<postgres-password>` with the password chosen during installation:

```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -f "c:\dev\E-Commerce Platform\server\scripts\setup-database.sql"
```

Alternatively, create the database manually:
   ```bash
   psql -U postgres
  CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_password';
  CREATE DATABASE ecommerce_db OWNER ecommerce_user;
  GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
   ```

### Option C: Using docker-compose (if Docker installed)

```bash
cd "c:\dev\E-Commerce Platform"
docker-compose up -d
```

---

## Environment Configuration

### 1. Root .env File

Create `.env` in `c:\dev\E-Commerce Platform`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Backend
PORT=5000
JWT_SECRET=your_jwt_secret_key_min_32_chars_for_production
JWT_EXPIRE_IN=24h
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api

# AI Service
FASTAPI_ENV=development
AI_SERVICE_PORT=8000
AI_SERVICE_URL=http://localhost:8000
LLM_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo

# Feature Flags
ENABLE_AI_SEARCH=true
ENABLE_RECOMMENDATIONS=true
ENABLE_CHATBOT=true

# Payment (Phase 5)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# File Upload (Phase 4)
MAX_FILE_SIZE=52428800
```

### 2. Backend .env

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
JWT_SECRET=your_jwt_secret_key_min_32_chars_for_production
JWT_EXPIRE_IN=24h
NODE_ENV=development
```

### 3. AI Service .env

Create `ai-service/.env`:

```env
FASTAPI_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
LLM_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
BACKEND_URL=http://localhost:5000
ENABLE_SEARCH=true
ENABLE_RECOMMENDATIONS=true
ENABLE_CHATBOT=true
```

### 4. Verify the Database

```powershell
Get-Service postgresql-x64-15
Test-NetConnection localhost -Port 5432
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" "postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db" -c "SELECT NOW();"
```

When the backend starts, it creates the `users` table automatically. You should see `Database connected` and `Users table ready` in its terminal.

---

## Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check DATABASE_URL in .env files
- Ensure password is correct

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <PID> /F
```

### npm install Issues
```bash
# Clear npm cache
npm cache clean --force

# Install again
npm install
```

### Python Virtual Environment (Optional)
```bash
cd "c:\dev\E-Commerce Platform\ai-service"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

## Service Health Checks

Once all services are running, test endpoints:

```bash
# Backend health
curl http://localhost:5000/health

# Frontend (open browser)
http://localhost:5173

# AI Service docs
http://localhost:8000/docs
```

---

## Next Steps: Phase 2 Authentication

Once services are running, begin implementation of authentication system. See `PHASE_2_AUTHENTICATION_PLAN.md` for detailed implementation steps.

**Estimated Duration:** 2-3 days
**Success Criteria:** 
- User registration endpoint working
- User login with JWT token
- Protected routes functional
- Frontend authentication UI complete

