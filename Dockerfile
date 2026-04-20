FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Copy only the app manifests so `npm ci` can cache well.
COPY package.json package-lock.json ./

# Some build environments set npm's "production" config, which would omit devDependencies.
# We need devDependencies to run `next build` (TypeScript, ESLint, etc.).
RUN npm ci --include=dev


FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . ./

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Keep runtime image lean.
RUN npm prune --omit=dev


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
