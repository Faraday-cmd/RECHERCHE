# RECHERCHE V1 — Payment Production Activation Architecture

## 1. Overview
This document specifies the activation procedure, credentials requirement, and webhook verification boundaries for **Orange Money** and **MTN Mobile Money** payment gateways in Cameroon and Africa.

---

## 2. Orange Money Activation Matrix (#150#)

- **Provider Name:** `ORANGE_MONEY`
- **Adapter Class:** `OrangeMoneyProvider`
- **Current Implementation Status:** `IMPLEMENTED` (Sandbox & Interface Ready)
- **Production Status:** `CONFIGURATION_REQUIRED` / `EXTERNAL_ACTION_REQUIRED`

### Required Production Environment Variables:
```ini
ORANGE_MONEY_BASE_URL=https://api.orange.com/orange-money-webpay/cm/v1
ORANGE_MONEY_CLIENT_ID=UNDEFINED_REQUIRES_ORANGE_MERCHANT_ACCOUNT
ORANGE_MONEY_CLIENT_SECRET=UNDEFINED_REQUIRES_ORANGE_MERCHANT_ACCOUNT
ORANGE_MONEY_MERCHANT_KEY=UNDEFINED_REQUIRES_ORANGE_MERCHANT_ACCOUNT
ORANGE_MONEY_WEBHOOK_SECRET=UNDEFINED_REQUIRES_ORANGE_MERCHANT_ACCOUNT
```

### Callback & Webhook Configuration:
- **Webhook Endpoint:** `POST https://api.recherche.cm/api/v1/subscriptions/webhook/orange-money`
- **Authorization Header:** `x-orange-signature` / Secret Token matching `ORANGE_MONEY_WEBHOOK_SECRET`.
- **Transaction Reference Mapping:** `providerTxId` mapped to `Payment.providerTransactionId`.
- **Verification Rule:** `amountXAF` and `subscriptionId` verified server-side against database `Payment` ledger prior to activating `ACTIVE` status.

---

## 3. MTN Mobile Money Activation Matrix (*126# Cameroon/Africa)

- **Provider Name:** `MTN_MOMO`
- **Adapter Class:** `MtnMobileMoneyProvider`
- **Current Implementation Status:** `IMPLEMENTED` (Sandbox & Interface Ready)
- **Production Status:** `CONFIGURATION_REQUIRED` / `EXTERNAL_ACTION_REQUIRED`

### Required Production Environment Variables:
```ini
MTN_MOMO_BASE_URL=https://proxy.momoapi.mtn.com/collection/v1_0
MTN_MOMO_API_USER=UNDEFINED_REQUIRES_MTN_DEVELOPER_ACCOUNT
MTN_MOMO_API_KEY=UNDEFINED_REQUIRES_MTN_DEVELOPER_ACCOUNT
MTN_MOMO_PRIMARY_KEY=UNDEFINED_REQUIRES_MTN_DEVELOPER_ACCOUNT
MTN_MOMO_WEBHOOK_SECRET=UNDEFINED_REQUIRES_MTN_DEVELOPER_ACCOUNT
```

### Callback & Webhook Configuration:
- **Webhook Endpoint:** `POST https://api.recherche.cm/api/v1/subscriptions/webhook/mtn-momo`
- **Authorization Header:** `X-Callback-Signature` / Secret Token matching `MTN_MOMO_WEBHOOK_SECRET`.
- **Transaction Reference Mapping:** `providerTxId` mapped to `Payment.providerTransactionId`.
- **Verification Rule:** Server verifies `status === 'SUCCESSFUL'` and `amountXAF === expectedAmount` before unlocking role access.

---

## 4. Sandbox vs Production Operational Differences

| Feature | Sandbox / Mock | Production Target |
| :--- | :--- | :--- |
| **API Endpoints** | Local Mocks / Placeholder URLs | Official Orange / MTN Partner Endpoints |
| **Credentials** | Development Placeholders | RSA / Secret Keys issued by Telecom Operators |
| **USSD Push Prompt** | Simulated Success Callback | Real Handset USSD Prompt (#150# / *126#) |
| **Real Funds Transfer** | Disabled (0 XAF charged) | Real XAF Account Debits |
