'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column as ColumnType, boardApi, cardApi } from '@/lib/api'
import { Card } from './Card'

interface ColumnProps {
  column: ColumnType
  boardId: number
  onUpdate: () => void
}

export function Column({ column, boardId, onUpdate }: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(column.name)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDescription, setNewCardDescription] = useState('')

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  const handleRename = async () => {
    if (name.trim() && name !== column.name) {
      try {
        await boardApi.renameColumn(boardId, column.id, name.trim())
        onUpdate()
      } catch {
        // handle error
      }
    }
    setIsEditing(false)
  }

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      try {
        await cardApi.create(column.id, newCardTitle.trim(), newCardDescription.trim())
        setNewCardTitle('')
        setNewCardDescription('')
        setIsAddingCard(false)
        onUpdate()
      } catch {
        // handle error
      }
    }
  }

  return (
    <div className={`column ${isOver ? 'drop-zone' : ''}`} data-column-id={column.id}>
      <div className="column-header">
        {isEditing ? (
          <input
            type="text"
            className="column-title-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setName(column.name)
                setIsEditing(false)
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="column-title"
            onClick={() => setIsEditing(true)}
            title="Click to rename"
          >
            {column.name}
          </span>
        )}
      </div>

      <div ref={setNodeRef}>
        <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="cards-container">
            {column.cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                columnId={column.id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {isAddingCard ? (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="form-group">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCardTitle.trim()) handleAddCard()
                if (e.key === 'Escape') {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                  setNewCardDescription('')
                }
              }}
            />
          </div>
          <div className="form-group">
            <textarea
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              placeholder="Description (optional)"
              style={{ minHeight: 60 }}
            />
          </div>
          <div className="card-actions" style={{ opacity: 1 }}>
            <button className="card-btn" onClick={handleAddCard}>Add</button>
            <button className="card-btn" onClick={() => {
              setIsAddingCard(false)
              setNewCardTitle('')
              setNewCardDescription('')
            }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-card-btn" onClick={() => setIsAddingCard(true)}>
          + Add Card
        </button>
      )}
    </div>
  )
}
