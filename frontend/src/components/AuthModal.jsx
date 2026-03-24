import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function ShineBorder({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className="animate-shine pointer-events-none absolute inset-0 rounded-[inherit] will-change-[background-position]"
        style={{
          backgroundImage: 'radial-gradient(transparent, transparent, #10a37f, #7ab8ff, transparent, transparent)',
          backgroundSize: '300% 300%',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '0.8px',
        }}
      />
    </div>
  )
}

export default function AuthModal({ onClose, onSkip }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (isLogin) { await signInWithEmail(email, password); onClose() }
      else { await signUpWithEmail(email, password); setSuccess('Cuenta creada. Revisa tu email para confirmar.') }
    } catch (err) { setError(err.message || 'Error de autenticación') }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    try { await signInWithGoogle() } catch (err) { setError(err.message) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <ShineBorder className="w-full max-w-sm rounded-2xl animate-scale-up">
        <div
          className="rounded-2xl px-6 py-8 sm:px-8 sm:py-10 relative"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="animate-float inline-block">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              NousBot
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Asistente inteligente · UT Cancún
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all border"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>o</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none border transition-colors focus:border-[var(--accent)]"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
            <input
              type="password" placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none border transition-colors focus:border-[var(--accent)]"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />

            {error && <p className="text-[12px] px-1" style={{ color: 'var(--danger)' }}>{error}</p>}
            {success && <p className="text-[12px] px-1" style={{ color: 'var(--accent)' }}>{success}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-tertiary)' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
              className="font-medium hover:underline" style={{ color: 'var(--accent)' }}
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>

          {/* Skip */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={onSkip}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              Continuar sin cuenta →
            </button>
            <p className="text-[11px] text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Tu historial no se guardará entre sesiones
            </p>
          </div>
        </div>
      </ShineBorder>
    </div>
  )
}
