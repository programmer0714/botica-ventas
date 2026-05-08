const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Usuario y contraseña requeridos' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.username, u.password_hash,
              e.nombres, e.apellidos, c.nombre_cargo AS cargo
       FROM Usuarios u
       JOIN Empleados e ON u.id_empleado = e.id_empleado
       JOIN Cargos c ON e.id_cargo = c.id_cargo
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        username:   usuario.username,
        nombre:     `${usuario.nombres} ${usuario.apellidos}`,
        cargo:      usuario.cargo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id:       usuario.id_usuario,
        username: usuario.username,
        nombre:   `${usuario.nombres} ${usuario.apellidos}`,
        cargo:    usuario.cargo
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor' });
  }
}

module.exports = { login };
