//const API_URL = 'https://dime-bonsai-emporium.ngrok-free.dev/api'
const API_URL = 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    ...options
  });
  return res.json();
}

// ─── AUTH ──────────────────────────────────────────
export const loginAPI = (username, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

// ─── PRODUCTOS ─────────────────────────────────────
export const getProductos    = () => apiFetch('/productos');
export const buscarProductos = (q) => apiFetch(`/productos/buscar?q=${q}`);
export const getStockBajo    = () => apiFetch('/productos/stock-bajo');
export const actualizarStock = (id, stock) =>
  apiFetch(`/productos/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ stock })
  });
export const crearProducto  = (data) =>
  apiFetch('/productos', { method: 'POST', body: JSON.stringify(data) });
export const editarProducto = (id, data) =>
  apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarProducto = (id) =>
  apiFetch(`/productos/${id}`, { method: 'DELETE' });

// ─── VENTAS ────────────────────────────────────────
export const getVentas = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  return apiFetch(`/ventas?${params}`);
};
export const registrarVenta = (data) =>
  apiFetch('/ventas', { method: 'POST', body: JSON.stringify(data) });

// ─── DASHBOARD ─────────────────────────────────────
export const getDashboard = () => apiFetch('/ventas/dashboard');

// ─── CLIENTES ──────────────────────────────────────
export const buscarCliente = (doc) => apiFetch(`/clientes?doc=${doc}`);
export const crearCliente  = (data) =>
  apiFetch('/clientes', { method: 'POST', body: JSON.stringify(data) });

// ─── DEVOLUCIONES ──────────────────────────────────
export const getDevoluciones     = () => apiFetch('/devoluciones');
export const registrarDevolucion = (data) =>
  apiFetch('/devoluciones', { method: 'POST', body: JSON.stringify(data) });

// ─── RECLAMACIONES ─────────────────────────────────
export const getReclamaciones     = () => apiFetch('/reclamaciones');
export const registrarReclamacion = (data) =>
  apiFetch('/reclamaciones', { method: 'POST', body: JSON.stringify(data) });
export const getCajaActiva  = () => apiFetch('/caja/activa');
export const getHistorialCaja = () => apiFetch('/caja/historial');
export const abrirCaja      = (monto_apertura) =>
  apiFetch('/caja/abrir', { method: 'POST', body: JSON.stringify({ monto_apertura }) });
export const cerrarCaja     = (id_caja, monto_cierre) =>
  apiFetch('/caja/cerrar', { method: 'POST', body: JSON.stringify({ id_caja, monto_cierre }) });
