/* === REPORTES — conectado a API === */
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import styles from './Reportes.module.css'
import { getVentas, getProductos } from '../api'

const COLORES_PIE = [
  'rgba(13,122,95,1)', 'rgba(26,111,168,1)',
  'rgba(240,165,0,1)', 'rgba(192,57,43,1)',
  'rgba(142,68,173,1)', 'rgba(39,174,96,1)',
]

// Fecha por defecto: primer día del mes actual hasta hoy
const hoy    = new Date()
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  .toISOString().split('T')[0]
const fechaHoy = hoy.toISOString().split('T')[0]

export default function Reportes() {
  const [desde, setDesde] = useState(primerDiaMes)
  const [hasta, setHasta] = useState(fechaHoy)

  const [ventas,    setVentas]    = useState([])
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ── Carga de datos ──────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resVentas, resProductos] = await Promise.all([
        getVentas({ desde, hasta }),
        getProductos(),
      ])
      if (resVentas.ok)    setVentas(resVentas.data)
      else setError('No se pudieron cargar las ventas.')
      if (resProductos.ok) setProductos(resProductos.data)
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ── Procesamiento local de datos ────────────────────────────────────────

  // Ventas por día (para el BarChart)
  const ventasPorDia = (() => {
    const mapa = {}
    ventas.forEach(v => {
      const dia = new Date(v.fecha_hora).toLocaleDateString('es-PE', { day: '2-digit' })
      mapa[dia] = (mapa[dia] || 0) + Number(v.total)
    })
    return Object.entries(mapa)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dia, total]) => ({ dia, total: Number(total.toFixed(2)) }))
  })()

  // Total general del período
  const totalPeriodo = ventas.reduce((acc, v) => acc + Number(v.total), 0)

  // Ventas por categoría (para el PieChart) — agrupa por categoría del producto
  const ventasPorCategoria = (() => {
    const mapa = {}
    ventas.forEach(v => {
      const cat = v.categoria ?? 'Sin categoría'
      mapa[cat] = (mapa[cat] || 0) + 1
    })
    return Object.entries(mapa).map(([name, value]) => ({ name, value }))
  })()

  // Top 5 productos más vendidos
  const topProductos = (() => {
    const mapa = {}
    ventas.forEach(v => {
      const nombre = v.producto ?? 'Desconocido'
      if (!mapa[nombre]) mapa[nombre] = { nombre, cantidad: 0, ingreso: 0 }
      mapa[nombre].cantidad += Number(v.cantidad ?? 1)
      mapa[nombre].ingreso  += Number(v.total)
    })
    return Object.values(mapa)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
  })()

  // Ventas por empleado
  const porEmpleado = (() => {
    const mapa = {}
    ventas.forEach(v => {
      const nombre = v.empleado ?? 'Sin asignar'
      if (!mapa[nombre]) mapa[nombre] = { nombre, ventas: 0, total: 0 }
      mapa[nombre].ventas += 1
      mapa[nombre].total  += Number(v.total)
    })
    return Object.values(mapa).sort((a, b) => b.total - a.total)
  })()

  // Stock bajo (de productos)
  const stockBajo = productos.filter(p => p.stock < p.stock_minimo).length

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* FILTROS */}
      <div className={styles.filtros}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Desde:</label>
          <input type="date" className="form-control" style={{ width: '150px' }}
            value={desde} onChange={e => setDesde(e.target.value)} />
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Hasta:</label>
          <input type="date" className="form-control" style={{ width: '150px' }}
            value={hasta} onChange={e => setHasta(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={cargarDatos}>
            Aplicar
          </button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleExportarCSV}>
          Exportar CSV
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
          color: 'var(--color-danger)', fontSize: '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* RESUMEN RÁPIDO */}
      {!loading && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '16px',
        }}>
          {[
            ['Total del período',  `S/ ${totalPeriodo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
            ['Comprobantes',       `${ventas.length} emitidos`],
            ['Productos stock bajo', `${stockBajo} productos`],
          ].map(([label, val]) => (
            <div key={label} className="card" style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* GRÁFICOS */}
      <div className={styles.grid2} style={{ marginBottom: '16px' }}>

        {/* Ventas por día */}
        <div className={`card ${styles.reportCard}`}>
          <div className="card-header">
            <h3 className="card-title">Ventas del período</h3>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-3)' }}>Cargando...</p>
          ) : ventasPorDia.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-3)' }}>Sin datos en este rango.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasPorDia} barSize={18}>
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'rgba(138,160,155,1)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(138,160,155,1)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={val => [`S/ ${val}`, 'Total']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid rgba(224,232,229,1)', fontSize: 12 }}
                />
                <Bar dataKey="total" fill="rgba(220,38,38,0.2)" stroke="rgba(153,6,6,1)" strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ventas por categoría */}
        <div className={`card ${styles.reportCard}`}>
          <div className="card-header">
            <h3 className="card-title">Ventas por Categoría</h3>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-3)' }}>Cargando...</p>
          ) : ventasPorCategoria.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-3)' }}>Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ventasPorCategoria} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                  {ventasPorCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={styles.grid2}>

        {/* Top 5 productos */}
        <div className={`card ${styles.reportCard}`}>
          <div className="card-header">
            <h3 className="card-title">Top 5 Productos Más Vendidos</h3>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)' }}>Cargando...</p>
          ) : topProductos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)' }}>Sin ventas en este período.</p>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Producto</th><th>Cantidad</th><th>Ingreso</th></tr>
              </thead>
              <tbody>
                {topProductos.map((p, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-green">#{i + 1}</span></td>
                    <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                    <td>{p.cantidad} und.</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      S/ {p.ingreso.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Ventas por empleado */}
        <div className={`card ${styles.reportCard}`}>
          <div className="card-header">
            <h3 className="card-title">Ventas por Empleado</h3>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)' }}>Cargando...</p>
          ) : porEmpleado.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)' }}>Sin datos.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Empleado</th><th>Ventas</th><th>Total</th></tr>
              </thead>
              <tbody>
                {porEmpleado.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{e.nombre}</td>
                    <td>{e.ventas} comprobantes</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      S/ {e.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  // ── Exportar CSV ────────────────────────────────────────────────────────
  function handleExportarCSV() {
    if (ventas.length === 0) { alert('No hay datos para exportar.'); return }
    const cabecera = ['Fecha', 'Comprobante', 'Cliente', 'Empleado', 'Producto', 'Cantidad', 'Total']
    const filas = ventas.map(v => [
      new Date(v.fecha_hora).toLocaleDateString('es-PE'),
      `${v.serie}-${v.correlativo}`,
      v.cliente   ?? '',
      v.empleado  ?? '',
      v.producto  ?? '',
      v.cantidad  ?? '',
      Number(v.total).toFixed(2),
    ])
    const csv = [cabecera, ...filas].map(f => f.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `reporte_ventas_${desde}_${hasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
}