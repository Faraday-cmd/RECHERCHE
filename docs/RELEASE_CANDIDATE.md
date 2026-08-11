# RECHERCHE V1 — Release Candidate & Payment Activation Documentation

## 1. Executive Summary
- **Release Candidate Version:** `1.0.0-rc1`
- **Build Status:** ✅ PASSED (Shared, API, Web, Prisma)
- **Test Status:** ✅ PASSED (250+ Executable Security & Systems Scenarios)
- **Code-Ready Status:** ✅ YES
- **Deployment-Ready Status:** ✅ YES
- **Payment-Production-Ready Status:** ⚠️ BLOCKED (Requires live Orange Money / MTN Mobile Money production API credentials)

---

## 2. Production Readiness Matrix

| Domain | Status | Evidence / Verification |
| :--- | :---: | :--- |
| **API Workspace (`apps/api`)** | READY | Compiles cleanly via `tsc` |
| **Web Workspace (`apps/web`)** | READY | Compiles cleanly via Next.js |
| **Shared Workspace (`packages/shared`)** | READY | Compiles cleanly via `tsc` |
| **Database & Prisma Schema** | READY | Validated via `prisma validate` |
| **Authentication & Session Security** | READY | Argon2id, short-lived JWT, rotation & revocation |
| **Authorization & IDOR Defense** | READY | Server-derived identity, `ProviderRoleGuard` |
| **Provider Role Inbox Isolation** | READY | Role context tag (`contextRoleId`), header verified |
| **Search & PostGIS Spatial** | READY | Bounded Haversine radius queries, coordinate masking |
| **Messaging & WebSocket Security** | READY | Socket session auth, room membership verified |
| **Social, Ratings & Moderation** | READY | Canonical friendships, rating aggregates, moderation queue |
| **Payment Abstraction Layer** | READY | `IPaymentProvider` interface, provider-agnostic core |
| **Orange Money Adapter** | READY (Sandbox/Config) | `OrangeMoneyProvider` (USSD #150#) implemented |
| **MTN Mobile Money Adapter** | READY (Sandbox/Config) | `MtnMobileMoneyProvider` (USSD *126#) implemented |
| **Future Payment Adapters** | READY | Extensible factory pattern (`PaymentProviderFactory`) |
| **Orange Money Live Activation** | BLOCKED | Awaiting live production `ORANGE_MONEY_*` secrets |
| **MTN Mobile Money Live Activation** | BLOCKED | Awaiting live production `MTN_MOMO_*` secrets |

---

## 3. Extending Payment Adapters (PayPal, Stripe, Bank Transfer)
To add a new payment provider (e.g., `PayPalProvider` or `StripeProvider`):
1. Implement `IPaymentProvider` interface (`initiatePayment`, `verifyWebhookPayload`).
2. Register the adapter in `PaymentProviderFactory.constructor`.
3. **Zero changes** are required to `SubscriptionService`, subscription state transitions, payment ledgers, or role entitlement logic.

---

## 4. Undefined Business Decisions (Section 60)
The following remain environment placeholders until official decision/activation:
1. Live `ORANGE_MONEY_*` and `MTN_MOMO_*` production credentials & endpoints.
2. Live `GOOGLE_MAPS_*` production API keys.
3. Rating scale anti-abuse weighting algorithm.
4. Provider filter taxonomy vocabulary.
5. Subscription grace period duration.
6. Current Course expiration timing rules.
7. Attachment size limits and retention policies.
8. Legal retention/deletion policies.
9. Notification Matrix per-channel routing.
10. Admin role hierarchy flags.
