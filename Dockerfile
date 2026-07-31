FROM node:20.11.1-alpine3.19 AS build

WORKDIR /app

COPY Frontend/package.json Frontend/package-lock.json ./

RUN npm ci

COPY Frontend/ ./

RUN npm run build

FROM nginx:1.25.4-alpine3.18

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
