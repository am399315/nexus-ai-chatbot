import { useState, useEffect } from 'react'
import './StatsBar.css'

export default function StatsBar({ messageCount, activeModel }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
  }

  const modelLabel = activeModel
    ? activeModel === 'fallback' ? 'Modo local' : activeModel.replace('gemini-', 'Gemini ').replace('-', ' ')
    : 'Gemini'

  return (
    <div className="stats-bar">
      <span className="stat-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="11" height="11">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {messageCount} msgs
      </span>
      <span className="stat-sep">·</span>
      <span className="stat-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="11" height="11">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {fmt(elapsed)}
      </span>
      <span className="stat-sep">·</span>
      <span className="stat-item stat-model">
        <span className="stat-dot" />
        {modelLabel}
      </span>
    </div>
  )
}
