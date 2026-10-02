// POST /api/logout — Cerrar sesión

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClearSessionCookie, parseSessionCookie, verifySession } from '../lib/session';
import { query } from '../lib/db';
import { sendJson } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie || null;
    const token = parseSessionCookie(cookieHeader);

    if (token) {
      const session = await verifySession(token);
      
      if (session) {
        // Registrar evento de seguridad
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        await query(
          'INSERT INTO security_events (user_id, event_type, ip_address) VALUES ($1, $2, $3)',
          [session.userId, 'logout', ip]
        ).catch(() => {});
      }
    }

    // Limpiar cookie de sesión
    res.setHeader('Set-Cookie', getClearSessionCookie());

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Error en /api/logout:', error);
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
