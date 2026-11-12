FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use package-lock when present, fallback to bun lock)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle (client + server)
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Default Ollama endpoint inside the compose network; override as needed
ENV OLLAMA_HOST=http://ollama:11434

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
