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
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
