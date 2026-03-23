import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendMessage, getSessionMessages } from '../services/api'
import MessageBubble from '../components/MessageBubble'
import TypingIndicator from '../components/TypingIndicator'
import SuggestedQuestions from '../components/SuggestedQuestions'
import AuthModal from '../components/AuthModal'
import Sidebar from '../components/Sidebar'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    '¡Hola! 👋 Soy **UTC Bot**, el asistente virtual de la **Universidad Tecnológica de Cancún**.\n\nPuedo ayudarte con información sobre:\n\n* Carreras y oferta educativa\n* Trámites y servicios escolares\n* Proceso de admisión e inscripción\n* Titulación y estadías\n* Contacto y ubicación\n\n¿En qué puedo ayudarte hoy?',
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (text = null) => {
    const question = (text || input).trim()
    if (!question || isLoading) return

    const userMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(question, sessionId)
      const botMessage = { role: 'assistant', content: response.answer }
      setMessages((prev) => [...prev, botMessage])

      if (response.session_id && !sessionId) {
        setSessionId(response.session_id)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo o contacta a la universidad al **(998) 881 19 00**.',
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE])
    setSessionId(null)
    setInput('')
  }

  const handleSelectSession = async (selectedSessionId) => {
    try {
      const data = await getSessionMessages(selectedSessionId)
      const loaded = data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      setMessages(loaded.length > 0 ? loaded : [WELCOME_MESSAGE])
      setSessionId(selectedSessionId)
    } catch (err) {
      console.error('Error loading session:', err)
    }
  }

  return (
    <div className="h-full flex w-full">
      {/* Sidebar - solo si está logueado */}
      {user && (
        <Sidebar
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Chat principal */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            )}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'var(--utc-green)' }}
            >
              UT
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">UTC Bot</h1>
              <p className="text-[12px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                Asistente UT Cancún BIS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] font-medium text-green-700">En línea</span>
            </div>

            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Nueva conversación"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>

            {user ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ background: 'var(--utc-green)' }}
                title={user.email}
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--utc-green)' }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages flex-1 overflow-y-auto px-5 py-6" style={{ background: 'var(--bg-primary)' }}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <SuggestedQuestions onClick={(q) => handleSend(q)} />
          )}
        </div>

        {/* Input */}
        <div
          className="px-5 py-3.5 border-t"
          style={{ borderColor: 'var(--border-light)', background: 'var(--bg-chat)' }}
        >
          <div
            className="flex items-end gap-2 rounded-2xl border px-4 py-2.5 transition-all focus-within:border-[var(--utc-green)] focus-within:shadow-[0_0_0_3px_rgba(0,105,62,0.08)]"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta sobre la UT Cancún..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-[14px] leading-relaxed py-0.5 placeholder:text-gray-400"
              style={{ maxHeight: '120px', minHeight: '24px' }}
              onInput={(e) => {
                e.target.style.height = '24px'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="send-btn flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: input.trim() ? 'var(--utc-green)' : 'var(--border-light)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            UTC Bot puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
