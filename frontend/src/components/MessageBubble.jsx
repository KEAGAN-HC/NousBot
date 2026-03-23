import { useMemo } from 'react'

function parseMarkdown(text) {
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Unordered lists
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

  // Line breaks into paragraphs
  html = html
    .split('\n\n')
    .map((p) => {
      p = p.trim()
      if (!p) return ''
      if (
        p.startsWith('<ul>') ||
        p.startsWith('<ol>') ||
        p.startsWith('<li>')
      )
        return p
      return `<p>${p}</p>`
    })
    .join('')

  // Single line breaks within paragraphs
  html = html.replace(/(?<!<\/li>)\n(?!<)/g, '<br/>')

  return html
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const html = useMemo(
    () => (isUser ? null : parseMarkdown(message.content)),
    [message.content, isUser]
  )

  return (
    <div
      className={`msg-appear flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isUser && (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold mt-0.5"
            style={{ background: 'var(--utc-green)' }}
          >
            UT
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
            isUser
              ? 'text-white rounded-br-md'
              : 'bot-message rounded-bl-md'
          }`}
          style={{
            background: isUser ? 'var(--bg-user-msg)' : 'var(--bg-bot-msg)',
            color: isUser ? 'var(--text-on-green)' : 'var(--text-primary)',
          }}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  )
}
