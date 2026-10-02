// POST /api/login — Autenticación de usuario

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPassword } from '../lib/auth';
import { createSession, getSessionCookie } from '../lib/session';
import { query } from '../lib/db';
import { validate, loginSchema } from '../lib/validation';
import { checkRateLimit } from '../lib/security';
import { sendJson } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    // Rate limiting: máximo 5 intentos por minuto por IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(ip as string, 5, 60000);
    
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter));
      return sendJson(res, 429, { 
        success: false, 
        error: 'Demasiados intentos. Espera antes de volver a intentar.' 
      });
    }

    // Validar datos de entrada
    const validation = validate(loginSchema, req.body);
    if (!validation.success) {
      return sendJson(res, 400, { success: false, error: validation.error });
    }

    const { email, password } = validation.data;

    // Buscar usuario
    const result = await query(
      'SELECT id, email, password_hash, account_status FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Mensaje genérico para no revelar si el email existe
      return sendJson(res, 401, { success: false, error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar estado de la cuenta
    if (user.account_status !== 'active') {
      return sendJson(res, 403, { success: false, error: 'Cuenta no activa' });
    }

    // Verificar contraseña
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return sendJson(res, 401, { success: false, error: 'Credenciales inválidas' });
    }

    // Crear sesión
    const token = await createSession(user.id, user.email);

    // Establecer cookie de sesión
    res.setHeader('Set-Cookie', getSessionCookie(token));

    // Registrar evento de seguridad
    await query(
      'INSERT INTO security_events (user_id, event_type, ip_address) VALUES ($1, $2, $3)',
      [user.id, 'login', ip]
    ).catch(() => {
      // No fallar si no se puede registrar el evento
    });

    return sendJson(res, 200, {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        account_status: user.account_status,
      },
    });
  } catch (error) {
    console.error('Error en /api/login:', error);
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
