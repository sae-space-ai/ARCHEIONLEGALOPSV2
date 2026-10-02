# ARCHEION LEGAL OPS V2

Sistema de gestión de expedientes legales con almacenamiento local.

## Características

- ✅ **Sin base de datos**: Funciona completamente en el navegador
- ✅ **Sin autenticación**: Acceso libre y directo
- ✅ **Almacenamiento local**: Los datos se guardan en tu navegador
- ✅ **Modo público**: Todos los expedientes son accesibles

## Uso

### Panel de Control
- Vista general de expedientes
- Estadísticas por estado
- Accesos rápidos

### Gestión de Expedientes
- Crear nuevos expedientes
- Listar y filtrar expedientes
- Ver detalles de expedientes
- Registrar actuaciones

### Búsqueda y Filtros
- Buscar por referencia, título o descripción
- Filtrar por categoría (Administrativo, Jurídico, PRL)
- Filtrar por estado (Abierto, En curso, Cerrado, Archivado)

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Despliegue

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify
```bash
# Build
npm run build

# Subir la carpeta dist/
```

## Estructura del Proyecto

```
├── src/
│   ├── api/
│   │   └── client-local.ts    # API con almacenamiento local
│   ├── components/
│   │   └── Layout.tsx         # Layout principal
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Panel de control
│   │   ├── CasesPage.tsx      # Lista de expedientes
│   │   ├── CaseDetailPage.tsx # Detalle de expediente
│   │   └── NewCasePage.tsx    # Nuevo expediente
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   ├── App.tsx                # Componente principal
│   ├── main.tsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **TailwindCSS** - Estilos
- **LocalStorage** - Almacenamiento de datos

## Limitaciones

⚠️ **Importante**: 
- Los datos se almacenan localmente en el navegador
- Los datos NO se sincronizan entre dispositivos
- Los datos se pierden si se limpia el caché del navegador
- No hay respaldo automático
- No es adecuado para producción con datos críticos

## Migración a Base de Datos

Si necesitas migrar a una base de datos real:

1. Configurar PostgreSQL/Neon
2. Restaurar archivos de API del backend
3. Configurar variables de entorno
4. Ejecutar migraciones SQL
5. Actualizar `client-local.ts` para usar API REST

## Licencia

MIT
