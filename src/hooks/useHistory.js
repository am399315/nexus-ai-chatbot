import { useState, useCallback } from 'react'

const KEY = 'nexusai-history'

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? [] }
  catch { return [] }
}

export function useHistory() {
  const [conversations, setConversations] = useState(loadFromStorage)

  const saveConversation = useCallback((id, messages) => {
    if (!messages.some(m => m.role === 'user')) return
    const firstUser = messages.find(m => m.role === 'user')
    const title = (firstUser?.text ?? 'Conversación').slice(0, 55)
    const entry = {
      id,
      title,
      messages: messages.map(m => ({
        role: m.role,
        text: m.text,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      })),
      updatedAt: new Date().toISOString(),
    }
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === id)
      const updated = idx >= 0
        ? prev.map((c, i) => (i === idx ? entry : c))
        : [entry, ...prev].slice(0, 60)
      localStorage.setItem(KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id)
      localStorage.setItem(KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(KEY)
    setConversations([])
  }, [])

  return { conversations, saveConversation, deleteConversation, clearAll }
}
