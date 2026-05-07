export default function Devoluciones() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'16px',alignItems:'start'}}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Registro de Devoluciones</h3>
          <span className="badge badge-yellow">3 pendientes</span>
        </div>
        <table>
          <thead>
            <tr><th>ID Venta</th><th>Cliente</th><th>Producto</th><th>Motivo</th><th>Monto</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {[
              { venta:'B001-000010', cliente:'Carlos Ríos',  prod:'Paracetamol 500mg', motivo:'Producto vencido', monto:'S/ 12.00', estado:'Aprobada'},
              { venta:'B001-000008', cliente:'María López',  prod:'Amoxicilina 500mg', motivo:'Error de despacho','monto':'S/ 8.50',  estado:'Pendiente'},
            ].map((d,i) => (
              <tr key={i}>
                <td style={{fontWeight:500,color:'var(--color-primary)'}}>{d.venta}</td>
                <td>{d.cliente}</td>
                <td>{d.prod}</td>
                <td style={{fontSize:'12px'}}>{d.motivo}</td>
                <td style={{fontWeight:600}}>{d.monto}</td>
                <td><span className={`badge ${d.estado==='Aprobada'?'badge-green':'badge-yellow'}`}>{d.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3 className="card-title" style={{marginBottom:'14px'}}>Nueva Devolución</h3>
        <div className="form-group"><label className="form-label">Nº de Venta</label><input className="form-control" placeholder="Ej: B001-000012" /></div>
        <div className="form-group"><label className="form-label">Producto</label><input className="form-control" placeholder="Nombre del producto" /></div>
        <div className="form-group"><label className="form-label">Cantidad</label><input type="number" className="form-control" min="1" defaultValue="1" /></div>
        <div className="form-group"><label className="form-label">Motivo</label><textarea className="form-control" rows={4} placeholder="Motivo de la devolución..." /></div>
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Registrar Devolución</button>
      </div>
    </div>
  )
}
