from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.models.board import Board
from app.models.column import BoardColumn
from app.models.card import Card
from app.schemas.board import CardCreate, CardUpdate, CardMove, CardResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api", tags=["cards"])


def verify_column_ownership(db: Session, user: User, column_id: int) -> BoardColumn:
    """Verify user owns the column through their board."""
    column = db.query(BoardColumn).join(Board).filter(
        BoardColumn.id == column_id,
        Board.user_id == user.id
    ).first()

    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    return column


def verify_card_ownership(db: Session, user: User, card_id: int) -> tuple[Card, BoardColumn]:
    """Verify user owns the card through their board."""
    card = db.query(Card).join(BoardColumn).join(Board).filter(
        Card.id == card_id,
        Board.user_id == user.id
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    column = db.query(BoardColumn).filter(BoardColumn.id == card.column_id).first()
    return card, column


def reorder_cards(db: Session, column_id: int, start_position: int, end_position: int = None):
    """Reorder cards in a column after a card is moved or deleted."""
    cards = db.query(Card).filter(
        Card.column_id == column_id,
        Card.position > start_position
    ).order_by(Card.position).all()

    for card in cards:
        card.position -= 1
    db.commit()


@router.post("/columns/{column_id}/cards", response_model=CardResponse)
def create_card(
    column_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    column = verify_column_ownership(db, current_user, column_id)

    # Get max position
    max_pos = db.query(Card).filter(Card.column_id == column_id).count()

    card = Card(
        column_id=column_id,
        title=card_data.title,
        description=card_data.description,
        position=max_pos
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    return card


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_data: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card, _ = verify_card_ownership(db, current_user, card_id)

    card.title = card_data.title
    card.description = card_data.description
    db.commit()
    db.refresh(card)

    return card


@router.put("/cards/{card_id}/move", response_model=CardResponse)
def move_card(
    card_id: int,
    move_data: CardMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card, source_column = verify_card_ownership(db, current_user, card_id)
    dest_column = verify_column_ownership(db, current_user, move_data.column_id)

    old_position = card.position
    old_column_id = card.column_id
    new_position = move_data.position

    # If moving within the same column
    if old_column_id == move_data.column_id:
        if old_position < new_position:
            # Moving down: shift cards between old+1 and new down
            db.query(Card).filter(
                Card.column_id == old_column_id,
                Card.position > old_position,
                Card.position <= new_position
            ).update({Card.position: Card.position - 1})
        else:
            # Moving up: shift cards between new and old-1 up
            db.query(Card).filter(
                Card.column_id == old_column_id,
                Card.position >= new_position,
                Card.position < old_position
            ).update({Card.position: Card.position + 1})
    else:
        # Moving to different column
        # Reorder source column
        db.query(Card).filter(
            Card.column_id == old_column_id,
            Card.position > old_position
        ).update({Card.position: Card.position - 1})

        # Reorder destination column
        db.query(Card).filter(
            Card.column_id == move_data.column_id,
            Card.position >= new_position
        ).update({Card.position: Card.position + 1})

        card.column_id = move_data.column_id

    card.position = new_position
    db.commit()
    db.refresh(card)

    return card


@router.delete("/cards/{card_id}")
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card, column = verify_card_ownership(db, current_user, card_id)

    position = card.position
    db.delete(card)
    db.commit()

    # Reorder remaining cards
    db.query(Card).filter(
        Card.column_id == column.id,
        Card.position > position
    ).update({Card.position: Card.position - 1})
    db.commit()

    return {"message": "Card deleted"}
