# Parche de corrección — ARCHEION LEGAL OPS

**Fecha:** 2026  
**Commit base:** `73d531af7f` (rama `main`)  
**Autor del parche:** Auditoría externa (sin acceso de escritura al repositorio)

---

## ⚠️ AVISO IMPORTANTE

Este parche **NO ha sido aplicado al repositorio**. No existe ningún commit verificable en GitHub.
Los archivos de esta carpeta deben ser copiados manualmente al repositorio por el propietario.

---

## Causa raíz del fallo

La variable de entorno `NEXT_PUBLIC_SUPABASE_URL` en Vercel contenía el nombre del proyecto
(`manuel-gago-web`) en lugar de la URL completa (`https://[project-ref].supabase.co`).

Esto provocaba el error:
```
Unexpected token '<', '<!DOCTYPE' ... is not valid JSON
```

Las peticiones a la API de Supabase devolvían HTML (página de error) en lugar de JSON.

---

## Instrucciones de aplicación

### Paso 1: Crear rama de trabajo

```bash
git checkout main
git pull origin main
git checkout -b fix/auth-magic-link-nextjs15
```

### Paso 2: Copiar archivos del parche

Copia cada archivo de esta carpeta `patch/` a su ubicación correspondiente en el repositorio:

| Archivo del parche | Destino en el repositorio |
|---|---|
| `patch/lib/supabase/server.ts` | `lib/supabase/server.ts` |
| `patch/lib/supabase/client.ts` | `lib/supabase/client.ts` |
| `patch/lib/supabase/middleware.ts` | `lib/supabase/middleware.ts` |
| `patch/middleware.ts` | `middleware.ts` (raíz del proyecto) |
| `patch/app/auth/callback/route.ts` | `app/auth/callback/route.ts` |
| `patch/app/login/actions.ts` | `app/login/actions.ts` |
| `patch/app/login/page.tsx` | `app/login/page.tsx` |
| `patch/app/expedientes/page.tsx` | `app/expedientes/page.tsx` |

**NOTA:** Antes de copiar, revisa si estos archivos ya existen. Si existen, compara el contenido
y aplica solo los cambios necesarios. Si tu proyecto tiene una estructura diferente, adapta las
rutas de importación (`@/lib/supabase/...`) a la estructura real.

### Paso 3: Verificar dependencias

```bash
# Verificar que @supabase/ssr está instalado (versión >= 0.5.0)
npm ls @supabase/ssr

# Si no está instalado o la versión es antigua:
npm install @supabase/ssr@latest
```

### Paso 4: Corregir variables de entorno en Vercel

En **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Valor correcto | Dónde obtenerlo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (clave pública completa) | Supabase Dashboard → Settings → API → anon public |

**IMPORTANTE:** El valor de `NEXT_PUBLIC_SUPABASE_URL` debe ser la URL completa, NO el nombre
del proyecto. Debe empezar por `https://` y terminar por `.supabase.co`.

Aplicar en los tres entornos: Production, Preview y Development.

### Paso 5: Configurar URLs de retorno en Supabase

En **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, añadir:

```
https://archeion-legal-ops.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### Paso 6: Verificar que el usuario existe en Supabase

En **Supabase Dashboard → Authentication → Users**, confirmar que existe un usuario con email
`pergolessi9@gmail.com`. Si no existe, crearlo manualmente o dejar que el primer magic link
lo registre automáticamente (si `enable_signup` está activo).

### Paso 7: Compilar y verificar

```bash
npm install
npx tsc --noEmit
npm run build
```

### Paso 8: Commit y push

```bash
git add -A
git commit -m "fix: corregir autenticación magic link y compatibilidad Next.js 15

- Actualizar cliente de servidor para Next.js 15 (cookies async)
- Corregir callback de autenticación (exchangeCodeForSession)
- Verificar middleware de protección de rutas
- Corregir server action de envío de magic link
- Añadir manejo de errores en página de login"

git push origin fix/auth-magic-link-nextjs15
```

### Paso 9: Crear Pull Request

Ir a GitHub → repositorio → "Compare & pull request" → Dirigir a `main`.

### Paso 10: Verificar despliegue

Tras el merge, verificar en Vercel Dashboard que el deployment se completa sin errores.

---

## Pruebas manuales obligatorias

Después del despliegue, ejecutar este recorrido completo:

1. ✅ Acceder a `https://archeion-legal-ops.vercel.app` → Debe mostrar la página pública
2. ✅ Acceder a `https://archeion-legal-ops.vercel.app/login` → Debe mostrar el formulario
3. ✅ Introducir email y pulsar "Enviar enlace de acceso" → Debe mostrar mensaje de éxito
4. ✅ Abrir el correo recibido → Debe contener un enlace a `/auth/callback?code=...`
5. ✅ Pulsar el enlace → Debe redirigir a `/expedientes` con sesión activa
6. ✅ Recargar la página → La sesión debe persistir
7. ✅ Navegar a otra ruta y volver → La sesión debe persistir
8. ✅ Cerrar sesión → Debe redirigir a `/login`

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `lib/supabase/server.ts` | Adaptar a API async de `cookies()` en Next.js 15 |
| `lib/supabase/client.ts` | Usar `createBrowserClient` de `@supabase/ssr` |
| `lib/supabase/middleware.ts` | Refrescar sesión en cada petición con cookies correctas |
| `middleware.ts` | Proteger rutas privadas y redirigir a `/login` |
| `app/auth/callback/route.ts` | Usar `exchangeCodeForSession` (no `signInWithOtp`) |
| `app/login/actions.ts` | Server action con `emailRedirectTo` correcto |
| `app/login/page.tsx` | Manejo de estados de carga y errores |
| `app/expedientes/page.tsx` | Obtener sesión y datos con cliente de servidor |

---

## Limitaciones de esta auditoría

- **NO se ha verificado** el envío real de correo (requiere acceso a Supabase Dashboard)
- **NO se ha verificado** el intercambio de código (requiere flujo E2E)
- **NO se ha verificado** el acceso a expedientes (requiere sesión activa)
- **NO se ha verificado** la persistencia de sesión (requiere cookies activas)
- **NO se ha verificado** las políticas RLS (requiere acceso a Supabase SQL editor)

Todos estos puntos quedan marcados como **CORREGIDO SIN VERIFICAR** hasta que el propietario
ejecute las pruebas manuales del Paso 10.
