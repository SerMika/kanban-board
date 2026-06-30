from pydantic import BaseModel
from datetime import datetime
from typing import List


class CardBase(BaseModel):
    title: str
    description: str = ""


class CardCreate(CardBase):
    pass


class CardUpdate(CardBase):
    pass


class CardMove(BaseModel):
    column_id: int
    position: int


class CardResponse(CardBase):
    id: int
    column_id: int
    position: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ColumnBase(BaseModel):
    name: str


class ColumnUpdate(BaseModel):
    name: str


class ColumnResponse(ColumnBase):
    id: int
    board_id: int
    position: int
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True


class BoardResponse(BaseModel):
    id: int
    name: str
    columns: List[ColumnResponse] = []

    class Config:
        from_attributes = True
