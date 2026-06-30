'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useAuth } from '@/lib/AuthContext'
import { Board, cardApi } from '@/lib/api'
import { Column } from './Column'
import { Card as CardType } from '@/lib/api'

export function KanbanBoard() {
  const { logout } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const lastOverColumnRef = useRef<number | null>(null)
  const lastDestRef = useRef<{ columnId: number; position: number }>({ columnId: 0, position: 0 })

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

  const findColumnByPointer = useCallback((clientX: number, clientY: number): number | null => {
    if (!boardRef.current || !board) return null

    const columns = boardRef.current.querySelectorAll('.column')
    for (const col of columns) {
      const rect = col.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        const colId = col.getAttribute('data-column-id')
        return colId ? parseInt(colId) : null
      }
    }
    return null
  }, [board])

  // Extract column id from droppable id (format: "column-{id}")
  const extractColumnId = (id: string | number): number | null => {
    if (typeof id === 'number') return id
    const match = id.match(/^column-(\d+)$/)
    return match ? parseInt(match[1]) : null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
      lastOverColumnRef.current = null
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !board) return

    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    // Get pointer position from the translated rect
    const rect = active.rect.current.translated
    if (!rect) return
    const clientY = rect.top + rect.height / 2
    const clientX = rect.left + rect.width / 2

    let overColumnId: number | null = null

    if (over.data.current?.type === 'card') {
      overColumnId = over.data.current.columnId
    } else if (over.data.current?.type === 'column') {
      overColumnId = over.data.current.columnId
    } else {
      // Try to extract from id
      overColumnId = extractColumnId(over.id as string)
      if (!overColumnId) {
        overColumnId = findColumnByPointer(clientX, clientY)
      }
    }

    if (!overColumnId) return

    const activeColumnId = activeData.columnId

    // Skip if same column
    if (activeColumnId === overColumnId) {
      lastOverColumnRef.current = overColumnId
      return
    }

    // Skip if already handled this column
    if (lastOverColumnRef.current === overColumnId) return
    lastOverColumnRef.current = overColumnId

    // Store destination for handleDragEnd
    lastDestRef.current = { columnId: overColumnId, position: 0 }

    const activeId = active.id as number

    setBoard((prev) => {
      if (!prev) return prev

      const sourceColumn = prev.columns.find(c => c.id === activeColumnId)
      const destColumn = prev.columns.find(c => c.id === overColumnId)
      if (!sourceColumn || !destColumn) return prev

      const cardIndex = sourceColumn.cards.findIndex(c => c.id === activeId)
      if (cardIndex === -1) return prev

      const card = { ...sourceColumn.cards[cardIndex] }

      const newColumns = prev.columns.map(col => {
        if (col.id === activeColumnId) {
          return { ...col, cards: col.cards.filter(c => c.id !== activeId) }
        }
        if (col.id === overColumnId) {
          const newCards = [...col.cards, card]
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
    lastOverColumnRef.current = null

    if (!over) return

    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    const activeId = active.id as number
    const dest = lastDestRef.current

    try {
      await cardApi.move(activeId, dest.columnId, dest.position)
      await fetchBoard()
    } catch {
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
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board" ref={boardRef}>
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
