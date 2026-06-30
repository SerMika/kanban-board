# Kanban Board Start Script for Windows

Write-Host "Starting Kanban Board..." -ForegroundColor Green
docker compose up --build -d
Write-Host "App running at http://localhost:8000" -ForegroundColor Green
