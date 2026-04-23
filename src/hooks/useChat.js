import { useState, useCallback, useRef } from 'react'
import { streamAIResponse } from '../services/aiSimulator'

function createMessage(role, text, extra = {}) {
  return { id: crypto.randomUUID(), role, text, timestamp: new Date(), ...extra }
}

export function makeWelcome() {
  return createMessage(
    'bot',
    '¡Hola! Soy **NexusAI**, powered by **Gemini**. Puedo responder sobre tecnología, ciencias, historia, cultura, matemáticas, arte y mucho más. ¿En qué puedo ayudarte hoy?'
  )
}

export function useChat({ tone = 'casual', temperature = 0.7 } = {}) {
  const [messages, setMessages] = useState(() => [makeWelcome()])
  const [isTyping, setIsTyping] = useState(false)
  const [reactions, setReactions] = useState({})
  const [activeModel, setActiveModel] = useState(null)
  const abortRef = useRef(null)
  const convIdRef = useRef(crypto.randomUUID())

  const doSend = useCallback(async (text, snapshot) => {
    setIsTyping(true)
    const botId = crypto.randomUUID()
    setMessages(prev => [...prev, createMessage('bot', '', { id: botId, isStreaming: true })])

    const controller = new AbortController()
    abortRef.current = controller

    const history = snapshot.map(m => ({ role: m.role, text: m.text }))

    try {
      await streamAIResponse(
        history,
        chunk => setMessages(prev =>
          prev.map(m => m.id === botId ? { ...m, text: m.text + chunk } : m)
        ),
        controller.signal,
        {
          tone,
          temperature,
          onMeta: meta => { if (meta?.model) setActiveModel(meta.model) },
        }
      )
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === botId
            ? { ...m, text: '⚠️ Error al conectar con el servidor. Verifica que el backend esté corriendo con `npm run dev`.' }
            : m
        ))
      }
    } finally {
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, isStreaming: false } : m))
      setIsTyping(false)
    }
  }, [tone, temperature])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return
    const userMsg = createMessage('user', text.trim())
    setMessages(prev => [...prev, userMsg])
    await doSend(text.trim(), [...messages, userMsg])
  }, [messages, isTyping, doSend])

  const retryLast = useCallback(async () => {
    if (isTyping) return
    const lastUserIdx = messages.findLastIndex(m => m.role === 'user')
    if (lastUserIdx === -1) return
    const truncated = messages.slice(0, lastUserIdx + 1)
    setMessages(truncated)
    await doSend(messages[lastUserIdx].text, truncated)
  }, [messages, isTyping, doSend])

  const toggleReaction = useCallback((messageId, reaction) => {
    setReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction,
    }))
  }, [])

  const resetChat = useCallback((initialMessages) => {
    abortRef.current?.abort()
    const normalized = (initialMessages ?? [makeWelcome()]).map(m => ({
      ...m,
      id: m.id ?? crypto.randomUUID(),
      timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp ?? Date.now()),
    }))
    convIdRef.current = crypto.randomUUID()
    setMessages(normalized.length ? normalized : [makeWelcome()])
    setReactions({})
    setIsTyping(false)
    setActiveModel(null)
  }, [])

  const exportChat = useCallback(() => {
    const lines = messages.map(m => {
      const who  = m.role === 'user' ? 'Tú' : 'NexusAI'
      const time = new Date(m.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      const plain = m.text
        .replace(/```[\w]*\n?[\s\S]*?```/g, '[bloque de código]')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
      return `[${time}] ${who}: ${plain}`
    }).join('\n\n')

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nexusai-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [messages])

  return {
    messages,
    sendMessage,
    retryLast,
    isTyping,
    reactions,
    toggleReaction,
    resetChat,
    exportChat,
    activeModel,
    convId: convIdRef.current,
  }
}
