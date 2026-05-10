const db = require('../config/db');

// GET /api/clientes?doc=12345678
async function buscarCliente(req, res) {
  const { doc } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT * FROM clientes WHERE numero_documento = ? LIMIT 1`,
      [doc]
    );
    if (rows.length === 0) {
      return res.json({ ok: false, mensaje: 'Cliente no encontrado' });
    }
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al buscar cliente' });
  }
}

// POST /api/clientes
async function crearCliente(req, res) {
  const { tipo_documento, numero_documento, nombre_razon_social } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO clientes (tipo_documento, numero_documento, nombre_razon_social)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre_razon_social = VALUES(nombre_razon_social)`,
      [tipo_documento, numero_documento, nombre_razon_social]
    );
    res.status(201).json({ ok: true, id_cliente: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear cliente' });
  }
}

module.exports = { buscarCliente, crearCliente };