const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');

const authCtrl        = require('../controllers/authController');
const productosCtrl   = require('../controllers/productosController');
const ventasCtrl      = require('../controllers/ventasController');
const clientesCtrl    = require('../controllers/clientesController');
const devCtrl         = require('../controllers/devolucionesController');
const cajaCtrl        = require('../controllers/cajaController');

// ─── AUTH (sin token) ──────────────────────────────────────────────────────
router.post('/auth/login', authCtrl.login);

// ─── DASHBOARD (con token) ────────────────────────────────────────────────
router.get('/ventas/dashboard', auth, ventasCtrl.getDashboard);

// ─── PRODUCTOS ────────────────────────────────────────────────────────────
router.get('/productos',              auth, productosCtrl.getProductos);
router.get('/productos/buscar',       auth, productosCtrl.buscarProductos);
router.get('/productos/stock-bajo',   auth, productosCtrl.getStockBajo);
router.put('/productos/:id/stock',    auth, productosCtrl.actualizarStock);
router.put('/productos/:id',          auth, productosCtrl.editarProducto);
router.delete('/productos/:id',       auth, productosCtrl.eliminarProducto);
router.post('/productos',             auth, productosCtrl.crearProducto);

// ─── VENTAS ───────────────────────────────────────────────────────────────
router.get('/ventas',    auth, ventasCtrl.getVentas);
router.post('/ventas',   auth, ventasCtrl.registrarVenta);

// ─── CLIENTES ─────────────────────────────────────────────────────────────
router.get('/clientes',  auth, clientesCtrl.buscarCliente);
router.post('/clientes', auth, clientesCtrl.crearCliente);

// ─── DEVOLUCIONES ─────────────────────────────────────────────────────────
router.get('/devoluciones',  auth, devCtrl.getDevoluciones);
router.post('/devoluciones', auth, devCtrl.registrarDevolucion);

// ─── RECLAMACIONES ────────────────────────────────────────────────────────
router.get('/reclamaciones',  auth, devCtrl.getReclamaciones);
router.post('/reclamaciones', auth, devCtrl.registrarReclamacion);

// ─── CAJA ─────────────────────────────────────────────────────────────────
router.get('/caja/activa',    auth, cajaCtrl.getCajaActiva);
router.get('/caja/historial', auth, cajaCtrl.getHistorial);
router.post('/caja/abrir',    auth, cajaCtrl.abrirCaja);
router.post('/caja/cerrar',   auth, cajaCtrl.cerrarCaja);

module.exports = router;