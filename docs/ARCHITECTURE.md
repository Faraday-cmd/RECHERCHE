# RECHERCHE V1 — SYSTEM ARCHITECTURE DOCUMENTATION

**Document Status:** Master Architecture Specification  
**Version:** 1.0 (V1)  
**Target Platform:** Recherche Contextual Discovery & Connection Platform  

---

## 1. System Architecture Overview

RECHERCHE V1 is designed as a modular, decoupled, multi-tenant provider platform centered around contextual discovery, location-aware search, multi-role provider identity, and direct communications.

```
+-----------------------------------------------------------------------+
|                           NEXT.JS 14 FRONTEND                         |
|     (i18n: French / English, App Router, React Query, Zustand)       |
+-----------------------------------+-----------------------------------+
                                    |
                    +---------------+---------------+
                    | HTTPS REST    | WSS WebSockets |
                    v               v               |
+---------------------------------------------------+-------------------+
|                           NESTJS BACKEND API                          |
|             (Guards, Interceptors, DTO Validation, RBAC/ABAC)         |
+-----+-------------+---------------+---------------+-------------+-----+
      |             |               |               |             |
      v             v               v               v             v
 +---------+   +---------+     +---------+     +---------+   +---------+
 |  Auth   |   | Roles & |     | Content |     | Search  |   | Message |
 | Module  |   | Subscrip|     | Module  |     | PostGIS |   | Gateway |
 +---------+   +---------+     +---------+     +---------+   +---------+
      |             |               |               |             |
+-----+-------------+---------------+---------------+-------------+-----+
|                        PRISMA ORM DATA LAYER                          |
+-----------------------------------+-----------------------------------+
                                    |
                    +---------------+---------------+
                    v                               v
    +-------------------------------+   +-------------------------------+
    |  POSTGRESQL 16 + POSTGIS DB   |   |   REDIS 7 (Cache & Queues)    |
    +-------------------------------+   +-------------------------------+
```

---

## 2. Frontend Architecture

### Framework & Routing
- **Next.js 14+ App Router** utilizing Server Components for public content rendering and Client Components for dynamic dashboards.
- **Route Layouts:**
  - `(public)` — Unauthenticated guest browsing, Info feed, public search, provider profile pages, campus details.
  - `(auth)` — Login, registration, password recovery.
  - `(user)` — User profile, permanent location selector, Friends center, direct chats.
  - `(provider)` — Provider role switcher, Info post manager, Current Courses manager, Campuses manager, role subscription billing.
  - `(admin)` — Platform moderation queue, report review modal, user suspension controls.

### State Management
- **Server State:** TanStack Query (v5) for request caching, pagination, and optimistic updates.
- **Local Application State:** Zustand for active role selection, search filter state, modal visibility, and active map viewport.

### UI Components & Aesthetics
- Custom modern design system built with CSS Modules and CSS Custom Properties.
- Accessible interactive components, dark/light theme support, responsive mobile-first layouts.
- **Persistent Floating Contact Button:** Rendered on provider profiles at bottom-right, routing directly to the provider role inbox.

---

## 3. Backend Architecture

- **Framework:** Node.js with NestJS (TypeScript).
- **Domain Modules:**
  1. `AuthModule`: Password hashing (Argon2id), JWT issuance, refresh token rotation, session revocation.
  2. `UserModule`: Account CRUD, permanent search location, privacy controls.
  3. `RoleModule`: Multi-role allocation, role profile CRUD, active role context switching.
  4. `SubscriptionModule`: Plan selection, billing state machine (`pending`, `active`, `expiring`, `expired`, `suspended`).
  5. `ProviderModule`: Lehrer, Betreuer, Visa Companion, and Deutsch Institut institution/campus management.
  6. `ContentModule`: Info post lifecycle (5-day expiration timer), Current Courses structured publishing.
  7. `SearchModule`: Role-aware filters, text search, PostGIS spatial queries (`ST_DistanceSphere`).
  8. `MessagingModule`: Socket.io WebSocket Gateway, provider-to-user private chat, 1-on-1 friend chat, group messaging, attachment handling.
  9. `NotificationModule`: Event-driven notification dispatch (In-app DB inbox, Web Push, Transactional Email).
  10. `PaymentModule`: Orange Money API integration adapter, server-side callback verification, webhook replay protection, idempotency handling.
  11. `ModerationModule`: Universal 3-dot reporting workflow, Admin review dashboard, action audit logs.

---

## 4. Database Architecture & Domain Model (~30 Entities)

- **Database Engine:** PostgreSQL 16 with PostGIS extension (`GEOMETRY(Point, 4326)`).
- **ORM Engine:** **Prisma ORM** (`schema.prisma` with raw `$queryRaw` execution for PostGIS spatial queries).

### Domain Schema Summary

```prisma
// Core Identity & Privacy
model User {
  id                    String              @id @default(uuid())
  email                 String              @unique
  passwordHash          String
  name                  String
  sex                   String
  dob                   DateTime
  permanentLocationGeom String?             // PostGIS Point WKT
  bio                   String?
  status                UserStatus          @default(ACTIVE)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  privacySettings       UserPrivacySettings?
  userRoles             UserRole[]
  friends1              Friendship[]        @relation("User1")
  friends2              Friendship[]        @relation("User2")
  ratings               Rating[]
  reportsSubmitted      Report[]            @relation("Reporter")
  auditLogs             AuditLog[]
}

model UserPrivacySettings {
  id                  String              @id @default(uuid())
  userId              String              @unique
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileVisibility   ProfileVisibility   @default(PUBLIC) // PUBLIC, FRIENDS_ONLY, PRIVATE
  showExactAddress    Boolean             @default(false)
  showAge             Boolean             @default(true)
}

// Roles & Subscriptions
enum RoleCode {
  LEHRER
  BETREUER
  VISA_COMPANION
  DEUTSCH_INSTITUT
}

model Role {
  id          String      @id @default(uuid())
  code        RoleCode    @unique
  name        String
  userRoles   UserRole[]
}

model UserRole {
  id              String            @id @default(uuid())
  userId          String
  roleId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  role            Role              @relation(fields: [roleId], references: [id])
  status          UserRoleStatus    @default(DRAFT) // DRAFT, PENDING_PAYMENT, ACTIVE, INACTIVE, EXPIRED, SUSPENDED
  subscriptions   Subscription[]
  providerProfile ProviderProfile?

  @@unique([userId, roleId])
}

model SubscriptionPlan {
  id            String         @id @default(uuid())
  code          String         @unique
  roleCode      RoleCode
  name          String
  priceXAF      Decimal
  includesRoles RoleCode[]
}

model Subscription {
  id          String             @id @default(uuid())
  userRoleId  String
  userRole    UserRole           @relation(fields: [userRoleId], references: [id], onDelete: Cascade)
  planCode    String
  amountXAF   Decimal
  status      SubscriptionStatus @default(PENDING) // PENDING, ACTIVE, EXPIRING, EXPIRED, CANCELLED, SUSPENDED
  startsAt    DateTime?
  expiresAt   DateTime?
  payments    Payment[]
}

model Payment {
  id             String        @id @default(uuid())
  subscriptionId String
  subscription   Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  idempotencyKey String        @unique
  providerTxId   String?       @unique
  paymentMethod  String        @default("ORANGE_MONEY")
  amountXAF      Decimal
  status         PaymentStatus @default(PENDING) // PENDING, SUCCESS, FAILED, REFUNDED
  payloadJson    Json?
  createdAt      DateTime      @default(now())
}

// Provider Profiles & Campuses
model ProviderProfile {
  id                   String                 @id @default(uuid())
  userRoleId           String                 @unique
  userRole             UserRole               @relation(fields: [userRoleId], references: [id], onDelete: Cascade)
  displayName          String
  shortBio             String
  fullDescription      String
  profilePicUrl        String?
  coverPicUrl          String?
  phoneNumbers         Json                   // Array of contact objects
  openingHours         Json?
  yearFounded          Int?
  campuses             Campus[]
  infos                Info[]
  currentCourses       CurrentCourse[]
  follows              Follow[]
  ratings              Rating[]
}

model Campus {
  id                 String               @id @default(uuid())
  providerProfileId  String
  providerProfile    ProviderProfile      @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  name               String
  address            String
  locationGeom       String               // PostGIS Point WKT
  contactPhones      Json
  openingHours       Json
  courseAvailability CampusCourseAvailability[]
  currentCourses     CurrentCourse[]
}

model CampusCourseAvailability {
  id         String     @id @default(uuid())
  campusId   String
  campus     Campus     @relation(fields: [campusId], references: [id], onDelete: Cascade)
  levelCode  String     // A1, A2, B1, B2, C1, C2
}

// Content Systems
model Info {
  id                String          @id @default(uuid())
  providerProfileId String
  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  title             String
  summary           String
  description       String
  infoType          String
  contentLang       String          @default("de")
  photosJson        Json?           // Up to 3 photos
  videoUrl          String?         // Up to 1 video
  campusId          String?
  courseId          String?
  ctaType           String?         // CONTACT, VIEW_COURSE, VIEW_PROFILE, NONE
  status            InfoStatus      @default(PUBLISHED) // PUBLISHED, EXPIRED, DELETED
  publishedAt       DateTime        @default(now())
  expiresAt         DateTime        // Default 5 days after publishing
  likes             InfoLike[]
  comments          InfoComment[]
  shares            InfoShare[]
}

model CurrentCourse {
  id                String          @id @default(uuid())
  providerProfileId String
  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  campusId          String
  campus            Campus          @relation(fields: [campusId], references: [id])
  title             String
  level             String
  language          String          @default("German")
  shortDescription  String
  fullDescription   String
  startDate         DateTime
  durationPeriod    String
  priceXAF          Decimal
  priceNote         String?
  capacity          Int?
  enrolledCount     Int             @default(0)
  photosJson        Json?           // Up to 3 photos
  videoUrl          String?         // Up to 1 video
  publishToInfo     Boolean         @default(true)
  publishToCourses  Boolean         @default(true)
  createdAt         DateTime        @default(now())
}

// Social, Messaging & Moderation
model Follow {
  id                String          @id @default(uuid())
  followerUserId    String
  providerProfileId String
  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  createdAt         DateTime        @default(now())
}

model Rating {
  id                String          @id @default(uuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerProfileId String
  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  stars             Int
  reviewText        String?
  createdAt         DateTime        @default(now())
}

model InfoLike {
  id        String   @id @default(uuid())
  infoId    String
  info      Info     @relation(fields: [infoId], references: [id], onDelete: Cascade)
  userId    String
}

model InfoComment {
  id        String   @id @default(uuid())
  infoId    String
  info      Info     @relation(fields: [infoId], references: [id], onDelete: Cascade)
  userId    String
  comment   String
  createdAt DateTime @default(now())
}

model InfoShare {
  id        String   @id @default(uuid())
  infoId    String
  info      Info     @relation(fields: [infoId], references: [id], onDelete: Cascade)
  userId    String
}

model Friendship {
  id          String           @id @default(uuid())
  user1Id     String
  user1       User             @relation("User1", fields: [user1Id], references: [id], onDelete: Cascade)
  user2Id     String
  user2       User             @relation("User2", fields: [user2Id], references: [id], onDelete: Cascade)
  status      FriendshipStatus @default(PENDING) // PENDING, ACCEPTED, REJECTED
  createdAt   DateTime         @default(now())
}

model Block {
  id          String   @id @default(uuid())
  blockerId   String
  blockedId   String
  createdAt   DateTime @default(now())
}

model Conversation {
  id            String               @id @default(uuid())
  type          ConversationType     // USER_PROVIDER, FRIEND_PRIVATE, GROUP
  contextRoleId String?
  members       ConversationMember[]
  messages      Message[]
}

model ConversationMember {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  roleId         String?
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderUserId   String
  senderRoleId   String?
  content        String
  attachments    Json?
  createdAt      DateTime     @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  eventType String
  payload   Json
  readAt    DateTime?
  createdAt DateTime @default(now())
}

model Report {
  id             String       @id @default(uuid())
  reporterUserId String
  reporter       User         @relation("Reporter", fields: [reporterUserId], references: [id])
  targetType     ReportTarget // PROFILE, INFO, COMMENT, CONVERSATION
  targetId       String
  reason         String
  details        String
  status         ReportStatus @default(PENDING) // PENDING, REVIEWED, RESOLVED, DISMISSED
  reviewerId     String?
  decisionNotes  String?
  createdAt      DateTime     @default(now())
}

model Category {
  id        String   @id @default(uuid())
  code      String   @unique
  name      Json     // i18n names { fr: "", en: "" }
  roleCode  RoleCode
}

model AuditLog {
  id          String   @id @default(uuid())
  adminUserId String
  admin       User     @relation(fields: [adminUserId], references: [id])
  action      String
  resource    String
  details     Json
  ipAddress   String
  createdAt   DateTime @default(now())
}
```

---

## 5. Authentication Architecture

- **Password Hashing:** Argon2id with custom salt parameters. Plaintext passwords never logged or stored.
- **Tokens:** Short-lived JWT Access Tokens (15 min lifetime) passed in HTTP headers or HttpOnly cookies.
- **Refresh Strategy:** Secure 7-day Refresh Tokens stored in DB/Redis with rotation on every refresh and immediate server-side revocation capability.
- **Session Revocation:** Redis blacklist checks incoming access token IDs on sensitive endpoints.

---

## 6. Authorization Architecture

- **Server-Side Deny-By-Default:** Client-side hiding of UI elements is treated purely as UX. Server executes authorization checks on EVERY mutation and query.
- **Authorization Verification Matrix:**
  1. *Authenticated Identity Check:* Validates JWT token and active user status (`ACTIVE`).
  2. *Role Check:* Validates that the requested `provider_role_id` is unlocked by the user.
  3. *Ownership Check:* Validates that the entity being modified (Info, Course, Campus) was created by the active `provider_role_id`. Cross-role editing is strictly blocked.
  4. *Subscription Status Check:* Validates that provider role subscription is `ACTIVE`.
  5. *Block Check:* Validates that neither sender nor recipient has blocked the other.

---

## 7. Role & Subscription Architecture

### Unified Account, Multi-Role Execution
- A single person owns 1 user account but can unlock multiple provider roles:
  - `Betreuer`
  - `Lehrer`
  - `Visa Companion`
  - `Deutsch Institut`
- Unlocking a role via subscription grants eligibility/access to create that profile, but does **not** auto-create or auto-fill that profile.

### CFA Franc (XAF) Subscription Pricing
- **Betreuer:** 2,000 XAF
- **Lehrer:** 5,000 XAF alone / 6,000 XAF with Betreuer
- **Visa Companion:** 10,000 XAF alone / 15,000 XAF with underlying roles
- **Deutsch Institut:** 12,500 XAF alone / 20,000 XAF with all underlying roles
- *Exact billing cycle & renewal rules remain UNDEFINED.*

### Subscription Visibility Rules
- Providers can prepare/edit profiles while payment is pending.
- Public provider listing remains hidden until server-side payment verification.
- **Expired Subscriptions:** Profile and content remain stored in database and discoverable via explicit search at lower priority; provider content loses normal active visibility; **users CANNOT contact inactive providers.**
- *Grace-period duration remains UNDEFINED.*

---

## 8. Search & Filter Architecture

- **Role-Aware Engine:** Server-side search combining PostGIS spatial distance calculations with role-specific filters.
- **Role Filters:**
  - *Deutsch Institut:* Location, campus, distance, rating, price, course level, course language, start date, availability.
  - *Lehrer:* Service, language, location, distance, price, rating.
  - *Betreuer:* Service category, location, distance, price, rating.
  - *Visa Companion:* Destination country, visa service, language, location, distance, price, rating.
- **Sorting Algorithms:** Nearest, Farthest, Most Relevant, Most Popular, Recently Published, Best Rated, Price Low-to-High, Price High-to-Low.

---

## 9. Location & Map Architecture

- **4 Location Concepts:**
  1. *User Permanent Location:* Stored in user profile via interactive map picker (Not device GPS).
  2. *Search Target Location:* Dynamic search origin selected by user (City, quarter/neighborhood, map area). Independent of current GPS.
  3. *Provider Fixed Location:* Stored in provider profile.
  4. *Campus Fixed Locations:* Multi-campus branch coordinates for Deutsch Institut.
- **Spatial Calculations:** PostGIS `ST_DistanceSphere(search_point, provider_point)`.
- **Location Privacy:** Exact addresses hidden; public API returns calculated distance (e.g. "3.1 km away") or general area name.

---

## 10. Messaging Architecture

- **Provider Contact Conversations:** Unauthenticated or authenticated users initiate chat via persistent floating Contact button on provider profiles. Conversation belongs to the provider role inbox.
- **Friend Private & Group Chats:** Authenticated mutual friends communicate 1-on-1 or in private groups with text, photos, and files. Blocked users cannot message.
- **Transport:** WebSocket gateway (Socket.io) with HTTP REST fallback for offline messages.

---

## 11. Notification Architecture

- **Event-Driven Bus:** Redis + BullMQ queue dispatches notifications asynchronously.
- **Channels:** In-App (DB Inbox + Socket.io), Web Push (VAPID / FCM), Transactional Email.
- **Triggers:** Follower notifications on new Infos/Courses/updates, friend requests, messages, subscription alerts, payment receipts, moderation decisions. Debounced to prevent noise.

---

## 12. Payment Architecture (Orange Money)

- **Server-to-Server Integration:** Orange Money Webhook API integration for Cameroon/Africa.
- **Security Baseline:**
  - Client "payment success" claims are NEVER trusted.
  - HMAC SHA-256 webhook signature verification.
  - Idempotency key pattern prevents double-crediting.
  - Subscription activated strictly after server confirms transaction validity.

---

## 13. Security Baseline

- Deny-by-default server-side authorization.
- Input validation (`class-validator`) and HTML sanitization (`sanitize-html`).
- Parameterized SQL queries via Prisma ORM.
- Byte-level magic-number validation for file uploads.
- Presigned S3 URLs for private attachment storage.
- Rate limiting via NestJS Throttler and Redis.
- Immutable administrative audit logs (`AuditLog` table).

---

## 14. Internationalization (i18n)

- **Day 1 Requirement:** French (default) and English supported across navigation, UI controls, error messages, and system communications.
- **Libraries:** `next-intl` (Frontend) and `nestjs-i18n` (Backend).
- **Decoupling:** Application UI language is completely independent of provider service languages, course languages, or provider post content languages. Zero hardcoded UI strings.

---

## 15. File Storage Architecture

- **Storage Backend:** AWS S3 or S3-compatible Object Storage (MinIO / Cloudflare R2).
- **Upload Flow:** Client requests upload presigned URL -> Server validates user quota & file type -> Presigned URL generated -> Client uploads directly to S3 bucket.
- **Validation:** File signature magic-bytes checked server-side before attaching file metadata to records.

---

## 16. Testing Strategy

- **Unit Tests (Jest):** Business logic, DTO validation, PostGIS distance formulas, price math.
- **Integration Tests (Supertest + Testcontainers):** Database migration verification, REST API endpoint authorization.
- **Security Authorization Tests:** Automated test suite verifying 403 Forbidden on all cross-role and unauthorized resource requests.
- **End-to-End Tests (Playwright):** Full user flows (Guest search, User registration, Role purchase via Orange Money, Course publishing, Messaging, Admin report review).

---

## 17. Deployment Architecture

- **Containerization:** Multi-stage Docker containers for Next.js Web App and NestJS API.
- **Reverse Proxy:** Nginx or Caddy handling Let's Encrypt SSL termination and security headers.
- **Environment Management:** Real secrets passed strictly through environment variables. Provided `.env.example` file contains placeholder definitions.
