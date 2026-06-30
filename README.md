# Kanban Board MVP

A simple project management app with Kanban board functionality.

## Features

- User authentication (login with username/password)
- Kanban board with drag-and-drop cards
- Rename columns (click on column title)
- Create, edit, delete cards
- Responsive design

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Run

```bash
# Windows
.\scripts\start.ps1

# Mac/Linux
./scripts/start.sh
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Stop

```bash
# Windows
.\scripts\stop.ps1

# Mac/Linux
./scripts/stop.sh
```

## Default Credentials

- Username: `user`
- Password: `password`

## Architecture

```
+----------------+       +----------------+
|    Frontend    | ----> |    Backend     |
|  Next.js :3000 |       |  FastAPI :8000 |
+----------------+       +----------------+
                                   |
                                   v
                            +--------------+
                            |   SQLite     |
                            |  kanban.db   |
                            +--------------+
```

## Project Structure

```
kanban-board/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── core/       # Config, security
│   │   ├── db/         # Database
│   │   └── models/     # SQLAlchemy models
│   ├── tests/           # pytest tests
│   └── Dockerfile
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # Pages
│   │   ├── components/  # React components
│   │   └── lib/        # API client, auth
│   └── Dockerfile
├── scripts/             # Start/stop scripts
├── docker-compose.yml
└── .env
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login, returns JWT | No |
| GET | /api/boards | Get user's board | Yes |
| PUT | /api/boards/{id}/columns/{id} | Rename column | Yes |
| POST | /api/columns/{id}/cards | Create card | Yes |
| PUT | /api/cards/{id} | Update card | Yes |
| PUT | /api/cards/{id}/move | Move card | Yes |
| DELETE | /api/cards/{id} | Delete card | Yes |

## Environment Variables

Create `.env` file:

```env
# Backend
SECRET_KEY=changeme-in-production
DATABASE_URL=sqlite:///./kanban.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Run Backend Tests

```bash
docker exec kanban-board-backend-1 uv run pytest
```

### Run Migrations

```bash
docker exec kanban-board-backend-1 uv run alembic upgrade head
```

## Tech Stack

- Frontend: Next.js 15, React 19, @dnd-kit, axios
- Backend: FastAPI, SQLAlchemy, Alembic, SQLite
- Container: Docker with docker-compose
- Package Manager: uv (Python), npm (Node.js)
