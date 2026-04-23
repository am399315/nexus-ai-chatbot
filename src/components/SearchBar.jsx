import { useEffect, useRef } from 'react'
import './SearchBar.css'

export default function SearchBar({ query, onChange, matchCount, onClose }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="search-icon" width="15" height="15">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Buscar en la conversación…"
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
      />
      {query && (
        <span className="search-count">
          {matchCount === 0 ? 'Sin resultados' : `${matchCount} resultado${matchCount !== 1 ? 's' : ''}`}
        </span>
      )}
      <button className="search-close" onClick={onClose} aria-label="Cerrar búsqueda">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
