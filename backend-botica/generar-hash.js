// Ejecuta este script UNA SOLA VEZ para generar el hash correcto
// Luego actualiza la tabla Usuarios con ese hash
// Uso: node generar-hash.js

const bcrypt = require('bcryptjs');

async function generarHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash generado para "123456":');
  console.log(hash);
  console.log('\nEjecuta este SQL para actualizar el admin:');
  console.log(`UPDATE Usuarios SET password_hash = '${hash}' WHERE username = 'admin';`);
}

generarHash();
