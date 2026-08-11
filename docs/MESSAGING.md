# RECHERCHE V1 — Messaging, Conversations & Payment Abstraction Specification

## 1. Overview
Phase 10 implements the direct messaging domain, provider role inbox isolation, block enforcement, attachment boundaries, real-time socket authentication, and provider-agnostic payment abstraction.

---

## 2. Conversation Types & Authorization Rules

### Types:
1. **`USER_PROVIDER`:** Initiated by an authenticated user targeting a published, active provider role. Associated with `contextRoleId`.
2. **`FRIEND_PRIVATE`:** Direct chat between users. Strictly requires an `ACCEPTED` `Friendship`.
3. **`GROUP`:** Multi-member conversation.

---

## 3. Provider Role Inbox Isolation
A user owning multiple provider roles (`LEHRER`, `BETREUER`, `VISA_COMPANION`, `DEUTSCH_INSTITUT`) has **role-isolated inboxes**.

### Rules:
- Conversations targeting `LEHRER` (Role A) are tagged with `contextRoleId = Role A`.
- `LEHRER` conversations are strictly **hidden** and **forbidden** from `BETREUER` (Role B) context.
- Server enforces role isolation via `ProviderRoleGuard` and context header `x-provider-role-id`.

---

## 4. Block Enforcement & Input Security
- If User A blocks User B, private conversations and new message transmissions are rejected (`403 Forbidden`).
- Message text is sanitized against malicious HTML `<script>` tags server-side.
- Bounded pagination (`limit <= 50`).

---

## 5. Payment Provider Abstraction Architecture (`IPaymentProvider`)

Core subscription state transitions, entitlement unlocking, and idempotency ledger behavior remain **provider-independent**.

### Supported & Planned Providers:
1. `OrangeMoneyProvider`: Orange Money payment adapter (#150# USSD callback).
2. `MtnMobileMoneyProvider`: MTN Mobile Money payment adapter (*126# USSD callback for Cameroon/Africa).
3. `PayPalProvider`: Planned future adapter.
4. `StripeProvider`: Planned future adapter.

### Factory Architecture:
`PaymentProviderFactory.getProvider(providerName)` resolves the provider-specific adapter while core ledger logic stays strictly provider-agnostic. Real API credentials remain UNDEFINED environment placeholders.
