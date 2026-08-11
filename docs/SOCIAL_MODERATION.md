# RECHERCHE V1 — Social, Ratings, Follows & Moderation Specification

## 1. Overview
Phase 11 implements the social layer (Friendships, Blocks, Role-Isolated Follows, Ratings & Reviews with server aggregates), Info social interactions (`InfoLike`, `InfoComment`, `InfoShare`), universal reporting (`Report`), admin moderation queue workflow, and security audit logging (`AuditLog`).

---

## 2. Friendship Lifecycle & Canonical Ordering
- **Statuses:** `PENDING`, `ACCEPTED`, `REJECTED`.
- **Canonical Database Constraint:** `user1Id = min(userId, targetUserId)` and `user2Id = max(userId, targetUserId)`. This prevents duplicate logical friendships regardless of who initiated the request.
- **Authorization Guard:** Server verifies that **only** the intended request recipient can accept or reject a request (`403 Forbidden`).

---

## 3. Block System & Matrix Rules
- Creating a `Block` (`blockerId` -> `blockedId`) automatically removes any existing `Friendship` records.
- Blocks prevent friend requests, private chats, follow operations, and social interactions in **both** directions.
- Provider-role contexts cannot bypass a user block.

---

## 4. Follow System & Provider Role Isolation
- Follow operations target **`providerProfileId`**, NOT `userId`.
- Following a user's `LEHRER` provider profile does **not** automatically follow their `BETREUER` profile.

---

## 5. Ratings & Reviews System
- Ratings target `providerProfileId` (stars: 1 to 5).
- Per V1 specification: **No prior transaction is required** to submit a rating.
- Server sanitizes `<script>` tags from review text.
- Server calculates authoritative rating aggregates (`averageRating`, `totalRatings`). Client-supplied aggregates are strictly rejected.

---

## 6. Universal Reporting & Admin Moderation Queue
- **Target Types:** `PROFILE`, `INFO`, `COMMENT`, `CONVERSATION`.
- **Statuses:** `PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED`.
- **Moderation Rule:** Submitting a report does **NOT** automatically delete reported content. All moderation actions are explicit and logged in `AuditLog`.

---

## 7. Security Audit Events
Audit events logged via `AuditService.logSecurityEvent`:
- `FRIEND_REQUEST_CREATED`, `FRIEND_REQUEST_ACCEPTED`, `FRIEND_REQUEST_REJECTED`
- `USER_BLOCKED`, `USER_UNBLOCKED`
- `RATING_CREATED`
- `REPORT_RESOLVED`
