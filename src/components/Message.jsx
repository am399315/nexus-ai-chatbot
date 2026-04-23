import { useMemo, useState } from 'react'
import './Message.css'

function formatTime(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightQuery(html, query) {
  if (!query) return html
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-highlight">$1</mark>'
  )
}

function renderText(text) {
  const segments = text.split(/(```[\w]*\n?[\s\S]*?```)/g)
  return segments.map(seg => {
    if (seg.startsWith('```')) {
      const match = seg.match(/^```(\w*)\n?([\s\S]*)```$/)
      if (match) {
        const lang = match[1] || 'code'
        const code = escapeHtml(match[2])
        return `<pre class="code-block"><div class="code-label">${lang}</div><code>${code}</code></pre>`
      }
    }
    return seg
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }).join('')
}

export default function Message({
  id, role, text, timestamp, isStreaming,
  reaction, onReaction, onRetry,
  searchQuery, isDimmed,
}) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  const rawHtml  = useMemo(() => renderText(text), [text])
  const finalHtml = useMemo(
    () => highlightQuery(rawHtml, searchQuery),
    [rawHtml, searchQuery]
  )

  const handleCopy = () => {
    const plain = text
      .replace(/```[\w]*\n?[\s\S]*?```/g, match => match.replace(/```[\w]*\n?/, '').replace(/```$/, ''))
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
    navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}${isDimmed ? ' dimmed' : ''}`}>
      {!isUser && (
        <div className={`bot-avatar${isStreaming ? ' pulsing' : ''}`}>N</div>
      )}

      <div className="message-content">
        <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          <span dangerouslySetInnerHTML={{ __html: finalHtml }} />
          {isStreaming && <span className="stream-cursor" aria-hidden="true" />}
        </div>

        {!isStreaming && (
          <div className="msg-actions">
            <span className="timestamp">{formatTime(timestamp)}</span>

            <div className="action-btns">
              <button
                className={`action-btn${copied ? ' action-done' : ''}`}
                onClick={handleCopy}
                title="Copiar mensaje"
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>

              {!isUser && (
                <>
                  <button
                    className={`action-btn${reaction === 'like' ? ' reaction-active like' : ''}`}
                    onClick={() => onReaction?.(id, 'like')}
                    title="Me gustó"
                  >
                    <svg viewBox="0 0 24 24" fill={reaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                  </button>
                  <button
                    className={`action-btn${reaction === 'dislike' ? ' reaction-active dislike' : ''}`}
                    onClick={() => onReaction?.(id, 'dislike')}
                    title="No me gustó"
                  >
                    <svg viewBox="0 0 24 24" fill={reaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                  </button>
                  {onRetry && (
                    <button className="action-btn" onClick={onRetry} title="Reintentar respuesta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/>
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="user-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
