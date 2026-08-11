# RECHERCHE V1 — Database Backup & Recovery Procedure

## 1. Overview
This document outlines the backup, restoration, and disaster recovery procedures for the RECHERCHE PostgreSQL 16 database with PostGIS spatial extension.

---

## 2. Backup Expectations & Scheduling

### Automated Daily Snapshots:
- Full database logical backups executed daily using `pg_dump`.
- Preserves PostGIS spatial tables (`User`, `ProviderProfile`, `Campus`).
- Preserves immutable ledgers (`Payment`, `Subscription`, `AuditLog`).

### Recommended Backup Command:
```bash
pg_dump -h localhost -U recherche_user -d recherche_db -F c -b -v -f /backups/recherche_$(date +%Y%m%d_%H%M%S).dump
```

---

## 3. Restoration Procedure

### Restoration Steps:
1. Ensure the PostgreSQL database instance has PostGIS enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).
2. Run database restoration:
```bash
pg_restore -h localhost -U recherche_user -d recherche_db -v /backups/recherche_TARGET_SNAPSHOT.dump
```
3. Execute Prisma schema validation and migration sync:
```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

---

## 4. Payment Ledger & Audit Log Preservation
- `Payment`, `Subscription`, and `AuditLog` records are immutable financial/security audit logs.
- During database restoration, verify that idempotency keys (`idemp_${userId}_${planCode}`) match the pre-backup state to prevent duplicate charge claims.
