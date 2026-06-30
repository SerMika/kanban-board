'use client'

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface Card {
  id: number
  title: string
  description: string
  position: number
  created_at: string
  updated_at: string
}

export interface Column {
  id: number
  name: string
  position: number
  cards: Card[]
}

export interface Board {
  id: number
  name: string
  user_id: number
  columns: Column[]
}

export const authApi = {
  login: async (username: string, password: string): Promise<string> => {
    const response = await api.post<{ access_token: string }>('/api/auth/login', {
      username,
      password,
    })
    const token = response.data.access_token
    localStorage.setItem('token', token)
    return token
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },
}

export const boardApi = {
  getBoard: async (): Promise<Board> => {
    const response = await api.get<Board>('/api/boards')
    return response.data
  },

  renameColumn: async (boardId: number, columnId: number, name: string): Promise<Column> => {
    const response = await api.put<Column>(`/api/boards/${boardId}/columns/${columnId}`, { name })
    return response.data
  },
}

export const cardApi = {
  create: async (columnId: number, title: string, description: string = ''): Promise<Card> => {
    const response = await api.post<Card>(`/api/columns/${columnId}/cards`, { title, description })
    return response.data
  },

  update: async (cardId: number, title: string, description: string): Promise<Card> => {
    const response = await api.put<Card>(`/api/cards/${cardId}`, { title, description })
    return response.data
  },

  move: async (cardId: number, columnId: number, position: number): Promise<Card> => {
    const response = await api.put<Card>(`/api/cards/${cardId}/move`, {
      column_id: columnId,
      position,
    })
    return response.data
  },

  delete: async (cardId: number): Promise<void> => {
    await api.delete(`/api/cards/${cardId}`)
  },
}

export default api
