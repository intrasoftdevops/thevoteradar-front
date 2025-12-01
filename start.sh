#!/bin/sh
set -e

PORT=${PORT:-8080}

# Configurar puerto de nginx
sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf

# Crear directorio assets si no existe
mkdir -p /usr/share/nginx/html/assets

# Función para escapar caracteres especiales en JavaScript
escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g' | sed "s/'/\\'/g" | sed 's/"/\\"/g' | sed 's/`/\\`/g' | sed 's/\$/\\$/g'
}

# Generar archivo JavaScript con variables de entorno desde Secret Manager
{
  echo 'window.__ENV__ = {'
  echo "  production: ${PRODUCTION:-false},"
  echo "  development: ${DEVELOPMENT:-true},"
  printf '  apiURL: "%s",\n' "$(escape_js "${API_URL:-}")"
  printf '  backofficeApiURL: "%s",\n' "$(escape_js "${BACKOFFICE_API_URL:-}")"
  printf '  surveyApiURL: "%s",\n' "$(escape_js "${SURVEY_API_URL:-}")"
  printf '  defaultTenantId: "%s",\n' "$(escape_js "${DEFAULT_TENANT_ID:-475711}")"
  printf '  key1: "%s",\n' "$(escape_js "${KEY1:-}")"
  printf '  key2: "%s",\n' "$(escape_js "${KEY2:-}")"
  printf '  key3: "%s",\n' "$(escape_js "${KEY3:-}")"
  printf '  key4: "%s",\n' "$(escape_js "${KEY4:-}")"
  printf '  powerBiURL: "%s"\n' "$(escape_js "${POWER_BI_URL:-}")"
  echo '};'
} > /usr/share/nginx/html/assets/env.js

exec nginx -g "daemon off;"

