from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.models.board import Board
from app.models.column import BoardColumn
from app.models.card import Card
from app.schemas.board import BoardResponse, ColumnUpdate, ColumnResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api", tags=["boards"])


def get_or_create_board(db: Session, user: User) -> Board:
    board = db.query(Board).filter(Board.user_id == user.id).first()
    if not board:
        board = Board(user_id=user.id, name="My Board")
        db.add(board)
        db.commit()
        db.refresh(board)

        # Create default columns
        default_columns = ["Backlog", "In Progress", "Done"]
        for i, name in enumerate(default_columns):
            col = BoardColumn(board_id=board.id, name=name, position=i)
            db.add(col)
        db.commit()
        db.refresh(board)

    return board


@router.get("/boards", response_model=BoardResponse)
def get_board(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = get_or_create_board(db, current_user)
    return board


@router.put("/boards/{board_id}/columns/{column_id}", response_model=ColumnResponse)
def rename_column(
    board_id: int,
    column_id: int,
    update: ColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    column = db.query(BoardColumn).filter(
        BoardColumn.id == column_id,
        BoardColumn.board_id == board_id
    ).first()

    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    column.name = update.name
    db.commit()
    db.refresh(column)

    return column
