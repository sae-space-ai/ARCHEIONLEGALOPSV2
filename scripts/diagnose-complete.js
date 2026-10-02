#!/usr/bin/env node

/**
 * Script de diagnóstico completo para ARCHEION LEGAL OPS V2
 * 
 * Uso: node scripts/diagnose-complete.js
 * 
 * Este script verifica:
 * 1. Variables de entorno
 * 2. Conexión a PostgreSQL
 * 3. Existencia de tablas
 * 4. Existencia del usuario público (debe ser eliminado)
 * 5. Permisos de inserción
 * 6. Estructura de la base de datos
 */

import { Pool } from 'pg';

const REQUIRED_TABLES = ['users', 'cases', 'case_events', 'security_events'];
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

async function diagnose() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  DIAGNÓSTICO COMPLETO — ARCHEION LEGAL OPS V2');
  console.log('═══════════════════════════════════════════════════\n');
  
  // 1. Verificar variables de entorno
  console.log('📋 1. Verificando variables de entorno...');
  
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  };
  
  if (!envVars.DATABASE_URL) {
    console.error('❌ ERROR CRÍTICO: DATABASE_URL no está configurada');
    console.error('\n📋 SOLUCIÓN:');
    console.error('   1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables');
    console.error('   2. Añade DATABASE_URL con la URL completa de PostgreSQL');
    console.error('   3. Formato: postgresql://user:password@host:port/database?sslmode=require');
    console.error('   4. Marca Production, Preview y Development');
    console.error('   5. Redespliega la aplicación');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL está configurada');
  
  if (!envVars.SESSION_SECRET) {
    console.warn('⚠️  WARNING: SESSION_SECRET no está configurada');
    console.warn('   El sistema usará un secreto por defecto (NO SEGURO)');
    console.warn('   Genera uno con: openssl rand -base64 32');
  } else {
    console.log('✅ SESSION_SECRET está configurada');
  }
  
  console.log(`✅ NODE_ENV: ${envVars.NODE_ENV || 'no definido'}\n`);
  
  // 2. Conectar a PostgreSQL
  console.log('🔌 2. Conectando a PostgreSQL...');
  
  const pool = new Pool({
    connectionString: envVars.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    ssl: envVars.DATABASE_URL.includes('sslmode=require') ? false : undefined,
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa\n');
    
    // 3. Verificar tablas
    console.log('📊 3. Verificando tablas...');
    
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    const existingTables = tablesResult.rows.map(r => r.tablename);
    console.log(`   Tablas encontradas: ${existingTables.join(', ')}`);
    
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error(`\n❌ ERROR: Faltan las siguientes tablas: ${missingTables.join(', ')}`);
      console.error('\n📋 SOLUCIÓN:');
      console.error('   Ejecuta el script de migración en PostgreSQL:');
      console.error('   psql $DATABASE_URL -f db/migrations/001_initial.sql');
      client.release();
      await pool.end();
      process.exit(1);
    }
    
    console.log('✅ Todas las tablas requeridas existen\n');
    
    // 4. Verificar estructura de tablas
    console.log('🔍 4. Verificando estructura de tablas...');
    
    const usersColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('   users:', usersColumns.rows.map(r => r.column_name).join(', '));
    
    const casesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cases'
      ORDER BY ordinal_position
    `);
    console.log('   cases:', casesColumns.rows.map(r => r.column_name).join(', '));
    
    const eventsColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'case_events'
      ORDER BY ordinal_position
    `);
    console.log('   case_events:', eventsColumns.rows.map(r => r.column_name).join(', '));
    console.log('');
    
    // 5. Verificar usuario público (DEBE SER ELIMINADO)
    console.log('👤 5. Verificando usuario público...');
    
    const publicUserResult = await client.query(
      'SELECT id, email FROM users WHERE id = $1',
      [PUBLIC_USER_ID]
    );
    
    if (publicUserResult.rows.length > 0) {
      console.warn('⚠️  WARNING: El usuario público AÚN existe');
      console.warn(`   ID: ${publicUserResult.rows[0].id}`);
      console.warn(`   Email: ${publicUserResult.rows[0].email}`);
      console.warn('\n📋 ACCIÓN REQUERIDA:');
      console.warn('   1. Crea un usuario real con credenciales seguras');
      console.warn('   2. Reasigna los expedientes del usuario público al usuario real');
      console.warn('   3. Ejecuta: psql $DATABASE_URL -f db/migrations/002_remove_public_user.sql');
    } else {
      console.log('✅ El usuario público ha sido eliminado\n');
    }
    
    // 6. Contar usuarios reales
    console.log('👥 6. Contando usuarios reales...');
    
    const usersCount = await client.query(
      'SELECT COUNT(*) as total FROM users WHERE id != $1',
      [PUBLIC_USER_ID]
    );
    console.log(`   Usuarios reales: ${usersCount.rows[0].total}`);
    
    if (parseInt(usersCount.rows[0].total) === 0) {
      console.warn('\n⚠️  WARNING: No hay usuarios reales en la base de datos');
      console.warn('   Crea un usuario con:');
      console.warn('   INSERT INTO users (email, password_hash, account_status)');
      console.warn('   VALUES (\'tu@email.com\', \'hash_bcrypt\', \'active\');');
    }
    console.log('');
    
    // 7. Contar expedientes
    console.log('📁 7. Contando expedientes...');
    
    const casesCount = await client.query(
      'SELECT COUNT(*) as total FROM cases'
    );
    console.log(`   Total expedientes: ${casesCount.rows[0].total}`);
    
    const publicCasesCount = await client.query(
      'SELECT COUNT(*) as total FROM cases WHERE user_id = $1',
      [PUBLIC_USER_ID]
    );
    console.log(`   Expedientes del usuario público: ${publicCasesCount.rows[0].total}`);
    console.log('');
    
    // 8. Verificar permisos de inserción
    console.log('🔐 8. Verificando permisos de inserción...');
    
    try {
      await client.query('BEGIN');
      
      const testRef = `TEST-${Date.now()}`;
      const testUserId = publicUserResult.rows.length > 0 
        ? PUBLIC_USER_ID 
        : (await client.query('SELECT id FROM users LIMIT 1')).rows[0]?.id;
      
      if (!testUserId) {
        throw new Error('No hay usuarios en la base de datos');
      }
      
      await client.query(
        `INSERT INTO cases (user_id, referencia, titulo, descripcion, categoria, estado)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [testUserId, testRef, 'Prueba', 'Descripción de prueba', 'administrativo', 'abierto']
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
    console.error('   5. Verifica que el formato de la URL es correcto');
    process.exit(1);
  }
}

diagnose().catch((error) => {
  console.error('❌ Error inesperado durante el diagnóstico:', error);
  process.exit(1);
});
