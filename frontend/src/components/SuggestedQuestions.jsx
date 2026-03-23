const SUGGESTIONS = [
  {
    icon: '🎓',
    text: '¿Qué carreras ofrece la UT Cancún?',
  },
  {
    icon: '📋',
    text: '¿Cómo es el proceso de admisión 2026?',
  },
  {
    icon: '📄',
    text: '¿Qué trámites ofrece Servicios Escolares?',
  },
  {
    icon: '📍',
    text: '¿Dónde se ubica la universidad y cómo contactarlos?',
  },
]

export default function SuggestedQuestions({ onClick }) {
  return (
    <div className="mt-6 space-y-2">
      <p
        className="text-[12px] font-medium mb-3 px-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        Preguntas sugeridas
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onClick(s.text)}
            className="group flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all hover:border-[var(--utc-green)] hover:bg-green-50/50 active:scale-[0.98]"
            style={{
              background: 'var(--bg-chat)',
              borderColor: 'var(--border-light)',
            }}
          >
            <span className="text-lg flex-shrink-0">{s.icon}</span>
            <span
              className="text-[13px] leading-snug group-hover:text-[var(--utc-green)] transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
