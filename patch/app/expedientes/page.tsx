/**
 * Página protegida de expedientes.
 *
 * Usa el cliente de servidor para obtener la sesión y los datos.
 * Si no hay sesión, el middleware ya habrá redirigido a /login,
 * pero se incluye una verificación adicional por seguridad.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ExpedientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener expedientes del usuario autenticado
  // Las políticas RLS garantizan que solo se devuelvan los del usuario
  const { data: expedientes, error } = await supabase
    .from('expedientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[expedientes] Error al cargar expedientes:', error.message)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Mis Expedientes</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/nuevo"
              className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
            >
              Nuevo expediente
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {expedientes && expedientes.length > 0 ? (
          <div className="grid gap-4">
            {expedientes.map((exp) => (
              <Link
                key={exp.id}
                href={`/expediente/${exp.id}`}
                className="block p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-white">
                  {exp.referencia || exp.titulo}
                </h2>
                <p className="text-slate-400 mt-1">
                  {exp.categoria} — {exp.estado}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Creado:{' '}
                  {new Date(exp.created_at).toLocaleDateString('es-ES')}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">
              No tienes expedientes todavía.
            </p>
            <Link
              href="/nuevo"
              className="mt-4 inline-block px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
            >
              Crear primer expediente
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
