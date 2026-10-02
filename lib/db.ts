// Cliente PostgreSQL para Vercel serverless functions
// Usa pg (node-postgres) con pool de conexiones

import { Pool } from 'pg';

// Pool singleton para reutilizar conexiones en serverless
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está configurada en Vercel. ' +
        'Configura la variable de entorno en Vercel Dashboard → Settings → Environment Variables. ' +
        'El valor debe ser la URL de conexión completa a PostgreSQL (ej: postgresql://user:pass@host:port/db).'
      );
    }

    pool = new Pool({
      connectionString,
      max: 10, // Máximo de conexiones en el pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Error inesperado en el pool de PostgreSQL:', err);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query ejecutada en ${duration}ms:`, text.substring(0, 100));
  }
  
  return { rows: result.rows, rowCount: result.rowCount || 0 };
}

export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
