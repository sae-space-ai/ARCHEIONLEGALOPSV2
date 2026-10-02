/**
 * Helper de middleware para refrescar la sesión en cada petición.
 *
 * Gestiona las cookies de sesión de Supabase y protege las rutas
 * privadas redirigiendo a /login cuando no hay usuario autenticado.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )

  // Refrescar la sesión si ha expirado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas
  const protectedPaths = [
    '/expedientes',
    '/expediente',
    '/nuevo',
    '/profile',
    '/configuracion',
  ]

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Si la ruta está protegida y no hay usuario, redirigir a /login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Si el usuario está autenticado y visita /login, redirigir a /expedientes
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/expedientes'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
