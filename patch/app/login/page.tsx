/**
 * Página de login con formulario de magic link.
 *
 * Incluye manejo de estados de carga, errores y mensajes de éxito.
 * Lee el parámetro ?error= de la URL para mostrar mensajes contextuales.
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { sendMagicLink } from './actions'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('pergolessi9@gmail.com')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Leer parámetros de error de la URL
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_failed') {
      setMessage({
        type: 'error',
        text: 'El enlace de acceso ha expirado o no es válido. Solicita uno nuevo.',
      })
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const result = await sendMagicLink(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result?.success) {
      setMessage({
        type: 'success',
        text: result.message || 'Enlace enviado. Revisa tu correo.',
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Acceso privado sin contraseña
          </h1>
          <p className="mt-2 text-slate-400">
            Enviaremos un enlace temporal de inicio de sesión a tu correo.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:z-10 focus:border-amber-500 focus:ring-amber-500"
              placeholder="tu@correo.com"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
                  : 'bg-red-900/50 text-red-200 border border-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          El enlace es personal. No lo reenvíe. Los expedientes siguen
          protegidos mediante autenticación y políticas RLS.
        </p>
      </div>
    </div>
  )
}
