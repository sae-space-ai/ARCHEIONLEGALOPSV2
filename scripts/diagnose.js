#!/usr/bin/env node

/**
 * Script de diagnóstico para ARCHEION LEGAL OPS V2
 * 
 * Uso: node scripts/diagnose.js
 * 
 * Este script verifica:
 * 1. Variables de entorno
 * 2. Conexión a PostgreSQL
 * 3. Existencia de tablas
 * 4. Existencia del usuario público
 * 5. Permisos de inserción
 */

import { Pool } from 'pg';

const REQUIRED_TABLES = ['users', 'cases', 'case_events', 'security_events'];
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DE ARCHEION LEGAL OPS V2\n');
  
  // 1. Verificar variables de entorno
  console.log('1️⃣  Verificando variables de entorno...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.error('\n📋 SOLUCIÓN:');
    console.error('   1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables');
    console.error('   2. Añade DATABASE_URL con la URL completa de PostgreSQL');
    console.error('   3. Formato: postgresql://user:password@host:port/database?sslmode=require');
    console.error('   4. Redespliega la aplicación');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL está configurada\n');
  
  // 2. Conectar a PostgreSQL
  console.log('2️⃣  Conectando a PostgreSQL...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa\n');
    
    // 3. Verificar tablas
    console.log('3️⃣  Verificando tablas...');
    
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(r => r.tablename);
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error(`❌ ERROR: Faltan las siguientes tablas: ${missingTables.join(', ')}`);
      console.error('\n📋 SOLUCIÓN:');
      console.error('   1. Ejecuta el script de migración en PostgreSQL:');
      console.error('      psql $DATABASE_URL -f db/migrations/001_initial.sql');
      console.error('   2. O ejecuta el contenido de db/migrations/001_initial.sql manualmente');
      client.release();
      await pool.end();
      process.exit(1);
    }
    
    console.log('✅ Todas las tablas existen\n');
    
    // 4. Verificar usuario público
    console.log('4️⃣  Verificando usuario público...');
    
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE id = $1',
      [PUBLIC_USER_ID]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`❌ ERROR: El usuario público (${PUBLIC_USER_ID}) no existe`);
      console.error('\n📋 SOLUCIÓN:');
      console.error('   Ejecuta este SQL en PostgreSQL:');
      console.error(`
INSERT INTO users (id, email, password_hash, account_status)
VALUES (
  '${PUBLIC_USER_ID}',
  'public@archeion.local',
  'no-password-public-mode',
  'active'
)
ON CONFLICT (id) DO NOTHING;
      `);
      client.release();
      await pool.end();
      process.exit(1);
    }
    
    console.log(`✅ Usuario público existe: ${userResult.rows[0].email}\n`);
    
    // 5. Verificar permisos de inserción
    console.log('5️⃣  Verificando permisos de inserción...');
    
    try {
      // Intentar insertar y eliminar un expediente de prueba
      await client.query('BEGIN');
      
      const testRef = `TEST-${Date.now()}`;
      await client.query(
        `INSERT INTO cases (user_id, referencia, titulo, descripcion, categoria, estado)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [PUBLIC_USER_ID, testRef, 'Prueba', 'Descripción de prueba', 'administrativo', 'abierto']
      );
      
      await client.query(
        'DELETE FROM cases WHERE referencia = $1',
        [testRef]
      );
      
      await client.query('COMMIT');
      console.log('✅ Permisos de inserción correctos\n');
    } catch (insertError) {
      await client.query('ROLLBACK');
      console.error('❌ ERROR: No se pueden insertar expedientes');
      console.error(`   Detalle: ${insertError.message}`);
      client.release();
      await pool.end();
      process.exit(1);
    }
    
    // 6. Contar expedientes existentes
    console.log('6️⃣  Contando expedientes...');
    
    const countResult = await client.query(
      'SELECT COUNT(*) as total FROM cases WHERE user_id = $1',
      [PUBLIC_USER_ID]
    );
    
    console.log(`✅ Expedientes existentes: ${countResult.rows[0].total}\n`);
    
    client.release();
    await pool.end();
    
    // Resumen
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DIAGNÓSTICO COMPLETADO CON ÉXITO');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('La base de datos está correctamente configurada.');
    console.log('La aplicación debería funcionar correctamente.');
    console.log('');
    
  } catch (connectionError) {
    console.error('❌ ERROR: No se pudo conectar a PostgreSQL');
    console.error(`   Detalle: ${connectionError.message}`);
    console.error('\n📋 SOLUCIÓN:');
    console.error('   1. Verifica que DATABASE_URL es correcta');
    console.error('   2. Verifica que la base de datos está accesible desde Vercel');
    console.error('   3. Si usas Neon, verifica que la IP de Vercel está permitida');
    console.error('   4. Verifica que el usuario y contraseña son correctos');
    process.exit(1);
  }
}

diagnose().catch((error) => {
  console.error('❌ Error inesperado durante el diagnóstico:', error);
  process.exit(1);
});
