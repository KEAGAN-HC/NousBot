import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendMessage, getSessionMessages } from '../services/api'
import MessageBubble from '../components/MessageBubble'
import TypingIndicator from '../components/TypingIndicator'
import SuggestedQuestions from '../components/SuggestedQuestions'
import AuthModal from '../components/AuthModal'
import Sidebar from '../components/Sidebar'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [hasSkippedAuth, setHasSkippedAuth] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Show auth popup on first load (if not logged in)
  useEffect(() => {
    if (!authLoading && !user && !hasSkippedAuth) {
      setShowAuth(true)
    }
  }, [authLoading, user])

  // Close auth when user logs in
  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, isLoading])

  const handleSend = async (text = null) => {
    const question = (text || input).trim()
    if (!question || isLoading) return

    const userMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(question, sessionId)
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }])
      if (response.session_id && !sessionId) setSessionId(response.session_id)
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al procesar tu pregunta. Intenta de nuevo.',
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleNewChat = () => {
    setMessages([])
    setSessionId(null)
    setInput('')
  }

  const handleSelectSession = async (id) => {
    try {
      const data = await getSessionMessages(id)
      const loaded = data.messages.map((m) => ({ role: m.role, content: m.content }))
      setMessages(loaded)
      setSessionId(id)
    } catch (err) { console.error(err) }
  }

  const handleSkipAuth = () => {
    setHasSkippedAuth(true)
    setShowAuth(false)
  }

  const showWelcome = messages.length === 0

  // Loading screen
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-float">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex w-full">
      {/* Sidebar */}
      <Sidebar
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              NousBot
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* New chat */}
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Nuevo chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>

            {user ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white"
                style={{ background: 'var(--accent)' }}
                title={user.email}
              >
                {user.email?.[0]?.toUpperCase()}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        {/* Chat area */}
        {showWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="animate-float mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              ¿En qué puedo ayudarte?
            </h2>
            <p className="text-[14px] mb-8" style={{ color: 'var(--text-secondary)' }}>
              Pregunta sobre carreras, trámites, admisión y más
            </p>
            <SuggestedQuestions onClick={(q) => handleSend(q)} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-2xl mx-auto">
            <div
              className="flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all focus-within:border-[var(--text-tertiary)]"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta algo..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-[14px] leading-relaxed py-0.5 placeholder:text-[var(--text-tertiary)]"
                style={{ color: 'var(--text-primary)', maxHeight: '150px', minHeight: '24px' }}
                onInput={(e) => { e.target.style.height = '24px'; e.target.style.height = e.target.scrollHeight + 'px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
                style={{ background: input.trim() ? 'var(--text-primary)' : 'var(--text-tertiary)', color: 'var(--bg-primary)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
              NousBot puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>

      {/* Auth modal - shows on first load */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSkip={handleSkipAuth}
        />
      )}
    </div>
  )
}
