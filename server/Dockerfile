FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev \
	&& npm cache clean --force
COPY --from=builder /app/dist ./dist
# Cloud Run uses PORT environment variable, default to 8080
EXPOSE 8080
USER node
CMD ["node", "dist/index.js"]
