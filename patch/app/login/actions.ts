/**
 * Server Actions para la página de login.
 *
 * sendMagicLink: Envía un enlace mágico al correo del usuario.
 * CRÍTICO: emailRedirectTo debe ser la URL completa del callback.
 * Si NEXT_PUBLIC_SITE_URL no está configurada, usar la URL de Vercel.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'El correo electrónico es obligatorio' }
  }

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'El formato del correo electrónico no es válido' }
  }

  // Construir la URL de redirección
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://archeion-legal-ops.vercel.app'
  const redirectTo = `${siteUrl}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    console.error('[login/actions] Error al enviar magic link:', error.message)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Enlace de acceso enviado. Revisa tu bandeja de entrada y la carpeta de spam.',
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
