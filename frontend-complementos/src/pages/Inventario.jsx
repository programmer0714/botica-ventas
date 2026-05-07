/* === INVENTARIO === */
import styles from './Inventario.module.css'
import iconMedicamento from '../assets/icons/icon-medicamento.svg'

const PRODUCTOS = [
  { id:1, nombre:'Paracetamol 500mg', categoria:'Analgésico', laboratorio:'Portugal', presentacion:'Pastilla', stock:80, minimo:20, precio:1.20, vence:'2026-08-15', estado:'Disponible' },
  { id:2, nombre:'Amoxicilina 500mg', categoria:'Antibiótico', laboratorio:'Pharma',   presentacion:'Cápsula', stock:8,  minimo:20, precio:0.85, vence:'2025-12-01', estado:'Stock Bajo' },
  { id:3, nombre:'Ibuprofeno 400mg',  categoria:'Analgésico', laboratorio:'Hersil',    presentacion:'Pastilla', stock:45, minimo:20, precio:1.50, vence:'2027-03-20', estado:'Disponible' },
  { id:4, nombre:'Diclofenaco Iny.',  categoria:'Analgésico', laboratorio:'Pharma',    presentacion:'Inyectable',stock:3, minimo:15, precio:2.30, vence:'2025-11-10', estado:'Por Vencer' },
  { id:5, nombre:'Paracetamol Jrb.',  categoria:'Analgésico', laboratorio:'Portugal',  presentacion:'Jarabe',  stock:12, minimo:15, precio:8.50, vence:'2026-01-05', estado:'Stock Bajo' },
]

export default function Inventario() {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Inventario de Productos</h3>
          <div style={{display:'flex',gap:'8px'}}>
            <input className="form-control" placeholder="🔍 Buscar producto..." style={{width:'220px'}} />
            <select className="form-control" style={{width:'160px'}}><option>Todas las categorías</option><option>Analgésico</option><option>Antibiótico</option></select>
            <button className="btn btn-primary btn-sm">+ Nuevo Producto</button>
          </div>
        </div>
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
              {PRODUCTOS.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div className={styles.prodIcon}>
                        {/* 🖼️ Ícono medicamento: reemplazar icon-medicamento.svg en assets/icons */}
                        <img src={iconMedicamento} alt="" width="16"
                          onError={e => e.target.style.display='none'} />
                      </div>
                      <span style={{fontWeight:500}}>{p.nombre}</span>
                    </div>
                  </td>
                  <td>{p.categoria}</td>
                  <td>{p.laboratorio}</td>
                  <td>{p.presentacion}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <div className={styles.stockBar}>
                        <div className={styles.stockFill} style={{
                          width: `${Math.min((p.stock/p.minimo)*100,100)}%`,
                          background: p.stock < p.minimo ? 'rgba(192,57,43,1)' : 'rgba(13,122,95,1)'
                        }} />
                      </div>
                      <span style={{fontSize:'12px'}}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{fontWeight:600,color:'var(--color-primary)'}}>S/ {p.precio.toFixed(2)}</td>
                  <td style={{fontSize:'12px'}}>{p.vence}</td>
                  <td>
                    <span className={`badge ${
                      p.estado==='Disponible' ? 'badge-green' :
                      p.estado==='Stock Bajo' ? 'badge-red' : 'badge-yellow'
                    }`}>{p.estado}</span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn btn-outline btn-sm">✏️</button>
                      <button className="btn btn-danger btn-sm">🗑</button>
                    </div>
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
