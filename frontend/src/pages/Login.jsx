import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import { loginAPI } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ usuario: 'admin', password: '123456' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginAPI(form.usuario, form.password)
      if (result.ok) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('usuario', JSON.stringify(result.usuario))
        navigate('/dashboard')
      } else {
        setError(result.mensaje || 'Usuario o contraseña incorrectos')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* FONDO ANIMADO 3D (GLASS ORBS) */}
      <div className={styles.bg}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={styles.bgOverlay} />
      </div>

      {/* CARD DE LOGIN */}
      <div className={styles.card}>
        {/* LOGO */}
        <div className={styles.luxuryLogo}>
          <IconCross />
        </div>

        <h1 className={styles.title}>Botica Nova Salud</h1>
        <p className={styles.sub}>Ingresa tus credenciales para continuar</p>

        {error && (
          <div style={{
            background: 'rgba(192,57,43,0.1)',
            border: '1px solid rgba(192,57,43,0.3)',
            color: '#c0392b',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <IconAlert /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ingresa tu usuario"
              value={form.usuario}
              onChange={e => setForm({...form, usuario: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary ${styles.btnLogin}`}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <p className={styles.footer}>
          © 2025 Botica Nova Salud — SENATI Ingeniería de Software con IA
        </p>
      </div>
    </div>
  )
}

/* ── SVG Icons ── */
function IconCross() {
  return (
    <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" style={{width: '32px', height: '32px', filter: 'drop-shadow(0px -1px 1px rgba(0,0,0,0.4))'}}>
      <path d="M10 4v6H4v4h6v6h4v-6h6v-4h-6V4h-4z"/>
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px', height:'16px', marginRight:'6px', display:'inline-block', verticalAlign:'middle'}}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}