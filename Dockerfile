FROM node:20-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# App source
COPY server.js ./
COPY public ./public

# Persistent data directory
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=3000
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

# Run as non-root user (built into the node:alpine image)
RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/api/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
