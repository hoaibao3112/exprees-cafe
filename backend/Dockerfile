# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Install sqlite3 runtime dependency if needed, but node-sqlite3 usually provides prebuilts for debian/slim.
# If slim fails, standard node:20 image works out of the box.
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
# Copy uploads folder structure if needed
RUN mkdir -p uploads

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/main"]
