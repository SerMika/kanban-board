# Frontend

Next.js 15 frontend with TypeScript.

## Structure

```
frontend/src/
├── app/
│   ├── layout.tsx       # Root layout with AuthProvider
│   ├── page.tsx         # Main page (redirects to /login or shows board)
│   ├── login/page.tsx   # Login page
│   └── globals.css      # Global styles
├── components/
│   ├── KanbanBoard.tsx  # Main board with DnD context
│   ├── Column.tsx       # Column with cards, inline rename
│   └── Card.tsx         # Draggable card with edit
└── lib/
    ├── api.ts           # API client with auth interceptor
    └── AuthContext.tsx   # Auth state management
```

## API Endpoints (via backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/boards | Get user's board with columns/cards |
| PUT | /api/boards/{id}/columns/{id} | Rename column |
| POST | /api/columns/{id}/cards | Create card |
| PUT | /api/cards/{id} | Update card |
| PUT | /api/cards/{id}/move | Move card |
| DELETE | /api/cards/{id} | Delete card |

## Auth

- Default: username=`user`, password=`password`
- JWT stored in localStorage
- API client adds Bearer token to all requests
- 401 response redirects to /login

## Commands

```bash
# Run in Docker
docker-compose up -d

# Run locally (dev)
cd frontend && npm run dev
```
