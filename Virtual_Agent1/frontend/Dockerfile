# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Injected by docker-compose build args (empty = use nginx proxy)
ARG VITE_API_BASE_URL=""
ARG VITE_RESUME_API_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_RESUME_API_URL=$VITE_RESUME_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
