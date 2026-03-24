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

  useEffect(() => { loadSessions() }, [user])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (currentSessionId === id) onNewChat()
    } catch (err) { console.error(err) }
  }

  const formatDate = (d) => {
    const diff = Date.now() - new Date(d)
    if (diff < 86400000) return 'Hoy'
    if (diff < 172800000) return 'Ayer'
    return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:relative z-40 h-full w-64 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--bg-secondary)' }}>
        {/* Top */}
        <div className="p-3 flex flex-col gap-1">
          <button
            onClick={() => { onNewChat(); onClose() }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo chat
          </button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {!user ? (
            <p className="text-[12px] text-center px-4 py-6" style={{ color: 'var(--text-tertiary)' }}>
              Inicia sesión para guardar tu historial
            </p>
          ) : loading ? (
            <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-tertiary)' }}>Cargando...</p>
          ) : sessions.length === 0 ? (
            <p className="text-[12px] text-center px-4 py-6" style={{ color: 'var(--text-tertiary)' }}>
              Sin conversaciones aún
            </p>
          ) : (
            <div className="space-y-0.5">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); onClose() }}
                  className={`w-full group flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    currentSessionId === s.id
                      ? 'bg-[var(--bg-hover)]'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="flex-1 truncate text-left">{s.title}</span>
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-active)] transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-[12px] px-2 py-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Salir
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-center" style={{ color: 'var(--text-tertiary)' }}>
              NousBot · UT Cancún
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
