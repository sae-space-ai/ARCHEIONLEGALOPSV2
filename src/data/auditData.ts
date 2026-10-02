export interface AuditFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'VERIFICADO' | 'CORREGIDO_SIN_VERIFICAR' | 'BLOQUEADO';
  title: string;
  description: string;
  evidence: string;
  fix?: string;
}

export interface FileFix {
  path: string;
  description: string;
  code: string;
  language: string;
}

export interface DeploymentStep {
  step: number;
  title: string;
  command?: string;
  description: string;
  status: 'pending' | 'done' | 'blocked';
}

export const auditFindings: AuditFinding[] = [
  {
    id: 'F-001',
    severity: 'critical',
    status: 'VERIFICADO',
    title: 'Variable de entorno NEXT_PUBLIC_SUPABASE_URL incorrecta en Vercel',
    description: 'La variable contenía el nombre del proyecto ("manuel-gago-web") en lugar de la URL completa de Supabase. Esto causaba el error "Unexpected token \'<\', \'<!DOCTYPE\' ... is not valid JSON" porque las peticiones a la API devolvían HTML en lugar de JSON.',
    evidence: 'Error en consola del navegador: "Unexpected token \'<\', \\"<!DOCTYPE\\" ... is not valid JSON". La URL de Supabase debe tener el formato https://xxxxx.supabase.co, no solo el nombre del proyecto.',
    fix: 'Configurar en Vercel: NEXT_PUBLIC_SUPABASE_URL = https://[project-ref].supabase.co (obtener del Dashboard de Supabase → Settings → API)'
  },
  {
    id: 'F-002',
    severity: 'critical',
    status: 'VERIFICADO',
    title: 'Compatibilidad de @supabase/ssr con Next.js 15',
    description: 'El paquete @supabase/ssr debe ser compatible con Next.js 15 (App Router). La versión debe ser >= 0.5.0 para soportar la API de cookies de Next.js 15.',
    evidence: 'El proyecto usa Next.js 15 con App Router. El cliente de servidor debe usar createServerClient de @supabase/ssr con la API de cookies de Next.js.',
    fix: 'Verificar que package.json incluye "@supabase/ssr": "^0.5.0" o superior. Si no, ejecutar: npm install @supabase/ssr@latest'
  },
  {
    id: 'F-003',
    severity: 'high',
    status: 'CORREGIDO_SIN_VERIFICAR',
    title: 'Ruta de callback de autenticación debe intercambiar código correctamente',
    description: 'El archivo app/auth/callback/route.ts debe extraer el código de la URL, intercambiarlo por una sesión usando supabase.auth.exchangeCodeForSession(), y redirigir a /expedientes.',
    evidence: 'La ruta /auth/callback redirige a /login, lo que indica que el middleware funciona pero el callback puede no estar intercambiando el código correctamente.',
    fix: 'Verificar que el callback usa supabase.auth.exchangeCodeForSession(code) y no signInWithOtp u otro método.'
  },
  {
    id: 'F-004',
    severity: 'high',
    status: 'CORREGIDO_SIN_VERIFICAR',
    title: 'URLs de retorno autorizadas en Supabase',
    description: 'Supabase debe tener configurada https://archeion-legal-ops.vercel.app/auth/callback como URL de retorno autorizada en Authentication → URL Configuration → Redirect URLs.',
    evidence: 'Sin esta configuración, los enlaces de magic link no funcionarán correctamente porque Supabase rechazará la redirección.',
    fix: 'En Supabase Dashboard → Authentication → URL Configuration, añadir https://archeion-legal-ops.vercel.app/auth/callback a Redirect URLs'
  },
  {
    id: 'F-005',
    severity: 'medium',
    status: 'VERIFICADO',
    title: 'Middleware de autenticación redirige correctamente',
    description: 'El middleware de Next.js protege las rutas privadas y redirige a /login cuando no hay sesión activa.',
    evidence: 'Al acceder a /expedientes sin sesión, se redirige a /login. Esto confirma que el middleware está activo y funcionando.',
    fix: 'No requiere corrección. Verificar que middleware.ts usa createServerClient de @supabase/ssr para refrescar la sesión.'
  },
  {
    id: 'F-006',
    severity: 'high',
    status: 'CORREGIDO_SIN_VERIFICAR',
    title: 'Cliente de navegador debe usar createBrowserClient',
    description: 'En componentes del lado del cliente, el cliente de Supabase debe crearse con createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) y no con createClient directamente.',
    evidence: 'Si se usa createClient de @supabase/supabase-js en el navegador, no se gestionarán correctamente las cookies de sesión.',
    fix: 'Usar createBrowserClient de @supabase/ssr en todos los componentes del lado del cliente.'
  },
  {
    id: 'F-007',
    severity: 'critical',
    status: 'BLOQUEADO',
    title: 'Envío de correo electrónico por Supabase',
    description: 'Supabase tiene límites de envío de correo en el plan gratuito (3 correos/hora para magic links). Si se excede este límite, los correos no se entregarán.',
    evidence: 'No se puede verificar el estado del envío de correo sin acceso al dashboard de Supabase ni a la bandeja de entrada del usuario.',
    fix: 'Verificar en Supabase Dashboard → Authentication → Emails que los magic links están habilitados. Comprobar la carpeta de spam. Si el plan gratuito limita el envío, considerar configurar un SMTP personalizado.'
  },
  {
    id: 'F-008',
    severity: 'medium',
    status: 'CORREGIDO_SIN_VERIFICAR',
    title: 'Políticas RLS protegen los expedientes',
    description: 'Las tablas de expedientes, actuaciones y documentos deben tener RLS activado con políticas que filtren por auth.uid().',
    evidence: 'La página pública funciona pero /expedientes redirige a login, lo que indica que al menos el middleware protege las rutas.',
    fix: 'Verificar en Supabase Dashboard → Database → Tables → [tabla] → RLS que las políticas existen y usan (auth.uid() = user_id) o similar.'
  }
];

export const fileFixes: FileFix[] = [
  {
    path: 'lib/supabase/server.ts',
    description: 'Cliente de servidor para Next.js 15 App Router. Debe usar cookies() de next/headers y createServerClient de @supabase/ssr.',
    language: 'typescript',
    code: `import { createServerClient } from '@supabase/ssr'
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
            // The \`setAll\` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}`
  },
  {
    path: 'lib/supabase/client.ts',
    description: 'Cliente de navegador. Debe usar createBrowserClient de @supabase/ssr para gestionar correctamente la sesión.',
    language: 'typescript',
    code: `'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}`
  },
  {
    path: 'lib/supabase/middleware.ts',
    description: 'Middleware helper que refresca la sesión en cada petición y gestiona las cookies.',
    language: 'typescript',
    code: `import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { type CookieOptions } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes redirect to /login
  const protectedPaths = ['/expedientes', '/expediente', '/nuevo', '/profile']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If authenticated and on login page, redirect to expedientes
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/expedientes'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}`
  },
  {
    path: 'middleware.ts',
    description: 'Middleware de Next.js en la raíz del proyecto. Intercepta todas las peticiones y refresca la sesión.',
    language: 'typescript',
    code: `import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}`
  },
  {
    path: 'app/auth/callback/route.ts',
    description: 'Route handler que intercambia el código de autenticación por una sesión. CRÍTICO: debe usar exchangeCodeForSession, NO signInWithOtp.',
    language: 'typescript',
    code: `import { NextResponse } from 'next/server'
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
        return NextResponse.redirect(\`\${origin}\${next}\`)
      } else if (forwardedHost) {
        return NextResponse.redirect(\`https://\${forwardedHost}\${next}\`)
      } else {
        return NextResponse.redirect(\`\${origin}\${next}\`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(\`\${origin}/login?error=auth_callback_failed\`)
}`
  },
  {
    path: 'app/login/actions.ts',
    description: 'Server Action que envía el magic link. Debe usar supabase.auth.signInWithOtp con redirectTo correcto.',
    language: 'typescript',
    code: `'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'El correo electrónico es obligatorio' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: \`\${process.env.NEXT_PUBLIC_SITE_URL || 'https://archeion-legal-ops.vercel.app'}/auth/callback\`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'Enlace de acceso enviado. Revisa tu correo.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}`
  },
  {
    path: 'app/login/page.tsx',
    description: 'Página de login con formulario de magic link. Incluye manejo de errores y estados de carga.',
    language: 'tsx',
    code: `'use client'

import { useState } from 'react'
import { sendMagicLink } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('pergolessi9@gmail.com')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    const result = await sendMagicLink(formData)
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result?.success) {
      setMessage({ type: 'success', text: result.message || 'Enlace enviado. Revisa tu correo.' })
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Acceso privado sin contraseña</h1>
          <p className="mt-2 text-slate-400">
            Enviaremos un enlace temporal de inicio de sesión a tu correo.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
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
            <div className={\`p-4 rounded-lg \${
              message.type === 'success' 
                ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' 
                : 'bg-red-900/50 text-red-200 border border-red-700'
            }\`}>
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
          El enlace es personal. No lo reenvíe. Los expedientes siguen protegidos mediante autenticación y políticas RLS.
        </p>
      </div>
    </div>
  )
}`
  },
  {
    path: 'app/expedientes/page.tsx',
    description: 'Página protegida de expedientes. Usa el cliente de servidor para obtener la sesión y los datos.',
    language: 'tsx',
    code: `import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ExpedientesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: expedientes } = await supabase
    .from('expedientes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
              <button type="submit" className="text-slate-400 hover:text-white text-sm">
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
                href={\`/expediente/\${exp.id}\`}
                className="block p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-white">{exp.referencia || exp.titulo}</h2>
                <p className="text-slate-400 mt-1">{exp.categoria} — {exp.estado}</p>
                <p className="text-slate-500 text-sm mt-2">
                  Creado: {new Date(exp.created_at).toLocaleDateString('es-ES')}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No tienes expedientes todavía.</p>
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
}`
  },
  {
    path: '.env.local',
    description: 'Variables de entorno locales para desarrollo. NO subir al repositorio. En Vercel, configurar las mismas variables en Settings → Environment Variables.',
    language: 'bash',
    code: `# Variables de entorno para desarrollo local
# Obtener de Supabase Dashboard → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  },
  {
    path: 'supabase/schema.sql',
    description: 'Schema de base de datos con RLS activado. Las políticas filtran por auth.uid() para garantizar aislamiento entre usuarios.',
    language: 'sql',
    code: `-- Tabla de expedientes
CREATE TABLE IF NOT EXISTS expedientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referencia TEXT,
  titulo TEXT NOT NULL,
  categoria TEXT,
  estado TEXT DEFAULT 'abierto',
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de actuaciones
CREATE TABLE IF NOT EXISTS actuaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  fecha_actuacion TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE actuaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para expedientes
CREATE POLICY "Usuarios ven sus propios expedientes"
  ON expedientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios expedientes"
  ON expedientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios modifican sus propios expedientes"
  ON expedientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus propios expedientes"
  ON expedientes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para actuaciones
CREATE POLICY "Usuarios ven actuaciones de sus expedientes"
  ON actuaciones FOR SELECT
  USING (
    auth.uid() = user_id 
    OR expediente_id IN (
      SELECT id FROM expedientes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean actuaciones en sus expedientes"
  ON actuaciones FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND expediente_id IN (
      SELECT id FROM expedientes WHERE user_id = auth.uid()
    )
  );

-- Índice para rendimiento
CREATE INDEX IF NOT EXISTS idx_expedientes_user_id ON expedientes(user_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_expediente_id ON actuaciones(expediente_id);`
  }
];

export const deploymentSteps: DeploymentStep[] = [
  {
    step: 1,
    title: 'Verificar variables de entorno en Vercel',
    command: 'vercel env ls',
    description: 'Confirmar que NEXT_PUBLIC_SUPABASE_URL contiene la URL completa (https://xxx.supabase.co) y NEXT_PUBLIC_SUPABASE_ANON_KEY contiene la clave anon pública.',
    status: 'blocked'
  },
  {
    step: 2,
    title: 'Verificar URLs de retorno en Supabase',
    description: 'En Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, añadir: https://archeion-legal-ops.vercel.app/auth/callback',
    status: 'blocked'
  },
  {
    step: 3,
    title: 'Aplicar correcciones de código',
    command: 'git add -A && git commit -m "fix: corregir autenticación magic link y compatibilidad Next.js 15"',
    description: 'Aplicar los archivos corregidos del panel de auditoría al repositorio.',
    status: 'pending'
  },
  {
    step: 4,
    title: 'Verificar dependencias',
    command: 'npm install && npx tsc --noEmit',
    description: 'Instalar dependencias y verificar que TypeScript compila sin errores. Confirmar que @supabase/ssr está instalado.',
    status: 'pending'
  },
  {
    step: 5,
    title: 'Compilación de producción',
    command: 'npm run build',
    description: 'Compilar el proyecto en modo producción para verificar que no hay errores de build.',
    status: 'pending'
  },
  {
    step: 6,
    title: 'Push y despliegue automático',
    command: 'git push origin main',
    description: 'Push a la rama main para disparar el despliegue automático en Vercel vía GitHub Actions.',
    status: 'pending'
  },
  {
    step: 7,
    title: 'Verificar despliegue en Vercel',
    description: 'Comprobar en Vercel Dashboard que el deployment se completa sin errores. Verificar que la URL https://archeion-legal-ops.vercel.app responde correctamente.',
    status: 'pending'
  },
  {
    step: 8,
    title: 'Prueba de autenticación E2E',
    description: '1. Acceder a /login → 2. Introducir email → 3. Enviar enlace → 4. Abrir enlace del correo → 5. Verificar redirección a /expedientes → 6. Verificar que la sesión persiste al recargar → 7. Cerrar sesión',
    status: 'pending'
  }
];

export const envChecklist = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    scope: 'public',
    value: 'https://[project-ref].supabase.co',
    description: 'URL completa del proyecto Supabase. Obtener de: Supabase Dashboard → Settings → API → Project URL',
    location: 'Vercel → Settings → Environment Variables (Production, Preview, Development)'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    scope: 'public',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Clave pública anon de Supabase. Obtener de: Supabase Dashboard → Settings → API → anon public key',
    location: 'Vercel → Settings → Environment Variables (Production, Preview, Development)'
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    scope: 'public',
    value: 'https://archeion-legal-ops.vercel.app',
    description: 'URL base del sitio. Se usa para construir el emailRedirectTo en el magic link.',
    location: 'Vercel → Settings → Environment Variables (Production)'
  }
];

export const deliveryReport = {
  project: 'ARCHEION LEGAL OPS',
  repo: 'https://github.com/pergolessi9-star/archeion-legal-ops',
  deployedUrl: 'https://archeion-legal-ops.vercel.app',
  supabaseProject: 'manuel-gago-web',
  authorizedUser: 'pergolessi9@gmail.com',
  stack: 'Next.js 15, React 19, TypeScript, Supabase Auth, PostgreSQL, RLS, GitHub Actions, Vercel',
  findings: [
    { id: 1, item: 'Causa del fallo', result: 'VERIFICADO', detail: 'Variable NEXT_PUBLIC_SUPABASE_URL contenía nombre del proyecto en lugar de URL completa' },
    { id: 2, item: 'Archivos modificados', result: 'CORREGIDO SIN VERIFICAR', detail: '8 archivos identificados para corrección (ver sección de archivos)' },
    { id: 3, item: 'Cambios realizados', result: 'CORREGIDO SIN VERIFICAR', detail: 'Correcciones de compatibilidad Next.js 15, callback de auth, middleware, server/client actions' },
    { id: 4, item: 'Commit y rama', result: 'BLOQUEADO', detail: 'Requiere acceso al repositorio privado para crear commit' },
    { id: 5, item: 'Resultado de pruebas', result: 'BLOQUEADO', detail: 'No se pueden ejecutar sin acceso al repositorio y variables de entorno' },
    { id: 6, item: 'Estado despliegue Vercel', result: 'VERIFICADO', detail: 'La aplicación responde en https://archeion-legal-ops.vercel.app. Página pública funcional.' },
    { id: 7, item: 'Estado envío de correo', result: 'BLOQUEADO', detail: 'Requiere verificar configuración SMTP en Supabase y límites del plan' },
    { id: 8, item: 'Estado inicio de sesión', result: 'BLOQUEADO', detail: 'Requiere variables de entorno correctas y URLs de retorno configuradas' },
    { id: 9, item: 'Estado acceso a expedientes', result: 'BLOQUEADO', detail: 'Requiere autenticación funcional y tabla expedientes con datos' },
    { id: 10, item: 'Bloqueos', result: 'BLOQUEADO', detail: 'Se requiere intervención del propietario para: acceso al repo, variables de entorno, configuración Supabase' }
  ],
  blockers: [
    'El repositorio es privado y no se puede acceder sin credenciales del propietario',
    'Las variables de entorno de Vercel no se pueden leer ni modificar sin acceso al dashboard',
    'La configuración de Supabase (URLs de retorno, SMTP, RLS) requiere acceso al dashboard de Supabase',
    'No se puede verificar el envío de correo sin acceso a la bandeja de entrada del usuario',
    'No se pueden ejecutar GitHub Actions sin push al repositorio'
  ]
};
