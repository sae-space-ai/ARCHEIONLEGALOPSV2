# ARCHEION LEGAL OPS V3.0

Sistema de gestión documental jurídica con trazabilidad completa, auditoría y exportación de expedientes.

## 🎯 Características Principales

### ✅ Gestión Documental Completa
- **Subida de documentos** con validación de tipos y tamaños
- **Hash SHA-256** para verificación de integridad
- **Versionado** de documentos con preservación de originales
- **Metadatos completos**: tipo, fecha, procedencia, confidencialidad
- **Vinculación** de documentos a actuaciones
- **Descarga segura** con registro de auditoría

### ✅ Trazabilidad y Auditoría
- **Log de auditoría completo** de todas las operaciones
- **Registro de actuaciones** con cronología
- **Identificación de usuario** en cada operación
- **Fechas diferenciadas**: documento, recepción, incorporación
- **Historial de versiones** con motivo de cambio

### ✅ Exportación de Expedientes
- **Exportación ZIP** con toda la documentación
- **Índice documental** con metadatos
- **Cronología de actuaciones**
- **Manifiesto de integridad** con hashes SHA-256
- **Documentos originales** incluidos

### ✅ Seguridad y Confidencialidad
- **Niveles de confidencialidad**: público, interno, confidencial, secreto
- **Control de acceso** por usuario
- **Validación de archivos** (tipos permitidos, tamaño máximo)
- **Registro de descargas** en auditoría

## 📋 Tipos de Documentos Soportados

- **PDF** (.pdf)
- **Word** (.docx, .doc)
- **Texto** (.txt)
- **Imágenes** (.jpg, .jpeg, .png)
- **Email** (.eml)

**Tamaño máximo:** 25 MB por archivo

## 🏗️ Arquitectura

### Frontend
- **React 18** con TypeScript
- **Vite** para build rápido
- **TailwindCSS** para estilos
- **React Router** para navegación
- **LocalStorage** para almacenamiento local (modo demo)

### Backend (Preparado para producción)
- **Vercel Functions** para API
- **PostgreSQL** para datos
- **Vercel Blob** para archivos (pendiente de configurar)
- **JWT + bcrypt** para autenticación (pendiente de activar)

### Base de Datos
- **Migraciones versionadas** en `db/migrations/`
- **Índices optimizados** para consultas frecuentes
- **Triggers** para actualización automática de timestamps
- **Integridad referencial** con foreign keys

## 🚀 Instalación y Uso

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en http://localhost:5173
```

### Build para Producción

```bash
# Compilar aplicación
npm run build

# Los archivos se generan en dist/
```

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Seguir las instrucciones interactivas
```

## 📁 Estructura del Proyecto

```
archeion-legal-ops/
├── src/
│   ├── api/
│   │   ├── client-local.ts       # API con localStorage (demo)
│   │   └── documents.ts          # API de gestión documental
│   ├── components/
│   │   ├── AuditLog.tsx          # Log de auditoría
│   │   ├── DocumentList.tsx      # Lista de documentos
│   │   ├── DocumentUpload.tsx    # Formulario de subida
│   │   ├── ExportButton.tsx      # Botón de exportación
│   │   └── Layout.tsx            # Layout principal
│   ├── lib/
│   │   ├── crypto.ts             # Funciones SHA-256
│   │   └── zip.ts                # Exportación ZIP
│   ├── pages/
│   │   ├── CaseDetailPage.tsx    # Detalle de expediente (con tabs)
│   │   ├── CasesPage.tsx         # Lista de expedientes
│   │   ├── DashboardPage.tsx     # Panel principal
│   │   └── NewCasePage.tsx       # Crear expediente
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── App.tsx                   # Router principal
│   └── main.tsx                  # Entry point
├── db/
│   └── migrations/
│       ├── 001_initial.sql       # Esquema inicial
│       └── 003_documents.sql     # Módulo documental V3.0
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔐 Modo Actual: Demo con LocalStorage

La aplicación funciona actualmente en **modo demo** usando `localStorage` del navegador:

✅ **Ventajas:**
- Funciona inmediatamente sin configuración
- No requiere base de datos
- No requiere autenticación
- Perfecto para pruebas y demostraciones

⚠️ **Limitaciones:**
- Los datos solo existen en el navegador actual
- No hay sincronización entre dispositivos
- No hay backup automático
- No es adecuado para producción con datos reales

### Para Producción Real

Para usar en producción con datos reales, necesitas:

1. **Configurar PostgreSQL** (Neon recomendado)
2. **Configurar Vercel Blob** para almacenamiento de archivos
3. **Activar autenticación** (JWT + bcrypt)
4. **Ejecutar migraciones** de base de datos
5. **Configurar variables de entorno** en Vercel

Ver sección "Migración a Producción" más abajo.

## 📊 Flujo de Trabajo

### 1. Crear Expediente
- Ir a "Nuevo expediente"
- Completar referencia, título, categoría, descripción
- El expediente se crea con estado "abierto"

### 2. Gestionar Documentos
- Ir al detalle del expediente
- Pestaña "Documentos"
- Subir documentos con:
  - Título descriptivo
  - Tipo documental
  - Fecha del documento
  - Procedencia
  - Nivel de confidencialidad
- El sistema calcula SHA-256 automáticamente
- Los documentos aparecen en la lista

### 3. Registrar Actuaciones
- Pestaña "Cronología"
- Click en "+ Nueva actuación"
- Completar fecha, tipo, descripción
- Las actuaciones se ordenan cronológicamente

### 4. Vincular Documentos a Actuaciones
- Desde la lista de documentos
- Seleccionar actuación relacionada
- Tipo de relación: adjunto, evidencia, referencia, anexo

### 5. Consultar Auditoría
- Pestaña "Auditoría"
- Ver todas las operaciones realizadas
- Filtrar por tipo de entidad o acción
- Registro completo con timestamps

### 6. Exportar Expediente
- Pestaña "Resumen"
- Click en "Exportar expediente"
- Se genera ZIP con:
  - Ficha del expediente
  - Índice documental
  - Cronología
  - Documentos originales
  - Manifiesto de integridad

## 🗄️ Migración a Producción

### Paso 1: Configurar Base de Datos

```bash
# Crear base de datos en Neon (https://neon.tech)
# Copiar la URL de conexión

# Ejecutar migraciones
psql $DATABASE_URL -f db/migrations/001_initial.sql
psql $DATABASE_URL -f db/migrations/003_documents.sql
```

### Paso 2: Configurar Vercel

```bash
# En Vercel Dashboard → Settings → Environment Variables

# Añadir:
DATABASE_URL=postgresql://...
SESSION_SECRET=<generar_con_openssl_rand_base64_32>
BLOB_READ_WRITE_TOKEN=<de_vercel_blob>
```

### Paso 3: Activar Autenticación

Descomentar y configurar:
- `src/pages/LoginPage.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/hooks/useAuth.ts`
- `api/login.ts`
- `api/logout.ts`
- `api/session.ts`

### Paso 4: Migrar de LocalStorage a API Real

Cambiar imports en páginas:
```typescript
// De:
import { casesApi } from '../api/client-local';

// A:
import { casesApi } from '../api/client';
```

### Paso 5: Configurar Vercel Blob

```bash
# En Vercel Dashboard → Storage → Create Blob Store
# Copiar el token
# Añadir a Environment Variables: BLOB_READ_WRITE_TOKEN
```

## 🧪 Pruebas

### Pruebas Manuales

1. **Crear expediente:**
   - Ir a "Nuevo expediente"
   - Completar formulario
   - Verificar que aparece en la lista

2. **Subir documento:**
   - Ir a detalle de expediente
   - Pestaña "Documentos"
   - Subir PDF de prueba
   - Verificar que aparece SHA-256

3. **Registrar actuación:**
   - Pestaña "Cronología"
   - Crear nueva actuación
   - Verificar que aparece en la lista

4. **Exportar expediente:**
   - Pestaña "Resumen"
   - Click en "Exportar"
   - Verificar que se descarga ZIP

5. **Consultar auditoría:**
   - Pestaña "Auditoría"
   - Verificar que aparecen todas las operaciones

### Pruebas Automatizadas (Pendientes)

```bash
# TODO: Configurar Vitest o Jest
npm test
```

## 🔒 Seguridad

### Medidas Implementadas

✅ **Validación de archivos:**
- Tipos MIME permitidos
- Tamaño máximo 25 MB
- Hash SHA-256 para integridad

✅ **Niveles de confidencialidad:**
- Público
- Interno
- Confidencial
- Secreto

✅ **Auditoría completa:**
- Todas las operaciones registradas
- Identificación de usuario
- Timestamps precisos

✅ **Integridad documental:**
- Hash SHA-256 de cada archivo
- Versionado con preservación de originales
- Manifiesto de integridad en exportaciones

### Pendiente para Producción

⚠️ **Autenticación:**
- JWT con bcrypt
- Cookies HttpOnly + Secure
- Renovación de tokens

⚠️ **Autorización:**
- Control de acceso por usuario
- Aislamiento entre expedientes
- Permisos granulares

⚠️ **Almacenamiento seguro:**
- Vercel Blob privado
- URLs firmadas para descargas
- Cifrado en reposo

## 📝 Notas Legales

### Exportaciones

⚠️ **IMPORTANTE:** Las exportaciones generadas por este sistema:

✅ **Son útiles para:**
- Copias de trabajo
- Respaldos internos
- Consulta offline
- Verificación de integridad

❌ **NO constituyen:**
- Expediente administrativo electrónico formal
- Firma electrónica cualificada
- Copia auténtica con validez legal
- Documento con fe pública

Para expedientes con validez legal oficial, se requiere:
- Sistema de firma electrónica cualificada
- Sellado de tiempo certificado
- Cumplimiento de ENS (Esquema Nacional de Seguridad)
- Validación por autoridad competente

### RGPD

Este sistema está diseñado considerando el RGPD:

✅ **Medidas técnicas:**
- Minimización de datos
- Limitación de conservación
- Integridad y confidencialidad
- Registro de actividades

⚠️ **Responsabilidades del usuario:**
- Evaluación de impacto (EIPD) si procede
- Registro de tratamientos
- Información a interesados
- Ejercicio de derechos ARCO

## 🤝 Contribuir

Este es un proyecto privado para gestión documental jurídica.

Para reportar problemas o sugerir mejoras:
1. Revisar issues existentes
2. Crear nuevo issue con descripción detallada
3. Incluir pasos para reproducir si es un bug

## 📄 Licencia

Privado - Prof. Manuel Gago Fernández

## 📞 Soporte

Para consultas técnicas o incidencias:
- Revisar documentación en `docs/`
- Consultar log de auditoría en la aplicación
- Revisar migraciones en `db/migrations/`

---

**Versión:** 3.0  
**Última actualización:** 2026-01-XX  
**Estado:** ✅ Build exitoso, funcional en modo demo
