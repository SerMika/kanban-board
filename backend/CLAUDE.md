# Backend

Python FastAPI backend with SQLite database.

## Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   │   ├── auth.py    # POST /api/auth/login
│   │   ├── boards.py  # GET /api/boards, PUT /api/boards/{id}/columns/{id}
│   │   ├── cards.py   # CRUD for cards
│   │   └── deps.py    # Auth dependencies
│   ├── core/          # Config and security
│   │   ├── config.py  # SECRET_KEY, ALGORITHM
│   │   └── security.py # JWT, bcrypt password hashing
│   ├── db/            # Database
│   │   ├── base.py    # SQLAlchemy Base
│   │   └── session.py # Engine, SessionLocal, get_db
│   ├── models/        # SQLAlchemy models
│   │   ├── user.py    # User
│   │   ├── board.py   # Board
│   │   ├── column.py  # BoardColumn
│   │   └── card.py    # Card
│   ├── schemas/       # Pydantic schemas
│   │   ├── auth.py    # Token, LoginRequest
│   │   └── board.py   # Request/Response schemas
│   └── main.py        # FastAPI app
├── alembic/           # Database migrations
│   ├── env.py
│   └── versions/001_initial.py
├── pyproject.toml
└── alembic.ini
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Returns JWT token | No |
| GET | /api/boards | Get user's board | Yes |
| PUT | /api/boards/{id}/columns/{id} | Rename column | Yes |
| POST | /api/columns/{id}/cards | Create card | Yes |
| PUT | /api/cards/{id} | Update card | Yes |
| PUT | /api/cards/{id}/move | Move card | Yes |
| DELETE | /api/cards/{id} | Delete card | Yes |

## Auth

- Default user: username=`user`, password=`password`
- JWT tokens with HS256 algorithm
- Token expiration: 24 hours

## Commands

```bash
# Run migrations
uv run alembic upgrade head

# Run dev server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest
```

## Database

SQLite at `./kanban.db` (in container: `/app/kanban.db`)

## Tests

18 tests covering auth, boards, and cards:
- `tests/conftest.py` - fixtures (test DB, client, auth headers)
- `tests/test_auth.py` - login, protected endpoints
- `tests/test_boards.py` - get board, rename column
- `tests/test_cards.py` - CRUD, move, delete with reordering
