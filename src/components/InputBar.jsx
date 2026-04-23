import { useState, useRef, useCallback } from 'react'
import './InputBar.css'

const SUGGESTIONS = ['¿Cómo funciona la IA?', 'Cuéntame algo curioso', 'Explícame React', 'Escríbeme un poema', '¿Qué es el universo?']

export default function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }, [value, disabled, onSend])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const handleSuggestion = (text) => {
    if (disabled) return
    onSend(text)
  }

  const charCount = value.length
  const nearLimit = charCount > 430

  return (
    <footer className="input-bar-wrapper">
      <div className="suggestions" aria-label="Sugerencias">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="suggestion-chip"
            onClick={() => handleSuggestion(s)}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="input-row">
        <div className={`input-box ${disabled ? 'disabled' : ''}`}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje…"
            disabled={disabled}
            maxLength={500}
            rows={1}
            aria-label="Mensaje"
            autoComplete="off"
            spellCheck
          />

          <div className="input-actions">
            {nearLimit && (
              <span className={`char-count ${charCount >= 500 ? 'limit' : ''}`}>
                {500 - charCount}
              </span>
            )}
            <button
              className="send-btn"
              onClick={submit}
              disabled={disabled || !value.trim()}
              aria-label="Enviar mensaje"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="input-hint">
        NexusAI puede cometer errores. Verifica información importante. · <kbd>Enter</kbd> para enviar
        <span className="input-hint-author"> · Creado por <strong>Andres Escolastico</strong></span>
      </p>
    </footer>
  )
}
