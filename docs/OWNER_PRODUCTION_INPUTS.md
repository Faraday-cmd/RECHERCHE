# RECHERCHE V1 — Project Owner Production Configuration Guide

This document specifies every production configuration value required for go-live, where the project owner obtains each item, and where it must be entered during deployment.

---

## 1. Owner Production Inputs Table

| Input Variable Name | Required From Owner? | Where Owner Obtains It | Where It Is Entered | When Needed | Secret? | Verification Method |
| :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **`DATABASE_URL`** | **YES** | Hosting DB Provider (e.g. AWS RDS, DigitalOcean, Railway) | Server Env / Secret Manager | At Server Provisioning | **YES** | `npx prisma validate` & GET `/health/readiness` |
| **`JWT_ACCESS_SECRET`** | **YES** | Generated via `openssl rand -hex 32` | Server Env / Secret Manager | At Server Provisioning | **YES** | API startup validation checks length >= 32 |
| **`JWT_REFRESH_SECRET`** | **YES** | Generated via `openssl rand -hex 32` | Server Env / Secret Manager | At Server Provisioning | **YES** | API startup validation checks length >= 32 |
| **`CORS_ORIGIN`** | **YES** | Production Frontend Domain (e.g. `https://recherche.cm`) | Server Env / Secret Manager | At Domain Setup | NO | Preflight CORS OPTIONS header verification |
| **`ORANGE_MONEY_CLIENT_ID`** | **YES** | Orange Partner Portal (#150# Merchant Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`ORANGE_MONEY_CLIENT_SECRET`** | **YES** | Orange Partner Portal (#150# Merchant Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`ORANGE_MONEY_MERCHANT_KEY`** | **YES** | Orange Partner Portal (#150# Merchant Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`ORANGE_MONEY_WEBHOOK_SECRET`** | **YES** | Orange Partner Portal (#150# Webhook Config) | Server Env / Secret Manager | Before Payment Activation | **YES** | Webhook callback signature verification |
| **`MTN_MOMO_API_USER`** | **YES** | MTN MoMo Developer Portal (*126# Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`MTN_MOMO_API_KEY`** | **YES** | MTN MoMo Developer Portal (*126# Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`MTN_MOMO_PRIMARY_KEY`** | **YES** | MTN MoMo Developer Portal (*126# Account) | Server Env / Secret Manager | Before Payment Activation | **YES** | Provider activation test in sandbox/live |
| **`MTN_MOMO_WEBHOOK_SECRET`** | **YES** | MTN MoMo Developer Portal (*126# Webhook Config) | Server Env / Secret Manager | Before Payment Activation | **YES** | Webhook callback signature verification |
| **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** | **YES** | Google Cloud Console (Maps JS API Key) | Hosting Provider (Web Build) | At Frontend Build | NO (Public) | Client map render check |

---

## 2. Classified Input Subsections

### A. Things Owner Can Provide Directly:
- `JWT_ACCESS_SECRET` (generate via command: `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` (generate via command: `openssl rand -hex 32`)
- `CORS_ORIGIN` (`https://recherche.cm`)

### B. Things Owner Obtains from Orange Money:
- `ORANGE_MONEY_CLIENT_ID`, `ORANGE_MONEY_CLIENT_SECRET`, `ORANGE_MONEY_MERCHANT_KEY`, `ORANGE_MONEY_WEBHOOK_SECRET`

### C. Things Owner Obtains from MTN Mobile Money:
- `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, `MTN_MOMO_PRIMARY_KEY`, `MTN_MOMO_WEBHOOK_SECRET`

### D. Things Owner Obtains from Google Cloud:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (restrict HTTP referrer to `https://recherche.cm/*`)

### E. Things Required from Hosting / Deployment Provider:
- Production PostgreSQL connection string (`DATABASE_URL`) with PostGIS extension enabled.

---

## 3. Strict Rules for Secret Injection
1. **NEVER paste production secrets into chat or conversation prompts.**
2. All secrets must be entered directly into the **hosting provider's secure Environment Variables interface** (e.g. AWS Parameter Store, Railway Environment Secrets, Vercel Project Settings, Docker Secrets).
3. `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` can be configured immediately before server startup.
4. Payment secrets (`ORANGE_MONEY_*`, `MTN_MOMO_*`) must be configured once merchant accounts are provisioned by telecom operators in Cameroon/Africa.
