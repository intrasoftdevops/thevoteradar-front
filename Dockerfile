FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Crear environment.ts si no existe (necesario para el build de Angular)
# Angular necesita este archivo como base para los fileReplacements
RUN if [ ! -f src/environments/environment.ts ]; then \
      cp src/environments/environment.example.ts src/environments/environment.ts || \
      echo "export const environment = { production: false, development: true, apiURL: '', backofficeApiURL: '', surveyApiURL: '', defaultTenantId: '', key1: '', key2: '', key3: '', key4: '', powerBiURL: '' };" > src/environments/environment.ts; \
    fi

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=builder /app/dist/voteradar-front /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
