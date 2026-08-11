# RECHERCHE V1 — Production Security & Hardening Checklist

## 1. Security Architecture Checklist

| Security Control | Implementation Status | Verification Details |
| :--- | :---: | :--- |
| **Password Hashing** | ✅ PASSED | Argon2id hashing enforced. Hashes excluded from DTOs. |
| **JWT Session Security** | ✅ PASSED | Short-lived access tokens (15m), 7-day refresh tokens with rotation & family reuse detection. |
| **IDOR & BOLA Defense** | ✅ PASSED | Server derives user identity strictly from JWT session (`req.user.id`). |
| **Provider Role Isolation** | ✅ PASSED | `ProviderRoleGuard` verifies `x-provider-role-id` ownership. Lehrer cannot access Betreuer context. |
| **Input Sanitization & DTO Validation** | ✅ PASSED | Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`. XSS script tags sanitized. |
| **PostGIS Spatial Radius & Bounds** | ✅ PASSED | Parameterized Haversine queries. Lat (-90 to 90), Lng (-180 to 180), Radius (0.1 to 500 km). |
| **Payment Provider Abstraction** | ✅ PASSED | `IPaymentProvider` abstraction with `OrangeMoneyProvider` and `MtnMobileMoneyProvider` (*126# USSD). |
| **Idempotency & Replay Defense** | ✅ PASSED | Unique stable key (`idemp_${userId}_${planCode}`). Replay webhooks safely treated idempotently. |
| **Coordinate Privacy Masking** | ✅ PASSED | Raw PostGIS WKT coordinates masked from public DTOs unless `showExactAddress` is true. |
| **Block & Privacy Enforcement** | ✅ PASSED | Blocks enforced in both directions across search, messaging, friendships, and ratings. |
| **Rate Limiting / Anti-Abuse** | ✅ PASSED | `ThrottlerModule` active across sensitive auth and social endpoints. |

---

## 2. Payment Provider Extensibility Model
The core subscription state machine (`PENDING`, `ACTIVE`, `EXPIRING`, `EXPIRED`, `CANCELLED`, `SUSPENDED`) and entitlement unlocking are 100% provider-independent.

```
SubscriptionService
        │
        ▼
IPaymentProvider (Interface)
        │
        ├──────► OrangeMoneyProvider (USSD #150#)
        ├──────► MtnMobileMoneyProvider (USSD *126# - Cameroon/Africa)
        ├──────► PayPalProvider (Future Adapter)
        └──────► StripeProvider (Future Adapter)
```

Live production credentials remain UNDEFINED environment placeholders. Payment activation requires server-side webhook signature verification.
