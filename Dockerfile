FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
USER appuser
EXPOSE 3000
CMD ["node", "src/services/api-gateway/server.js"]
