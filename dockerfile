# Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run
FROM node:22-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]