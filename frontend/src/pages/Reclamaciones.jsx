/* === RECLAMACIONES — conectado a API === */
import { useState, useEffect, useCallback } from 'react'
import iconReclamo from '../assets/icons/icon-reclamo.svg'
import { getReclamaciones, registrarReclamacion } from '../api'

const FORM_VACIO = {
  tipo:        'Queja',
  nombre:      '',
  dni:         '',
  telefono:    '',
  descripcion: '',
}

export default function Reclamaciones() {
  // ── Tabla ──────────────────────────────────────────────────────────────────
  const [reclamos, setReclamos]       = useState([])
  const [loadingTabla, setLoadingTabla] = useState(true)
  const [errorTabla, setErrorTabla]   = useState(null)

  // ── Búsqueda local ─────────────────────────────────────────────────────────
  const [busqueda, setBusqueda]       = useState('')

  // ── Modal "Ver detalle" ────────────────────────────────────────────────────
  const [reclamoVer, setReclamoVer]   = useState(null)

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [form, setForm]               = useState(FORM_VACIO)
  const [registrando, setRegistrando] = useState(false)
  const [msgForm, setMsgForm]         = useState(null)

  // ── Carga tabla ────────────────────────────────────────────────────────────
  const cargarReclamos = useCallback(async () => {
    setLoadingTabla(true)
    setErrorTabla(null)
    try {
      const res = await getReclamaciones()
      if (res.ok) setReclamos(res.data)
      else setErrorTabla('No se pudieron cargar las reclamaciones.')
    } catch {
      setErrorTabla('Error de conexión con el servidor.')
    } finally {
      setLoadingTabla(false)
    }
  }, [])

  useEffect(() => { cargarReclamos() }, [cargarReclamos])

  // ── Filtro local ───────────────────────────────────────────────────────────
  const reclamosFiltrados = reclamos.filter(r => {
    const q = busqueda.toLowerCase()
    return (
      r.codigo?.toLowerCase().includes(q) ||
      r.nombre?.toLowerCase().includes(q)  ||
      r.dni?.includes(q)
    )
  })

  // ── Registrar ──────────────────────────────────────────────────────────────
  const handleRegistrar = async () => {
    setMsgForm(null)
    if (!form.nombre.trim()) {
      setMsgForm({ tipo: 'error', texto: 'El nombre del cliente es obligatorio.' }); return
    }
    if (!form.descripcion.trim()) {
      setMsgForm({ tipo: 'error', texto: 'La descripción del problema es obligatoria.' }); return
    }

    setRegistrando(true)
    try {
      const res = await registrarReclamacion({
        tipo:        form.tipo,
        nombre:      form.nombre.trim(),
        dni:         form.dni.trim(),
        telefono:    form.telefono.trim(),
        descripcion: form.descripcion.trim(),
      })
      if (res.ok) {
        setMsgForm({ tipo: 'ok', texto: `✅ ${form.tipo} registrada. Código: ${res.codigo ?? '—'}` })
        setForm(FORM_VACIO)
        await cargarReclamos()
      } else {
        setMsgForm({ tipo: 'error', texto: res.mensaje ?? 'Error al registrar.' })
      }
    } catch {
      setMsgForm({ tipo: 'error', texto: 'Error de conexión con el servidor.' })
    } finally {
      setRegistrando(false)
    }
  }

  const handleFormChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'start' }}>

      {/* ── TABLA ─────────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Libro de Reclamaciones</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!loadingTabla && (
              <span className="badge badge-yellow">
                {reclamos.filter(r => r.estado === 'Pendiente').length} pendientes
              </span>
            )}
          </div>
        </div>

        {/* Buscador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <img src={iconReclamo} alt="" width="20"
            onError={e => (e.target.style.display = 'none')} />
          <input
            className="form-control"
            placeholder="Buscar por código, cliente o DNI..."
            style={{ flex: 1 }}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {errorTabla && <div style={estiloError}>⚠️ {errorTabla}</div>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Cliente</th><th>DNI</th>
                <th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loadingTabla ? (
                <tr><td colSpan={7} style={estiloVacio}>Cargando reclamaciones...</td></tr>
              ) : reclamosFiltrados.length === 0 ? (
                <tr><td colSpan={7} style={estiloVacio}>No se encontraron registros.</td></tr>
              ) : reclamosFiltrados.map(r => (
                <tr key={r.id_reclamacion}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {r.codigo ?? `REC-${String(r.id_reclamacion).padStart(3,'0')}`}
                  </td>
                  <td>{r.nombre}</td>
                  <td style={{ fontSize: '12px' }}>{r.dni ?? '—'}</td>
                  <td>
                    <span className={`badge ${r.tipo === 'Reclamo' ? 'badge-red' : 'badge-yellow'}`}>
                      {r.tipo}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(r.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td>
                    <span className={`badge ${
                      r.estado === 'Resuelto'   ? 'badge-green'  :
                      r.estado === 'En Proceso' ? 'badge-blue'   :
                      'badge-yellow'
                    }`}>{r.estado}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setReclamoVer(r)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '10px' }}>
          {reclamosFiltrados.length} registro{reclamosFiltrados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── FORMULARIO ────────────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>Registrar Queja / Reclamo</h3>

        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select name="tipo" className="form-control"
            value={form.tipo} onChange={handleFormChange}>
            <option value="Queja">Queja</option>
            <option value="Reclamo">Reclamo</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Nombre del Cliente <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input name="nombre" className="form-control"
            placeholder="Nombre completo"
            value={form.nombre} onChange={handleFormChange} />
        </div>

        <div className="form-row cols-2">
          <div className="form-group">
            <label className="form-label">DNI</label>
            <input name="dni" className="form-control"
              placeholder="DNI"
              maxLength={8}
              value={form.dni} onChange={handleFormChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input name="telefono" className="form-control"
              placeholder="Teléfono"
              value={form.telefono} onChange={handleFormChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Descripción del problema <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea name="descripcion" className="form-control"
            rows={5}
            placeholder="Describa detalladamente el problema..."
            style={{ resize: 'vertical' }}
            value={form.descripcion} onChange={handleFormChange} />
        </div>

        {msgForm && (
          <div style={estiloMsg(msgForm.tipo)}>{msgForm.texto}</div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleRegistrar}
          disabled={registrando}
        >
          {registrando ? 'Registrando...' : 'Registrar'}
        </button>

        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '10px', textAlign: 'center' }}>
          Se generará un código de seguimiento automáticamente.
        </p>
      </div>

      {/* ── MODAL VER DETALLE ─────────────────────────────────────────────── */}
      {reclamoVer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '28px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>
                Detalle — {reclamoVer.codigo ?? `REC-${String(reclamoVer.id_reclamacion).padStart(3,'0')}`}
              </h3>
              <button onClick={() => setReclamoVer(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-text-3)' }}>
                ×
              </button>
            </div>

            {[
              ['Tipo',      <span className={`badge ${reclamoVer.tipo === 'Reclamo' ? 'badge-red' : 'badge-yellow'}`}>{reclamoVer.tipo}</span>],
              ['Estado',    <span className={`badge ${reclamoVer.estado === 'Resuelto' ? 'badge-green' : reclamoVer.estado === 'En Proceso' ? 'badge-blue' : 'badge-yellow'}`}>{reclamoVer.estado}</span>],
              ['Cliente',   reclamoVer.nombre],
              ['DNI',       reclamoVer.dni ?? '—'],
              ['Teléfono',  reclamoVer.telefono ?? '—'],
              ['Fecha',     new Date(reclamoVer.fecha).toLocaleString('es-PE')],
            ].map(([label, val]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '8px 0',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: '13px',
              }}>
                <span style={{ color: 'var(--color-text-3)' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}

            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '6px' }}>Descripción</p>
              <p style={{
                fontSize: '13px', lineHeight: '1.6',
                background: 'var(--color-bg-2)', borderRadius: '8px',
                padding: '12px', margin: 0,
              }}>
                {reclamoVer.descripcion}
              </p>
            </div>

            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
              onClick={() => setReclamoVer(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Estilos ────────────────────────────────────────────────────────────────── */
const estiloError = {
  background: 'rgba(220,38,38,0.08)',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: '8px', padding: '10px 14px',
  marginBottom: '14px', color: 'var(--color-danger)', fontSize: '13px',
}
const estiloVacio = { textAlign: 'center', padding: '32px', color: 'var(--color-text-3)' }
const estiloMsg = tipo => ({
  padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px',
  background: tipo === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)',
  color: tipo === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
  border: `1px solid ${tipo === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
})