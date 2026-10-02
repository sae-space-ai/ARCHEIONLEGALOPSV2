// /api/cases/[id]/events — GET (listar) y POST (crear) actuaciones — MODO PÚBLICO

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { validate, createEventSchema } from '../../../lib/validation';
import { sendJson } from '../../../lib/types';

// User ID fijo para modo público
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id: caseId } = req.query;
    if (!caseId || typeof caseId !== 'string') {
      return sendJson(res, 400, { success: false, error: 'ID de expediente inválido' });
    }

    // Verificar que el expediente existe y pertenece al usuario público
    const caseResult = await query(
      'SELECT id FROM cases WHERE id = $1 AND user_id = $2',
      [caseId, PUBLIC_USER_ID]
    );

    if (caseResult.rows.length === 0) {
      return sendJson(res, 404, { success: false, error: 'Expediente no encontrado' });
    }

    // GET /api/cases/:id/events — Listar actuaciones
    if (req.method === 'GET') {
      const events = await query(
        'SELECT * FROM case_events WHERE case_id = $1 ORDER BY fecha_actuacion DESC, created_at DESC',
        [caseId]
      );
      return sendJson(res, 200, { success: true,  events.rows });
    }

    // POST /api/cases/:id/events — Crear actuación
    if (req.method === 'POST') {
      const validation = validate(createEventSchema, req.body);
      if (!validation.success) {
        return sendJson(res, 400, { success: false, error: validation.error });
      }

      const { fecha_actuacion, tipo, descripcion } = validation.data;

      const result = await query(
        `INSERT INTO case_events (case_id, user_id, fecha_actuacion, tipo, descripcion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [caseId, PUBLIC_USER_ID, fecha_actuacion, tipo, descripcion]
      );

      return sendJson(res, 201, { success: true,  result.rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error en /api/cases/[id]/events:', error);
    
    if (error.message?.includes('DATABASE_URL')) {
      return sendJson(res, 500, { 
        success: false, 
        error: 'Base de datos no configurada.' 
      });
    }
    
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
