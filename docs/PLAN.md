# Project Plan: Kanban Board MVP

## Overview

Build a Project Management App with Kanban board functionality, packaged in Docker.

## Architecture

```
kanban-board/
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── core/      # Config, security
│   │   ├── db/        # Database, migrations
│   │   └── models/    # SQLAlchemy models
│   ├── tests/         # Backend tests
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/          # Next.js
│   ├── src/
│   │   ├── app/       # Next.js app router
│   │   ├── components/
│   │   └── lib/       # Utilities
│   └── package.json
├── docker-compose.yml
├── .env
└── scripts/          # Start/stop scripts
```

---

## Part 1: Docker Setup (Foundation) - DONE

- [x] **1.1** Create project structure (directories, .gitignore)
- [x] **1.2** Create docker-compose.yml with services:
  - [x] Backend (Python FastAPI)
  - [x] Frontend (Next.js)
- [x] **1.3** Create backend Dockerfile with uv
- [x] **1.4** Create frontend Dockerfile
- [x] **1.5** Setup hot reload:
  - [x] Volume mount for backend code
  - [x] Volume mount for frontend src (dev mode)
- [x] **1.6** Create .env file
- [x] **1.7** Test Docker setup (containers start, basic connectivity)

**Notes:**
- Backend: uv + python:3.12-slim
- Frontend: node:20 + Next.js 15
- Hot reload works for both services

---

## Part 2: Backend Setup

- [x] **2.1** Initialize Python project with pyproject.toml and uv
- [x] **2.2** Create FastAPI application structure (app/main.py)
- [x] **2.3** Setup Alembic for database migrations
- [x] **2.4** Create database models:
  - [x] User (id, username, password_hash, created_at)
  - [x] Board (id, user_id, name, created_at)
  - [x] Column (id, board_id, name, position)
  - [x] Card (id, column_id, title, description, position, created_at, updated_at)
- [x] **2.5** Write initial migration
- [x] **2.6** Create API endpoints:
  - [x] **2.6.1** POST /api/auth/login - returns JWT
  - [x] **2.6.2** GET /api/boards - get user's board
  - [x] **2.6.3** PUT /api/boards/{id}/columns/{id} - rename column
  - [x] **2.6.4** POST /api/columns/{id}/cards - create card
  - [x] **2.6.5** PUT /api/cards/{id} - update card (title, description)
  - [x] **2.6.6** PUT /api/cards/{id}/move - move card to column/position
  - [x] **2.6.7** DELETE /api/cards/{id} - delete card
- [x] **2.7** Add JWT authentication middleware
- [x] **2.8** Seed initial columns on board creation (Backlog, In Progress, Done)

---

## Part 3: Backend Tests

- [x] **3.1** Setup pytest with pytest-asyncio
- [x] **3.2** Create test fixtures (test client, test DB)
- [x] **3.3** Write tests for auth:
  - [x] Login with valid credentials
  - [x] Login with invalid credentials
  - [x] Protected endpoint without token
- [x] **3.4** Write tests for boards:
  - [x] Get board
  - [x] Rename column
- [x] **3.5** Write tests for cards:
  - [x] Create card
  - [x] Update card
  - [x] Move card
  - [x] Delete card
- [x] **3.6** Run all tests, verify pass

---

## Part 4: Frontend Setup

- [x] **4.1** Setup project structure (app router)
- [x] **4.2** Install dependencies:
  - [x] dnd-kit for drag-and-drop
  - [x] axios for API calls
- [x] **4.3** Create Login page
- [x] **4.4** Create Kanban board page
- [x] **4.5** Implement Column component with inline rename
- [x] **4.6** Implement Card component with edit modal
- [x] **4.7** Implement drag-and-drop for cards between columns
- [x] **4.8** Add JWT storage (localStorage)
- [x] **4.9** Create API client with auth interceptor

---

## Part 5: Integration & Scripts

- [x] **5.1** Configure backend to serve frontend static files at / (SKIPPED - using two-container architecture)
- [x] **5.2** Create start.sh (Mac/Linux)
- [x] **5.3** Create start.ps1 (Windows)
- [x] **5.4** Create stop.sh / stop.ps1

**Notes:**
- Two-container architecture: frontend on :3000, backend on :8000
- CORS configured to allow cross-origin requests

---

## Part 6: Testing & Polish

- [x] **6.1** Verify login flow works
- [x] **6.2** Test drag-and-drop card movement
- [x] **6.3** Test column rename
- [x] **6.4** Test card create/edit/delete
- [~~6.5~~] Verify hot reload works in dev mode (SKIPPED)
- [~~6.6~~] Build and verify production Docker image (SKIPPED)

**Notes:**
- Drag-and-drop works between columns
- Empty columns accept drops
- API calls save on drop

---

## Dependencies Summary

### Backend
- fastapi
- uvicorn
- sqlalchemy
- alembic
- python-jose (JWT)
- passlib (password hashing)
- pydantic
- pytest
- pytest-asyncio
- httpx (for test client)

### Frontend
- next.js 15
- react 19
- @dnd-kit/core
- @dnd-kit/sortable
- axios

---

## Questions for User

None - all clarified.
