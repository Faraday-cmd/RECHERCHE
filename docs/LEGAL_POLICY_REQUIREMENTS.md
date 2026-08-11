# RECHERCHE V1 — Legal & Policy Requirements

## 1. Overview
This document specifies the technical data lifecycle requirements requiring formal legal review prior to live production activation.

---

## 2. Data Retention & Deletion Policy Matrix

| Data Domain | Technical Capability | Policy Requirement | Status |
| :--- | :--- | :--- | :---: |
| **User Account Deletion** | Soft-delete (`status: DELETED`) & hard-delete support | User right-to-be-forgotten vs audit preservation | `LEGAL REVIEW REQUIRED` |
| **Payment Ledger Records** | Immutable `Payment` & `Subscription` models | Tax law retention (Minimum 5 to 10 years) | `LEGAL REVIEW REQUIRED` |
| **Audit Logs (`AuditLog`)** | Security audit event logging | Incident response retention (Minimum 1 year) | `LEGAL REVIEW REQUIRED` |
| **Direct Messages & Attachments** | Soft-delete support | Message privacy and data processing terms | `LEGAL REVIEW REQUIRED` |
| **Moderation Reports (`Report`)** | Moderation queue review trail | Content liability & law enforcement compliance | `LEGAL REVIEW REQUIRED` |

---

## 3. Mandatory Actions Before Live Go-Live
1. Legal counsel review of Privacy Policy, Terms of Service, and Merchant Agreement.
2. Formalization of Cameroon/CEMAC data protection compliance terms.
