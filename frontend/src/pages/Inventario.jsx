/* === INVENTARIO — conectado a API === */
import { useState, useEffect, useCallback } from 'react'
import styles from './Inventario.module.css'
import {
  getProductos, buscarProductos,
  crearProducto, editarProducto, eliminarProducto,
} from '../api'

// ─── Constantes ────────────────────────────────────────────────────────────
const POR_PAGINA = 10

const FORM_VACIO = {
  nombre: '', id_laboratorio: '', id_categoria: '',
  id_presentacion: '', precio: '', stock: '', stock_minimo: '',
  fecha_vencimiento: '',
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function Inventario() {
  const [productos, setProductos]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // Búsqueda y filtro
  const [busqueda, setBusqueda]     = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  // Paginación
  const [pagina, setPagina]         = useState(1)

  // Modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEditar, setModoEditar]     = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [form, setForm]             = useState(FORM_VACIO)
  const [guardando, setGuardando]   = useState(false)
  const [msgModal, setMsgModal]     = useState(null)

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getProductos()
      if (res.ok) setProductos(res.data)
      else setError('No se pudieron cargar los productos.')
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarProductos() }, [cargarProductos])

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (busqueda.trim() === '') {
      cargarProductos()
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await buscarProductos(busqueda.trim())
        if (res.ok) setProductos(res.data)
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [busqueda, cargarProductos])

  // ── Filtro local por estado ───────────────────────────────────────────────
  const productosFiltrados = filtroEstado === 'Todos'
    ? productos
    : productos.filter(p => p.estado === filtroEstado)

  // ── Paginación ────────────────────────────────────────────────────────────
  const totalPaginas  = Math.max(1, Math.ceil(productosFiltrados.length / POR_PAGINA))
  const paginaSegura  = Math.min(pagina, totalPaginas)
  const inicio        = (paginaSegura - 1) * POR_PAGINA
  const productosPag  = productosFiltrados.slice(inicio, inicio + POR_PAGINA)

  useEffect(() => setPagina(1), [busqueda, filtroEstado])

  // ── Modal ─────────────────────────────────────────────────────────────────
  const abrirModalNuevo = () => {
    setModoEditar(false)
    setProductoEditando(null)
    setForm(FORM_VACIO)
    setMsgModal(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (p) => {
    setModoEditar(true)
    setProductoEditando(p)
    setForm({
      nombre:            p.nombre           ?? '',
      id_laboratorio:    p.id_laboratorio   ?? '',
      id_categoria:      p.id_categoria     ?? '',
      id_presentacion:   p.id_presentacion  ?? '',
      precio:            p.precio           ?? '',
      stock:             p.stock            ?? '',
      stock_minimo:      p.stock_minimo     ?? '',
      fecha_vencimiento: p.fecha_vencimiento
        ? p.fecha_vencimiento.split('T')[0]
        : '',
    })
    setMsgModal(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setMsgModal(null)
  }

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGuardar = async () => {
    const { nombre, precio, stock, stock_minimo } = form
    if (!nombre.trim() || precio === '' || stock === '' || stock_minimo === '') {
      setMsgModal({ tipo: 'error', texto: 'Completa los campos obligatorios: nombre, precio, stock y stock mínimo.' })
      return
    }
    setGuardando(true)
    setMsgModal(null)
    try {
      const payload = {
        ...form,
        precio:       parseFloat(form.precio),
        stock:        parseInt(form.stock),
        stock_minimo: parseInt(form.stock_minimo),
      }
      const res = modoEditar
        ? await editarProducto(productoEditando.id_producto, payload)
        : await crearProducto(payload)

      if (res.ok) {
        setMsgModal({ tipo: 'ok', texto: modoEditar ? 'Producto actualizado.' : 'Producto creado.' })
        await cargarProductos()
        setTimeout(cerrarModal, 800)
      } else {
        setMsgModal({ tipo: 'error', texto: res.mensaje ?? 'Error al guardar.' })
      }
    } catch {
      setMsgModal({ tipo: 'error', texto: 'Error de conexión.' })
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleEliminar = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await eliminarProducto(p.id_producto)
      if (res.ok) await cargarProductos()
      else alert(res.mensaje ?? 'Error al eliminar.')
    } catch {
      alert('Error de conexión.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="card">
        {/* CABECERA */}
        <div className="card-header">
          <h3 className="card-title">Inventario de Productos</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <IconSearch style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--color-text-3)',
                pointerEvents: 'none',
              }} />
              <input
                className="form-control"
                placeholder="Buscar producto..."
                style={{ width: '220px', paddingLeft: '32px' }}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '190px' }}
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Stock Bajo">Stock Bajo</option>
              <option value="Por Vencer">Por Vencer</option>
            </select>

            <button className="btn btn-primary btn-sm" onClick={abrirModalNuevo}>
              + Nuevo Producto
            </button>
          </div>
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

        {/* TABLA */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Producto</th><th>Categoría</th><th>Laboratorio</th>
                <th>Presentación</th><th>Stock</th><th>Precio</th>
                <th>Vencimiento</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-3)' }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : productosPag.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-3)' }}>
                    No se encontraron productos.
                  </td>
                </tr>
              ) : productosPag.map(p => (
                <tr key={p.id_producto}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconCategoria categoria={p.categoria} />
                      <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
                      {p.categoria ?? '—'}
                    </span>
                  </td>
                  <td>{p.laboratorio ?? '—'}</td>
                  <td>{p.presentacion ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className={styles.stockBar}>
                        <div
                          className={styles.stockFill}
                          style={{
                            width: `${Math.min((p.stock / (p.stock_minimo || 1)) * 100, 100)}%`,
                            background: p.stock < p.stock_minimo
                              ? 'var(--color-danger)'
                              : 'var(--color-success)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px' }}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    S/ {Number(p.precio).toFixed(2)}
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {p.fecha_vencimiento
                      ? new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')
                      : '—'}
                  </td>
                  <td>
                    <span className={`badge ${
                      p.estado === 'Disponible' ? 'badge-green' :
                      p.estado === 'Stock Bajo' ? 'badge-red' : 'badge-yellow'
                    }`}>{p.estado}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        title="Editar"
                        onClick={() => abrirModalEditar(p)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Eliminar"
                        onClick={() => handleEliminar(p)}
                      >
                        <IconDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className={styles.pagination}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
            {productosFiltrados.length} productos
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className={styles.pageBtn}
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={paginaSegura === 1}
            >
              <IconChevronLeft />
            </button>
            <span>Página {paginaSegura} de {totalPaginas}</span>
            <button
              className={styles.pageBtn}
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura === totalPaginas}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL CREAR / EDITAR ─────────────────────────────────────────── */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '28px', width: '100%', maxWidth: '520px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>
                {modoEditar ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={cerrarModal}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-text-3)' }}>
                ×
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre <span style={{color:'var(--color-danger)'}}>*</span></label>
              <input name="nombre" className="form-control"
                placeholder="Ej: Paracetamol 500mg"
                value={form.nombre} onChange={handleFormChange} />
            </div>

            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Precio (S/) <span style={{color:'var(--color-danger)'}}>*</span></label>
                <input name="precio" type="number" step="0.01" min="0"
                  className="form-control" placeholder="0.00"
                  value={form.precio} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock actual <span style={{color:'var(--color-danger)'}}>*</span></label>
                <input name="stock" type="number" min="0"
                  className="form-control" placeholder="0"
                  value={form.stock} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Stock mínimo <span style={{color:'var(--color-danger)'}}>*</span></label>
                <input name="stock_minimo" type="number" min="0"
                  className="form-control" placeholder="0"
                  value={form.stock_minimo} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha vencimiento</label>
                <input name="fecha_vencimiento" type="date"
                  className="form-control"
                  value={form.fecha_vencimiento} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">ID Laboratorio</label>
                <input name="id_laboratorio" type="number" min="1"
                  className="form-control" placeholder="ID"
                  value={form.id_laboratorio} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="form-label">ID Categoría</label>
                <input name="id_categoria" type="number" min="1"
                  className="form-control" placeholder="ID"
                  value={form.id_categoria} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="form-label">ID Presentación</label>
                <input name="id_presentacion" type="number" min="1"
                  className="form-control" placeholder="ID"
                  value={form.id_presentacion} onChange={handleFormChange} />
              </div>
            </div>

            <div style={{
              background: 'rgba(13,122,95,0.06)', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '16px', fontSize: '12px',
              color: 'var(--color-text-3)',
            }}>
              <strong>IDs de referencia:</strong><br/>
              Laboratorio: 1=Pharma, 2=Portugal, 3=Hersil, 4=Abott<br/>
              Categoría: 1=Analgésico, 2=Antibiótico, 3=Antiinflamatorio, 4=Antialérgico, 5=Gastrointestinal, 6=Vitaminas<br/>
              Presentación: 1=Pastilla, 2=Cápsula, 3=Jarabe, 4=Inyectable, 5=Inhalador
            </div>

            {msgModal && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '14px',
                fontSize: '13px',
                background: msgModal.tipo === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)',
                color: msgModal.tipo === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
                border: `1px solid ${msgModal.tipo === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
              }}>
                {msgModal.tipo === 'ok' ? '✅' : '⚠️'} {msgModal.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : modoEditar ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Ícono por categoría ───────────────────────────────────────────────────── */
function IconCategoria({ categoria }) {
  const iconos = {
    'Analgésico': {
      color: '#dc2626', bg: '#fef2f2',
      path: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
    'Antibiótico': {
      color: '#2563eb', bg: '#eff6ff',
      path: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    'Antiinflamatorio': {
      color: '#d97706', bg: '#fffbeb',
      path: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    },
    'Antialérgico': {
      color: '#7c3aed', bg: '#f5f3ff',
      path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    'Gastrointestinal': {
      color: '#059669', bg: '#ecfdf5',
      path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    'Vitaminas': {
      color: '#ea580c', bg: '#fff7ed',
      path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    },
  }

  const icono = iconos[categoria] ?? {
    color: '#6b7280', bg: '#f3f4f6',
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  }

  return (
    <div style={{
      width: '34px', height: '34px', borderRadius: '9px',
      background: icono.bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={icono.color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d={icono.path} />
      </svg>
    </div>
  )
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
function IconSearch({ style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: '14px', height: '14px', ...style }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: '14px', height: '14px' }}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconDelete() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: '14px', height: '14px' }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: '14px', height: '14px' }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: '14px', height: '14px' }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}