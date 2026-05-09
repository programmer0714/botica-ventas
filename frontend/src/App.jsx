import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login       from './pages/Login.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import Ventas      from './pages/Ventas.jsx'
import Inventario  from './pages/Inventario.jsx'
import Reclamaciones from './pages/Reclamaciones.jsx'
import Devoluciones  from './pages/Devoluciones.jsx'
import Reportes      from './pages/Reportes.jsx'
import Caja          from './pages/Caja.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          {/* <Route index element={<Navigate to="/dashboard" />} /> */}
          <Route index element={<Navigate to="/login" />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="ventas"        element={<Ventas />} />
          <Route path="inventario"    element={<Inventario />} />
          <Route path="reclamaciones" element={<Reclamaciones />} />
          <Route path="devoluciones"  element={<Devoluciones />} />
          <Route path="reportes"      element={<Reportes />} />
          <Route path="caja"          element={<Caja />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
