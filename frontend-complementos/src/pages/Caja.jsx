import { useState } from 'react'
import styles from './Caja.module.css'

export default function Caja() {
  const [abierta, setAbierta] = useState(false)

  return (
    <div className={styles.grid}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Estado de Caja</h3>
          <span className={`badge ${abierta ? 'badge-green' : 'badge-red'}`}>{abierta ? 'Abierta' : 'Cerrada'}</span>
        </div>
        {!abierta ? (
          <div>
            <div className="form-group"><label className="form-label">Monto de Apertura (S/)</label><input type="number" className="form-control" placeholder="0.00" /></div>
            <div className="form-group"><label className="form-label">Responsable</label><input className="form-control" defaultValue="Administrador" readOnly /></div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>setAbierta(true)}>Abrir Caja</button>
          </div>
        ) : (
          <div>
            <div className={styles.resumenCaja}>
              {[
                ['Monto Apertura', 'S/ 200.00'],
                ['Total Ventas',   'S/ 1,250.00'],
                ['Devoluciones',   'S/ 22.00'],
                ['Total Esperado', 'S/ 1,428.00'],
              ].map(([label, val]) => (
                <div key={label} className={styles.cajaRow}>
                  <span>{label}</span>
                  <span style={{fontWeight:600,color:'var(--color-primary)'}}>{val}</span>
                </div>
              ))}
            </div>
            <div className="form-group" style={{marginTop:'14px'}}>
              <label className="form-label">Monto Contado en Caja (S/)</label>
              <input type="number" className="form-control" placeholder="0.00" />
            </div>
            <button className="btn btn-danger" style={{width:'100%',justifyContent:'center'}} onClick={()=>setAbierta(false)}>Cerrar Caja</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title" style={{marginBottom:'14px'}}>Historial de Turnos</h3>
        <table>
          <thead><tr><th>Fecha</th><th>Responsable</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            {[
              ['2025-05-05','Ana López','S/ 980.00','Cerrada'],
              ['2025-05-04','Carlos R.','S/ 1,120.00','Cerrada'],
              ['2025-05-03','Ana López','S/ 860.00','Cerrada'],
            ].map(([f,r,t,e],i) => (
              <tr key={i}>
                <td style={{fontSize:'12px'}}>{f}</td>
                <td>{r}</td>
                <td style={{fontWeight:600,color:'var(--color-primary)'}}>{t}</td>
                <td><span className="badge badge-gray">{e}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
