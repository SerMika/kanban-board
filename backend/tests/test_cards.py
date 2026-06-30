import pytest


@pytest.fixture
def board_with_columns(client, auth_headers):
    """Get board with default columns."""
    response = client.get("/api/boards", headers=auth_headers)
    return response.json()


def test_create_card(client, auth_headers, board_with_columns):
    """Test creating a card."""
    column_id = board_with_columns["columns"][0]["id"]

    response = client.post(
        f"/api/columns/{column_id}/cards",
        json={"title": "Test Card", "description": "Test description"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Card"
    assert data["description"] == "Test description"
    assert data["position"] == 0


def test_create_multiple_cards_positions(client, auth_headers, board_with_columns):
    """Test that multiple cards get sequential positions."""
    column_id = board_with_columns["columns"][0]["id"]

    # Create 3 cards
    for i in range(3):
        response = client.post(
            f"/api/columns/{column_id}/cards",
            json={"title": f"Card {i}"},
            headers=auth_headers,
        )
        assert response.json()["position"] == i


def test_update_card(client, auth_headers, board_with_columns):
    """Test updating a card."""
    column_id = board_with_columns["columns"][0]["id"]

    # Create card
    create_response = client.post(
        f"/api/columns/{column_id}/cards",
        json={"title": "Original", "description": "Original desc"},
        headers=auth_headers,
    )
    card_id = create_response.json()["id"]

    # Update card
    response = client.put(
        f"/api/cards/{card_id}",
        json={"title": "Updated", "description": "Updated desc"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated"
    assert response.json()["description"] == "Updated desc"


def test_move_card_same_column(client, auth_headers, board_with_columns):
    """Test moving card within the same column."""
    column_id = board_with_columns["columns"][0]["id"]

    # Create 3 cards
    card_ids = []
    for i in range(3):
        resp = client.post(
            f"/api/columns/{column_id}/cards",
            json={"title": f"Card {i}"},
            headers=auth_headers,
        )
        card_ids.append(resp.json()["id"])

    # Move first card to position 2
    response = client.put(
        f"/api/cards/{card_ids[0]}/move",
        json={"column_id": column_id, "position": 2},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["position"] == 2


def test_move_card_different_column(client, auth_headers, board_with_columns):
    """Test moving card to different column."""
    col1_id = board_with_columns["columns"][0]["id"]
    col2_id = board_with_columns["columns"][1]["id"]

    # Create card in column 1
    create_response = client.post(
        f"/api/columns/{col1_id}/cards",
        json={"title": "Moving Card"},
        headers=auth_headers,
    )
    card_id = create_response.json()["id"]

    # Move to column 2
    response = client.put(
        f"/api/cards/{card_id}/move",
        json={"column_id": col2_id, "position": 0},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["column_id"] == col2_id
    assert response.json()["position"] == 0


def test_delete_card(client, auth_headers, board_with_columns):
    """Test deleting a card."""
    column_id = board_with_columns["columns"][0]["id"]

    # Create card
    create_response = client.post(
        f"/api/columns/{column_id}/cards",
        json={"title": "To Delete"},
        headers=auth_headers,
    )
    card_id = create_response.json()["id"]

    # Delete card
    response = client.delete(f"/api/cards/{card_id}", headers=auth_headers)
    assert response.status_code == 200

    # Verify card is gone
    board_response = client.get("/api/boards", headers=auth_headers)
    cards = board_response.json()["columns"][0]["cards"]
    assert all(c["id"] != card_id for c in cards)


def test_delete_card_reorders_positions(client, auth_headers, board_with_columns):
    """Test that deleting a card reorders remaining cards."""
    column_id = board_with_columns["columns"][0]["id"]

    # Create 3 cards
    card_ids = []
    for i in range(3):
        resp = client.post(
            f"/api/columns/{column_id}/cards",
            json={"title": f"Card {i}"},
            headers=auth_headers,
        )
        card_ids.append(resp.json()["id"])

    # Delete middle card
    client.delete(f"/api/cards/{card_ids[1]}", headers=auth_headers)

    # Verify positions are reordered
    board_response = client.get("/api/boards", headers=auth_headers)
    cards = board_response.json()["columns"][0]["cards"]
    positions = [c["position"] for c in cards]
    assert positions == [0, 1]  # Two cards remaining, positions 0 and 1


def test_create_card_invalid_column(client, auth_headers):
    """Test creating card in non-existent column."""
    response = client.post(
        "/api/columns/999/cards",
        json={"title": "Test"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_nonexistent_card(client, auth_headers):
    """Test updating non-existent card."""
    response = client.put(
        "/api/cards/999",
        json={"title": "Test"},
        headers=auth_headers,
    )
    assert response.status_code == 404
