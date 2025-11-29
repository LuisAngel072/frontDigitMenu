# ----------------------------
# Etapa 1: Construcción (Build)
# ----------------------------
FROM node:20-alpine as build-step

WORKDIR /app

# Copiamos primero los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos dependencias (usamos ci para instalaciones limpias y exactas en CI/CD/Docker)
RUN npm ci

# Copiamos el código fuente
COPY . .

# Construimos la aplicación para producción
# Angular 17+ con el builder 'application' generará una carpeta 'browser' dentro de dist
RUN npm run build -- --configuration production

# ----------------------------
# Etapa 2: Servidor Web (Nginx)
# ----------------------------
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados.
# OJO: Con Angular 17 y el builder 'application', la ruta suele ser dist/nombre-proyecto/browser
COPY --from=build-step /app/dist/front-digit-menu/browser /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
