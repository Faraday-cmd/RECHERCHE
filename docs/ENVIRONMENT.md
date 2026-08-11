# RECHERCHE V1 — Production Environment Single Source of Truth

This document defines all production environment variables consumed across `@recherche/api` and `@recherche/web`.

---

## 1. Master Environment Variable Registry

| Variable Name | Workspace | Required / Optional | Secret? | Default Value | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `NODE_ENV` | API & Web | Required | No | `development` | Environment mode (`production`, `test`, `development`) |
| `PORT` | API | Optional | No | `4000` | HTTP port for NestJS backend |
| `API_PREFIX` | API | Optional | No | `api/v1` | REST API prefix |
| `DATABASE_URL` | API | **Required** | **YES** | None | PostgreSQL 16 + PostGIS connection string |
| `JWT_ACCESS_SECRET` | API | **Required** | **YES** | None (Min 32 chars) | Access token signing secret |
| `JWT_REFRESH_SECRET` | API | **Required** | **YES** | None (Min 32 chars) | Refresh token signing secret |
| `CORS_ORIGIN` | API | Required | No | `http://localhost:3000` | Allowed frontend origin domains |
| `ORANGE_MONEY_CLIENT_ID` | API | Optional (Payment) | **YES** | None | Orange Money merchant client ID |
| `ORANGE_MONEY_CLIENT_SECRET` | API | Optional (Payment) | **YES** | None | Orange Money merchant client secret |
| `ORANGE_MONEY_MERCHANT_KEY` | API | Optional (Payment) | **YES** | None | Orange Money merchant key |
| `ORANGE_MONEY_WEBHOOK_SECRET` | API | Optional (Payment) | **YES** | None | Webhook authentication secret |
| `MTN_MOMO_API_USER` | API | Optional (Payment) | **YES** | None | MTN Mobile Money API User ID |
| `MTN_MOMO_API_KEY` | API | Optional (Payment) | **YES** | None | MTN Mobile Money API Key |
| `MTN_MOMO_PRIMARY_KEY` | API | Optional (Payment) | **YES** | None | MTN Mobile Money Subscription Primary Key |
| `MTN_MOMO_WEBHOOK_SECRET` | API | Optional (Payment) | **YES** | None | Webhook authentication secret |
| `NEXT_PUBLIC_API_URL` | Web | Required | No | `http://localhost:4000/api/v1` | Public API endpoint URL |
| `NEXT_PUBLIC_WS_URL` | Web | Required | No | `http://localhost:4000` | Public WebSocket endpoint URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Web | Optional | No (Public) | None | Google Maps Client API Key |

---

## 2. Startup Security Validation Rules
- `NODE_ENV === 'production'`: Startup fails if `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` is missing, contains 'placeholder', or is under 32 characters.
- Payment adapters fail safely if missing credentials during activation attempt without leaking secret contents.
