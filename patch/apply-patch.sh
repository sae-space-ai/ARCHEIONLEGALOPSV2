#!/usr/bin/env bash
# =============================================================================
# apply-patch.sh
# Script de aplicación del parche de autenticación para ARCHEION LEGAL OPS
#
# USO:
#   1. Clonar el repositorio (si no está clonado):
#        git clone git@github.com:pergolessi9-star/archeion-legal-ops.git
#        cd archeion-legal-ops
#
#   2. Copiar la carpeta patch/ dentro del repo (o ejecutar desde la raíz del repo
#      si ya se han copiado los archivos del parche).
#
#   3. Ejecutar:
#        chmod +x apply-patch.sh
#        ./apply-patch.sh
#
#   4. Revisar los cambios y hacer push:
#        git push origin fix/supabase-passwordless-auth
#
#   5. Crear PR en GitHub o con gh CLI:
#        gh pr create --title "fix: autenticación magic link Next.js 15" --body "..."
# =============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; }

BRANCH_NAME="fix/supabase-passwordless-auth"
PATCH_DIR="patch"

# -----------------------------------------------------------------------------
# 1. Verificaciones previas
# -----------------------------------------------------------------------------
log "Verificando prerequisitos..."

if ! command -v git >/dev/null 2>&1; then
  err "git no está instalado"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  err "node no está instalado"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  err "npm no está instalado"
  exit 1
fi

# Verificar que estamos en un repo git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "No estás dentro de un repositorio git"
  err "Ejecuta este script desde la raíz de archeion-legal-ops"
  exit 1
fi

# Verificar que el remote es el correcto
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" != *"pergolessi9-star/archeion-legal-ops"* ]]; then
  warn "El remote origin no apunta a pergolessi9-star/archeion-legal-ops"
  warn "URL actual: $REMOTE_URL"
  read -p "¿Continuar de todas formas? (s/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[sS]$ ]]; then
    exit 1
  fi
fi

ok "Prerequisitos verificados"

# -----------------------------------------------------------------------------
# 2. Actualizar main y crear rama
# -----------------------------------------------------------------------------
log "Actualizando rama main..."
git fetch origin
git checkout main
git pull origin main

log "Creando rama $BRANCH_NAME..."
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  warn "La rama $BRANCH_NAME ya existe. ¿Eliminarla y recrearla? (s/N)"
  read -p "" -n 1 -r
  echo
  if [[ $REPLY =~ ^[sS]$ ]]; then
    git branch -D "$BRANCH_NAME"
    git checkout -b "$BRANCH_NAME"
  else
    git checkout "$BRANCH_NAME"
  fi
else
  git checkout -b "$BRANCH_NAME"
fi

ok "Rama $BRANCH_NAME creada"

# -----------------------------------------------------------------------------
# 3. Verificar estructura del parche
# -----------------------------------------------------------------------------
log "Verificando archivos del parche..."

REQUIRED_FILES=(
  "$PATCH_DIR/lib/supabase/server.ts"
  "$PATCH_DIR/lib/supabase/client.ts"
  "$PATCH_DIR/lib/supabase/middleware.ts"
  "$PATCH_DIR/middleware.ts"
  "$PATCH_DIR/app/auth/callback/route.ts"
  "$PATCH_DIR/app/login/actions.ts"
  "$PATCH_DIR/app/login/page.tsx"
  "$PATCH_DIR/app/expedientes/page.tsx"
  "$PATCH_DIR/.env.example"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    err "Falta el archivo del parche: $f"
    exit 1
  fi
done

ok "Todos los archivos del parche presentes"

# -----------------------------------------------------------------------------
# 4. Copiar archivos al repo (preservando existentes si difieren)
# -----------------------------------------------------------------------------
log "Aplicando archivos del parche..."

# Backup de archivos existentes
BACKUP_DIR=".patch-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

copy_file() {
  local src="$1"
  local dst="${src#$PATCH_DIR/}"
  
  if [[ -f "$dst" ]]; then
    # Archivo existe: hacer backup
    mkdir -p "$BACKUP_DIR/$(dirname "$dst")"
    cp "$dst" "$BACKUP_DIR/$dst"
    log "  Backup de $dst → $BACKUP_DIR/$dst"
  fi
  
  # Crear directorio destino si no existe
  mkdir -p "$(dirname "$dst")"
  
  # Copiar archivo
  cp "$src" "$dst"
  ok "  Aplicado: $dst"
}

copy_file "$PATCH_DIR/lib/supabase/server.ts"
copy_file "$PATCH_DIR/lib/supabase/client.ts"
copy_file "$PATCH_DIR/lib/supabase/middleware.ts"
copy_file "$PATCH_DIR/middleware.ts"
copy_file "$PATCH_DIR/app/auth/callback/route.ts"
copy_file "$PATCH_DIR/app/login/actions.ts"
copy_file "$PATCH_DIR/app/login/page.tsx"
copy_file "$PATCH_DIR/app/expedientes/page.tsx"
copy_file "$PATCH_DIR/.env.example"

ok "Archivos aplicados"

# -----------------------------------------------------------------------------
# 5. Verificar que .env.local NO se sube
# -----------------------------------------------------------------------------
log "Verificando .gitignore..."

if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
  warn ".env.local no está en .gitignore. Añadiéndolo..."
  echo "" >> .gitignore
  echo "# Variables de entorno locales (NUNCA subir secretos)" >> .gitignore
  echo ".env.local" >> .gitignore
  echo ".env" >> .gitignore
  ok ".env.local añadido a .gitignore"
else
  ok ".env.local ya está en .gitignore"
fi

# -----------------------------------------------------------------------------
# 6. Instalar dependencias y verificar @supabase/ssr
# -----------------------------------------------------------------------------
log "Instalando dependencias..."
npm install

log "Verificando @supabase/ssr..."
if ! npm ls @supabase/ssr >/dev/null 2>&1; then
  warn "@supabase/ssr no está instalado. Instalando..."
  npm install @supabase/ssr@latest
fi

SSR_VERSION=$(npm ls @supabase/ssr --depth=0 2>/dev/null | grep @supabase/ssr | sed 's/.*@//' || echo "desconocida")
ok "@supabase/ssr versión: $SSR_VERSION"

# -----------------------------------------------------------------------------
# 7. Comprobaciones de TypeScript y build
# -----------------------------------------------------------------------------
log "Ejecutando typecheck..."
if npm run typecheck 2>/dev/null; then
  ok "TypeScript: sin errores"
else
  warn "TypeScript: hay errores (pueden ser preexistentes)"
  warn "Revisa manualmente antes de hacer commit"
fi

log "Ejecutando build de producción..."
if npm run build; then
  ok "Build: exitoso"
else
  err "Build: FALLIDO"
  err "Revisa los errores y corrígelos antes de continuar"
  exit 1
fi

# -----------------------------------------------------------------------------
# 8. Commit
# -----------------------------------------------------------------------------
log "Preparando commit..."

git add -A
git status

# Verificar que hay cambios
if git diff --cached --quiet; then
  warn "No hay cambios para commitear"
  warn "Puede que los archivos ya estuvieran correctos"
else
  read -p "¿Crear commit con estos cambios? (S/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[nN]$ ]]; then
    git commit -m "fix: autenticación magic link y compatibilidad Next.js 15

- Adaptar cliente de servidor a cookies() async de Next.js 15
- Corregir callback de autenticación (exchangeCodeForSession)
- Verificar middleware de protección de rutas
- Corregir server action de envío de magic link
- Añadir manejo de errores en página de login
- Añadir .env.example como plantilla (sin secretos)

Causa raíz: NEXT_PUBLIC_SUPABASE_URL contenía el nombre del proyecto
en lugar de la URL completa de Supabase.

Fixes: autenticación sin contraseña, redirección de callback,
persistencia de sesión mediante cookies seguras.

Relacionado: error 'Unexpected token <, <!DOCTYPE ... is not valid JSON'"

    COMMIT_HASH=$(git rev-parse HEAD)
    ok "Commit creado: $COMMIT_HASH"
  else
    warn "Commit cancelado por el usuario"
  fi
fi

# -----------------------------------------------------------------------------
# 9. Instrucciones finales
# -----------------------------------------------------------------------------
echo ""
echo "============================================================================="
echo "  RESUMEN"
echo "============================================================================="
echo ""
echo "  Rama:        $BRANCH_NAME"
echo "  Commit:      ${COMMIT_HASH:-no creado}"
echo "  Backup:      $BACKUP_DIR/"
echo ""
echo "  PRÓXIMOS PASOS:"
echo ""
echo "  1. Revisar los cambios:"
echo "       git diff main..$BRANCH_NAME"
echo ""
echo "  2. Publicar la rama:"
echo "       git push origin $BRANCH_NAME"
echo ""
echo "  3. Crear pull request (una de estas opciones):"
echo "     a) Con gh CLI:"
echo "       gh pr create --base main --head $BRANCH_NAME \\"
echo "         --title 'fix: autenticación magic link Next.js 15' \\"
echo "         --body 'Corrige la autenticación sin contraseña y la compatibilidad con Next.js 15.'"
echo "     b) Manualmente en GitHub:"
echo "       https://github.com/pergolessi9-star/archeion-legal-ops/compare/main...$BRANCH_NAME"
echo ""
echo "  4. Configurar variables de entorno en Vercel:"
echo "     - NEXT_PUBLIC_SUPABASE_URL = https://<project-ref>.supabase.co"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key>"
echo "     - NEXT_PUBLIC_SITE_URL = https://archeion-legal-ops.vercel.app"
echo ""
echo "  5. Configurar Redirect URLs en Supabase:"
echo "     - https://archeion-legal-ops.vercel.app/auth/callback"
echo ""
echo "  6. Tras el merge, probar el flujo completo:"
echo "     /login → enviar enlace → abrir correo → /expedientes"
echo ""
echo "============================================================================="
