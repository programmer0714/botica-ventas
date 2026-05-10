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
       FROM devoluciones d
       JOIN ventas v ON d.id_venta = v.id_venta
       JOIN productos p ON d.id_producto = p.id_producto
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       ORDER BY d.fecha DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener devoluciones' });
  }
}

// POST /api/devoluciones
async function registrarDevolucion(req, res) {
  const { id_venta, id_producto, cantidad, motivo } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO devoluciones (id_venta, id_producto, cantidad, motivo, estado)
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [id_venta, id_producto, cantidad, motivo]
    );
    await db.query(
      `UPDATE productos SET stock = stock + ? WHERE id_producto = ?`,
      [cantidad, id_producto]
    );
    res.status(201).json({ ok: true, id_devolucion: result.insertId, mensaje: 'Devolución registrada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al registrar devolución' });
  }
}

// ─── RECLAMACIONES ─────────────────────────────────────────────────────────
// GET /api/reclamaciones
async function getReclamaciones(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.id_reclamacion,
              r.tipo,
              r.nombre,
              r.dni,
              r.telefono,
              r.motivo,
              r.fecha,
              r.estado,
              r.id_venta,
              v.serie,
              v.correlativo
       FROM reclamaciones r
       LEFT JOIN ventas v ON r.id_venta = v.id_venta
       ORDER BY r.fecha DESC`
    );

    // Generar código legible: REC-2025-001
    const data = rows.map(r => ({
      ...r,
      codigo: `REC-${new Date(r.fecha).getFullYear()}-${String(r.id_reclamacion).padStart(3, '0')}`,
    }));

    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reclamaciones' });
  }
}

// POST /api/reclamaciones
async function registrarReclamacion(req, res) {
  const { tipo, nombre, dni, telefono, descripcion, id_venta } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ ok: false, mensaje: 'Nombre y descripción son obligatorios' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO reclamaciones (id_venta, tipo, nombre, dni, telefono, motivo, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [id_venta ?? null, tipo ?? 'Queja', nombre, dni ?? null, telefono ?? null, descripcion]
    );

    const codigo = `REC-${new Date().getFullYear()}-${String(result.insertId).padStart(3, '0')}`;

    res.status(201).json({
      ok: true,
      id_reclamacion: result.insertId,
      codigo,
      mensaje: 'Reclamación registrada correctamente',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al registrar reclamación' });
  }
}

module.exports = { getDevoluciones, registrarDevolucion, getReclamaciones, registrarReclamacion };