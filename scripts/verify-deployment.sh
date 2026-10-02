#!/bin/bash

# Script de verificación post-despliegue para ARCHEION LEGAL OPS V2
# Uso: ./scripts/verify-deployment.sh [URL]
# Ejemplo: ./scripts/verify-deployment.sh https://archeionlegalopsv-2.vercel.app

URL=${1:-"https://archeionlegalopsv-2.vercel.app"}

echo "═══════════════════════════════════════════════════"
echo "  VERIFICACIÓN POST-DESPLIEGUE"
echo "  URL: $URL"
echo "═══════════════════════════════════════════════════"
echo ""

# Verificar página principal
echo "🔍 Verificando página principal..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Página principal responde (HTTP $HTTP_CODE)"
else
  echo "   ❌ Página principal falla (HTTP $HTTP_CODE)"
fi
echo ""

# Verificar página de login
echo "🔍 Verificando página de login..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/login")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Página de login responde (HTTP $HTTP_CODE)"
  # Verificar que contiene el formulario
  CONTENT=$(curl -s "$URL/login")
  if echo "$CONTENT" | grep -q "Iniciar sesión"; then
    echo "   ✅ Formulario de login presente"
  else
    echo "   ⚠️  Formulario de login no encontrado"
  fi
else
  echo "   ❌ Página de login falla (HTTP $HTTP_CODE)"
fi
echo ""

# Verificar endpoint /api/session
echo "🔍 Verificando endpoint /api/session..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/session")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /api/session responde (HTTP $HTTP_CODE)"
  RESPONSE=$(curl -s "$URL/api/session")
  echo "   Respuesta: $RESPONSE"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "   ❌ /api/session no existe (HTTP 404)"
  echo "   Las funciones API no están desplegadas correctamente"
  echo "   Verifica vercel.json y la configuración de Vercel"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "   ⚠️  /api/session responde con error (HTTP 500)"
  echo "   Probablemente DATABASE_URL no está configurada"
else
  echo "   ❌ /api/session falla (HTTP $HTTP_CODE)"
fi
echo ""

# Verificar endpoint /api/cases
echo "🔍 Verificando endpoint /api/cases..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/cases")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /api/cases responde (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "   ✅ /api/cases requiere autenticación (HTTP 401)"
  echo "   Esto es correcto si la autenticación está activa"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "   ❌ /api/cases no existe (HTTP 404)"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "   ⚠️  /api/cases responde con error (HTTP 500)"
  echo "   Probablemente DATABASE_URL no está configurada"
else
  echo "   ❌ /api/cases falla (HTTP $HTTP_CODE)"
fi
echo ""

# Resumen
echo "═══════════════════════════════════════════════════"
echo "  RESUMEN"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Si todos los endpoints responden correctamente:"
echo "  ✅ Despliegue exitoso"
echo ""
echo "Si /api/* devuelve 404:"
echo "  ❌ Las funciones API no están desplegadas"
echo "  Solución: Verifica vercel.json y redeploy"
echo ""
echo "Si /api/* devuelve 500:"
echo "  ❌ DATABASE_URL no está configurada"
echo "  Solución: Configura la variable en Vercel Dashboard"
echo ""
echo "Si /api/cases devuelve 401:"
echo "  ✅ Autenticación funcionando correctamente"
echo ""
