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
          {new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>
    </header>
  )
}
