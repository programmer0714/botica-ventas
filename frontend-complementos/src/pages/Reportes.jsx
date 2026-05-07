import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import styles from './Reportes.module.css'

const VENTAS_MES = [
  {dia:'01',v:320},{dia:'02',v:480},{dia:'03',v:390},{dia:'04',v:650},
  {dia:'05',v:520},{dia:'06',v:480},{dia:'07',v:290},{dia:'08',v:610},
  {dia:'09',v:740},{dia:'10',v:680},{dia:'11',v:520},{dia:'12',v:890},
]

const CATEGORIAS = [
  { name:'Analgésicos',   value:38 },
  { name:'Antibióticos',  value:24 },
  { name:'Cuidado Personal', value:20 },
  { name:'Vitaminas',     value:18 },
]

const COLORES_PIE = [
  'rgba(13,122,95,1)', 'rgba(26,111,168,1)',
  'rgba(240,165,0,1)', 'rgba(192,57,43,1)'
]

const TOP_PRODUCTOS = [
  { nombre:'Paracetamol 500mg', cantidad:180, ingreso:'S/ 216.00' },
  { nombre:'Amoxicilina 500mg', cantidad:120, ingreso:'S/ 102.00' },
  { nombre:'Ibuprofeno 400mg',  cantidad: 95, ingreso:'S/ 142.50' },
  { nombre:'Diclofenaco Iny.',  cantidad: 80, ingreso:'S/ 184.00' },
  { nombre:'Paracetamol Jrb.',  cantidad: 60, ingreso:'S/ 510.00' },
]

const POR_EMPLEADO = [
  { nombre:'Ana López',   ventas:48, total:'S/ 2,340.00' },
  { nombre:'Carlos Ríos', ventas:35, total:'S/ 1,820.00' },
  { nombre:'Rosa Vega',   ventas:29, total:'S/ 1,450.00' },
]

export default function Reportes() {
  return (
    <div>
      {/* FILTROS */}
      <div className={styles.filtros}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <label className="form-label" style={{margin:0,whiteSpace:'nowrap'}}>Desde:</label>
          <input type="date" className="form-control" style={{width:'150px'}} defaultValue="2025-05-01" />
          <label className="form-label" style={{margin:0,whiteSpace:'nowrap'}}>Hasta:</label>
          <input type="date" className="form-control" style={{width:'150px'}} defaultValue="2025-05-12" />
        </div>
        <button className="btn btn-primary btn-sm">Exportar PDF</button>
      </div>

      {/* GRÁFICOS */}
      <div className={styles.grid2} style={{marginBottom:'16px'}}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Ventas del mes</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VENTAS_MES} barSize={18}>
              <XAxis dataKey="dia" tick={{fontSize:11,fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10,fill:'rgba(138,160,155,1)'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid rgba(224,232,229,1)',fontSize:12}} />
              <Bar dataKey="v" fill="rgba(13,122,95,1)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Ventas por Categoría</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CATEGORIAS} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                {CATEGORIAS.map((_, i) => <Cell key={i} fill={COLORES_PIE[i]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{fontSize:'12px'}} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Top 5 Productos Más Vendidos</h3></div>
          <table>
            <thead><tr><th>#</th><th>Producto</th><th>Cantidad</th><th>Ingreso</th></tr></thead>
            <tbody>
              {TOP_PRODUCTOS.map((p,i) => (
                <tr key={i}>
                  <td><span className="badge badge-green">#{i+1}</span></td>
                  <td style={{fontWeight:500}}>{p.nombre}</td>
                  <td>{p.cantidad} und.</td>
                  <td style={{fontWeight:600,color:'var(--color-primary)'}}>{p.ingreso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Ventas por Empleado</h3></div>
          <table>
            <thead><tr><th>Empleado</th><th>Ventas</th><th>Total</th></tr></thead>
            <tbody>
              {POR_EMPLEADO.map((e,i) => (
                <tr key={i}>
                  <td style={{fontWeight:500}}>{e.nombre}</td>
                  <td>{e.ventas} comprobantes</td>
                  <td style={{fontWeight:600,color:'var(--color-primary)'}}>{e.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
