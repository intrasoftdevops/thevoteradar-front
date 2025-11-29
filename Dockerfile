FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=builder /app/dist/voteradar-front /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'PORT=${PORT:-8080}' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'cat > /usr/share/nginx/html/assets/config.js <<EOF' >> /start.sh && \
    echo 'window.APP_CONFIG = {' >> /start.sh && \
    echo '  production: ${PRODUCTION:-true},' >> /start.sh && \
    echo '  development: ${DEVELOPMENT:-false},' >> /start.sh && \
    echo '  apiURL: "${API_URL:-}",' >> /start.sh && \
    echo '  backofficeApiURL: "${BACKOFFICE_API_URL:-}",' >> /start.sh && \
    echo '  surveyApiURL: "${SURVEY_API_URL:-}",' >> /start.sh && \
    echo '  defaultTenantId: "${DEFAULT_TENANT_ID:-475711}",' >> /start.sh && \
    echo '  key1: "${KEY1:-}",' >> /start.sh && \
    echo '  key2: "${KEY2:-}",' >> /start.sh && \
    echo '  key3: "${KEY3:-}",' >> /start.sh && \
    echo '  key4: "${KEY4:-}",' >> /start.sh && \
    echo '  powerBiURL: "${POWER_BI_URL:-}"' >> /start.sh && \
    echo '};' >> /start.sh && \
    echo 'EOF' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
