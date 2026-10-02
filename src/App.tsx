/**
 * ARCHEION LEGAL OPS — Visor del parche de corrección
 *
 * Este archivo es solo la interfaz del sandbox para mostrar
 * el contenido del parche. NO es la aplicación Next.js real.
 * Los archivos del parche están en la carpeta patch/ del proyecto.
 */

import { useState } from 'react'

const patchFiles = [
  {
    path: 'patch/INSTRUCCIONES.md',
    target: 'Raíz del repositorio',
    description: 'Instrucciones completas de aplicación del parche',
  },
  {
    path: 'patch/lib/supabase/server.ts',
    target: 'lib/supabase/server.ts',
    description: 'Cliente de servidor adaptado a Next.js 15 (cookies async)',
  },
  {
    path: 'patch/lib/supabase/client.ts',
    target: 'lib/supabase/client.ts',
    description: 'Cliente de navegador con createBrowserClient',
  },
  {
    path: 'patch/lib/supabase/middleware.ts',
    target: 'lib/supabase/middleware.ts',
    description: 'Helper de middleware para refrescar sesión',
  },
  {
    path: 'patch/middleware.ts',
    target: 'middleware.ts (raíz)',
    description: 'Middleware de Next.js para proteger rutas',
  },
  {
    path: 'patch/app/auth/callback/route.ts',
    target: 'app/auth/callback/route.ts',
    description: 'Callback con exchangeCodeForSession (CRÍTICO)',
  },
  {
    path: 'patch/app/login/actions.ts',
    target: 'app/login/actions.ts',
    description: 'Server action para enviar magic link',
  },
  {
    path: 'patch/app/login/page.tsx',
    target: 'app/login/page.tsx',
    description: 'Página de login con manejo de errores',
  },
  {
    path: 'patch/app/expedientes/page.tsx',
    target: 'app/expedientes/page.tsx',
    description: 'Página protegida de expedientes',
  },
  {
    path: 'patch/verify-rls.sql',
    target: 'Supabase SQL Editor',
    description: 'Script para verificar políticas RLS',
  },
]

export default function App() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 pb-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚖️</span>
            <h1 className="text-2xl font-bold">ARCHEION LEGAL OPS — Parche de Corrección</h1>
          </div>
          <p className="text-slate-400">
            Parche aplicable al repositorio{' '}
            <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
              pergolessi9-star/archeion-legal-ops
            </code>
          </p>
        </header>

        {/* Aviso crítico */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-8">
          <h2 className="text-red-300 font-semibold text-lg mb-2">
            ⚠️ Estado de la auditoría
          </h2>
          <ul className="text-red-200/80 text-sm space-y-1">
            <li>• <strong>NO tengo acceso de escritura</strong> al repositorio privado.</li>
            <li>• <strong>NO se ha creado ningún commit</strong> en GitHub.</li>
            <li>• <strong>NO existe pull request</strong> porque no puedo autenticarme contra GitHub.</li>
            <li>• Los cambios deben ser aplicados manualmente por el propietario.</li>
          </ul>
        </div>

        {/* Causa raíz */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
          <h2 className="text-white font-semibold text-lg mb-3">
            🔍 Causa raíz del fallo
          </h2>
          <p className="text-slate-300 text-sm mb-3">
            La variable de entorno <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> en
            Vercel contenía el nombre del proyecto (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-red-300">manuel-gago-web</code>)
            en lugar de la URL completa (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300">https://[project-ref].supabase.co</code>).
          </p>
          <p className="text-slate-300 text-sm">
            Esto provocaba que las peticiones a la API de Supabase devolvieran HTML en lugar de JSON,
            causando el error: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-red-300">Unexpected token '&lt;', '&lt;!DOCTYPE' ... is not valid JSON</code>
          </p>
        </div>

        {/* Archivos del parche */}
        <div className="mb-8">
          <h2 className="text-white font-semibold text-lg mb-4">
            📄 Archivos del parche ({patchFiles.length} archivos)
          </h2>
          <div className="space-y-3">
            {patchFiles.map((file) => (
              <div
                key={file.path}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <code className="text-amber-300 text-sm font-mono">{file.path}</code>
                    <p className="text-slate-400 text-xs mt-1">
                      → Copiar a: <span className="text-slate-300">{file.target}</span>
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{file.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pasos críticos */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-8">
          <h2 className="text-emerald-300 font-semibold text-lg mb-3">
            ✅ Pasos críticos que debe ejecutar el propietario
          </h2>
          <ol className="text-emerald-200/80 text-sm space-y-2 list-decimal list-inside">
            <li>
              Corregir <code className="bg-slate-900 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> en Vercel
              (debe ser <code className="bg-slate-900 px-1 rounded">https://[project-ref].supabase.co</code>)
            </li>
            <li>
              Añadir <code className="bg-slate-900 px-1 rounded">https://archeion-legal-ops.vercel.app/auth/callback</code> a
              las Redirect URLs en Supabase Dashboard
            </li>
            <li>
              Copiar los archivos de la carpeta <code className="bg-slate-900 px-1 rounded">patch/</code> al repositorio
            </li>
            <li>
              Ejecutar <code className="bg-slate-900 px-1 rounded">npm install @supabase/ssr@latest</code> si no está instalado
            </li>
            <li>
              Compilar con <code className="bg-slate-900 px-1 rounded">npm run build</code> y verificar que no hay errores
            </li>
            <li>
              Hacer commit, push y merge a <code className="bg-slate-900 px-1 rounded">main</code>
            </li>
            <li>
              Probar el flujo completo: login → email → callback → expedientes
            </li>
          </ol>
        </div>

        {/* Clasificación de resultados */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
          <h2 className="text-white font-semibold text-lg mb-4">
            📋 Contrato de entrega
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">#</th>
                <th className="text-left py-2 text-slate-400">Elemento</th>
                <th className="text-left py-2 text-slate-400">Clasificación</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700/50">
                <td className="py-2">1</td>
                <td>Causa del fallo</td>
                <td><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30">VERIFICADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">2</td>
                <td>Archivos modificados (parche generado)</td>
                <td><span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/30">CORREGIDO SIN VERIFICAR</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">3</td>
                <td>Commit y rama en GitHub</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">4</td>
                <td>Pull Request</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">5</td>
                <td>Resultado de pruebas (build, auth, RLS)</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">6</td>
                <td>Estado despliegue Vercel (página pública)</td>
                <td><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30">VERIFICADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">7</td>
                <td>Envío de correo</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">8</td>
                <td>Inicio de sesión</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2">9</td>
                <td>Acceso a expedientes</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
              <tr>
                <td className="py-2">10</td>
                <td>Bloqueos (intervención del propietario)</td>
                <td><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">BLOQUEADO</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bloqueos */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
          <h2 className="text-purple-300 font-semibold text-lg mb-3">
            ⊘ Bloqueos que requieren intervención del propietario
          </h2>
          <ol className="text-purple-200/80 text-sm space-y-2 list-decimal list-inside">
            <li>El repositorio es privado: no tengo credenciales de GitHub para acceder ni escribir.</li>
            <li>Las variables de entorno de Vercel no son legibles ni modificables desde este entorno.</li>
            <li>La configuración de Supabase (URLs de retorno, SMTP, RLS) requiere acceso al dashboard.</li>
            <li>No se puede verificar el envío de correo sin acceso a la bandeja de entrada.</li>
            <li>No se pueden ejecutar GitHub Actions ni crear PRs sin autenticación.</li>
          </ol>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-700 text-center text-slate-500 text-xs">
          <p>
            Parche generado para ARCHEION LEGAL OPS — Repositorio: pergolessi9-star/archeion-legal-ops
          </p>
          <p className="mt-1">
            Commit base: 73d531af7f · Supabase: manuel-gago-web · Usuario: pergolessi9@gmail.com
          </p>
        </footer>
      </div>
    </div>
  )
}
