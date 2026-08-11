# RECHERCHE V1 — Production Deployment Guide

## 1. Prerequisites & Stack Overview
- **Node.js:** v20.18.0+ LTS
- **Database:** PostgreSQL 16 with PostGIS extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`)
- **API Framework:** NestJS (`apps/api`)
- **Web App:** Next.js (`apps/web`)

---

## 2. Environment Configuration Boundary

### Required Environment Variables (`.env.production`):
```ini
NODE_ENV=production
PORT=4000
API_PREFIX=api/v1
CORS_ORIGIN=https://recherche.cm

DATABASE_URL=postgresql://recherche_user:SECURE_PASSWORD@localhost:5432/recherche_db?schema=public

JWT_ACCESS_SECRET=REPLACE_WITH_MIN_32_CHAR_CRYPTO_SECURE_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=REPLACE_WITH_MIN_32_CHAR_CRYPTO_SECURE_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# Payment Configuration (Adapters Ready — Credentials UNDEFINED until activation)
ORANGE_MONEY_WEBHOOK_SECRET=UNDEFINED_REQUIRED_BEFORE_PRODUCTION
MTN_MOMO_WEBHOOK_SECRET=UNDEFINED_REQUIRED_BEFORE_PRODUCTION

# Google Maps API (Boundaries Ready — Key UNDEFINED until activation)
GOOGLE_MAPS_API_KEY=UNDEFINED_REQUIRED_BEFORE_PRODUCTION
```

---

## 3. Database Migration & Initialization
```bash
# Validate Prisma schema
npm run validate:schema --workspace=apps/api

# Deploy database migrations
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema apps/api/prisma/schema.prisma
```

---

## 4. Production Build & Execution
```bash
# Build all workspaces (Shared, API, Web)
npm run build

# Start production API server
npm run start:prod --workspace=apps/api

# Start production Web app
npm run start --workspace=apps/web
```

---

## 5. Security & Rollback Operations
- All secrets MUST be loaded via environment variables or secret managers. Never commit secrets to Git.
- Session tokens are stored in HTTP-only cookies / authorization headers. Token families can be immediately revoked via `AuthService.revokeSession`.
- Database rollback: Use `prisma migrate resolve` with database snapshots.
