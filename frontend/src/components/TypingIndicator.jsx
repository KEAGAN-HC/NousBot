export default function TypingIndicator() {
  return (
    <div className="msg-appear flex gap-3 mb-6">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1"
        style={{ background: 'var(--accent)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="flex items-center pt-1">
        <div className="thinking-bars">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      </div>
    </div>
  )
}
