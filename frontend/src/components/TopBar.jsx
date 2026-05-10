import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './TopBar.module.css'
import { getStockBajo } from '../api'

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

  const [productos, setProductos] = useState([])
  const [abierto, setAbierto]     = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    getStockBajo()
      .then(res => { if (res.ok) setProductos(res.data) })
      .catch(() => {})
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const alertas = productos.length

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>

        {/* ── CAMPANA ── */}
        <div ref={ref} style={{ position: 'relative' }}>
          <div
            className={styles.alertBadge}
            style={{ opacity: alertas === 0 ? 0.5 : 1, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setAbierto(prev => !prev)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {alertas === 0 ? 'Sin alertas' : `${alertas} alertas de stock`}
          </div>

          {/* ── DROPDOWN ── */}
          {abierto && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '300px', zIndex: 500,
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '1px solid rgba(224,232,229,1)',
              overflow: 'hidden',
            }}>
              {/* Cabecera */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(224,232,229,1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Alertas de Stock</span>
                <span style={{
                  background: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)',
                  borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                }}>
                  {alertas} productos
                </span>
              </div>

              {/* Lista */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {alertas === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '13px' }}>
                    ✅ Sin alertas de stock
                  </div>
                ) : productos.map(p => (
                  <div key={p.id_producto} style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(224,232,229,0.6)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '13px',
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0, marginBottom: '2px' }}>{p.nombre}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-3)' }}>
                        Mínimo: {p.stock_minimo} und.
                      </p>
                    </div>
                    <span style={{
                      background: p.stock === 0 ? 'rgba(220,38,38,0.12)' : 'rgba(240,165,0,0.12)',
                      color: p.stock === 0 ? 'var(--color-danger)' : 'rgba(160,110,0,1)',
                      borderRadius: '20px', padding: '3px 10px',
                      fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {p.stock === 0 ? 'Sin stock' : `${p.stock} und.`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pie con link a inventario */}
              {alertas > 0 && (
                <div style={{
                  padding: '10px 16px', textAlign: 'center',
                  borderTop: '1px solid rgba(224,232,229,1)',
                }}>
                  <a href="/inventario" style={{
                    fontSize: '12px', color: 'var(--color-primary)',
                    fontWeight: 600, textDecoration: 'none',
                  }}
                    onClick={() => setAbierto(false)}
                  >
                    Ver inventario completo →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FECHA ── */}
        <div className={styles.fecha}>
          <IconCalendar />
          {new Date().toLocaleDateString('es-PE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>

      </div>
    </header>
  )
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}