/* === CAJA / TURNO — conectado a API === */
import { useState, useEffect, useCallback } from 'react'
import styles from './Caja.module.css'
import { getCajaActiva, getHistorialCaja, abrirCaja, cerrarCaja } from '../api'

export default function Caja() {
  // ── Estado de caja ────────────────────────────────────────────────────────
  const [cajaActiva, setCajaActiva]   = useState(null)   // null = cerrada
  const [historial, setHistorial]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // ── Formulario apertura ───────────────────────────────────────────────────
  const [montoApertura, setMontoApertura] = useState('')
  const [abriendo, setAbriendo]           = useState(false)
  const [msgApertura, setMsgApertura]     = useState(null)

  // ── Formulario cierre ─────────────────────────────────────────────────────
  const [montoCierre, setMontoCierre] = useState('')
  const [cerrando, setCerrando]       = useState(false)
  const [msgCierre, setMsgCierre]     = useState(null)

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargarEstado = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resCaja, resHist] = await Promise.all([
        getCajaActiva(),
        getHistorialCaja(),
      ])
      if (resCaja.ok)  setCajaActiva(resCaja.abierta ? resCaja.data : null)
      else setError('No se pudo consultar el estado de caja.')
      if (resHist.ok)  setHistorial(resHist.data)
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarEstado() }, [cargarEstado])

  // ── Abrir caja ────────────────────────────────────────────────────────────
  const handleAbrir = async () => {
    setMsgApertura(null)
    const monto = parseFloat(montoApertura)
    if (isNaN(monto) || monto < 0) {
      setMsgApertura({ tipo: 'error', texto: 'Ingresa un monto de apertura válido.' })
      return
    }
    setAbriendo(true)
    try {
      const res = await abrirCaja(monto)
      if (res.ok) {
        setMontoApertura('')
        await cargarEstado()
      } else {
        setMsgApertura({ tipo: 'error', texto: res.mensaje ?? 'Error al abrir caja.' })
      }
    } catch {
      setMsgApertura({ tipo: 'error', texto: 'Error de conexión.' })
    } finally {
      setAbriendo(false)
    }
  }

  // ── Cerrar caja ───────────────────────────────────────────────────────────
  const handleCerrar = async () => {
    setMsgCierre(null)
    const monto = parseFloat(montoCierre)
    if (isNaN(monto) || monto < 0) {
      setMsgCierre({ tipo: 'error', texto: 'Ingresa el monto contado en caja.' })
      return
    }
    if (!confirm('¿Confirmas el cierre de caja? Esta acción no se puede deshacer.')) return

    setCerrando(true)
    try {
      const res = await cerrarCaja(cajaActiva.id_caja, monto)
      if (res.ok) {
        setMontoCierre('')
        await cargarEstado()
      } else {
        setMsgCierre({ tipo: 'error', texto: res.mensaje ?? 'Error al cerrar caja.' })
      }
    } catch {
      setMsgCierre({ tipo: 'error', texto: 'Error de conexión.' })
    } finally {
      setCerrando(false)
    }
  }

  // ── Calcular total esperado ───────────────────────────────────────────────
  const totalEsperado = cajaActiva
    ? Number(cajaActiva.monto_apertura) + Number(cajaActiva.total_ventas)
    : 0

  const diferencia = montoCierre !== ''
    ? parseFloat(montoCierre) - totalEsperado
    : null

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.grid}>
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-3)' }}>
          Cargando estado de caja...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.grid}>

      {/* ── PANEL PRINCIPAL ────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Estado de Caja</h3>
          <span className={`badge ${cajaActiva ? 'badge-green' : 'badge-red'}`}>
            {cajaActiva ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        {error && <div style={estiloError}>⚠️ {error}</div>}

        {/* ── CAJA CERRADA: formulario apertura ── */}
        {!cajaActiva ? (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-3)', marginBottom: '16px' }}>
              No hay ningún turno activo. Ingresa el monto inicial para abrir la caja.
            </p>
            <div className="form-group">
              <label className="form-label">
                Monto de Apertura (S/) <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                className="form-control"
                placeholder="0.00"
                value={montoApertura}
                onChange={e => setMontoApertura(e.target.value)}
              />
            </div>

            {msgApertura && <div style={estiloMsg(msgApertura.tipo)}>{msgApertura.texto}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleAbrir}
              disabled={abriendo}
            >
              {abriendo ? 'Abriendo...' : '🔓 Abrir Caja'}
            </button>
          </div>

        ) : (
          /* ── CAJA ABIERTA: resumen + cierre ── */
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '14px' }}>
              Turno abierto el{' '}
              {new Date(cajaActiva.fecha_apertura).toLocaleString('es-PE')}
              {cajaActiva.responsable && ` · ${cajaActiva.responsable}`}
            </p>

            <div className={styles.resumenCaja}>
              {[
                ['Monto Apertura',   `S/ ${Number(cajaActiva.monto_apertura).toFixed(2)}`],
                ['Total Ventas',     `S/ ${Number(cajaActiva.total_ventas).toFixed(2)}`],
                ['Devoluciones',     `${cajaActiva.total_devoluciones} registros`],
                ['Total Esperado',   `S/ ${totalEsperado.toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label} className={styles.cajaRow}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">
                Monto Contado en Caja (S/) <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                className="form-control"
                placeholder="0.00"
                value={montoCierre}
                onChange={e => setMontoCierre(e.target.value)}
              />
            </div>

            {/* Diferencia en tiempo real */}
            {diferencia !== null && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
                fontSize: '13px', fontWeight: 600,
                background: Math.abs(diferencia) < 0.01
                  ? 'rgba(16,185,129,0.1)' : 'rgba(240,165,0,0.1)',
                color: Math.abs(diferencia) < 0.01
                  ? 'var(--color-success)' : 'rgba(160,110,0,1)',
                border: `1px solid ${Math.abs(diferencia) < 0.01
                  ? 'rgba(16,185,129,0.25)' : 'rgba(240,165,0,0.3)'}`,
              }}>
                {Math.abs(diferencia) < 0.01
                  ? '✅ Cuadre perfecto'
                  : diferencia > 0
                    ? `📈 Sobrante: S/ ${diferencia.toFixed(2)}`
                    : `📉 Faltante: S/ ${Math.abs(diferencia).toFixed(2)}`}
              </div>
            )}

            {msgCierre && <div style={estiloMsg(msgCierre.tipo)}>{msgCierre.texto}</div>}

            <button
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleCerrar}
              disabled={cerrando}
            >
              {cerrando ? 'Cerrando...' : '🔒 Cerrar Caja'}
            </button>
          </div>
        )}
      </div>

      {/* ── HISTORIAL ──────────────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>Historial de Turnos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha apertura</th>
                <th>Responsable</th>
                <th>Total ventas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)' }}>
                    Sin turnos registrados.
                  </td>
                </tr>
              ) : historial.map(t => (
                <tr key={t.id_caja}>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(t.fecha_apertura).toLocaleDateString('es-PE')}
                  </td>
                  <td>{t.responsable}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    S/ {Number(t.total_ventas).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${t.estado === 'Abierta' ? 'badge-green' : 'badge-gray'}`}>
                      {t.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

/* ── Helpers de estilo ─────────────────────────────────────────────────────── */
const estiloError = {
  background: 'rgba(220,38,38,0.08)',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: '8px', padding: '10px 14px',
  marginBottom: '14px', color: 'var(--color-danger)', fontSize: '13px',
}

const estiloMsg = (tipo) => ({
  padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
  fontSize: '13px',
  background: tipo === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)',
  color: tipo === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
  border: `1px solid ${tipo === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
})