'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as CardType, cardApi } from '@/lib/api'

interface CardProps {
  card: CardType
  columnId: number
  onUpdate: () => void
}

export function Card({ card, columnId, onUpdate }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card, columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = async () => {
    try {
      await cardApi.update(card.id, title, description)
      setIsEditing(false)
      onUpdate()
    } catch {
      // handle error
    }
  }

  const handleDelete = async () => {
    try {
      await cardApi.delete(card.id)
      onUpdate()
    } catch {
      // handle error
    }
  }

  if (isEditing) {
    return (
      <div className="card" style={style}>
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
          />
        </div>
        <div className="form-group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="card-actions" style={{ opacity: 1 }}>
          <button className="card-btn" onClick={handleSave}>Save</button>
          <button className="card-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="card-title">{card.title}</div>
      {card.description && (
        <div className="card-description">{card.description}</div>
      )}
      <div className="card-actions">
        <button className="card-btn" onClick={() => setIsEditing(true)}>Edit</button>
        <button className="card-btn delete" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  )
}
