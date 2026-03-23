import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadPDF, getStats } from '../services/api'
import AuthModal from '../components/AuthModal'

// Lista de emails de administradores
const ADMIN_EMAILS = [
  // Agrega aquí los emails que pueden acceder al admin
  // 'tu-email@ejemplo.com',
]

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [stats, setStats] = useState(null)
  const [uploads, setUploads] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Por ahora, cualquier usuario logueado puede ser admin
  // Cambia esto cuando tengas los emails de admins definidos
  const isAdmin = user && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email))

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploads((prev) => [
          { name: file.name, status: 'error', message: 'Solo se aceptan PDFs' },
          ...prev,
        ])
        continue
      }

      try {
        const result = await uploadPDF(file)
        setUploads((prev) => [
          {
            name: file.name,
            status: 'success',
            message: `${result.documents_added} fragmentos agregados`,
          },
          ...prev,
        ])
        loadStats()
      } catch (err) {
        setUploads((prev) => [
          { name: file.name, status: 'error', message: 'Error al procesar' },
          ...prev,
        ])
      }
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  // Si no está logueado, mostrar login
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
            style={{ background: 'var(--utc-green)' }}
          >
            UT
          </div>
          <h1 className="text-xl font-semibold mb-2">Panel de Administración</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Inicia sesión para gestionar la base de conocimiento
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'var(--utc-green)' }}
          >
            Iniciar sesión
          </button>
          <div className="mt-4">
            <a href="/" className="text-sm hover:underline" style={{ color: 'var(--utc-green)' }}>
              ← Volver al chat
            </a>
          </div>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    )
  }

  // Si está logueado pero no es admin
  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Acceso denegado</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            No tienes permisos de administrador.
          </p>
          <a href="/" className="text-sm hover:underline" style={{ color: 'var(--utc-green)' }}>
            ← Volver al chat
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border-light)', background: 'var(--bg-chat)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--utc-green)' }}
          >
            UT
          </div>
          <div>
            <h1 className="text-[15px] font-semibold leading-tight">Panel de Administración</h1>
            <p className="text-[12px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
              Gestión de base de conocimiento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border-light)' }}
          >
            ← Ir al Chat
          </a>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-xs px-2 py-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'var(--bg-chat)', borderColor: 'var(--border-light)' }}
            >
              <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Documentos en base
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--utc-green)' }}>
                {stats?.total_documents ?? '—'}
              </p>
            </div>
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'var(--bg-chat)', borderColor: 'var(--border-light)' }}
            >
              <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Colección
              </p>
              <p className="text-sm font-semibold mt-2">{stats?.collection_name ?? '—'}</p>
            </div>
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'var(--bg-chat)', borderColor: 'var(--border-light)' }}
            >
              <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Modelo embeddings
              </p>
              <p className="text-xs font-mono mt-2">{stats?.embedding_model ?? '—'}</p>
            </div>
          </div>

          {/* Upload area */}
          <div
            className="rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
            style={{
              borderColor: dragActive ? 'var(--utc-green)' : 'var(--border-light)',
              background: dragActive ? 'rgba(0,105,62,0.03)' : 'var(--bg-chat)',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <div className="mb-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto"
                style={{ color: 'var(--text-secondary)' }}
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
                <line x1="9" y1="15" x2="12" y2="12" strokeLinecap="round" />
                <line x1="15" y1="15" x2="12" y2="12" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">
              {uploading ? 'Procesando...' : 'Arrastra PDFs aquí o haz clic para subir'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Los PDFs se procesan automáticamente y se agregan a la base de conocimiento del chatbot
            </p>
          </div>

          {/* Upload history */}
          {uploads.length > 0 && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-chat)', borderColor: 'var(--border-light)' }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <h3 className="text-sm font-semibold">Archivos procesados</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {uploads.map((upload, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          upload.status === 'success'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {upload.status === 'success' ? '✓' : '✗'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{upload.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {upload.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-chat)', borderColor: 'var(--border-light)' }}
          >
            <h3 className="text-sm font-semibold mb-3">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadStats}
                className="px-4 py-2 rounded-xl text-xs font-medium border hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Actualizar estadísticas
              </button>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-medium border hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Ver API Docs (Swagger)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
