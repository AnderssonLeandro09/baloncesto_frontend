# ====================================
# Dockerfile para Frontend React
# Multi-stage build para producción
# ====================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Variables de entorno para el build (Vite las incrusta en build time)
ARG VITE_API_URL=http://localhost:8000
ARG VITE_API_VERSION=basketball
ARG VITE_APP_NAME="Basketball Module"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_VERSION=$VITE_API_VERSION
ENV VITE_APP_NAME=$VITE_APP_NAME

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Stage 2: Production con Nginx
FROM nginx:alpine AS production

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
