# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Biến giả cho build-time — NextAuth + Prisma cần chúng để không crash
# Giá trị thật sẽ được docker-compose inject khi chạy runtime
ENV AUTH_SECRET="build-time-dummy-secret-not-used-in-production"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate
RUN npm run build

# Stage 3: Runner (siêu nhẹ, chỉ chứa standalone output)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server + static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema (cần cho prisma generate/db push lúc runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy worker
COPY --from=builder /app/chatWorker.mjs ./chatWorker.mjs

# Copy essential packages for the standalone worker from builder's node_modules
# Because standalone optimizes and throws away unused node_modules,
# we need to copy the specific modules required by chatWorker.mjs
COPY --from=builder /app/node_modules/bullmq ./node_modules/bullmq
COPY --from=builder /app/node_modules/ioredis ./node_modules/ioredis
COPY --from=builder /app/node_modules/@google ./node_modules/@google
COPY --from=builder /app/node_modules/msgpackr ./node_modules/msgpackr
COPY --from=builder /app/node_modules/cluster-key-slot ./node_modules/cluster-key-slot
COPY --from=builder /app/node_modules/standard-as-callback ./node_modules/standard-as-callback
COPY --from=builder /app/node_modules/denque ./node_modules/denque
COPY --from=builder /app/node_modules/redis-parser ./node_modules/redis-parser
COPY --from=builder /app/node_modules/tslib ./node_modules/tslib
COPY --from=builder /app/node_modules/uuid ./node_modules/uuid

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
