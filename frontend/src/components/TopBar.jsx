import { useLocation } from 'react-router-dom'
import styles from './TopBar.module.css'

const TITLES = {
  '/dashboard':     'Inicio',
  '/ventas':        'Módulo de Ventas',
  '/inventario':    'Inventario de Productos',
  '/reclamaciones': 'Libro de Reclamaciones',
  '/devoluciones':  'Devoluciones',
  '/reportes':      'Reportes y Dashboard',
  '/caja':          'Caja / Turno',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Nova Salud'

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        <div className={styles.alertBadge}>
          {/* Icono alerta */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          5 alertas de stock
        </div>
        <div className={styles.fecha}>
          <IconCalendar />
          {new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>
    </header>
  )
}
function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
