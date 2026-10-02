// /api/cases — GET (listar) y POST (crear) expedientes — MODO PÚBLICO

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../lib/db';
import { validate, createCaseSchema } from '../../lib/validation';
import { sendJson } from '../../lib/types';
import { getPublicUserId } from '../../lib/publicUser';

// GET /api/cases — Listar expedientes (acceso público)
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { categoria, estado, search } = req.query;

    let sql = 'SELECT * FROM cases WHERE user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (categoria && typeof categoria === 'string') {
      sql += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (estado && typeof estado === 'string') {
      sql += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (search && typeof search === 'string') {
      sql += ` AND (referencia ILIKE $${paramIndex} OR titulo ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return sendJson(res, 200, { success: true, data: result.rows });
  } catch (error) {
    console.error('Error en GET /api/cases:', error);
    return sendJson(res, 500, { success: false, error: 'Error al cargar expedientes' });
  }
}

// POST /api/cases — Crear nuevo expediente (acceso público)
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    // Validar datos
    const validation = validate(createCaseSchema, req.body);
    if (!validation.success) {
      return sendJson(res, 400, { success: false, error: validation.error });
    }

    const { referencia, titulo, descripcion, categoria } = validation.data;

    // Verificar que la referencia es única para este usuario
    const existing = await query(
      'SELECT id FROM cases WHERE user_id = $1 AND referencia = $2',
      [userId, referencia]
    );

    if (existing.rows.length > 0) {
      return sendJson(res, 409, { 
        success: false, 
        error: 'Ya existe un expediente con esa referencia' 
      });
    }

    // Crear expediente
    const result = await query(
      `INSERT INTO cases (user_id, referencia, titulo, descripcion, categoria, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, referencia, titulo, descripcion, categoria, 'abierto']
    );

    return sendJson(res, 201, { success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en POST /api/cases:', error);
    return sendJson(res, 500, { success: false, error: 'Error al crear expediente' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Modo público: usar user_id público
  const userId = getPublicUserId();

  if (req.method === 'GET') {
    return handleGet(req, res, userId);
  }

  if (req.method === 'POST') {
    return handlePost(req, res, userId);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}
