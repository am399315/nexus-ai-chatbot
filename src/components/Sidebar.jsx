import './Sidebar.css'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

export default function Sidebar({ conversations, onLoad, onDelete, onClear, onNew, onClose }) {
  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <aside className="sidebar" onClick={e => e.stopPropagation()}>
        <div className="sidebar-header">
          <span className="sidebar-title">Historial</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <button className="sidebar-new-btn" onClick={onNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva conversación
        </button>

        <div className="sidebar-list">
          {conversations.length === 0 ? (
            <div className="sidebar-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Sin conversaciones guardadas</p>
              <small>Las próximas se guardan automáticamente</small>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="conv-item" onClick={() => onLoad(conv)}>
                <div className="conv-body">
                  <span className="conv-title">{conv.title}</span>
                  <span className="conv-meta">
                    {conv.messages.filter(m => m.role === 'user').length} msgs · {formatDate(conv.updatedAt)}
                  </span>
                </div>
                <button
                  className="conv-delete"
                  onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                  aria-label="Eliminar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {conversations.length > 0 && (
          <div className="sidebar-footer">
            <button className="sidebar-clear" onClick={onClear}>
              Borrar todo el historial
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
