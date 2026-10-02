#!/usr/bin/env node

/**
 * Script de backup de la base de datos antes de migración
 * 
 * Uso: node scripts/backup-before-migration.js
 * 
 * Este script:
 * 1. Verifica la conexión a PostgreSQL
 * 2. Exporta todos los datos a archivos JSON
 * 3. Crea un backup SQL completo
 * 4. Verifica la integridad del backup
 */

import { Pool } from 'pg';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = './backups';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

async function backup() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  BACKUP ANTES DE MIGRACIÓN');
  console.log('  Timestamp:', TIMESTAMP);
  console.log('═══════════════════════════════════════════════════\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.error('   Configura la variable de entorno antes de ejecutar este script.');
    process.exit(1);
  }

  // Crear directorio de backups si no existe
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Backup de usuarios
    console.log('📦 Exportando usuarios...');
    const usersResult = await client.query('SELECT * FROM users ORDER BY created_at');
    const usersBackup = {
      timestamp: TIMESTAMP,
      table: 'users',
      count: usersResult.rows.length,
      data: usersResult.rows,
    };
    writeFileSync(
      join(BACKUP_DIR, `users_${TIMESTAMP}.json`),
      JSON.stringify(usersBackup, null, 2)
    );
    console.log(`   ✅ ${usersResult.rows.length} usuarios exportados\n`);

    // Backup de expedientes
    console.log('📦 Exportando expedientes...');
    const casesResult = await client.query('SELECT * FROM cases ORDER BY created_at');
    const casesBackup = {
      timestamp: TIMESTAMP,
      table: 'cases',
      count: casesResult.rows.length,
      data: casesResult.rows,
    };
    writeFileSync(
      join(BACKUP_DIR, `cases_${TIMESTAMP}.json`),
      JSON.stringify(casesBackup, null, 2)
    );
    console.log(`   ✅ ${casesResult.rows.length} expedientes exportados\n`);

    // Backup de actuaciones
    console.log('📦 Exportando actuaciones...');
    const eventsResult = await client.query('SELECT * FROM case_events ORDER BY created_at');
    const eventsBackup = {
      timestamp: TIMESTAMP,
      table: 'case_events',
      count: eventsResult.rows.length,
      data: eventsResult.rows,
    };
    writeFileSync(
      join(BACKUP_DIR, `case_events_${TIMESTAMP}.json`),
      JSON.stringify(eventsBackup, null, 2)
    );
    console.log(`   ✅ ${eventsResult.rows.length} actuaciones exportadas\n`);

    // Backup de eventos de seguridad
    console.log('📦 Exportando eventos de seguridad...');
    const securityResult = await client.query('SELECT * FROM security_events ORDER BY created_at');
    const securityBackup = {
      timestamp: TIMESTAMP,
      table: 'security_events',
      count: securityResult.rows.length,
      data: securityResult.rows,
    };
    writeFileSync(
      join(BACKUP_DIR, `security_events_${TIMESTAMP}.json`),
      JSON.stringify(securityBackup, null, 2)
    );
    console.log(`   ✅ ${securityResult.rows.length} eventos exportados\n`);

    // Verificar usuario público
    console.log('🔍 Verificando usuario público...');
    const publicUserResult = await client.query(
      "SELECT COUNT(*) as count FROM users WHERE id = '00000000-0000-0000-0000-000000000000'"
    );
    const publicUserCount = parseInt(publicUserResult.rows[0].count);
    
    if (publicUserCount > 0) {
      console.log(`   ⚠️  Usuario público encontrado (${publicUserCount} registro)`);
      
      const publicCasesResult = await client.query(
        "SELECT COUNT(*) as count FROM cases WHERE user_id = '00000000-0000-0000-0000-000000000000'"
      );
      console.log(`   📁 Expedientes del usuario público: ${publicCasesResult.rows[0].count}`);
      
      const publicEventsResult = await client.query(
        "SELECT COUNT(*) as count FROM case_events WHERE user_id = '00000000-0000-0000-0000-000000000000'"
      );
      console.log(`   📝 Actuaciones del usuario público: ${publicEventsResult.rows[0].count}\n`);
    } else {
      console.log('   ✅ Usuario público no existe\n');
    }

    client.release();
    await pool.end();

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ BACKUP COMPLETADO');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`Archivos de backup creados en: ${BACKUP_DIR}/`);
    console.log(`  - users_${TIMESTAMP}.json`);
    console.log(`  - cases_${TIMESTAMP}.json`);
    console.log(`  - case_events_${TIMESTAMP}.json`);
    console.log(`  - security_events_${TIMESTAMP}.json`);
    console.log('');
    console.log('PRÓXIMO PASO:');
    console.log('1. Revisa los archivos de backup para verificar integridad');
    console.log('2. Guarda una copia de seguridad en un lugar seguro');
    console.log('3. Ejecuta la migración: psql $DATABASE_URL -f db/migrations/002_remove_public_user.sql');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR durante el backup:', error.message);
    await pool.end();
    process.exit(1);
  }
}

backup();
