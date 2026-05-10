const db = require('../config/db');

// ─── GET /api/caja/activa ─────────────────────────────────────────────────
// Devuelve la caja abierta actualmente (si existe)
async function getCajaActiva(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ct.*, 
              CONCAT(e.nombres,' ',e.apellidos) AS responsable
       FROM caja_turnos ct
       JOIN usuarios u ON ct.id_usuario = u.id_usuario
       JOIN empleados e ON u.id_empleado = e.id_empleado
       WHERE ct.estado = 'Abierta'
       ORDER BY ct.fecha_apertura DESC
       LIMIT 1`
    );
    if (rows.length === 0) {
      return res.json({ ok: true, abierta: false, data: null });
    }
    res.json({ ok: true, abierta: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al consultar caja activa' });
  }
}

// ─── GET /api/caja/historial ──────────────────────────────────────────────
// Devuelve los últimos 20 turnos cerrados
async function getHistorial(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ct.*,
              CONCAT(e.nombres,' ',e.apellidos) AS responsable
       FROM caja_turnos ct
       JOIN usuarios u ON ct.id_usuario = u.id_usuario
       JOIN empleados e ON u.id_empleado = e.id_empleado
       ORDER BY ct.fecha_apertura DESC
       LIMIT 20`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener historial de caja' });
  }
}

// ─── POST /api/caja/abrir ─────────────────────────────────────────────────
async function abrirCaja(req, res) {
  const { monto_apertura } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (monto_apertura === undefined || monto_apertura < 0) {
    return res.status(400).json({ ok: false, mensaje: 'Monto de apertura inválido' });
  }

  try {
    // Verificar que no haya una caja ya abierta
    const [[cajaExiste]] = await db.query(
      `SELECT id_caja FROM caja_turnos WHERE estado = 'Abierta' LIMIT 1`
    );
    if (cajaExiste) {
      return res.status(409).json({ ok: false, mensaje: 'Ya existe una caja abierta. Ciérrala antes de abrir una nueva.' });
    }

    const [result] = await db.query(
      `INSERT INTO caja_turnos (id_usuario, monto_apertura, estado)
       VALUES (?, ?, 'Abierta')`,
      [id_usuario, monto_apertura]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Caja abierta correctamente',
      id_caja: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al abrir caja' });
  }
}

// ─── POST /api/caja/cerrar ────────────────────────────────────────────────
async function cerrarCaja(req, res) {
  const { id_caja, monto_cierre } = req.body;

  if (!id_caja || monto_cierre === undefined || monto_cierre < 0) {
    return res.status(400).json({ ok: false, mensaje: 'Datos incompletos para cerrar caja' });
  }

  try {
    // Verificar que la caja existe y está abierta
    const [[caja]] = await db.query(
      `SELECT * FROM caja_turnos WHERE id_caja = ? AND estado = 'Abierta'`,
      [id_caja]
    );
    if (!caja) {
      return res.status(404).json({ ok: false, mensaje: 'Caja no encontrada o ya cerrada' });
    }

    // Calcular total de ventas durante el turno
    const [[ventas]] = await db.query(
      `SELECT IFNULL(SUM(total), 0) AS total_ventas
       FROM ventas
       WHERE estado = 'Activa'
         AND fecha_hora >= ?`,
      [caja.fecha_apertura]
    );

    // Calcular total de devoluciones durante el turno
    const [[devoluciones]] = await db.query(
      `SELECT IFNULL(COUNT(*), 0) AS total_devoluciones
       FROM devoluciones
       WHERE fecha >= ?`,
      [caja.fecha_apertura]
    );

    await db.query(
      `UPDATE caja_turnos
       SET monto_cierre        = ?,
           total_ventas        = ?,
           total_devoluciones  = ?,
           fecha_cierre        = NOW(),
           estado              = 'Cerrada'
       WHERE id_caja = ?`,
      [
        monto_cierre,
        ventas.total_ventas,
        devoluciones.total_devoluciones,
        id_caja,
      ]
    );

    res.json({
      ok: true,
      mensaje: 'Caja cerrada correctamente',
      resumen: {
        monto_apertura:     caja.monto_apertura,
        total_ventas:       ventas.total_ventas,
        total_devoluciones: devoluciones.total_devoluciones,
        monto_cierre,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al cerrar caja' });
  }
}

module.exports = { getCajaActiva, getHistorial, abrirCaja, cerrarCaja };