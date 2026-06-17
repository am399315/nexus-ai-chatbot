import { useState, useEffect, useRef, useMemo } from 'react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import StatsBar from './components/StatsBar'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import ConfigPanel from './components/ConfigPanel'
import { useChat } from './hooks/useChat'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import './App.css'

export default function App() {
  const [tone, setTone] = useState('casual')
  const [temperature, setTemperature] = useState(0.7)

  const {
    messages, sendMessage, retryLast, isTyping,
    reactions, toggleReaction, resetChat, exportChat,
    activeModel, convId,
  } = useChat({ tone, temperature })

  const { theme, toggle: toggleTheme } = useTheme()
  const { conversations, saveConversation, deleteConversation, clearAll } = useHistory()

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [configOpen,  setConfigOpen]  = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const prevTypingRef = useRef(false)
  const menuRef = useRef(null)

  // Auto-guardar conversación cuando el bot termina de responder
  useEffect(() => {
    if (prevTypingRef.current && !isTyping) {
      saveConversation(convId, messages)
    }
    prevTypingRef.current = isTyping
  }, [isTyping, messages, saveConversation, convId])

  // Cerrar menú al hacer click afuera
  useEffect(() => {
    if (!menuOpen) return
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  // Atajo de teclado: Ctrl+F / Cmd+F para búsqueda
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  // Limpiar búsqueda al cerrar
  const handleCloseSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  // Filtrar mensajes según búsqueda
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const q = searchQuery.toLowerCase()
    return messages.filter(m => m.text.toLowerCase().includes(q)).length
  }, [messages, searchQuery])

  const handleLoadConversation = (conv) => {
    resetChat(conv.messages)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    resetChat()
    setSidebarOpen(false)
  }

  const lastBotIdx = messages.findLastIndex(m => m.role === 'bot' && !m.isStreaming)

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">N</span>
            <div>
              <span className="logo-name">NexusAI</span>
              <span className="logo-tagline">Asistente Inteligente</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="status-pill">
            <span className="status-dot" />
            <span>En línea</span>
          </div>
        </div>

        <div className="header-right">
          <div className="header-icons">
            {/* Búsqueda */}
            <button
              className={`icon-btn hide-mobile${searchOpen ? ' active' : ''}`}
              aria-label="Buscar en conversación"
              title="Buscar (Ctrl+F)"
              onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery('') }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Tema */}
            <button
              className="icon-btn"
              aria-label="Cambiar tema"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Configuración */}
            <button
              className={`icon-btn hide-mobile${configOpen ? ' active' : ''}`}
              aria-label="Configuración"
              title="Configuración"
              onClick={() => setConfigOpen(v => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {/* Historial */}
            <button
              className={`icon-btn hide-mobile${sidebarOpen ? ' active' : ''}`}
              aria-label="Historial"
              title="Historial de conversaciones"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/>
                <path d="M17.5 14h.01"/><path d="M14 17.5h7"/><path d="M14 14h7"/>
              </svg>
            </button>

            {/* Menú de 3 puntos */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                aria-label="Menú"
                onClick={() => setMenuOpen(v => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>

              {menuOpen && (
                <div className="dropdown" role="menu">
                  <button className="dropdown-item" onClick={() => { handleNewChat(); setMenuOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nueva conversación
                  </button>
                  <button className="dropdown-item" onClick={() => { exportChat(); setMenuOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exportar chat
                  </button>
                  <button className="dropdown-item" onClick={() => { setSidebarOpen(true); setMenuOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/>
                    </svg>
                    Ver historial
                  </button>
                  <div className="dropdown-divider" />
                  <div className="dropdown-info">
                    <span>NexusAI v2.0 · Gemini AI</span>
                    <span style={{ color: '#a78bfa', fontWeight: 500 }}>© Andres Escolastico</span>
                    <span>Todos los derechos reservados</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Barra de búsqueda ── */}
      {searchOpen && (
        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          matchCount={matchCount}
          onClose={handleCloseSearch}
        />
      )}

      {/* ── Orbs de fondo ── */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* ── Chat ── */}
      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        reactions={reactions}
        onReaction={toggleReaction}
        onRetry={retryLast}
        lastBotIdx={lastBotIdx}
        searchQuery={searchQuery.trim()}
      />

      <StatsBar messageCount={messages.length} activeModel={activeModel} />

      <InputBar onSend={sendMessage} disabled={isTyping} />

      {/* ── Overlays ── */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          onLoad={handleLoadConversation}
          onDelete={deleteConversation}
          onClear={clearAll}
          onNew={handleNewChat}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {configOpen && (
        <ConfigPanel
          tone={tone}
          temperature={temperature}
          onTone={setTone}
          onTemp={setTemperature}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  )
}
