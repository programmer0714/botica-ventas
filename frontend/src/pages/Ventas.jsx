import { useState, useEffect } from 'react'
import styles from './Ventas.module.css'
import { buscarProductos, buscarCliente, crearCliente, registrarVenta } from '../api'

// ── MODAL COMPROBANTE (React puro, funciona en ngrok) ─────────────────────
function ModalComprobante({ datos, onCerrar }) {
  if (!datos) return null
  const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora  = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  const handleImprimir = () => window.print()

  return (
    <>
      {/* Estilos de impresión — oculta todo menos el comprobante */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #comprobante-print { display: block !important; position: fixed; top: 0; left: 0; width: 80mm; }
        }
        #comprobante-print { display: none; }
      `}</style>

      {/* Versión para imprimir (oculta en pantalla) */}
      <div id="comprobante-print" style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', width: '80mm', padding: '8px', color: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold' }}>BOTICA NOVA SALUD</div>
          <div style={{ fontSize: '11px', color: '#444' }}>RUC: 20123456789</div>
          <div style={{ fontSize: '11px', color: '#444' }}>Av. Principal 123, Lima</div>
          <div style={{ fontSize: '11px', color: '#444' }}>Tel: 01-234-5678</div>
          <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{datos.tipo} ELECTRÓNICA</div>
          <div style={{ fontWeight: 'bold' }}>{datos.serie}-{String(datos.correlativo).padStart(6, '0')}</div>
        </div>
        <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
        <div><strong>Fecha:</strong> {fecha} {hora}</div>
        <div><strong>Cliente:</strong> {datos.cliente || 'Consumidor Final'}</div>
        <div><strong>{datos.tipoDoc}:</strong> {datos.documento || '--------'}</div>
        <div><strong>Pago:</strong> {datos.formaPago}</div>
        <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '2px 0' }}>Descripción</th>
              <th style={{ textAlign: 'center', borderBottom: '1px solid #ccc' }}>Cant</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>P.U.</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {datos.detalle.map((d, i) => (
              <tr key={i}>
                <td style={{ padding: '2px 0' }}>{d.nombre}</td>
                <td style={{ textAlign: 'center' }}>{d.cantidad}</td>
                <td style={{ textAlign: 'right' }}>S/ {Number(d.precio).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>S/ {(d.precio * d.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>OP. GRAVADAS:</span><span>S/ {datos.subtotal.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>IGV (18%):</span><span>S/ {datos.igv.toFixed(2)}</span></div>
        <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}><span>TOTAL:</span><span>S/ {datos.total.toFixed(2)}</span></div>
        <hr style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
          <div>¡Gracias por su compra!</div>
          <div>Documento válido para sustento de gasto</div>
        </div>
      </div>

      {/* Modal visible en pantalla */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '380px', maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <strong style={{ fontSize: '15px' }}>🧾 Comprobante de Pago</strong>
            <button onClick={onCerrar} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {/* Comprobante */}
          <div style={{ border: '1px dashed #ccc', borderRadius: '8px', padding: '16px', fontFamily: 'Courier New, monospace', fontSize: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>BOTICA NOVA SALUD</div>
              <div style={{ fontSize: '11px', color: '#666' }}>RUC: 20123456789</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Av. Principal 123, Lima</div>
              <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
              <div style={{ fontWeight: 'bold' }}>{datos.tipo} ELECTRÓNICA</div>
              <div style={{ fontWeight: 'bold' }}>{datos.serie}-{String(datos.correlativo).padStart(6, '0')}</div>
            </div>
            <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
            <div><strong>Fecha:</strong> {fecha} {hora}</div>
            <div><strong>Cliente:</strong> {datos.cliente || 'Consumidor Final'}</div>
            <div><strong>{datos.tipoDoc}:</strong> {datos.documento || '--------'}</div>
            <div><strong>Pago:</strong> {datos.formaPago}</div>
            <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '2px 0' }}>Producto</th>
                  <th style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>Cant</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #eee' }}>P.U.</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #eee' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {datos.detalle.map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: '3px 0' }}>{d.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{d.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>S/ {Number(d.precio).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>S/ {(d.precio * d.cantidad).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>OP. GRAVADAS:</span><span>S/ {datos.subtotal.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>IGV (18%):</span><span>S/ {datos.igv.toFixed(2)}</span></div>
            <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}><span>TOTAL:</span><span>S/ {datos.total.toFixed(2)}</span></div>
            <hr style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }} />
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#888' }}>
              <div>¡Gracias por su compra!</div>
              <div>Documento válido para sustento de gasto</div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onCerrar}
              style={{ flex: 1, padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              Cerrar
            </button>
            <button onClick={handleImprimir}
              style={{ flex: 2, padding: '10px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Ventas() {
  const [tipo, setTipo]             = useState('BOLETA')
  const [tipoId, setTipoId]         = useState(1)
  const [busqueda, setBusqueda]     = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando]     = useState(false)
  const [detalle, setDetalle]       = useState([])
  const [formaPago, setFormaPago]   = useState('Contado')
  const [cliente, setCliente]       = useState({ nombre: '', documento: '', tipo: 'DNI', id: null })
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [vendiendo, setVendiendo]   = useState(false)
  const [mensaje, setMensaje]       = useState(null)
  const [comprobante, setComprobante] = useState(null) // datos para el modal

  const cambiarTipo = (t) => {
    setTipo(t)
    setTipoId(t === 'BOLETA' ? 1 : 2)
  }

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

  const handleBuscarCliente = async () => {
    if (!cliente.documento.trim()) return
    setBuscandoCliente(true)
    try {
      const res = await buscarCliente(cliente.documento)
      if (res.ok) {
        setCliente({ ...cliente, nombre: res.data.nombre_razon_social, tipo: res.data.tipo_documento, id: res.data.id_cliente })
      } else {
        setCliente({ ...cliente, nombre: '', id: null })
      }
    } catch { }
    finally { setBuscandoCliente(false) }
  }

  const subtotal = detalle.reduce((a, d) => a + d.precio * d.cantidad, 0)
  const igv      = subtotal * 0.18
  const total    = subtotal + igv

  const handleVender = async () => {
    if (detalle.length === 0) return
    setVendiendo(true)
    setMensaje(null)
    try {
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
        const datosVenta = {
          tipo,
          serie:       res.data.serie,
          correlativo: res.data.correlativo,
          cliente:     cliente.nombre,
          documento:   cliente.documento,
          tipoDoc:     cliente.tipo,
          formaPago,
          detalle:     [...detalle],
          subtotal,
          igv,
          total: Number(res.data.total)
        }
        setComprobante(datosVenta)
        setMensaje({
          tipo: 'ok',
          texto: `✅ Venta registrada — ${res.data.serie}-${res.data.correlativo} | Total: S/ ${Number(res.data.total).toFixed(2)}`
        })
        setDetalle([])
        setCliente({ nombre: '', documento: '', tipo: 'DNI', id: null })
        setFormaPago('Contado')
      } else {
        setMensaje({ tipo: 'error', texto: `❌ ${res.mensaje}` })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: '❌ Error al conectar con el servidor' })
    } finally {
      setVendiendo(false)
    }
  }

  return (
    <div className={styles.ventasWrapper}>

      {/* MODAL COMPROBANTE */}
      <ModalComprobante datos={comprobante} onCerrar={() => setComprobante(null)} />

      {mensaje && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '14px',
          fontSize: '13px', fontWeight: 500,
          background: mensaje.tipo === 'ok' ? 'rgba(13,122,95,0.1)' : 'rgba(192,57,43,0.1)',
          border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(13,122,95,0.3)' : 'rgba(192,57,43,0.3)'}`,
          color: mensaje.tipo === 'ok' ? 'var(--color-primary)' : '#c0392b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{mensaje.texto}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {mensaje.tipo === 'ok' && comprobante && (
              <button onClick={() => setComprobante(comprobante)}
                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                🖨️ Ver comprobante
              </button>
            )}
            <button onClick={() => setMensaje(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>×</button>
          </div>
        </div>
      )}

      <div className={styles.tipoBar}>
        {[['BOLETA', 1], ['FACTURA', 2]].map(([t]) => (
          <button key={t}
            className={`${styles.tipoBtn} ${tipo === t ? styles.tipoActivo : ''}`}
            onClick={() => cambiarTipo(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div>
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
                  <input className="form-control" placeholder="Buscar..."
                    value={cliente.documento}
                    onChange={e => setCliente({ ...cliente, documento: e.target.value, id: null })}
                    onKeyDown={e => e.key === 'Enter' && handleBuscarCliente()} />
                  <button className="btn btn-outline" style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
                    onClick={handleBuscarCliente} disabled={buscandoCliente}>
                    {buscandoCliente ? '...' : <IconSearch />}
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre / Razón Social</label>
              <input className="form-control" placeholder="Nombre del cliente"
                value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} />
              {cliente.id && (
                <span style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px', display: 'block' }}>
                  ✓ Cliente encontrado en BD
                </span>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '12px' }}>Buscar Producto</h3>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <IconSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              <input className="form-control" placeholder="Escribe el nombre del producto..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ paddingLeft: '36px' }} />
            </div>

            {busqueda && (
              <div className={styles.busquedaResultados}>
                {buscando ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-3)' }}>Buscando...</div>
                ) : resultados.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-3)' }}>No se encontraron productos</div>
                ) : resultados.map(p => (
                  <div key={p.id_producto} className={styles.busquedaItem} onClick={() => agregarProducto(p)}>
                    <div className={styles.prodIconBox}><IconPill /></div>
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
                        <input type="number" className="form-control"
                          style={{ width: '70px', padding: '4px 8px' }}
                          value={d.cantidad} min={1} max={d.stock}
                          onChange={e => cambiarCantidad(d.id_producto, e.target.value)} />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        S/ {(d.precio * d.cantidad).toFixed(2)}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminar(d.id_producto)}>
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
              <button className="btn btn-outline"
                onClick={() => { setDetalle([]); setCliente({ nombre: '', documento: '', tipo: 'DNI', id: null }) }}>
                Cancelar
              </button>
              <button className="btn btn-primary"
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

function IconSearch({ style }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', ...style }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
function IconTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
}
function IconPill() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }}><path d="M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v2" /><circle cx="17" cy="17" r="5" /><path d="M17 14v6M14 17h6" /></svg>
}