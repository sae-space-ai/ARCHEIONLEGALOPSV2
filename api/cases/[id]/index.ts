// /api/cases/[id] — GET expediente individual — MODO PRIVADO

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySession, parseSessionCookie } from '../../../lib/session';
import { query } from '../../../lib/db';
import { sendJson } from '../../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación
    const cookieHeader = req.headers.cookie || null;
    const token = parseSessionCookie(cookieHeader);
    
    if (!token) {
      return sendJson(res, 401, { success: false, error: 'No autorizado' });
    }

    const session = await verifySession(token);
    if (!session) {
      return sendJson(res, 401, { success: false, error: 'Sesión inválida o caducada' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return sendJson(res, 400, { success: false, error: 'ID inválido' });
    }

    // Obtener expediente verificando que pertenece al usuario autenticado
    const result = await query(
      'SELECT * FROM cases WHERE id = $1 AND user_id = $2',
      [id, session.userId]
    );

    if (result.rows.length === 0) {
      return sendJson(res, 404, { success: false, error: 'Expediente no encontrado' });
    }

    return sendJson(res, 200, { success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error en GET /api/cases/[id]:', error);
    
    if (error.message?.includes('DATABASE_URL')) {
      return sendJson(res, 500, { 
        success: false, 
        error: 'Base de datos no configurada.' 
      });
    }
    
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
