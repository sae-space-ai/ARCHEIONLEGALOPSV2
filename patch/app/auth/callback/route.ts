/**
 * Route handler para el callback de autenticación.
 *
 * CRÍTICO: Este archivo debe usar exchangeCodeForSession, NO signInWithOtp.
 * El flujo es:
 * 1. El usuario recibe un email con un enlace a /auth/callback?code=XXXX
 * 2. Este handler extrae el código de la URL
 * 3. Intercambia el código por una sesión usando exchangeCodeForSession
 * 4. Redirige al usuario a /expedientes
 *
 * Si se usa signInWithOtp aquí, el flujo falla silenciosamente.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/expedientes'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // Si hay error al intercambiar el código, loguear para debugging
    console.error('[auth/callback] Error al intercambiar código:', error.message)
  }

  // Si no hay código o el intercambio falló, redirigir a login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
