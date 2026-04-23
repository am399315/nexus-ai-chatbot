import './ConfigPanel.css'

const TONES = [
  { id: 'casual',    label: 'Casual',    desc: 'Amigable y relajado',      icon: '😊' },
  { id: 'formal',    label: 'Formal',    desc: 'Profesional y estructurado', icon: '💼' },
  { id: 'technical', label: 'Técnico',   desc: 'Preciso y detallado',       icon: '⚙️' },
  { id: 'creative',  label: 'Creativo',  desc: 'Expresivo e imaginativo',   icon: '✨' },
]

export default function ConfigPanel({ tone, temperature, onTone, onTemp, onClose }) {
  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel" onClick={e => e.stopPropagation()}>
        <div className="config-header">
          <span className="config-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              <circle cx="1" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="2" fill="currentColor" stroke="none"/>
            </svg>
            Configuración
          </span>
          <button className="config-close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="config-body">
          <section className="config-section">
            <label className="config-label">Tono del asistente</label>
            <div className="tone-grid">
              {TONES.map(t => (
                <button
                  key={t.id}
                  className={`tone-btn${tone === t.id ? ' active' : ''}`}
                  onClick={() => onTone(t.id)}
                >
                  <span className="tone-icon">{t.icon}</span>
                  <span className="tone-name">{t.label}</span>
                  <span className="tone-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="config-section">
            <label className="config-label">
              Creatividad
              <span className="temp-value">{Math.round(temperature * 100)}%</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={temperature}
              onChange={e => onTemp(parseFloat(e.target.value))}
              className="temp-slider"
            />
            <div className="temp-labels">
              <span>Más preciso</span>
              <span>Más creativo</span>
            </div>
          </section>

          <div className="config-note">
            Los cambios aplican al próximo mensaje.
          </div>
        </div>
      </div>
    </div>
  )
}
