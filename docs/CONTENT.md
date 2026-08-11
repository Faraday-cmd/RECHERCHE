# RECHERCHE V1 — Content Systems Specification (Infos & Current Courses)

## 1. Overview
The RECHERCHE Content System enables verified provider roles (`LEHRER`, `BETREUER`, `VISA_COMPANION`, `DEUTSCH_INSTITUT`) to publish public announcements (`Info`) and structured course offerings (`CurrentCourse`).

---

## 2. Role Ownership Isolation
Every `Info` and `CurrentCourse` publication is strictly owned by the **specific provider role** (`UserRole` -> `ProviderProfile`) that created it.

### Rules:
- Ownership is **not** determined merely by `userId`.
- If User A owns both a `LEHRER` role and a `BETREUER` role:
  - Content created by User A's `LEHRER` role is managed exclusively by the `LEHRER` role context.
  - User A's `BETREUER` role context is strictly **blocked** from editing, deleting, or republishing `LEHRER` content.
- The server enforces role isolation via `ProviderRoleGuard` and context header `x-provider-role-id`.

---

## 3. Info Publication Lifecycle & 5-Day Expiration Rule

### Statuses:
- `DRAFT`: Saved draft, not publicly visible.
- `PUBLISHED`: Active publication visible in public search and feeds.
- `EXPIRED`: Public visibility period ended. Retained in provider dashboard.
- `DELETED`: Soft-deleted or removed content.

### 5-Day Expiration Mechanics:
1. Upon publication (`PUBLISHED`), `publishedAt = now()` and `expiresAt = now() + 5 days`.
2. Public feed queries (`GET /api/v1/info/public/feed`) filter out items where `expiresAt <= now()`.
3. Expired Infos remain permanently stored in the owning provider's dashboard, tagged with `status: EXPIRED` ("Expirée").
4. **Republishing:** The provider can invoke `POST /api/v1/info/:id/republish` from the dashboard. This resets `publishedAt = now()` and `expiresAt = now() + 5 days` without creating duplicate database records.

---

## 4. Current Course System

### V1 Architectural Constraints:
1. **Single Start Date:** A `CurrentCourse` publication has exactly **one** start date (`startDate: DateTime`). Multiple recurring start dates are not supported in V1.
2. **Pricing:** Course prices are specified in CFA Francs (`priceXAF: Decimal`).
3. **Public Discoverability:** Only published courses (`publishToCourses == true`) owned by active, published provider profiles appear in public feeds.

---

## 5. Interactions & Universal Reporting

- **Likes (`InfoLike`):** Unique per user (`@unique([infoId, userId])`). Prevents duplicate likes.
- **Comments (`InfoComment`):** HTML script-sanitized user comments.
- **Shares (`InfoShare`):** Share tracking.
- **Universal Reporting (`Report`):** Users tap the content three-dot menu -> "Signaler". Creates a record in the universal `Report` table (`targetType: INFO`). Content is submitted for admin review without automatic deletion.

---

## 6. Security & Audit Boundaries
- Server sanitizes `<script>` tags from descriptions.
- Audit events logged: `INFO_CREATED`, `INFO_UPDATED`, `INFO_REPUBLISHED`, `INFO_REPORTED`, `COURSE_CREATED`, `COURSE_UPDATED`, `COURSE_DELETED`.
- No sensitive credentials or user secrets in logs.
