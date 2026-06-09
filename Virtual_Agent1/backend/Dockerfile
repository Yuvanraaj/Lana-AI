FROM node:20-alpine

# sqlite3 needs native bindings — install build tools
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json ./

# Install production deps (no lock file required)
RUN npm install --omit=dev

# Copy source
COPY . .

# SQLite data directory
RUN mkdir -p data uploads

EXPOSE 8001

CMD ["node", "server.js"]
