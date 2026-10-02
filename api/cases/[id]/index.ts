// /api/cases/[id] — GET expediente individual — MODO PÚBLICO

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { sendJson } from '../../../lib/types';
import { getPublicUserId } from '../../../lib/publicUser';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const userId = getPublicUserId();
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return sendJson(res, 400, { success: false, error: 'ID inválido' });
    }

    // Obtener expediente verificando que pertenece al usuario público
    const result = await query(
      'SELECT * FROM cases WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return sendJson(res, 404, { success: false, error: 'Expediente no encontrado' });
    }

    return sendJson(res, 200, { success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en GET /api/cases/[id]:', error);
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
