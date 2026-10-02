# GUÍA RÁPIDA DE USO - ARCHEION LEGAL OPS V3.0

## 🚀 Inicio Rápido

### 1. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### 2. Compilar para Producción

```bash
# Compilar aplicación
npm run build

# Los archivos se generan en dist/
```

---

## 📋 Flujo de Trabajo Básico

### Paso 1: Crear un Expediente

1. Ir a **"Nuevo expediente"** en el menú
2. Completar:
   - **Referencia**: Código único (ej: EXP-2026-001)
   - **Título**: Nombre descriptivo
   - **Categoría**: Administrativo, Jurídico o PRL
   - **Descripción**: Detalles del expediente
3. Click en **"Crear expediente"**

### Paso 2: Gestionar Documentos

1. Ir a **"Expedientes"** y seleccionar un expediente
2. Pestaña **"Documentos"**
3. Click en **"Subir documento"**
4. Completar:
   - **Archivo**: Seleccionar PDF, DOCX, etc.
   - **Título**: Nombre descriptivo
   - **Tipo**: Reclamación, Justificante, Comunicación, etc.
   - **Fecha**: Fecha del documento
   - **Procedencia**: De dónde viene
   - **Confidencialidad**: Público, Interno, Confidencial, Secreto
5. Click en **"Subir"**
6. El sistema calcula SHA-256 automáticamente

### Paso 3: Registrar Actuaciones

1. En el detalle del expediente
2. Pestaña **"Cronología"**
3. Click en **"+ Nueva actuación"**
4. Completar:
   - **Fecha**: Fecha de la actuación
   - **Tipo**: Hecho, Registro, Comunicación, Plazo, etc.
   - **Descripción**: Detalles de la actuación
5. Click en **"Guardar actuación"**

### Paso 4: Vincular Documentos a Actuaciones

1. En la lista de documentos
2. Click en **"Vincular a actuación"**
3. Seleccionar actuación relacionada
4. Tipo de relación: Adjunto, Evidencia, Referencia, Anexo
5. Click en **"Vincular"**

### Paso 5: Consultar Auditoría

1. En el detalle del expediente
2. Pestaña **"Auditoría"**
3. Ver todas las operaciones realizadas:
   - Creación de expedientes
   - Subida de documentos
   - Descargas
   - Registro de actuaciones
   - Exportaciones
   - Etc.

### Paso 6: Exportar Expediente

1. En el detalle del expediente
2. Pestaña **"Resumen"**
3. Click en **"Exportar expediente"**
4. Se descarga un ZIP con:
   - Ficha del expediente
   - Índice documental
   - Cronología de actuaciones
   - Documentos originales
   - Manifiesto de integridad con hashes SHA-256

---

## 🎯 Funcionalidades Principales

### Gestión de Expedientes

- ✅ Crear expedientes con referencia única
- ✅ Listar expedientes con filtros
- ✅ Consultar detalle completo
- ✅ Editar estado y descripción
- ✅ Categorías: Administrativo, Jurídico, PRL
- ✅ Estados: Abierto, En curso, Cerrado, Archivado

### Gestión Documental

- ✅ Subir documentos (PDF, DOCX, DOC, TXT, JPG, PNG, EML)
- ✅ Tamaño máximo: 25 MB
- ✅ Hash SHA-256 automático
- ✅ Metadatos completos
- ✅ Versionado de documentos
- ✅ Descarga segura
- ✅ Eliminación con registro

### Cronología

- ✅ Registrar actuaciones
- ✅ Tipos: Hecho, Registro, Comunicación, Plazo, Fundamento, Petición, PRL
- ✅ Ordenación cronológica
- ✅ Vinculación con documentos

### Auditoría

- ✅ Log completo de operaciones
- ✅ Identificación de usuario
- ✅ Timestamps precisos
- ✅ Metadatos contextuales

### Exportación

- ✅ ZIP con toda la documentación
- ✅ Índice documental
- ✅ Cronología
- ✅ Documentos originales
- ✅ Manifiesto de integridad

---

## 🔍 Tipos de Documentos

### Categorías Documentales

1. **Reclamación** - Documentos de reclamaciones
2. **Justificante** - Justificantes de presentación
3. **Comunicación** - Comunicaciones con dirección
4. **Solicitud** - Solicitudes de evaluación
5. **Informe Prevención** - Informes del Servicio de Prevención
6. **Horario** - Horarios docentes
7. **Asignación** - Asignación de aulas
8. **Dotación Tecnológica** - Solicitudes de dotación
9. **Resolución** - Respuestas y resoluciones
10. **Otro** - Documentación complementaria

### Niveles de Confidencialidad

1. **Público** - Acceso libre
2. **Interno** - Solo personal autorizado
3. **Confidencial** - Restringido
4. **Secreto** - Máxima restricción

---

## 📊 Dashboard

El panel principal muestra:

- **Total de expedientes**
- **Expedientes abiertos**
- **Expedientes en curso**
- **Expedientes cerrados**
- **Accesos rápidos** a funciones principales

---

## 🔐 Seguridad

### Medidas Implementadas

✅ **Validación de archivos:**
- Tipos MIME permitidos
- Tamaño máximo 25 MB
- Hash SHA-256 para integridad

✅ **Niveles de confidencialidad:**
- Público, Interno, Confidencial, Secreto

✅ **Auditoría completa:**
- Todas las operaciones registradas
- Identificación de usuario
- Timestamps precisos

✅ **Integridad documental:**
- Hash SHA-256 de cada archivo
- Versionado con preservación
- Manifiesto de integridad

---

## ⚠️ Notas Importantes

### Modo Demo

La aplicación funciona actualmente en **modo demo** con LocalStorage:

✅ **Ventajas:**
- Funciona inmediatamente
- No requiere configuración
- Perfecto para pruebas

⚠️ **Limitaciones:**
- Datos solo en el navegador actual
- No hay sincronización
- No hay backup automático
- No adecuado para producción

### Exportaciones

⚠️ **Las exportaciones NO constituyen:**
- Expediente administrativo electrónico formal
- Firma electrónica cualificada
- Copia auténtica con validez legal

✅ **Las exportaciones SON útiles para:**
- Copias de trabajo
- Respaldos internos
- Consulta offline
- Verificación de integridad

---

## 🛠️ Solución de Problemas

### El documento no se sube

**Posibles causas:**
- Tipo de archivo no permitido
- Tamaño superior a 25 MB
- Error de conexión

**Soluciones:**
- Verificar tipo de archivo (PDF, DOCX, DOC, TXT, JPG, PNG, EML)
- Comprobar tamaño del archivo
- Reintentar la subida

### No puedo descargar un documento

**Posibles causas:**
- Documento eliminado
- Error de permisos
- Archivo corrupto

**Soluciones:**
- Verificar que el documento existe
- Consultar log de auditoría
- Revisar integridad con SHA-256

### La exportación falla

**Posibles causas:**
- Sin documentos en el expediente
- Error de memoria
- Navegador incompatible

**Soluciones:**
- Verificar que hay documentos
- Cerrar otras pestañas
- Usar navegador actualizado

---

## 📚 Recursos Adicionales

### Documentación Completa

- **README.md** - Documentación técnica completa
- **INFORME-FINAL-V3.md** - Informe técnico detallado
- **RESUMEN-EJECUTIVO.md** - Resumen ejecutivo

### Migraciones de Base de Datos

- **db/migrations/001_initial.sql** - Esquema inicial
- **db/migrations/003_documents.sql** - Módulo documental V3.0

### Para Producción

Ver sección "Migración a Producción" en `README.md`

---

## 📞 Soporte

Para consultas técnicas o incidencias:

1. Revisar documentación en `README.md`
2. Consultar log de auditoría en la aplicación
3. Revisar migraciones en `db/migrations/`
4. Verificar build logs con `npm run build`

---

## ✅ Checklist de Uso

### Antes de empezar
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run dev`
- [ ] Abrir http://localhost:5173

### Crear expediente
- [ ] Ir a "Nuevo expediente"
- [ ] Completar referencia, título, categoría, descripción
- [ ] Click en "Crear expediente"

### Subir documentos
- [ ] Ir a detalle del expediente
- [ ] Pestaña "Documentos"
- [ ] Click en "Subir documento"
- [ ] Completar metadatos
- [ ] Verificar hash SHA-256

### Registrar actuaciones
- [ ] Pestaña "Cronología"
- [ ] Click en "+ Nueva actuación"
- [ ] Completar fecha, tipo, descripción
- [ ] Click en "Guardar actuación"

### Exportar expediente
- [ ] Pestaña "Resumen"
- [ ] Click en "Exportar expediente"
- [ ] Verificar descarga del ZIP
- [ ] Comprobar contenido del ZIP

---

**Prof. Manuel Gago Fernández**  
**ARCHEION LEGAL OPS V3.0**  
**Guía Rápida de Uso**

---

*Para documentación técnica completa, consultar README.md e INFORME-FINAL-V3.md*
