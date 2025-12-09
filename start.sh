#!/bin/sh
set -e

PORT=${PORT:-8080}

# Configurar puerto de nginx (compatible con Alpine Linux)
sed -i.bak "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/conf.d/default.conf.bak

# Crear directorio assets si no existe
mkdir -p /usr/share/nginx/html/assets

# Función para escapar caracteres especiales en JavaScript
escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g' | sed "s/'/\\\\'/g" | sed 's/"/\\"/g' | sed 's/`/\\\\`/g' | sed 's/\$/\\\\$/g'
}

# Generar archivo JavaScript con variables de entorno desde Secret Manager
{
  echo 'window.__ENV__ = {'
  
  # Producción y desarrollo
  if [ "${PRODUCTION:-false}" = "true" ]; then
    echo '  production: true,'
  else
    echo '  production: false,'
  fi
  
  if [ "${DEVELOPMENT:-true}" = "true" ]; then
    echo '  development: true,'
  else
    echo '  development: false,'
  fi
  
  # URLs y otros valores con escape
  printf '  apiURL: "%s",\n' "$(escape_js "${API_URL:-}")"
  printf '  backofficeApiURL: "%s",\n' "$(escape_js "${BACKOFFICE_API_URL:-}")"
  printf '  surveyApiURL: "%s",\n' "$(escape_js "${SURVEY_API_URL:-}")"
  printf '  defaultTenantId: "%s",\n' "$(escape_js "${DEFAULT_TENANT_ID:-473173}")"
  printf '  key1: "%s",\n' "$(escape_js "${KEY1:-}")"
  printf '  key2: "%s",\n' "$(escape_js "${KEY2:-}")"
  printf '  key3: "%s",\n' "$(escape_js "${KEY3:-}")"
  printf '  key4: "%s",\n' "$(escape_js "${KEY4:-}")"
  printf '  powerBiURL: "%s"\n' "$(escape_js "${POWER_BI_URL:-}")"
  echo '};'
} > /usr/share/nginx/html/assets/env.js

exec nginx -g "daemon off;"

