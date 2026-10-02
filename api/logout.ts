// POST /api/logout — Cerrar sesión

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClearSessionCookie } from '../lib/session';
import { sendJson } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    // Limpiar cookie de sesión
    res.setHeader('Set-Cookie', getClearSessionCookie());

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Error en /api/logout:', error);
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
