/* === DEVOLUCIONES — conectado a API === */
import { useState, useEffect, useCallback } from 'react'
import {
  getDevoluciones, registrarDevolucion,
  getVentas, buscarProductos,
} from '../api'

const FORM_VACIO = {
  serie_correlativo: '',  // texto que escribe el usuario para buscar la venta
  id_venta:          null,
  id_producto:       null,
  nombre_producto:   '',
  cantidad:          1,
  motivo:            '',
}

export default function Devoluciones() {
  // ── Tabla ──────────────────────────────────────────────────────────────────
  const [devoluciones, setDevoluciones] = useState([])
  const [loadingTabla, setLoadingTabla] = useState(true)
  const [errorTabla, setErrorTabla]     = useState(null)

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [form, setForm]           = useState(FORM_VACIO)
  const [registrando, setRegistrando] = useState(false)
  const [msgForm, setMsgForm]     = useState(null)

  // Sugerencias autocomplete ventas
  const [sugerenciasVenta, setSugerenciasVenta]   = useState([])
  const [buscandoVenta, setBuscandoVenta]         = useState(false)

  // Sugerencias autocomplete productos
  const [sugerenciasProd, setSugerenciasProd]     = useState([])
  const [buscandoProd, setBuscandoProd]           = useState(false)

  // ── Carga de tabla ─────────────────────────────────────────────────────────
  const cargarDevoluciones = useCallback(async () => {
    setLoadingTabla(true)
    setErrorTabla(null)
    try {
      const res = await getDevoluciones()
      if (res.ok) setDevoluciones(res.data)
      else setErrorTabla('No se pudieron cargar las devoluciones.')
    } catch {
      setErrorTabla('Error de conexión con el servidor.')
    } finally {
      setLoadingTabla(false)
    }
  }, [])

  useEffect(() => { cargarDevoluciones() }, [cargarDevoluciones])

  // ── Pendientes (conteo real) ───────────────────────────────────────────────
  const pendientes = devoluciones.filter(d => d.estado === 'Pendiente').length

  // ── Buscar venta por serie-correlativo ────────────────────────────────────
  const handleVentaInput = async (valor) => {
    setForm(prev => ({ ...prev, serie_correlativo: valor, id_venta: null }))
    if (valor.trim().length < 3) { setSugerenciasVenta([]); return }
    setBuscandoVenta(true)
    try {
      // Llama a GET /api/ventas (trae historial), filtramos localmente
      const res = await getVentas()
      if (res.ok) {
        const filtradas = res.data.filter(v =>
          `${v.serie}-${v.correlativo}`.toLowerCase().includes(valor.toLowerCase())
        ).slice(0, 6)
        setSugerenciasVenta(filtradas)
      }
    } catch { /* silencioso */ }
    finally { setBuscandoVenta(false) }
  }

  const seleccionarVenta = (v) => {
    setForm(prev => ({
      ...prev,
      serie_correlativo: `${v.serie}-${v.correlativo}`,
      id_venta: v.id_venta,
    }))
    setSugerenciasVenta([])
  }

  // ── Buscar producto ───────────────────────────────────────────────────────
  const handleProductoInput = async (valor) => {
    setForm(prev => ({ ...prev, nombre_producto: valor, id_producto: null }))
    if (valor.trim().length < 2) { setSugerenciasProd([]); return }
    setBuscandoProd(true)
    try {
      const res = await buscarProductos(valor.trim())
      if (res.ok) setSugerenciasProd(res.data.slice(0, 6))
    } catch { /* silencioso */ }
    finally { setBuscandoProd(false) }
  }

  const seleccionarProducto = (p) => {
    setForm(prev => ({
      ...prev,
      nombre_producto: p.nombre,
      id_producto:     p.id_producto,
    }))
    setSugerenciasProd([])
  }

  // ── Registrar devolución ──────────────────────────────────────────────────
  const handleRegistrar = async () => {
    setMsgForm(null)
    if (!form.id_venta) {
      setMsgForm({ tipo: 'error', texto: 'Selecciona una venta válida de la lista.' }); return
    }
    if (!form.id_producto) {
      setMsgForm({ tipo: 'error', texto: 'Selecciona un producto válido de la lista.' }); return
    }
    if (!form.motivo.trim()) {
      setMsgForm({ tipo: 'error', texto: 'Escribe el motivo de la devolución.' }); return
    }
    if (form.cantidad < 1) {
      setMsgForm({ tipo: 'error', texto: 'La cantidad debe ser al menos 1.' }); return
    }

    setRegistrando(true)
    try {
      const res = await registrarDevolucion({
        id_venta:    form.id_venta,
        id_producto: form.id_producto,
        cantidad:    Number(form.cantidad),
        motivo:      form.motivo.trim(),
      })
      if (res.ok) {
        setMsgForm({ tipo: 'ok', texto: '✅ Devolución registrada correctamente. El stock fue actualizado.' })
        setForm(FORM_VACIO)
        setSugerenciasVenta([])
        setSugerenciasProd([])
        await cargarDevoluciones()
      } else {
        setMsgForm({ tipo: 'error', texto: res.mensaje ?? 'Error al registrar.' })
      }
    } catch {
      setMsgForm({ tipo: 'error', texto: 'Error de conexión con el servidor.' })
    } finally {
      setRegistrando(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

      {/* ── TABLA ─────────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Registro de Devoluciones</h3>
          {!loadingTabla && (
            <span className={`badge ${pendientes > 0 ? 'badge-yellow' : 'badge-green'}`}>
              {pendientes > 0 ? `${pendientes} pendientes` : 'Sin pendientes'}
            </span>
          )}
        </div>

        {errorTabla && (
          <div style={estiloError}> ⚠️ {errorTabla} </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loadingTabla ? (
                <tr>
                  <td colSpan={7} style={estiloVacio}>Cargando devoluciones...</td>
                </tr>
              ) : devoluciones.length === 0 ? (
                <tr>
                  <td colSpan={7} style={estiloVacio}>No hay devoluciones registradas.</td>
                </tr>
              ) : devoluciones.map(d => (
                <tr key={d.id_devolucion}>
                  <td style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                    {d.serie}-{d.correlativo}
                  </td>
                  <td>{d.cliente ?? 'Sin nombre'}</td>
                  <td>{d.producto}</td>
                  <td style={{ textAlign: 'center' }}>{d.cantidad}</td>
                  <td style={{ fontSize: '12px', maxWidth: '160px' }}>{d.motivo}</td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(d.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td>
                    <span className={`badge ${
                      d.estado === 'Aprobada'   ? 'badge-green'  :
                      d.estado === 'Rechazada'  ? 'badge-red'    :
                      'badge-yellow'
                    }`}>
                      {d.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FORMULARIO ────────────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>Nueva Devolución</h3>

        {/* Nº de Venta con autocomplete */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">
            Nº de Venta <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            className="form-control"
            placeholder="Ej: B001-000012"
            value={form.serie_correlativo}
            onChange={e => handleVentaInput(e.target.value)}
            autoComplete="off"
          />
          {/* indicador de selección */}
          {form.id_venta && (
            <span style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '3px', display: 'block' }}>
              ✓ Venta seleccionada (ID: {form.id_venta})
            </span>
          )}
          {/* dropdown sugerencias */}
          {sugerenciasVenta.length > 0 && (
            <div style={estiloDropdown}>
              {buscandoVenta && <div style={estiloDropdownItem}>Buscando...</div>}
              {sugerenciasVenta.map(v => (
                <div
                  key={v.id_venta}
                  style={estiloDropdownItem}
                  onMouseDown={() => seleccionarVenta(v)}
                >
                  <strong style={{ color: 'var(--color-primary)' }}>
                    {v.serie}-{v.correlativo}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '8px' }}>
                    {v.cliente ?? 'Sin nombre'} — S/ {Number(v.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Producto con autocomplete */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">
            Producto <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            className="form-control"
            placeholder="Escribe el nombre..."
            value={form.nombre_producto}
            onChange={e => handleProductoInput(e.target.value)}
            autoComplete="off"
          />
          {form.id_producto && (
            <span style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '3px', display: 'block' }}>
              ✓ Producto seleccionado (ID: {form.id_producto})
            </span>
          )}
          {sugerenciasProd.length > 0 && (
            <div style={estiloDropdown}>
              {buscandoProd && <div style={estiloDropdownItem}>Buscando...</div>}
              {sugerenciasProd.map(p => (
                <div
                  key={p.id_producto}
                  style={estiloDropdownItem}
                  onMouseDown={() => seleccionarProducto(p)}
                >
                  <strong>{p.nombre}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '8px' }}>
                    Stock: {p.stock} — S/ {Number(p.precio).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cantidad */}
        <div className="form-group">
          <label className="form-label">
            Cantidad <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            type="number"
            className="form-control"
            min="1"
            value={form.cantidad}
            onChange={e => setForm(prev => ({ ...prev, cantidad: e.target.value }))}
          />
        </div>

        {/* Motivo */}
        <div className="form-group">
          <label className="form-label">
            Motivo <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Motivo de la devolución..."
            style={{ resize: 'vertical' }}
            value={form.motivo}
            onChange={e => setForm(prev => ({ ...prev, motivo: e.target.value }))}
          />
        </div>

        {/* Mensaje del formulario */}
        {msgForm && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
            fontSize: '13px',
            background: msgForm.tipo === 'ok'
              ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)',
            color: msgForm.tipo === 'ok'
              ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${msgForm.tipo === 'ok'
              ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
          }}>
            {msgForm.texto}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleRegistrar}
          disabled={registrando}
        >
          {registrando ? 'Registrando...' : 'Registrar Devolución'}
        </button>

        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '10px', textAlign: 'center' }}>
          Al registrar, el stock del producto se actualiza automáticamente.
        </p>
      </div>
    </div>
  )
}

/* ── Estilos inline reutilizables ──────────────────────────────────────────── */
const estiloError = {
  background: 'rgba(220,38,38,0.08)',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: '8px', padding: '10px 14px',
  marginBottom: '14px', color: 'var(--color-danger)', fontSize: '13px',
}

const estiloVacio = {
  textAlign: 'center', padding: '32px', color: 'var(--color-text-3)',
}

const estiloDropdown = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
  background: '#fff', border: '1px solid var(--color-border)',
  borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  marginTop: '4px', overflow: 'hidden',
}

const estiloDropdownItem = {
  padding: '9px 12px', cursor: 'pointer', fontSize: '13px',
  borderBottom: '1px solid var(--color-border-light)',
  transition: 'background .15s',
  display: 'flex', alignItems: 'center',
}