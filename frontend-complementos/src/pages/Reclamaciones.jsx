/* RECLAMACIONES */
import { useState } from 'react'
import iconReclamo from '../assets/icons/icon-reclamo.svg'

const RECLAMOS = [
  { id:'REC-2025-001', cliente:'Ana Torres',    tipo:'Reclamo', fecha:'2025-05-01', estado:'Pendiente' },
  { id:'REC-2025-002', cliente:'Luis Mendoza',  tipo:'Queja',   fecha:'2025-05-02', estado:'Resuelto'  },
  { id:'REC-2025-003', cliente:'Rosa Cárdenas', tipo:'Reclamo', fecha:'2025-05-03', estado:'En Proceso'},
]

export default function Reclamaciones() {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'16px',alignItems:'start'}}>
      {/* TABLA */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Libro de Reclamaciones</h3>
          <button className="btn btn-danger btn-sm" onClick={() => setMostrarForm(!mostrarForm)}>
            + Nueva Queja / Reclamo
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
          {/* 🖼️ Ícono libro: reemplazar icon-reclamo.svg en assets/icons */}
          <img src={iconReclamo} alt="" width="20" onError={e=>e.target.style.display='none'} />
          <input className="form-control" placeholder="Buscar por código o cliente..." style={{flex:1}} />
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Código</th><th>Cliente</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {RECLAMOS.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:600,color:'var(--color-primary)'}}>{r.id}</td>
                  <td>{r.cliente}</td>
                  <td><span className={`badge ${r.tipo==='Reclamo'?'badge-red':'badge-yellow'}`}>{r.tipo}</span></td>
                  <td style={{fontSize:'12px'}}>{r.fecha}</td>
                  <td><span className={`badge ${r.estado==='Resuelto'?'badge-green':r.estado==='Pendiente'?'badge-yellow':'badge-blue'}`}>{r.estado}</span></td>
                  <td><button className="btn btn-outline btn-sm">Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="card">
        <h3 className="card-title" style={{marginBottom:'14px'}}>Registrar Queja / Reclamo</h3>
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select className="form-control"><option>Queja</option><option>Reclamo</option></select>
        </div>
        <div className="form-group">
          <label className="form-label">Nombre del Cliente</label>
          <input className="form-control" placeholder="Nombre completo" />
        </div>
        <div className="form-row cols-2">
          <div className="form-group"><label className="form-label">DNI</label><input className="form-control" placeholder="DNI" /></div>
          <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" placeholder="Teléfono" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Descripción del problema</label>
          <textarea className="form-control" rows={5} placeholder="Describa detalladamente..." style={{resize:'vertical'}} />
        </div>
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Registrar</button>
      </div>
    </div>
  )
}
