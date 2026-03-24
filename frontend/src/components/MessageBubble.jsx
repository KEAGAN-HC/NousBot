import { useMemo } from 'react'

function parseMarkdown(text) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  html = html.split('\n\n').map((p) => {
    p = p.trim()
    if (!p) return ''
    if (p.startsWith('<ul>') || p.startsWith('<ol>') || p.startsWith('<li>')) return p
    return `<p>${p}</p>`
  }).join('')
  html = html.replace(/(?<!<\/li>)\n(?!<)/g, '<br/>')
  return html
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const html = useMemo(() => (isUser ? null : parseMarkdown(message.content)), [message.content, isUser])

  if (isUser) {
    return (
      <div className="msg-appear flex justify-end mb-4">
        <div
          className="max-w-[75%] rounded-3xl px-5 py-3 text-[15px] leading-relaxed"
          style={{ background: 'var(--bg-user-msg)', color: 'var(--text-primary)' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

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
      <div
        className="bot-msg flex-1 text-[15px] leading-relaxed"
        style={{ color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
