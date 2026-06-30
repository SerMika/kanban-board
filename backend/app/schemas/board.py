from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)

    id: int
    column_id: int
    position: int
    created_at: datetime
    updated_at: datetime


class ColumnBase(BaseModel):
    name: str


class ColumnUpdate(BaseModel):
    name: str


class ColumnResponse(ColumnBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int
    position: int
    cards: List[CardResponse] = []


class BoardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    columns: List[ColumnResponse] = []
