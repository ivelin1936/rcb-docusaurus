# Stage 1 — Build Docusaurus static site
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# Stage 2 — Serve with nginx
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="RCB Docusaurus"
LABEL org.opencontainers.image.description="Renault Club Bulgaria — Technical Documentation Site"
LABEL org.opencontainers.image.source="https://github.com/ivelin1936/rcb-docusaurus"

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/rcb-docusaurus/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
