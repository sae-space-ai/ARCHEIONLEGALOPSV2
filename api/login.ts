// POST /api/login — Autenticación de usuario

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPassword } from '../lib/auth';
import { createSession, getSessionCookie } from '../lib/session';
import { query } from '../lib/db';
import { validate, loginSchema } from '../lib/validation';
import { sendJson } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    // Validar datos de entrada
    const validation = validate(loginSchema, req.body);
    if (!validation.success) {
      return sendJson(res, 400, { success: false, error: validation.error });
    }

    const { email, password } = validation.data;

    // Buscar usuario
    const result = await query(
      'SELECT id, email, password_hash, account_status, created_at FROM users WHERE email = $1',
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

    return sendJson(res, 200, {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        account_status: user.account_status,
      },
    });
  } catch (error: any) {
    console.error('Error en /api/login:', error);
    
    if (error.message?.includes('DATABASE_URL')) {
      return sendJson(res, 500, { 
        success: false, 
        error: 'Base de datos no configurada. Contacta con el administrador.' 
      });
    }
    
    return sendJson(res, 500, { success: false, error: 'Error interno del servidor' });
  }
}
