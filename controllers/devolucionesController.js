const db = require('../config/db');

// ─── DEVOLUCIONES ──────────────────────────────────────────────────────────

// GET /api/devoluciones
async function getDevoluciones(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT d.id_devolucion, d.cantidad, d.motivo, d.fecha, d.estado,
              v.serie, v.correlativo,
              p.nombre AS producto,
              c.nombre_razon_social AS cliente
       FROM Devoluciones d
       JOIN Ventas v ON d.id_venta = v.id_venta
       JOIN Productos p ON d.id_producto = p.id_producto
       LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
       ORDER BY d.fecha DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener devoluciones' });
  }
}

// POST /api/devoluciones
async function registrarDevolucion(req, res) {
  const { id_venta, id_producto, cantidad, motivo } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Devoluciones (id_venta, id_producto, cantidad, motivo, estado)
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [id_venta, id_producto, cantidad, motivo]
    );
    // Devolver stock al inventario
    await db.query(
      `UPDATE Productos SET stock = stock + ? WHERE id_producto = ?`,
      [cantidad, id_producto]
    );
    res.status(201).json({ ok: true, id_devolucion: result.insertId, mensaje: 'Devolución registrada' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al registrar devolución' });
  }
}

// ─── RECLAMACIONES ─────────────────────────────────────────────────────────

// GET /api/reclamaciones
async function getReclamaciones(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.id_reclamacion, r.motivo, r.fecha, r.estado,
              v.serie, v.correlativo,
              c.nombre_razon_social AS cliente
       FROM Reclamaciones r
       JOIN Ventas v ON r.id_venta = v.id_venta
       LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
       ORDER BY r.fecha DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reclamaciones' });
  }
}

// POST /api/reclamaciones
async function registrarReclamacion(req, res) {
  const { id_venta, motivo } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Reclamaciones (id_venta, motivo, estado) VALUES (?, ?, 'Pendiente')`,
      [id_venta, motivo]
    );
    res.status(201).json({ ok: true, id_reclamacion: result.insertId, mensaje: 'Reclamación registrada' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al registrar reclamación' });
  }
}

module.exports = { getDevoluciones, registrarDevolucion, getReclamaciones, registrarReclamacion };
