import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSessions, deleteSession } from '../services/api'

export default function Sidebar({ currentSessionId, onSelectSession, onNewChat, isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  const loadSessions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getSessions()
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [user])

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    try {
      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) onNewChat()
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  const handleNewChat = () => {
    onNewChat()
    onClose()
  }

  const handleSelect = (sessionId) => {
    onSelectSession(sessionId)
    onClose()
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return 'Hoy'
    if (diff < 172800000) return 'Ayer'
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-full w-72 flex flex-col border-r transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'var(--bg-chat)',
          borderColor: 'var(--border-light)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--utc-green)' }}
            >
              UT
            </div>
            <span className="text-sm font-semibold">Historial</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva conversación
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {!user ? (
            <p
              className="text-xs text-center px-4 py-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Inicia sesión para ver tu historial de conversaciones
            </p>
          ) : loading ? (
            <p
              className="text-xs text-center py-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cargando...
            </p>
          ) : sessions.length === 0 ? (
            <p
              className="text-xs text-center px-4 py-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              No tienes conversaciones guardadas aún
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelect(session.id)}
                  className={`w-full text-left group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-gray-50 ${
                    currentSessionId === session.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] leading-tight">
                      {session.title}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {formatDate(session.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User footer */}
        {user && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <div className="min-w-0">
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="text-xs px-2 py-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Salir
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
