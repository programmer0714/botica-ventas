const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app    = express();
const routes = require('./routes/index');

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ─── RUTAS API ────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── SERVIR FRONTEND (build de Vite) ─────────────────────────────────────
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// Cualquier ruta no-API devuelve el index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ─── INICIO ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Frontend disponible en http://localhost:${PORT}`);
});