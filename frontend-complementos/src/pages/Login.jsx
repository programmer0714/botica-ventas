import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

/* 🖼️ Imagen de fondo y logo desde assets/images */
import bgImg   from '../assets/images/login-bg.jpg'
import logoImg from '../assets/images/logo-nova-salud.png'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', password: '' })

  const handleLogin = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      {/* FONDO CON IMAGEN */}
      <div className={styles.bg}>
        {/* 🖼️ Imagen de fondo: reemplazar login-bg.jpg en assets/images */}
        <img src={bgImg} alt="Fondo farmacia" className={styles.bgImg}
          onError={e => e.target.style.display='none'} />
        <div className={styles.bgOverlay} />
      </div>

      {/* CARD DE LOGIN */}
      <div className={styles.card}>
        {/* LOGO */}
        <div className={styles.logoBox}>
          {/* 🖼️ Logo de la botica: reemplazar logo-nova-salud.png en assets/images */}
          <img src={logoImg} alt="Logo Nova Salud" className={styles.logo}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
          <div className={styles.logoFallback} style={{display:'none'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>Botica Nova Salud</h1>
        <p className={styles.sub}>Ingresa tus credenciales para continuar</p>

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
          <button type="submit" className={`btn btn-primary ${styles.btnLogin}`}>
            Ingresar al Sistema
          </button>
        </form>

        <p className={styles.footer}>
          © 2025 Botica Nova Salud — SENATI Ingeniería de Software con IA
        </p>
      </div>
    </div>
  )
}
