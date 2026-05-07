import styles from './Dashboard.module.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

/* 🖼️ Imagen banner del dashboard desde assets/images */
import bannerImg from '../assets/images/dashboard-banner.jpg'

const STATS = [
  { label: 'Ventas Hoy',          value: 'S/ 1,250',  change: '+12% vs ayer',  up: true,  gradient: 'var(--gradient-stat-green)',  iconColor: 'var(--color-primary)' },
  { label: 'Productos en Stock',  value: '342',        change: '5 bajo mínimo', up: false, gradient: 'var(--gradient-stat-red)',    iconColor: 'var(--color-danger)' },
  { label: 'Boletas emitidas',    value: '28',         change: '+5 vs ayer',    up: true,  gradient: 'var(--gradient-stat-yellow)', iconColor: 'var(--color-accent)' },
  { label: 'Reclamaciones',       value: '2',          change: '1 pendiente',   up: false, gradient: 'var(--gradient-stat-blue)',   iconColor: 'var(--color-info)' },
]

const VENTAS_SEMANA = [
  { dia: 'Lun', total: 820 }, { dia: 'Mar', total: 1100 },
  { dia: 'Mié', total: 980 }, { dia: 'Jue', total: 1340 },
  { dia: 'Vie', total: 1250 }, { dia: 'Sáb', total: 1620 },
  { dia: 'Dom', total: 540 },
]

const VENTAS_RECIENTES = [
  { serie: 'B001-000012', cliente: 'Juan Pérez',     total: 'S/ 45.50',  tipo: 'Boleta',  estado: 'Activa' },
  { serie: 'F001-000003', cliente: 'RVM Maquinarias',total: 'S/ 280.00', tipo: 'Factura', estado: 'Activa' },
  { serie: 'B001-000011', cliente: 'María López',    total: 'S/ 22.00',  tipo: 'Boleta',  estado: 'Activa' },
  { serie: 'B001-000010', cliente: 'Carlos Ríos',    total: 'S/ 67.80',  tipo: 'Boleta',  estado: 'Anulada'},
]

const ALERTAS_STOCK = [
  { nombre: 'Amoxicilina 500mg',    stock: 8,  minimo: 20 },
  { nombre: 'Paracetamol Jarabe',   stock: 3,  minimo: 15 },
  { nombre: 'Ibuprofeno 400mg',     stock: 12, minimo: 20 },
]

export default function Dashboard() {
  return (
    <div>
      {/* BANNER */}
      <div className={styles.banner}>
        {/* 🖼️ Imagen banner: reemplazar dashboard-banner.jpg en assets/images */}
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
            <p className={styles.statValue}>{s.value}</p>
            <p className={`${styles.statChange} ${s.up ? styles.up : styles.down}`}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICO + ALERTAS */}
      <div className={styles.grid2}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas de la semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VENTAS_SEMANA} barSize={28}>
              <XAxis dataKey="dia" tick={{fontSize:12, fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:'10px', border:'1px solid rgba(224,232,229,1)', fontSize:12}} />
              <Bar dataKey="total" fill="rgba(13,122,95,1)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alertas de Stock</h3>
            <span className="badge badge-red">{ALERTAS_STOCK.length} productos</span>
          </div>
          <div className={styles.alertasList}>
            {ALERTAS_STOCK.map(a => (
              <div key={a.nombre} className={styles.alertaRow}>
                <div>
                  <p className={styles.alertaNombre}>{a.nombre}</p>
                  <p className={styles.alertaSub}>Mínimo: {a.minimo} und.</p>
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
      <div className="card" style={{marginTop: '16px'}}>
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
              {VENTAS_RECIENTES.map(v => (
                <tr key={v.serie}>
                  <td style={{fontWeight:500}}>{v.serie}</td>
                  <td>{v.cliente}</td>
                  <td><span className={`badge ${v.tipo==='Factura' ? 'badge-blue' : 'badge-gray'}`}>{v.tipo}</span></td>
                  <td style={{fontWeight:600, color:'var(--color-primary)'}}>{v.total}</td>
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
