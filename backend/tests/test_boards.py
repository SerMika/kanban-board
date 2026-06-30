import pytest


def test_get_board_creates_if_not_exists(client, auth_headers):
    """Test getting board creates it with default columns if not exists."""
    response = client.get("/api/boards", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Board"
    assert len(data["columns"]) == 3
    column_names = [c["name"] for c in data["columns"]]
    assert "Backlog" in column_names
    assert "In Progress" in column_names
    assert "Done" in column_names


def test_get_board_returns_existing(client, auth_headers):
    """Test getting board returns existing board."""
    # First request creates board
    client.get("/api/boards", headers=auth_headers)
    # Second request returns same board
    response = client.get("/api/boards", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()["columns"]) == 3


def test_rename_column(client, auth_headers):
    """Test renaming a column."""
    # Create board first
    board_response = client.get("/api/boards", headers=auth_headers)
    board_id = board_response.json()["id"]
    column_id = board_response.json()["columns"][0]["id"]

    response = client.put(
        f"/api/boards/{board_id}/columns/{column_id}",
        json={"name": "New Column Name"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Column Name"


def test_rename_column_wrong_board(client, auth_headers):
    """Test renaming column from another user's board."""
    response = client.put(
        "/api/boards/999/columns/1",
        json={"name": "Hacked"},
        headers=auth_headers,
    )
    assert response.status_code == 404
