import pytest


def test_login_success(client, test_user):
    """Test login with valid credentials."""
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, test_user):
    """Test login with invalid password."""
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpass"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_invalid_username(client):
    """Test login with non-existent username."""
    response = client.post(
        "/api/auth/login",
        json={"username": "nonexistent", "password": "testpass"},
    )
    assert response.status_code == 401


def test_protected_endpoint_without_token(client):
    """Test accessing protected endpoint without token."""
    response = client.get("/api/boards")
    assert response.status_code == 401


def test_protected_endpoint_with_invalid_token(client):
    """Test accessing protected endpoint with invalid token."""
    response = client.get(
        "/api/boards",
        headers={"Authorization": "Bearer invalid_token"},
    )
    assert response.status_code == 401
