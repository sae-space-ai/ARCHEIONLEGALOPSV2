// GET /api/session — Modo público: siempre devuelve null (sin autenticación)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // Modo público: no hay sesión
  return sendJson(res, 200, { user: null });
}
