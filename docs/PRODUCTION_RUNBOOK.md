# RECHERCHE V1 — Production Deployment Runbook

This runbook provides the step-by-step operational procedure for launching RECHERCHE V1 to production environments.

---

## 20-Step Production Execution Runbook

1. **Provision Production Database:** Provision PostgreSQL 16 instance and enable PostGIS extension (`CREATE EXTENSION IF NOT EXISTS postgis;`).
2. **Configure Production Secrets:** Inject production environment variables into `.env.production` (Database URL, JWT Secrets, CORS Origin).
3. **Execute Prisma Migrations:** Run `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`.
4. **Deploy NestJS API:** Build and start NestJS API server (`npm run build && npm run start:prod --workspace=apps/api`).
5. **Deploy Next.js Web App:** Build and start Next.js web application (`npm run build && npm run start --workspace=apps/web`).
6. **Verify Liveness Endpoint:** Perform HTTP GET request to `https://api.recherche.cm/api/v1/health` (Expect `status: ok`).
7. **Verify Readiness Endpoint:** Perform HTTP GET request to `https://api.recherche.cm/api/v1/health/readiness` (Expect `database: ok`).
8. **Verify Authentication Flow:** Test user registration, login, and JWT access token issuance.
9. **Verify Provider-Role Isolation:** Test context switching (`x-provider-role-id`) between Lehrer and Betreuer roles.
10. **Verify Search & Spatial Radius:** Perform spatial provider search (`/api/v1/search/providers?lat=3.8480&lng=11.5021&radiusKm=25`).
11. **Verify Messaging Domain:** Verify direct message transmission and role-isolated inbox lookups.
12. **Verify Admin Moderation Queue:** Test moderation queue report retrieval (`/api/v1/admin/moderation/reports`).
13. **Verify Sandbox Payment Initiation:** Initiate plan selection in sandbox mode to verify USSD prompt instructions (#150# and *126#).
14. **Configure Live Payment Webhooks:** Inject live `ORANGE_MONEY_*` and `MTN_MOMO_*` production credentials once received from operators.
15. **Perform Controlled Payment Verification:** Execute 1 XAF live test transaction for Orange Money and MTN Mobile Money.
16. **Monitor Webhook Callback Processing:** Confirm webhook callback signature verification and database `Payment` ledger update.
17. **Verify Subscription Entitlement Unlocking:** Confirm provider role status transitions to `ACTIVE` upon payment confirmation.
18. **Verify Database Snapshot Backup:** Trigger automated `pg_dump` snapshot to verify backup mechanism.
19. **Verify Rollback & Restoration Procedures:** Validate backup restoration procedures in staging.
20. **Declare GO / NO-GO Gate:** Review [docs/GO_LIVE_CHECKLIST.md](file:///c:/Users/S410G4-BMW%20Tunisia%20N/RECHERCHE/docs/GO_LIVE_CHECKLIST.md) and declare official Go/No-Go decision.
