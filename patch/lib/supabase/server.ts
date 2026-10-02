/**
 * Cliente de servidor Supabase para Next.js 15 (App Router).
 *
 * CRÍTICO: En Next.js 15, cookies() es async y devuelve Promise.
 * Debe usarse await cookies() antes de pasar los cookies al cliente.
 *
 * Este archivo reemplaza cualquier versión anterior que usara
 * cookies() de forma síncrona o que importara createClient de
 * @supabase/supabase-js directamente.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El método setAll se invoca desde un Server Component.
            // Este error puede ignorarse si se tiene middleware
            // que refresca las sesiones antes de cada respuesta.
          }
        },
      },
    }
  )
}
