# RECHERCHE V1 — DATABASE & DOMAIN SCHEMA SPECIFICATION

**Document Version:** 1.0 (Phase 3)  
**Database Engine:** PostgreSQL 16 + PostGIS Spatial Extension  
**ORM Layer:** Prisma ORM (`apps/api/prisma/schema.prisma`)  

---

## 1. Entity & Relationship Model Overview

The RECHERCHE database consists of **30 normalized entities** grouped into 7 functional domains:

```
+-----------------------------------------------------------------------------------+
|                                 1. CORE IDENTITY                                  |
|     +-------------+           +-----------------------+                           |
|     |    User     |<--------->|  UserPrivacySettings  |                           |
|     +------+------+           +-----------------------+                           |
|            | 1                                                                    |
|            |                                                                      |
|            | N                                                                    |
|     +------+------+           +-----------------------+     +------------------+  |
|     |  UserRole   |<--------->|    ProviderProfile    |---->|   Role (Master)  |  |
|     +------+------+           +-----------+-----------+     +------------------+  |
+------------|------------------------------|---------------------------------------+
             |                              |
             v                              v
+----------------------------+  +---------------------------------------------------+
| 2. SUBSCRIPTIONS & PAYMENTS|  | 3. PROVIDER CONTENT & CAMPUSES                    |
| +------------------------+ |  | +-----------------+         +-------------------+ |
| |      Subscription      | |  | |     Campus      |<------->|CampusCourseAvail. | |
| +-----------+------------+ |  | +--------+--------+         +-------------------+ |
|             | 1            |  |          | 1                                      |
|             v N            |  |          v N                                      |
| +------------------------+ |  | +--------+--------+         +-------------------+ |
| |        Payment         | |  | |  CurrentCourse  |         |   Info (5-Day)    | |
| +------------------------+ |  | +-----------------+         +-------------------+ |
+----------------------------+  +---------------------------------------------------+
                                            |
                                            v
+-----------------------------------------------------------------------------------+
| 4. SOCIAL, MESSAGING, REPORTING & AUDIT                                           |
| +----------+    +-----------+    +---------------+    +-------------------------+ |
| | Follow   |    |  Rating   |    | Conversation  |    |         Report          | |
| +----------+    +-----------+    +-------+-------+    +-------------------------+ |
| +----------+    +-----------+            | 1                                      |
| |Friendship|    |   Block   |            v N                                      |
| +----------+    +-----------+    +-------+-------+    +-------------------------+ |
| +----------+    +-----------+    |    Message    |    |        AuditLog         | |
| |InfoLike  |    |InfoComment|    +---------------+    +-------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 2. Master Entity Inventory (30 Entities)

### Core Identity & Privacy
1. `User`: Core authentication identity (`id`, `email`, `passwordHash`, `name`, `sex`, `dob`, `permanentLocationGeom`, `bio`, `status`).
2. `UserPrivacySettings`: Privacy flags (`profileVisibility`: `PUBLIC` | `FRIENDS_ONLY` | `PRIVATE`, `showExactAddress`, `showAge`).

### Role & Subscriptions
3. `Role`: Master provider role reference (`LEHRER`, `BETREUER`, `VISA_COMPANION`, `DEUTSCH_INSTITUT`).
4. `UserRole`: User-unlocked role record (`userId`, `roleId`, `status`: `DRAFT` | `PENDING_PAYMENT` | `ACTIVE` | `INACTIVE` | `EXPIRED` | `SUSPENDED`).
5. `SubscriptionPlan`: Master pricing configuration (XAF pricing matrix).
6. `Subscription`: Role subscription lifecycle (`userRoleId`, `planCode`, `amountXAF`, `status`: `PENDING` | `ACTIVE` | `EXPIRING` | `EXPIRED` | `CANCELLED` | `SUSPENDED`).
7. `Payment`: Idempotent payment ledger (`subscriptionId`, `idempotencyKey`, `providerTxId`, `amountXAF`, `status`: `PENDING` | `SUCCESS` | `FAILED` | `REFUNDED`).

### Provider Profiles & Campuses
8. `ProviderProfile`: Provider profile details (`displayName`, `shortBio`, `fullDescription`, `profilePicUrl`, `coverPicUrl`, `phoneNumbers`, `openingHours`, `yearFounded`, `fixedLocationGeom`).
9. `Campus`: Branch location for Deutsch Institut (`providerProfileId`, `name`, `address`, `locationGeom`, `contactPhones`, `openingHours`).
10. `CampusCourseAvailability`: Simple lightweight campus course list (`campusId`, `levelCode`: A1-C2, `priceXAF`).

### Content Systems
11. `Info`: Professional public post (`providerProfileId`, `title`, `summary`, `description`, `infoType`, `contentLang`, `photosJson`, `videoUrl`, `status`: `PUBLISHED` | `EXPIRED` | `DELETED`, `expiresAt`: default 5 days).
12. `CurrentCourse`: Structured course offering (`providerProfileId`, `campusId`, `title`, `level`, `language`, `shortDescription`, `fullDescription`, `startDate` (ONE start date), `durationPeriod`, `priceXAF`, `priceNote`, `capacity`, `enrolledCount`, `photosJson`, `videoUrl`, `publishToInfo`, `publishToCourses`).

### Social & Interactions
13. `Follow`: User follow relationship to a provider profile (`followerUserId`, `providerProfileId`).
14. `Rating`: User star rating and comment on provider (`userId`, `providerProfileId`, `stars`, `reviewText`).
15. `InfoLike`: Like interaction on Info posts.
16. `InfoComment`: User comment on Info posts.
17. `InfoShare`: Share event tracking.
18. `Friendship`: Mutual user friend relationship (`user1Id`, `user2Id`, `status`: `PENDING` | `ACCEPTED` | `REJECTED`).
19. `Block`: Server-enforced block record (`blockerId`, `blockedId`).

### Messaging & Notifications
20. `Conversation`: Thread container (`type`: `USER_PROVIDER` | `FRIEND_PRIVATE` | `GROUP`, `contextRoleId`).
21. `ConversationMember`: User/Role participation in a conversation.
22. `Message`: Chat message (`conversationId`, `senderUserId`, `senderRoleId`, `content`, `attachments`).
23. `Notification`: System/Event notification (`userId`, `eventType`, `payload`, `readAt`).

### Reporting, Moderation & Audit
24. `Report`: User report (`reporterUserId`, `targetType`: `PROFILE` | `INFO` | `COMMENT` | `CONVERSATION`, `targetId`, `reason`, `details`, `status`, `reviewerId`, `decisionNotes`).
25. `Category`: Master taxonomy for search filtering (`code`, `name` i18n JSON, `roleCode`).
26. `AuditLog`: Immutable admin action log (`adminUserId`, `action`, `resource`, `details`, `ipAddress`).

---

## 3. Role Isolation Architecture

- **Single Identity, Isolated Roles:** A user has one `User` identity. Provider roles (`UserRole`) are created independently.
- **Provider Ownership Key (`providerProfileId`):** All provider-generated resources (`Info`, `CurrentCourse`, `Campus`) store `providerProfileId` (referencing `UserRole`).
- **Server Enforcement:** A user operating under Role A cannot mutate or manage resources created under Role B, even though both roles belong to the same `userId`.

---

## 4. Location & PostGIS Spatial Architecture

PostgreSQL PostGIS spatial features store coordinates as WKT strings (`POINT(longitude latitude)`):
1. `User.permanentLocationGeom`: User permanent search location.
2. `ProviderProfile.fixedLocationGeom`: Provider professional location.
3. `Campus.locationGeom`: Branch campus coordinates.

**Spatial Query Helper (Distance Calculations):**
```sql
SELECT c.id, c.name,
       ST_DistanceSphere(
         ST_GeomFromText(c."locationGeom", 4326),
         ST_GeomFromText('POINT(11.5021 3.8480)', 4326)
       ) / 1000.0 AS distance_km
FROM "Campus" c
WHERE ST_DistanceSphere(
        ST_GeomFromText(c."locationGeom", 4326),
        ST_GeomFromText('POINT(11.5021 3.8480)', 4326)
      ) <= 25000;
```

---

## 5. Deletion & Retention Strategy

- **Account Deletion Request:** Sets `User.status = DELETED`. Soft-delete mechanism removes user profile from public search and discovery APIs immediately.
- **Info Expiration:** Infos expire 5 days after publishing (`expiresAt = publishedAt + 5 days`). `status` transitions to `EXPIRED`. Info disappears from public feed but remains stored in provider role dashboard where provider can republish.
- **Legal Retention:** Audit logs (`AuditLog`) and payment records (`Payment`) are preserved for compliance.
