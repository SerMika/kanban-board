# Kanban Board MVP

A simple project management app with Kanban board functionality.

## Features

- User authentication (login with username/password)
- Kanban board with drag-and-drop cards
- Rename columns
- Create, edit, delete cards

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

## Tech Stack

- Frontend: Next.js 15, React 19, @dnd-kit
- Backend: FastAPI, SQLAlchemy, SQLite
- Container: Docker with docker-compose
