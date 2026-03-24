import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadPDF, getStats } from '../services/api'
import AuthModal from '../components/AuthModal'

const ADMIN_EMAILS = []

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [stats, setStats] = useState(null)
  const [uploads, setUploads] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const isAdmin = user && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email))

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try { setStats(await getStats()) } catch (err) { console.error(err) }
  }

  const handleUpload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploads((p) => [{ name: file.name, status: 'error', message: 'Solo PDFs' }, ...p])
        continue
      }
      try {
        const r = await uploadPDF(file)
        setUploads((p) => [{ name: file.name, status: 'success', message: `${r.documents_added} fragmentos` }, ...p])
        loadStats()
      } catch { setUploads((p) => [{ name: file.name, status: 'error', message: 'Error' }, ...p]) }
    }
    setUploading(false)
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Consola de administración</h1>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>Acceso restringido</p>
          <button onClick={() => setShowAuth(true)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white" style={{ background: 'var(--accent)' }}>
            Iniciar sesión
          </button>
          <div className="mt-4"><a href="/" className="text-[13px]" style={{ color: 'var(--accent)' }}>← Volver al chat</a></div>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Acceso denegado</p>
          <a href="/" className="text-[13px]" style={{ color: 'var(--accent)' }}>← Volver al chat</a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>NousBot · Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="px-3 py-1.5 rounded-lg text-[12px] border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>← Chat</a>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{user.email}</span>
          <button onClick={signOut} className="text-[12px] px-2 py-1 rounded" style={{ color: 'var(--text-tertiary)' }}>Salir</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Documentos', value: stats?.total_documents ?? '—' },
              { label: 'Colección', value: stats?.collection_name ?? '—' },
              { label: 'Embeddings', value: stats?.embedding_model?.split('/')[1] ?? '—' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                <p className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Upload */}
          <div
            className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors"
            style={{ borderColor: dragActive ? 'var(--accent)' : 'var(--border-primary)', background: dragActive ? 'var(--accent-subtle)' : 'transparent' }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files) }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/><line x1="9" y1="15" x2="12" y2="12" strokeLinecap="round"/><line x1="15" y1="15" x2="12" y2="12" strokeLinecap="round"/>
            </svg>
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {uploading ? 'Procesando...' : 'Arrastra PDFs o haz clic'}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Se agregan automáticamente a la base de conocimiento</p>
          </div>

          {/* Upload history */}
          {uploads.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Archivos procesados</h3>
              </div>
              {uploads.map((u, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${u.status === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {u.status === 'success' ? 'OK' : 'ERR'}
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                  <span className="text-[12px] ml-auto" style={{ color: 'var(--text-tertiary)' }}>{u.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
