import { useEffect, useRef } from 'react'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import './ChatWindow.css'

export default function ChatWindow({
  messages, isTyping,
  reactions, onReaction, onRetry,
  lastBotIdx, searchQuery,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const hasSearch = searchQuery?.trim().length > 0

  return (
    <main className="chat-window" aria-live="polite" aria-label="Conversación">
      <div className="messages-list">
        {messages.length === 1 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="cw-glow" />
            <div className="cw-logo"><span>N</span></div>
            <h2 className="cw-title">Hola, soy <span>NexusAI</span></h2>
            <p className="cw-sub">Powered by Gemini AI · v2.0</p>
            <div className="cw-chips">
              <span className="cw-chip">⚡ Respuestas en tiempo real</span>
              <span className="cw-chip">💬 Múltiples tonos</span>
              <span className="cw-chip">📚 Historial guardado</span>
              <span className="cw-chip">🎨 Código con colores</span>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isLastBot = !msg.isStreaming && msg.role === 'bot' && idx === lastBotIdx
          const matches = hasSearch
            ? msg.text.toLowerCase().includes(searchQuery.toLowerCase())
            : true

          return (
            <Message
              key={msg.id}
              {...msg}
              reaction={reactions?.[msg.id]}
              onReaction={onReaction}
              onRetry={isLastBot ? onRetry : undefined}
              searchQuery={hasSearch ? searchQuery : ''}
              isDimmed={hasSearch && !matches}
            />
          )
        })}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </main>
  )
}
