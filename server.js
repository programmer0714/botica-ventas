const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app    = express();
const routes = require('./routes/index');

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ─── RUTAS ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── RUTA RAÍZ ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Botica Nova Salud funcionando',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'GET  /api/productos',
      'GET  /api/productos/buscar?q=...',
      'GET  /api/productos/stock-bajo',
      'PUT  /api/productos/:id/stock',
      'POST /api/productos',
      'GET  /api/ventas',
      'POST /api/ventas',
      'GET  /api/ventas/dashboard',
      'GET  /api/clientes?doc=...',
      'POST /api/clientes',
      'GET  /api/devoluciones',
      'POST /api/devoluciones',
      'GET  /api/reclamaciones',
      'POST /api/reclamaciones',
    ]
  });
});

// ─── INICIO ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles en http://localhost:${PORT}/`);
});
