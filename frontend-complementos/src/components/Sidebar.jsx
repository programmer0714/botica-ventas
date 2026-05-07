import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

/* ── Iconos SVG locales (carpeta assets/icons) ── */
import logoImg      from '../assets/images/logo-nova-salud.png'
import avatarImg    from '../assets/images/avatar-default.png'

const NAV = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard',  label: 'Inicio',             icon: <IconHome /> },
      { to: '/ventas',     label: 'Ventas',             icon: <IconVentas /> },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { to: '/inventario',    label: 'Inventario',       icon: <IconInventario /> },
      { to: '/devoluciones',  label: 'Devoluciones',     icon: <IconDevolucion /> },
      { to: '/caja',          label: 'Caja / Turno',     icon: <IconCaja /> },
    ]
  },
  {
    section: 'Atención',
    items: [
      { to: '/reclamaciones', label: 'Reclamaciones',   icon: <IconReclamo /> },
    ]
  },
  {
    section: 'Análisis',
    items: [
      { to: '/reportes',   label: 'Reportes',           icon: <IconReporte /> },
    ]
  }
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* LOGO */}
      <div className={styles.logo}>
        <div className={styles.logoImg}>
          {/* 🖼️ Aquí va el logo de la botica */}
          <img
            src={logoImg}
            alt="Logo Nova Salud"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
          />
          <div className={styles.logoFallback} style={{display:'none'}}>
            <span>🏥</span>
          </div>
        </div>
        <div>
          <p className={styles.marcaNombre}>Nova Salud</p>
          <p className={styles.marcaSub}>Sistema de Ventas</p>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav className={styles.nav}>
        {NAV.map(group => (
          <div key={group.section}>
            <p className={styles.navSection}>{group.section}</p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* USUARIO */}
      <div className={styles.userBox}>
        <div className={styles.avatar}>
          {/* 🖼️ Aquí va la foto del empleado */}
          <img
            src={avatarImg}
            alt="Avatar usuario"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
          />
          <div className={styles.avatarFallback} style={{display:'none'}}>U</div>
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Administrador</p>
          <p className={styles.userRole}>Turno Mañana</p>
        </div>
      </div>
    </aside>
  )
}

/* ── SVG Icons ── */
function IconHome()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9"/></svg> }
function IconVentas()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> }
function IconInventario() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function IconDevolucion() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 109 9"/><path d="M3 12V6M3 12H9"/></svg> }
function IconCaja()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg> }
function IconReclamo()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> }
function IconReporte()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
