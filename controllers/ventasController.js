const db = require('../config/db');

// GET /api/ventas — historial de ventas
async function getVentas(req, res) {
  const { desde, hasta, tipo } = req.query;

  let query = `
    SELECT v.id_venta, v.serie, v.correlativo, v.fecha_hora,
           v.forma_pago, v.subtotal, v.igv, v.total, v.estado,
           tc.nombre AS tipo_comprobante,
           c.nombre_razon_social AS cliente,
           c.numero_documento,
           CONCAT(e.nombres,' ',e.apellidos) AS vendedor
    FROM Ventas v
    JOIN Tipos_Comprobantes tc ON v.id_tipo_comprobante = tc.id_tipo
    LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    JOIN Empleados e ON u.id_empleado = e.id_empleado
    WHERE 1=1
  `;
  const params = [];

  if (desde) { query += ' AND DATE(v.fecha_hora) >= ?'; params.push(desde); }
  if (hasta)  { query += ' AND DATE(v.fecha_hora) <= ?'; params.push(hasta); }
  if (tipo)   { query += ' AND tc.nombre = ?'; params.push(tipo); }

  query += ' ORDER BY v.fecha_hora DESC';

  try {
    const [rows] = await db.query(query, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener ventas' });
  }
}

// GET /api/ventas/dashboard — datos para el dashboard
async function getDashboard(req, res) {
  try {
    const [[ventasHoy]] = await db.query(
      `SELECT IFNULL(SUM(total),0) AS total_hoy, COUNT(*) AS cantidad_hoy
       FROM Ventas WHERE DATE(fecha_hora) = CURDATE() AND estado = 'Activa'`
    );

    const [[stockBajo]] = await db.query(
      `SELECT COUNT(*) AS cantidad FROM Productos WHERE stock < stock_minimo`
    );

    const [ventasSemana] = await db.query(
      `SELECT DATE(fecha_hora) AS dia, SUM(total) AS total
       FROM Ventas
       WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         AND estado = 'Activa'
       GROUP BY DATE(fecha_hora)
       ORDER BY dia ASC`
    );

    const [ventasRecientes] = await db.query(
      `SELECT v.serie, v.correlativo, v.total, v.estado,
              tc.nombre AS tipo_comprobante,
              IFNULL(c.nombre_razon_social,'Sin documento') AS cliente
       FROM Ventas v
       JOIN Tipos_Comprobantes tc ON v.id_tipo_comprobante = tc.id_tipo
       LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
       ORDER BY v.fecha_hora DESC LIMIT 5`
    );

    res.json({
      ok: true,
      data: {
        ventas_hoy:      ventasHoy.total_hoy,
        cantidad_hoy:    ventasHoy.cantidad_hoy,
        stock_bajo:      stockBajo.cantidad,
        ventas_semana:   ventasSemana,
        ventas_recientes: ventasRecientes
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener datos del dashboard' });
  }
}

// POST /api/ventas — registrar nueva venta
async function registrarVenta(req, res) {
  const { id_tipo_comprobante, id_cliente, forma_pago, detalle } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!detalle || detalle.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'La venta debe tener al menos un producto' });
  }

  const conn = await require('../config/db').getConnection();
  try {
    await conn.beginTransaction();

    // Obtener serie y correlativo
    const [[comprobante]] = await conn.query(
      'SELECT serie, correlativo_actual FROM Tipos_Comprobantes WHERE id_tipo = ?',
      [id_tipo_comprobante]
    );

    const nuevoCorrelativo = comprobante.correlativo_actual + 1;
    const correlativo = String(nuevoCorrelativo).padStart(6, '0');

    // Calcular totales
    const subtotal = detalle.reduce((s, d) => s + (d.precio_unitario * d.cantidad), 0);
    const igv      = subtotal * 0.18;
    const total    = subtotal + igv;

    // Insertar venta
    const [ventaResult] = await conn.query(
      `INSERT INTO Ventas (id_tipo_comprobante, serie, correlativo, forma_pago, id_cliente, id_usuario, subtotal, igv, total, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activa')`,
      [id_tipo_comprobante, comprobante.serie, correlativo, forma_pago, id_cliente || null, id_usuario, subtotal, igv, total]
    );

    const id_venta = ventaResult.insertId;

    // Insertar detalle y descontar stock
    for (const item of detalle) {
      await conn.query(
        `INSERT INTO Detalle_Ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_venta, item.id_producto, item.cantidad, item.precio_unitario, item.precio_unitario * item.cantidad]
      );

      await conn.query(
        `UPDATE Productos SET stock = stock - ?
         WHERE id_producto = ? AND stock >= ?`,
        [item.cantidad, item.id_producto, item.cantidad]
      );
    }

    // Actualizar correlativo
    await conn.query(
      'UPDATE Tipos_Comprobantes SET correlativo_actual = ? WHERE id_tipo = ?',
      [nuevoCorrelativo, id_tipo_comprobante]
    );

    await conn.commit();

    res.status(201).json({
      ok: true,
      mensaje: 'Venta registrada correctamente',
      data: { id_venta, serie: comprobante.serie, correlativo, total }
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al registrar la venta' });
  } finally {
    conn.release();
  }
}

module.exports = { getVentas, getDashboard, registrarVenta };
