# ARCHEION LEGAL OPS V2 — Guía de Configuración

## ⚠️ PROBLEMA ACTUAL

La aplicación muestra "Error de conexión" al crear expedientes porque **la base de datos PostgreSQL no está configurada en Vercel**.

## 🔍 Diagnóstico

El error se produce porque:
1. La variable `DATABASE_URL` no está configurada en Vercel
2. El backend no puede conectarse a PostgreSQL
3. El frontend muestra un mensaje genérico en lugar del error real

## ✅ Solución Paso a Paso

### Paso 1: Crear base de datos PostgreSQL

**Opción A: Neon (Recomendado)**
1. Ve a https://neon.tech
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la "Connection String" (formato: `postgresql://user:pass@host.neon.tech/db?sslmode=require`)

**Opción B: Supabase PostgreSQL**
1. Ve a https://supabase.com
2. Crea un proyecto nuevo
3. Ve a Settings → Database
4. Copia la "Connection string" (formato URI)

**Opción C: Cualquier PostgreSQL**
- Asegúrate de que sea accesible desde Vercel (IP pública o connection string)

### Paso 2: Configurar variable de entorno en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `archeionlegalopsv-2`
3. Ve a **Settings → Environment Variables**
4. Añade una nueva variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Tu connection string de PostgreSQL
   - **Environment**: Production, Preview, Development (todos)
5. Guarda los cambios

### Paso 3: Ejecutar migraciones SQL

Conéctate a tu base de datos PostgreSQL y ejecuta:

```bash
# Opción 1: Con psql (si tienes acceso local)
psql "TU_DATABASE_URL" -f db/migrations/001_initial.sql

# Opción 2: Con la interfaz web de Neon/Supabase
# Copia y pega el contenido de db/migrations/001_initial.sql
```

Esto creará:
- Tabla `users` (con usuario público)
- Tabla `cases` (expedientes)
- Tabla `case_events` (actuaciones)
- Tabla `security_events` (registro de seguridad)
- Índices y triggers necesarios

### Paso 4: Verificar la configuración

Ejecuta el script de diagnóstico:

```bash
node scripts/diagnose.js
```

Este script verificará:
- ✅ Variable DATABASE_URL configurada
- ✅ Conexión a PostgreSQL
- ✅ Tablas creadas
- ✅ Usuario público existe
- ✅ Permisos de inserción

### Paso 5: Redesplegar en Vercel

```bash
git add .
git commit -m "fix: mejorar manejo de errores y diagnóstico"
git push
```

Vercel desplegará automáticamente los cambios.

### Paso 6: Probar la aplicación

1. Ve a https://archeionlegalopsv-2.vercel.app
2. Navega a "Nuevo expediente"
3. Rellena el formulario con datos de prueba:
   - Referencia: `TEST-001`
   - Título: `Expediente de prueba`
   - Categoría: `Administrativo`
   - Descripción: `Este es un expediente de prueba`
4. Pulsa "Crear expediente"
5. Deberías ser redirigido al detalle del expediente

## 🐛 Si el error persiste

### Error: "Base de datos no configurada"
- Verifica que `DATABASE_URL` está configurada en Vercel
- Verifica que el nombre de la variable es exactamente `DATABASE_URL`
- Redespliega después de añadir la variable

### Error: "Las tablas no existen"
- Ejecuta las migraciones SQL (Paso 3)
- Verifica que estás conectado a la base de datos correcta

### Error: "El usuario público no existe"
- Ejecuta este SQL manualmente:
```sql
INSERT INTO users (id, email, password_hash, account_status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'public@archeion.local',
  'no-password-public-mode',
  'active'
)
ON CONFLICT (id) DO NOTHING;
```

### Error: "Error de integridad referencial"
- El usuario público no existe (ver error anterior)
- O la tabla `users` no tiene la estructura correcta

## 📊 Estructura de la Base de Datos

```
users
├── id (UUID, PK)
├── email (VARCHAR)
├── password_hash (VARCHAR)
├── account_status (VARCHAR)
└── created_at, updated_at

cases
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── referencia (VARCHAR, UNIQUE por usuario)
├── titulo (VARCHAR)
├── descripcion (TEXT)
├── categoria (VARCHAR: administrativo|juridico|prl)
├── estado (VARCHAR: abierto|en_curso|cerrado|archivado)
└── created_at, updated_at

case_events
├── id (UUID, PK)
├── case_id (UUID, FK → cases)
├── user_id (UUID, FK → users)
├── fecha_actuacion (DATE)
├── tipo (VARCHAR: hecho|registro|comunicacion|plazo|fundamento|peticion|prl)
├── descripcion (TEXT)
└── created_at
```

## 🔒 Seguridad

Esta versión funciona en **modo público sin autenticación**:
- Todos los expedientes pertenecen al usuario público
- No hay login ni sesiones
- Cualquier persona con la URL puede ver y crear expedientes

**⚠️ No uses esta versión para datos sensibles o confidenciales.**

## 📝 Notas Técnicas

- **Frontend**: Vite + React + TypeScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Base de datos**: PostgreSQL (Neon recomendado)
- **Despliegue**: Vercel

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa los logs de Vercel: https://vercel.com/dashboard → Tu proyecto → Logs
2. Ejecuta el script de diagnóstico: `node scripts/diagnose.js`
3. Verifica que todas las variables de entorno están configuradas
4. Comprueba que las migraciones SQL se han ejecutado
