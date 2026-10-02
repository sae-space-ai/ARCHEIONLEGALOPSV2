// GET /api/session — Verificar sesión activa

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySession, parseSessionCookie } from '../lib/session';
import { query } from '../lib/db';
import { sendJson } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie || null;
    const token = parseSessionCookie(cookieHeader);

    if (!token) {
      return sendJson(res, 200, { user: null });
    }

    const session = await verifySession(token);

    if (!session) {
      return sendJson(res, 200, { user: null });
    }

    // Verificar que el usuario existe y está activo
    const result = await query(
      'SELECT id, email, created_at, account_status FROM users WHERE id = $1 AND account_status = $2',
      [session.userId, 'active']
    );

    if (result.rows.length === 0) {
      return sendJson(res, 200, { user: null });
    }

    const user = result.rows[0];

    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        account_status: user.account_status,
      },
    });
  } catch (error) {
    console.error('Error en /api/session:', error);
    return sendJson(res, 500, { error: 'Error interno del servidor' });
  }
}
