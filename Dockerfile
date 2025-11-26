# Stage 1: Build Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Angular application for production
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist/voteradar-front /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run uses PORT env var)
EXPOSE 8080

# Create startup script to handle PORT env var
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Get PORT from environment or default to 8080' >> /start.sh && \
    echo 'PORT=${PORT:-8080}' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Replace port in nginx config' >> /start.sh && \
    echo 'sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start nginx' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]

