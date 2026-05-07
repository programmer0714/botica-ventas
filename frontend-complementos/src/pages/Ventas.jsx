import { useState } from 'react'
import styles from './Ventas.module.css'

/* 🖼️ Ícono producto desde assets/icons */
import iconProducto from '../assets/icons/icon-producto.svg'

const PRODUCTOS_MOCK = [
  { id:1, nombre:'Paracetamol 500mg', precio:1.20, stock:80 },
  { id:2, nombre:'Amoxicilina 500mg', precio:0.85, stock:60 },
  { id:3, nombre:'Ibuprofeno 400mg',  precio:1.50, stock:45 },
  { id:4, nombre:'Diclofenaco 75mg',  precio:2.30, stock:30 },
]

export default function Ventas() {
  const [tipo, setTipo]           = useState('BOLETA')
  const [busqueda, setBusqueda]   = useState('')
  const [detalle, setDetalle]     = useState([])
  const [cliente, setCliente]     = useState({ nombre:'', documento:'', tipo:'DNI' })

  const agregarProducto = (prod) => {
    const existe = detalle.find(d => d.id === prod.id)
    if (existe) {
      setDetalle(detalle.map(d => d.id===prod.id ? {...d, cantidad: d.cantidad+1} : d))
    } else {
      setDetalle([...detalle, {...prod, cantidad:1}])
    }
  }

  const cambiarCantidad = (id, val) => {
    if (val < 1) return
    setDetalle(detalle.map(d => d.id===id ? {...d, cantidad: Number(val)} : d))
  }

  const eliminar = (id) => setDetalle(detalle.filter(d => d.id !== id))

  const subtotal = detalle.reduce((a,d) => a + d.precio * d.cantidad, 0)
  const igv      = subtotal * 0.18
  const total    = subtotal + igv

  const productosFiltrados = PRODUCTOS_MOCK.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      {/* TIPO DE COMPROBANTE */}
      <div className={styles.tipoBar}>
        {['BOLETA','FACTURA'].map(t => (
          <button key={t}
            className={`${styles.tipoBtn} ${tipo===t ? styles.tipoActivo : ''}`}
            onClick={() => setTipo(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* COLUMNA IZQUIERDA */}
        <div>
          {/* COMPROBANTE */}
          <div className="card" style={{marginBottom:'14px'}}>
            <h3 className="card-title" style={{marginBottom:'14px'}}>Comprobante de Pago</h3>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-control" value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option>BOLETA</option>
                  <option>FACTURA</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Serie</label>
                <input className="form-control" value={tipo==='BOLETA' ? 'B001' : 'F001'} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Correlativo</label>
                <input className="form-control" value="000013" readOnly />
              </div>
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Fecha Emisión</label>
                <input type="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Forma de Pago</label>
                <select className="form-control">
                  <option>Contado</option><option>Tarjeta</option><option>Yape</option><option>Plin</option>
                </select>
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="card" style={{marginBottom:'14px'}}>
            <h3 className="card-title" style={{marginBottom:'14px'}}>Datos del Cliente</h3>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Tipo Documento</label>
                <select className="form-control" value={cliente.tipo} onChange={e=>setCliente({...cliente,tipo:e.target.value})}>
                  <option>DNI</option><option>RUC</option><option>CE</option><option>SIN DOC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nº Documento</label>
                <input className="form-control" placeholder="Buscar..." value={cliente.documento} onChange={e=>setCliente({...cliente,documento:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre / Razón Social</label>
              <input className="form-control" placeholder="Nombre del cliente" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})} />
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="card">
            <h3 className="card-title" style={{marginBottom:'12px'}}>Listado de Productos</h3>
            <input
              className="form-control"
              placeholder="🔍 Buscar producto por nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{marginBottom:'12px'}}
            />
            {/* RESULTADOS BÚSQUEDA */}
            {busqueda && (
              <div className={styles.busquedaResultados}>
                {productosFiltrados.map(p => (
                  <div key={p.id} className={styles.busquedaItem} onClick={() => { agregarProducto(p); setBusqueda('') }}>
                    <div className={styles.prodIconBox}>
                      {/* 🖼️ Ícono producto: reemplazar icon-producto.svg en assets/icons */}
                      <img src={iconProducto} alt="" width="16"
                        onError={e => e.target.style.display='none'} />
                    </div>
                    <div>
                      <p style={{fontSize:'13px',fontWeight:500}}>{p.nombre}</p>
                      <p style={{fontSize:'11px',color:'var(--color-text-3)'}}>Stock: {p.stock} und.</p>
                    </div>
                    <span style={{marginLeft:'auto',fontWeight:600,color:'var(--color-primary)'}}>S/ {p.precio.toFixed(2)}</span>
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
                    <tr><td colSpan={5} style={{textAlign:'center',color:'var(--color-text-3)',padding:'24px'}}>
                      Busca un producto para agregar
                    </td></tr>
                  ) : detalle.map(d => (
                    <tr key={d.id}>
                      <td style={{fontWeight:500}}>{d.nombre}</td>
                      <td>S/ {d.precio.toFixed(2)}</td>
                      <td>
                        <input type="number" className="form-control" style={{width:'70px',padding:'4px 8px'}}
                          value={d.cantidad} min={1}
                          onChange={e => cambiarCantidad(d.id, e.target.value)} />
                      </td>
                      <td style={{fontWeight:600,color:'var(--color-primary)'}}>S/ {(d.precio*d.cantidad).toFixed(2)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={()=>eliminar(d.id)}>✕</button>
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
            <h3 className="card-title" style={{marginBottom:'16px'}}>Resumen</h3>
            <div className={styles.resumenRow}><span>OP. GRAVADAS</span><span>S/ {subtotal.toFixed(2)}</span></div>
            <div className={styles.resumenRow}><span>OP. INAFECTAS</span><span>S/ 0.00</span></div>
            <div className={styles.resumenRow}><span>SUBTOTAL</span><span>S/ {subtotal.toFixed(2)}</span></div>
            <div className={styles.resumenRow}><span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span></div>
            <div className={styles.resumenTotal}>
              <span>TOTAL</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div className={styles.botonesVenta}>
              <button className="btn btn-outline" onClick={()=>setDetalle([])}>Cancelar</button>
              <button className="btn btn-primary" disabled={detalle.length===0}>
                Vender
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
