/**
 * Cliente de navegador Supabase.
 *
 * Debe usarse createBrowserClient de @supabase/ssr (no createClient
 * de @supabase/supabase-js) para que la gestión de cookies sea
 * coherente con el cliente de servidor.
 */

'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
