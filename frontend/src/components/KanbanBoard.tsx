'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useAuth } from '@/lib/AuthContext'
import { Board, cardApi } from '@/lib/api'
import { Column } from './Column'
import { Card as CardType } from '@/lib/api'

export function KanbanBoard() {
  const { logout } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchBoard = async () => {
    try {
      const { boardApi } = await import('@/lib/api')
      const data = await boardApi.getBoard()
      setBoard(data)
    } catch {
      // handle error
    }
  }

  useEffect(() => {
    fetchBoard()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !board) return

    const activeId = active.id as number
    const overId = over.id as number

    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    // Find source column
    const activeColumnId = activeData.columnId
    let overColumnId = activeColumnId

    // Check if over is a column or a card
    if (over.data.current?.type === 'column') {
      overColumnId = overId
    } else if (over.data.current?.type === 'card') {
      overColumnId = over.data.current.columnId
    }

    if (activeColumnId === overColumnId) return

    // Move card between columns optimistically
    setBoard((prev) => {
      if (!prev) return prev

      const sourceColumn = prev.columns.find(c => c.id === activeColumnId)
      const destColumn = prev.columns.find(c => c.id === overColumnId)
      if (!sourceColumn || !destColumn) return prev

      const cardIndex = sourceColumn.cards.findIndex(c => c.id === activeId)
      if (cardIndex === -1) return prev

      const card = sourceColumn.cards[cardIndex]
      const newCard = { ...card, columnId: overColumnId } as CardType & { columnId: number }

      const newColumns = prev.columns.map(col => {
        if (col.id === activeColumnId) {
          return { ...col, cards: col.cards.filter(c => c.id !== activeId) }
        }
        if (col.id === overColumnId) {
          const overIndex = col.cards.findIndex(c => c.id === overId)
          const insertIndex = overIndex >= 0 ? overIndex : col.cards.length
          const newCards = [...col.cards]
          newCards.splice(insertIndex, 0, newCard)
          return { ...col, cards: newCards }
        }
        return col
      })

      return { ...prev, columns: newColumns }
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over || !board) return

    const activeId = active.id as number
    const overId = over.id as number

    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    const activeCard = activeData.card as CardType
    let destColumnId = activeData.columnId
    let destPosition = 0

    // Find destination column and position
    if (over.data.current?.type === 'column') {
      destColumnId = overId
      const destColumn = board.columns.find(c => c.id === destColumnId)
      destPosition = destColumn?.cards.length || 0
    } else if (over.data.current?.type === 'card') {
      destColumnId = over.data.current.columnId
      const destColumn = board.columns.find(c => c.id === destColumnId)
      if (destColumn) {
        const overIndex = destColumn.cards.findIndex(c => c.id === overId)
        destPosition = overIndex >= 0 ? overIndex : destColumn.cards.length
      }
    }

    try {
      await cardApi.move(activeId, destColumnId, destPosition)
      await fetchBoard()
    } catch {
      // Revert on error
      await fetchBoard()
    }
  }

  if (!board) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>{board.name}</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              boardId={board.id}
              onUpdate={fetchBoard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="card dragging" style={{ opacity: 0.9 }}>
              <div className="card-title">{activeCard.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
