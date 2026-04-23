import './TypingIndicator.css'

export default function TypingIndicator() {
  return (
    <div className="typing-wrapper" aria-label="NexusAI está escribiendo">
      <div className="bot-avatar small">N</div>
      <div className="typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  )
}
