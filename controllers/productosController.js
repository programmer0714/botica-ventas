const db = require('../config/db');

// GET /api/productos — lista todos los productos
async function getProductos(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.nombre, p.stock, p.stock_minimo, p.precio,
              p.fecha_vencimiento, p.estado,
              l.nombre AS laboratorio,
              c.nombre AS categoria,
              pr.nombre AS presentacion
       FROM Productos p
       LEFT JOIN Laboratorios l ON p.id_laboratorio = l.id_laboratorio
       LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
       LEFT JOIN Presentaciones pr ON p.id_presentacion = pr.id_presentacion
       ORDER BY p.nombre`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener productos' });
  }
}

// GET /api/productos/buscar?q=paracetamol — buscar productos
async function buscarProductos(req, res) {
  const { q } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.nombre, p.stock, p.precio,
              l.nombre AS laboratorio,
              pr.nombre AS presentacion
       FROM Productos p
       LEFT JOIN Laboratorios l ON p.id_laboratorio = l.id_laboratorio
       LEFT JOIN Presentaciones pr ON p.id_presentacion = pr.id_presentacion
       WHERE p.nombre LIKE ? AND p.stock > 0
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al buscar productos' });
  }
}

// GET /api/productos/stock-bajo — productos bajo mínimo
async function getStockBajo(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.nombre, p.stock, p.stock_minimo,
              l.nombre AS laboratorio
       FROM Productos p
       LEFT JOIN Laboratorios l ON p.id_laboratorio = l.id_laboratorio
       WHERE p.stock < p.stock_minimo
       ORDER BY p.stock ASC`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener stock bajo' });
  }
}

// PUT /api/productos/:id/stock — actualizar stock
async function actualizarStock(req, res) {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ ok: false, mensaje: 'Stock inválido' });
  }

  try {
    await db.query(
      `UPDATE Productos SET stock = ?,
       estado = CASE WHEN ? < stock_minimo THEN 'Stock Bajo' ELSE 'Disponible' END
       WHERE id_producto = ?`,
      [stock, stock, id]
    );
    res.json({ ok: true, mensaje: 'Stock actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar stock' });
  }
}

// POST /api/productos — crear producto
async function crearProducto(req, res) {
  const { nombre, id_laboratorio, id_categoria, id_presentacion, precio, stock, stock_minimo, fecha_vencimiento } = req.body;

  try {
    const estado = stock < stock_minimo ? 'Stock Bajo' : 'Disponible';
    const [result] = await db.query(
      `INSERT INTO Productos (nombre, id_laboratorio, id_categoria, id_presentacion, precio, stock, stock_minimo, fecha_vencimiento, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, id_laboratorio, id_categoria, id_presentacion, precio, stock, stock_minimo, fecha_vencimiento, estado]
    );
    res.status(201).json({ ok: true, id_producto: result.insertId, mensaje: 'Producto creado' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear producto' });
  }
}

module.exports = { getProductos, buscarProductos, getStockBajo, actualizarStock, crearProducto };
