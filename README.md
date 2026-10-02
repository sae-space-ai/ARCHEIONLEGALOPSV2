# ARCHEION LEGAL OPS V2 - Modo Público

## Estado Actual

La aplicación ha sido configurada para funcionar en **modo público sin autenticación**.

### Cambios Realizados

1. **Frontend**:
   - Eliminada la página de login (`LoginPage.tsx`)
   - Eliminado el componente de rutas protegidas (`ProtectedRoute.tsx`)
   - Eliminado el hook de autenticación (`useAuth.ts`)
   - Modificado `App.tsx` para que todas las rutas sean públicas
   - Modificado `Layout.tsx` para mostrar "Modo público" en lugar del botón de logout

2. **Backend**:
   - Eliminados los endpoints de autenticación (`login.ts`, `logout.ts`, `session.ts`)
   - Modificados los endpoints de expedientes para usar un `user_id` fijo
   - Todos los expedientes pertenecen al usuario público: `00000000-0000-0000-0000-000000000000`

3. **Base de Datos**:
   - El usuario público debe existir en la tabla `users`
   - Todos los expedientes y actuaciones están asociados a este usuario

### Funcionalidades Disponibles

- ✅ Panel de control (Dashboard)
- ✅ Listado de expedientes
- ✅ Creación de nuevos expedientes
- ✅ Consulta de expedientes individuales
- ✅ Registro de actuaciones
- ✅ Cronología de actuaciones
- ✅ Búsqueda y filtrado de expedientes

### Acceso

La aplicación es accesible públicamente en:
- **URL**: https://archeionlegalopsv-2.vercel.app/
- **Sin necesidad de login**
- **Todos los usuarios ven los mismos expedientes**

### Consideraciones de Seguridad

⚠️ **ADVERTENCIA**: Esta configuración NO es segura para datos sensibles.

- No hay aislamiento entre usuarios
- Cualquier persona puede ver y modificar todos los expedientes
- No hay registro de quién realizó cada acción
- No hay protección contra accesos no autorizados

### Próximos Pasos (si se requiere seguridad)

Si en el futuro se necesita implementar autenticación:

1. Restaurar los archivos eliminados desde el commit `85e4105`
2. Configurar `DATABASE_URL` en Vercel
3. Ejecutar las migraciones de base de datos
4. Crear usuarios reales con contraseñas seguras
5. Restaurar el sistema de autenticación bcrypt + JWT + cookies

### Build Status

✅ **Build exitoso**: 37 módulos, 186.71 KB JavaScript, 19.15 KB CSS

---

**Última actualización**: 2026-10-02  
**Modo**: Público sin autenticación  
**Estado**: Funcional
