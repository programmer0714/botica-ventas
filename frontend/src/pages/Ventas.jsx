import { useState, useEffect, useCallback } from 'react'
import styles from './Ventas.module.css'
import { buscarProductos, buscarCliente, crearCliente, registrarVenta } from '../api'

export default function Ventas() {
  const [tipo, setTipo]             = useState('BOLETA')         // BOLETA | FACTURA
  const [tipoId, setTipoId]         = useState(1)                // id_tipo_comprobante
  const [busqueda, setBusqueda]     = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando]     = useState(false)
  const [detalle, setDetalle]       = useState([])
  const [formaPago, setFormaPago]   = useState('Contado')
  const [cliente, setCliente]       = useState({ nombre: '', documento: '', tipo: 'DNI', id: null })
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [vendiendo, setVendiendo]   = useState(false)
  const [mensaje, setMensaje]       = useState(null) // { tipo: 'ok'|'error', texto }

  // Cambiar tipo comprobante
  const cambiarTipo = (t) => {
    setTipo(t)
    setTipoId(t === 'BOLETA' ? 1 : 2)
  }

  // Buscar productos con debounce
  useEffect(() => {
    if (!busqueda.trim()) { setResultados([]); return }
    const t = setTimeout(async () => {
      setBuscando(true)
      try {
        const res = await buscarProductos(busqueda)
        setResultados(res.ok ? res.data : [])
      } catch { setResultados([]) }
      finally { setBuscando(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  // Agregar producto al detalle
  const agregarProducto = (prod) => {
    const existe = detalle.find(d => d.id_producto === prod.id_producto)
    if (existe) {
      if (existe.cantidad >= prod.stock) return
      setDetalle(detalle.map(d =>
        d.id_producto === prod.id_producto ? { ...d, cantidad: d.cantidad + 1 } : d
      ))
    } else {
      setDetalle([...detalle, { ...prod, cantidad: 1 }])
    }
    setBusqueda('')
    setResultados([])
  }

  const cambiarCantidad = (id, val) => {
    const num = parseInt(val)
    if (!num || num < 1) return
    const prod = detalle.find(d => d.id_producto === id)
    if (num > prod.stock) return
    setDetalle(detalle.map(d => d.id_producto === id ? { ...d, cantidad: num } : d))
  }

  const eliminar = (id) => setDetalle(detalle.filter(d => d.id_producto !== id))

  // Buscar cliente por documento
  const handleBuscarCliente = async () => {
    if (!cliente.documento.trim()) return
    setBuscandoCliente(true)
    try {
      const res = await buscarCliente(cliente.documento)
      if (res.ok) {
        setCliente({
          ...cliente,
          nombre: res.data.nombre_razon_social,
          tipo:   res.data.tipo_documento,
          id:     res.data.id_cliente
        })
      } else {
        setCliente({ ...cliente, nombre: '', id: null })
      }
    } catch { /* silencioso */ }
    finally { setBuscandoCliente(false) }
  }

  // Totales
  const subtotal = detalle.reduce((a, d) => a + d.precio * d.cantidad, 0)
  const igv      = subtotal * 0.18
  const total    = subtotal + igv

  // Registrar venta
  const handleVender = async () => {
    if (detalle.length === 0) return
    setVendiendo(true)
    setMensaje(null)
    try {
      // Si hay nombre de cliente pero no id, crear cliente primero
      let id_cliente = cliente.id
      if (!id_cliente && cliente.nombre.trim() && cliente.documento.trim()) {
        const res = await crearCliente({
          tipo_documento:      cliente.tipo,
          numero_documento:    cliente.documento,
          nombre_razon_social: cliente.nombre
        })
        if (res.ok) id_cliente = res.id_cliente
      }

      const res = await registrarVenta({
        id_tipo_comprobante: tipoId,
        id_cliente:          id_cliente || null,
        forma_pago:          formaPago,
        detalle: detalle.map(d => ({
          id_producto:     d.id_producto,
          cantidad:        d.cantidad,
          precio_unitario: d.precio
        }))
      })

      if (res.ok) {
        setMensaje({
          tipo: 'ok',
          texto: `✅ Venta registrada — ${res.data.serie}-${res.data.correlativo} | Total: S/ ${Number(res.data.total).toFixed(2)}`
        })
        // Limpiar formulario
        setDetalle([])
        setCliente({ nombre: '', documento: '', tipo: 'DNI', id: null })
        setFormaPago('Contado')
      } else {
        setMensaje({ tipo: 'error', texto: `❌ ${res.mensaje}` })
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: '❌ Error al conectar con el servidor' })
    } finally {
      setVendiendo(false)
    }
  }

  return (
    <div className={styles.ventasWrapper}>

      {/* MENSAJE DE RESULTADO */}
      {mensaje && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '14px',
          fontSize: '13px',
          fontWeight: 500,
          background: mensaje.tipo === 'ok' ? 'rgba(13,122,95,0.1)' : 'rgba(192,57,43,0.1)',
          border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(13,122,95,0.3)' : 'rgba(192,57,43,0.3)'}`,
          color: mensaje.tipo === 'ok' ? 'var(--color-primary)' : '#c0392b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>×</button>
        </div>
      )}

      {/* TIPO DE COMPROBANTE */}
      <div className={styles.tipoBar}>
        {[['BOLETA', 1], ['FACTURA', 2]].map(([t, id]) => (
          <button key={t}
            className={`${styles.tipoBtn} ${tipo === t ? styles.tipoActivo : ''}`}
            onClick={() => cambiarTipo(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* COLUMNA IZQUIERDA */}
        <div>

          {/* COMPROBANTE */}
          <div className="card" style={{ marginBottom: '14px' }}>
            <h3 className="card-title" style={{ marginBottom: '14px' }}>Comprobante de Pago</h3>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-control" value={tipo} onChange={e => cambiarTipo(e.target.value)}>
                  <option value="BOLETA">BOLETA</option>
                  <option value="FACTURA">FACTURA</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Serie</label>
                <input className="form-control" value={tipo === 'BOLETA' ? 'B001' : 'F001'} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Forma de Pago</label>
                <select className="form-control" value={formaPago} onChange={e => setFormaPago(e.target.value)}>
                  <option>Contado</option>
                  <option>Tarjeta</option>
                  <option>Yape</option>
                  <option>Plin</option>
                </select>
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="card" style={{ marginBottom: '14px' }}>
            <h3 className="card-title" style={{ marginBottom: '14px' }}>Datos del Cliente</h3>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Tipo Documento</label>
                <select className="form-control" value={cliente.tipo} onChange={e => setCliente({ ...cliente, tipo: e.target.value })}>
                  <option>DNI</option>
                  <option>RUC</option>
                  <option>CE</option>
                  <option>SIN DOC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nº Documento</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    className="form-control"
                    placeholder="Buscar..."
                    value={cliente.documento}
                    onChange={e => setCliente({ ...cliente, documento: e.target.value, id: null })}
                    onKeyDown={e => e.key === 'Enter' && handleBuscarCliente()}
                  />
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
                    onClick={handleBuscarCliente}
                    disabled={buscandoCliente}>
                    {buscandoCliente ? '...' : <IconSearch />}
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre / Razón Social</label>
              <input
                className="form-control"
                placeholder="Nombre del cliente"
                value={cliente.nombre}
                onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
              />
              {cliente.id && (
                <span style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px', display: 'block' }}>
                  ✓ Cliente encontrado en BD
                </span>
              )}
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '12px' }}>Buscar Producto</h3>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <IconSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              <input
                className="form-control"
                placeholder="Escribe el nombre del producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* RESULTADOS */}
            {busqueda && (
              <div className={styles.busquedaResultados}>
                {buscando ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-3)' }}>Buscando...</div>
                ) : resultados.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-3)' }}>No se encontraron productos</div>
                ) : resultados.map(p => (
                  <div key={p.id_producto} className={styles.busquedaItem} onClick={() => agregarProducto(p)}>
                    <div className={styles.prodIconBox}>
                      <IconPill />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>{p.nombre}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
                        Stock: {p.stock} und. · {p.laboratorio} · {p.presentacion}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>S/ {Number(p.precio).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TABLA DETALLE */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>P. Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-3)', padding: '24px' }}>
                        Busca un producto para agregar
                      </td>
                    </tr>
                  ) : detalle.map(d => (
                    <tr key={d.id_producto}>
                      <td style={{ fontWeight: 500 }}>{d.nombre}</td>
                      <td>S/ {Number(d.precio).toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: '70px', padding: '4px 8px' }}
                          value={d.cantidad}
                          min={1}
                          max={d.stock}
                          onChange={e => cambiarCantidad(d.id_producto, e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        S/ {(d.precio * d.cantidad).toFixed(2)}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminar(d.id_producto)} title="Quitar">
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RESUMEN */}
        <div className={styles.resumenBox}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Resumen</h3>
            <div className={styles.resumenRow}><span>OP. GRAVADAS</span><span>S/ {subtotal.toFixed(2)}</span></div>
            <div className={styles.resumenRow}><span>OP. INAFECTAS</span><span>S/ 0.00</span></div>
            <div className={styles.resumenRow}><span>SUBTOTAL</span><span>S/ {subtotal.toFixed(2)}</span></div>
            <div className={styles.resumenRow}><span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span></div>
            <div className={styles.resumenTotal}>
              <span>TOTAL</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div className={styles.botonesVenta}>
              <button className="btn btn-outline" onClick={() => { setDetalle([]); setCliente({ nombre: '', documento: '', tipo: 'DNI', id: null }) }}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={detalle.length === 0 || vendiendo}
                onClick={handleVender}>
                {vendiendo ? 'Procesando...' : 'Vender'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── SVG Icons ── */
function IconSearch({ style }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', ...style }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
function IconTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
}
function IconPill() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }}><path d="M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v2" /><circle cx="17" cy="17" r="5" /><path d="M17 14v6M14 17h6" /></svg>
}