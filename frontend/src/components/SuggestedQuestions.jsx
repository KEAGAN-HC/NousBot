const SUGGESTIONS = [
  { text: '¿Qué carreras ofrece la UT Cancún?' },
  { text: '¿Cómo es el proceso de admisión 2026?' },
  { text: '¿Qué trámites ofrece Servicios Escolares?' },
  { text: '¿Dónde se ubica la universidad?' },
]

export default function SuggestedQuestions({ onClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-2xl mx-auto">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={i}
          onClick={() => onClick(s.text)}
          className="text-left px-4 py-3 rounded-xl text-[13px] leading-snug transition-colors border"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--bg-hover)'
            e.target.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = 'var(--text-secondary)'
          }}
        >
          {s.text}
        </button>
      ))}
    </div>
  )
}
