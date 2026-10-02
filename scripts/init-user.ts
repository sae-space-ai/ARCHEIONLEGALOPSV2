// Script de inicialización del primer usuario
// Ejecutar UNA VEZ después de crear la base de datos
// Uso: node scripts/init-user.js

import { hashPassword } from '../lib/auth.js';
import { query } from '../lib/db.js';

async function initUser() {
  const email = process.env.INITIAL_USER_EMAIL;
  const password = process.env.INITIAL_USER_PASSWORD;

  if (!email || !password) {
    console.error('Error: INITIAL_USER_EMAIL e INITIAL_USER_PASSWORD deben estar configuradas');
    process.exit(1);
  }

  console.log('Inicializando usuario...');
  console.log(`Email: ${email}`);

  // Verificar que el usuario no existe
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

  if (existing.rows.length > 0) {
    console.log('El usuario ya existe. No se realizan cambios.');
    process.exit(0);
  }

  // Crear usuario
  const passwordHash = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, password_hash, account_status) VALUES ($1, $2, $3) RETURNING id',
    [email.toLowerCase(), passwordHash, 'active']
  );

  console.log(`Usuario creado con ID: ${result.rows[0].id}`);
  console.log('Inicialización completada.');
  console.log('');
  console.log('IMPORTANTE: Elimina INITIAL_USER_EMAIL e INITIAL_USER_PASSWORD de las variables de entorno.');
}

initUser().catch((error) => {
  console.error('Error al inicializar usuario:', error);
  process.exit(1);
});
