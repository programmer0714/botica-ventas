import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboard } from '../api'

import bannerImg from '../assets/images/dashboard-banner.jpg'

export default function Dashboard() {
  const [datos, setDatos]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Datos por defecto mientras carga
  const STATS_DEFAULT = [
    { label: 'Ventas Hoy',         value: 'S/ 0.00', change: 'Cargando...', up: true,  gradient: 'var(--gradient-stat-green)',  iconColor: 'var(--color-primary)' },
    { label: 'Productos en Stock', value: '0',        change: 'Cargando...', up: false, gradient: 'var(--gradient-stat-red)',    iconColor: 'var(--color-primary)' },
    { label: 'Boletas emitidas',   value: '0',        change: 'Cargando...', up: true,  gradient: 'var(--gradient-stat-yellow)', iconColor: 'var(--color-primary)' },
    { label: 'Reclamaciones',      value: '0',        change: 'Cargando...', up: false, gradient: 'var(--gradient-stat-blue)',   iconColor: 'var(--color-primary)' },
  ]

  useEffect(() => {
    getDashboard().then(res => {
      if (res.ok) setDatos(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Armar STATS con datos reales
  const STATS = datos ? [
    {
      label: 'Ventas Hoy',
      value: `S/ ${Number(datos.ventas_hoy?.total_hoy || 0).toLocaleString('es-PE', {minimumFractionDigits:2})}`,
      change: `${datos.ventas_hoy?.cantidad_hoy || 0} transacciones`,
      up: true,
      gradient: 'var(--gradient-stat-green)',
      iconColor: 'var(--color-primary)'
    },
    {
      label: 'Stock Bajo',
      value: String(datos.stock_bajo?.cantidad || 0),
      change: 'productos bajo mínimo',
      up: false,
      gradient: 'var(--gradient-stat-red)',
      iconColor: 'var(--color-primary)'
    },
    {
      label: 'Boletas emitidas',
      value: String(datos.ventas_hoy?.cantidad_hoy || 0),
      change: 'hoy',
      up: true,
      gradient: 'var(--gradient-stat-yellow)',
      iconColor: 'var(--color-primary)'
    },
    {
      label: 'Reclamaciones',
      value: '0',
      change: 'sin pendientes',
      up: false,
      gradient: 'var(--gradient-stat-blue)',
      iconColor: 'var(--color-primary)'
    },
  ] : STATS_DEFAULT

  // Armar datos del gráfico
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const VENTAS_SEMANA = datos?.ventas_semana?.map(v => ({
    dia: diasSemana[new Date(v.dia).getDay()],
    total: Number(v.total)
  })) || [
    { dia: 'Lun', total: 0 }, { dia: 'Mar', total: 0 },
    { dia: 'Mié', total: 0 }, { dia: 'Jue', total: 0 },
    { dia: 'Vie', total: 0 }, { dia: 'Sáb', total: 0 },
    { dia: 'Dom', total: 0 },
  ]

  const VENTAS_RECIENTES = datos?.ventas_recientes || []
  const ALERTAS_STOCK    = datos?.stock_bajo_lista  || []

  return (
    <div>
      {/* BANNER */}
      <div className={styles.banner}>
        <img src={bannerImg} alt="Banner botica"
          onError={e => e.target.style.display='none'} />
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>Bienvenido al Sistema</h2>
          <p className={styles.bannerSub}>Botica Nova Salud — {new Date().toLocaleDateString('es-PE', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className={styles.statsGrid}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statCard} style={{background: s.gradient}}>
            <div className={styles.statIconBox} style={{color: s.iconColor}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{loading ? '...' : s.value}</p>
            <p className={`${styles.statChange} ${s.up ? styles.up : styles.down}`}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICO + ALERTAS */}
      <div className={styles.grid2}>
        <div className={`card ${styles.dashboardCard}`}>
          <div className="card-header">
            <h3 className="card-title">Ventas de la semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VENTAS_SEMANA} barSize={28}>
              <XAxis dataKey="dia" tick={{fontSize:12, fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:'10px', border:'1px solid rgba(224,232,229,1)', fontSize:12}} />
              <Bar dataKey="total" fill="rgba(220, 38, 38, 0.2)" stroke="rgba(153, 6, 6, 1)" strokeWidth={2} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`card ${styles.dashboardCard}`}>
          <div className="card-header">
            <h3 className="card-title">Alertas de Stock</h3>
            <span className="badge badge-red">{ALERTAS_STOCK.length} productos</span>
          </div>
          <div className={styles.alertasList}>
            {ALERTAS_STOCK.length === 0 ? (
              <p style={{fontSize:'13px', color:'var(--color-text-3)', textAlign:'center', padding:'20px'}}>
                <IconCheck /> Sin alertas de stock
              </p>
            ) : ALERTAS_STOCK.map(a => (
              <div key={a.nombre} className={styles.alertaRow}>
                <div>
                  <p className={styles.alertaNombre}>{a.nombre}</p>
                  <p className={styles.alertaSub}>Mínimo: {a.stock_minimo} und.</p>
                </div>
                <span className={`badge ${a.stock <= 5 ? 'badge-red' : 'badge-yellow'}`}>
                  Stock: {a.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VENTAS RECIENTES */}
      <div className={`card ${styles.dashboardCard}`} style={{marginTop: '16px'}}>
        <div className="card-header">
          <h3 className="card-title">Ventas Recientes</h3>
          <button className="btn btn-outline btn-sm">Ver todas</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Serie / Nº</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {VENTAS_RECIENTES.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{textAlign:'center', color:'var(--color-text-3)', padding:'24px'}}>
                    No hay ventas registradas
                  </td>
                </tr>
              ) : VENTAS_RECIENTES.map((v, i) => (
                <tr key={i}>
                  <td style={{fontWeight:500}}>{v.serie}-{v.correlativo}</td>
                  <td>{v.cliente}</td>
                  <td><span className={`badge ${v.tipo_comprobante==='FACTURA' ? 'badge-blue' : 'badge-gray'}`}>{v.tipo_comprobante}</span></td>
                  <td style={{fontWeight:600, color:'var(--color-primary)'}}>S/ {Number(v.total).toFixed(2)}</td>
                  <td><span className={`badge ${v.estado==='Activa' ? 'badge-green' : 'badge-red'}`}>{v.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px', height:'16px', marginRight:'6px', display:'inline-block', verticalAlign:'middle', color:'var(--color-success)'}}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}