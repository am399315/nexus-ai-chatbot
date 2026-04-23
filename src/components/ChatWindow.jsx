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
