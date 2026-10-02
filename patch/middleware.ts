/**
 * Middleware de Next.js (raíz del proyecto).
 *
 * Intercepta todas las peticiones y delega en updateSession para
 * refrescar la sesión de Supabase y proteger las rutas privadas.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto las que empiezan por:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
