# RECHERCHE — PROJECT MASTER SPECIFICATION
## Version 1 (V1)

**Status:** Master product and architecture specification  
**Purpose:** Source of truth for architecture, UX, backend, frontend, database, API, security, testing, and AI-assisted development.

---

## 0. AI DEVELOPMENT RULES

This document is authoritative for V1.

1. Do not invent business rules that are not defined here.
2. Do not silently change a validated decision.
3. If a requirement is missing or ambiguous, mark it:
   **UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION**
4. Do not implement future functionality in V1 unless explicitly listed as V1.
5. Preserve role isolation and permission boundaries.
6. Treat security and privacy as first-class architecture requirements.
7. Before modifying architecture or database structure, explain the impact and update documentation.
8. Never expose private personal data through public search.
9. Never trust client-side permissions; enforce authorization on the backend.
10. Important state changes must be auditable.

---

# 1. PRODUCT IDENTITY

**Product name:** Recherche

Recherche is a contextual discovery and connection platform initially focused on the German-language ecosystem.

V1 connects users with:
- German language schools / Deutschinstitute
- Lehrer
- Betreuer
- Visa Compagnons
- Courses
- Provider information
- Friends and private communication

Core value:
- visibility
- contextual discovery
- location-aware search
- comparison
- communication
- useful information
- trustworthy interaction

V1 is focused on the German-language ecosystem. Other languages are future expansion.

---

# 2. V1 SCOPE

## Included
- Guest browsing/search
- Registered user accounts
- Provider roles
- Multiple roles per underlying account
- Role-specific dashboards
- Provider profiles
- Provider subscriptions
- Search and filters
- Location/maps
- Provider ratings/stars
- Comments/reviews
- Infos
- Current Courses
- Course search
- Deutsch Institut campuses
- Provider contact
- Private messaging
- Friends
- Friend requests
- Blocking/removing friends
- Private groups
- Photos/files in private conversations
- Following providers
- Notifications
- Reports
- Admin dashboard
- Provider visibility statistics
- Payment infrastructure
- Orange Money integration for Cameroon/Africa
- Privacy/security controls

## Explicitly NOT V1
- Stories
- TikTok-style social feed
- User-to-user following
- Full creator/social publishing ecosystem
- Certificate-based provider verification
- Staff/editor accounts for provider roles
- Complex subscription tiers
- Automatic recurring course-date generation
- Arbitrary Info document uploads
- Multiple dates inside one published Current Course
- Cross-role content editing

Future features must not be implemented merely because they are anticipated.

---

# 3. LANGUAGE

V1 is German-focused.

If the UI language has not been selected:
- default UI language = French

Future UI/content languages may include:
- French
- English
- Italian
- Spanish
- others

Architecture should be internationalization-ready, but V1 remains German-focused.

---

# 4. APPLICATION ENTRY EXPERIENCE

On launch:
- show short loading phrases such as "Information is the key"
- use the configured UI language
- default to French if none is configured

After loading, the user arrives at the main information/search experience.

The user does NOT need to create an account immediately.

---

# 5. GUEST ACCESS

Guests can:
- browse public information
- search
- use categories and filters
- view public provider profiles
- view public provider information
- view public courses
- view public campus information
- compare providers
- view public ratings/comments

An account is required for:
- Friends
- friend requests
- private friend communication
- private groups
- following providers
- authenticated social interactions requiring identity

Users can contact providers without being friends.

---

# 6. USER ACCOUNT

Required user fields:
- name
- sex
- date of birth
- automatically calculated age
- permanent/fixed location
- short self-description

Permanent location is selected through a map/location interface.

It is NOT the user's current GPS location.

Sensitive identity details such as phone number, email, exact birth details, place of birth, and exact address are not automatically public.

Users may show a general area instead of an exact address.

Account deletion must remove the account from public search and handle associated data according to the final retention/deletion policy.

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** legal retention rules for deleted messages, reports, audit logs, and other legally retained records.

---

# 7. ROLE ARCHITECTURE

One underlying account/person may have multiple provider roles:

1. Lehrer
2. Betreuer
3. Visa Companion
4. Deutsch Institut

Roles are separate provider identities/dashboards even when owned by the same person.

Each role has:
- its own provider profile
- its own profile image
- its own cover image
- its own dashboard
- its own content ownership
- its own subscription state
- its own provider visibility
- its own statistics
- its own Infos
- role-specific permissions/data

A person can switch between roles.

The User dashboard is distinct from provider-role dashboards.

Only the User section performs normal public search/discovery.

Provider dashboards manage that role's content and communications.

---

# 8. ROLE ADDITION

The role selector shows an Add Role button only while not all available roles are unlocked.

Once all roles are unlocked:
- Add Role disappears
- no additional provider role can be added

Flow:
1. select Add Role
2. show available roles/offers
3. select role/plan
4. pay
5. role becomes unlocked after confirmed payment
6. complete provider profile
7. publish according to provider status/subscription rules

Unlocking an underlying role does not force completion of that role.

---

# 9. PROVIDER SUBSCRIPTIONS

Currency: CFA Franc (XAF)

V1 prices:

### Betreuer
- 2,000 XAF

### Lehrer
- 5,000 XAF for Lehrer only
- 6,000 XAF for Lehrer + Betreuer access

### Visa Companion
- 10,000 XAF for Visa Companion
- 15,000 XAF for Visa Companion + underlying roles

### Deutsch Institut
- 12,500 XAF for Deutsch Institut
- 20,000 XAF for all underlying roles

Provider subscriptions are monthly according to the product definition.

Payment must support:
- Orange Money API
- Cameroon/Africa payment needs

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact Orange Money API/provider, credentials, environment, webhook contract, and production configuration.

---

# 10. PROVIDER ACTIVATION / EXPIRATION

After subscription expiration:
- provider becomes inactive
- provider content becomes inactive/non-contactable according to platform rules
- provider can still be found by explicit search
- active providers receive priority
- users cannot contact an inactive provider

The profile may show limited information indicating inactive status.

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact grace-period mechanics.

---

# 11. PROVIDER VERIFICATION

V1 does NOT require complex certificate verification.

Providers create professional-style profiles and supply required information.

Trust is supported through:
- structured profiles
- ratings
- comments
- reports
- moderation
- admin decisions
- provider status/history

Reporting must support:
- fake profiles
- fake identity
- impersonation
- scams
- fraud
- harassment
- inappropriate content
- sexual/inadmissible content
- other policy violations

---

# 12. PROVIDER PROFILE DESIGN

Lehrer, Betreuer, and Visa Companion use the same general profile design.

Deutsch Institut follows the same visual philosophy but has institution-specific sections.

Provider profile:
- cover photo
- round profile/logo image
- provider name
- verification/status indicator where applicable
- short/long description
- relevant public information
- section navigation bars
- content
- follow control
- floating Contact button

The Contact button floats at bottom-right and remains available while navigating.

---

# 13. DEUTSCH INSTITUT PROFILE DATA

Required/available fields:
- phone number(s)
- email
- opening hours
- description
- profile photo/logo
- cover photo
- location/campus information

Optional:
- year founded

V1 excludes:
- website
- social media
- number of students
- official registration information

Multiple contact types are supported, such as:
- reception
- WhatsApp
- office
- other defined types

---

# 14. DEUTSCH INSTITUT CAMPUSES

A Deutsch Institut can have multiple campuses.

Each campus has:
- campus name
- fixed map location
- address/general location
- phone contacts
- opening hours
- available courses

Profile displays campuses horizontally.

Selecting a campus opens its details.

The system can indicate the campus most relevant/closest to the selected search location.

Users can view the campus on a map and navigate to it.

Campus location is a fixed professional location, not current GPS.

---

# 15. LOCATION MODEL

Keep these separate:

### User permanent location
Fixed location selected by the user.

### Provider professional location
Fixed location selected by the provider.

Deutsch Institut supports multiple fixed campus locations.

Search must not rely only on current GPS.

Users can explicitly search:
- city
- zone/neighborhood
- map area

Example:
"Deutsch Institut in Yaoundé, Melen"

The system compares all campuses of a multi-campus school against the selected search location.

Google Maps integration is planned conceptually.

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact Google Maps APIs, billing/project configuration, API restrictions, and quotas.

---

# 16. SEARCH

Search is a core V1 feature.

Support:
- search bar
- category filters
- multiple simultaneous filters
- sorting
- location
- provider role
- language where applicable
- price
- rating
- relevance
- distance

Filters are role-aware.

Search results should form a homogeneous list matching selected criteria.

---

# 17. SEARCH LOCATION UX

Search location is independent of the user's permanent location.

The user can choose:
- city
- zone
- neighborhood
- map location

Search can target another person's location.

For multi-campus schools, all campuses are considered.

---

# 18. SEARCH SORTING

V1 options:
- nearest
- farthest
- most relevant
- most popular
- recently published
- best rated
- price low-to-high
- price high-to-low

Category/filter choices appear when search is activated.

Multiple filters can be active simultaneously.

---

# 19. PROVIDER CARDS

Show minimally:
- provider photo/logo if available
- name
- short description
- role
- rating/stars
- relevant location/distance
- relevant price
- relevant role-specific attributes

Cards must remain concise.

---

# 20. ROLE-SPECIFIC SEARCH FILTERS

## Deutsch Institut
- location
- campus
- distance
- rating
- price
- course level
- course language
- course start date
- course availability
- relevance
- popularity
- recent publication

## Lehrer
- language
- location
- distance
- service
- price
- rating
- relevance
- popularity

## Betreuer
- service/category
- location
- distance
- price
- rating
- relevance
- popularity

## Visa Companion
- destination/country
- visa-related service
- language
- location
- distance
- price
- rating
- relevance
- popularity

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** final exact filter vocabulary and allowed values.

---

# 21. RATINGS AND COMMENTS

Any registered user can rate a provider.

A transaction or prior interaction is NOT required.

Users can give stars to providers.

Comments/reviews are supported.

Ratings are visible on provider profiles/search results.

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact rating scale, editing/deletion rules, anti-abuse rules, and whether one account may submit multiple ratings.

---

# 22. PROVIDER COMPARISON

Comparison is a core feature.

Users should compare relevant:
- price
- rating
- location/distance
- services
- courses
- role-specific attributes

Do not compare meaningless fields across provider types.

---

# 23. INFO SYSTEM

Infos are professional public information/announcements published by providers.

Every Info belongs to exactly ONE provider role.

Only the role that created the Info can:
- edit
- republish
- delete

Switching to another role owned by the same person does NOT grant access.

Platform Admin can intervene for moderation/security/policy reasons.

---

# 24. INFO CREATION FIELDS

### Automatic
- provider ID
- provider role ID
- provider name
- provider profile image
- creation/publication metadata

### Provider enters
1. Info title — required
2. Short summary — required
3. Full description — required
4. Info type — required
5. Content language — required
6. Photos — optional, maximum 3
7. Video — optional, maximum 1
8. Related Current Course — optional
9. Related campus — optional
10. Publish publicly or keep in provider profile
11. Expiration/publication duration
12. Publish now / schedule if scheduling is implemented

### Interactions
- likes
- comments
- sharing

### Optional CTA
- Contact provider
- View course
- View profile
- None

Reuse provider/campus data rather than re-entering it.

---

# 25. INFO LIFECYCLE

V1:
- no drafts
- preview before publishing
- publish
- edit published Info
- automatically expire after 5 days
- expired Info remains in role dashboard
- expired Info is marked Expired
- expired Info can be republished without recreating it
- provider can permanently delete it

Expiration removes it from public Infos visibility while retaining it in the provider dashboard.

---

# 26. INFO INTERACTIONS AND REPORTS

Users can:
- like
- comment
- share
- report

Report workflow:
1. 3-dot menu
2. Report
3. report modal
4. user enters report
5. submit
6. admin/platform review
7. decision
8. relevant notification

This same reporting pattern applies throughout the platform.

---

# 27. INFO ANALYTICS

Minimal V1:
- views
- likes
- comments
- shares
- follows
- contacts

No unnecessary analytics suite in V1.

---

# 28. INFO NOTIFICATIONS

Provider receives notifications for:
- likes
- comments
- follows
- provider contacts

Do not notify for every view/share in V1 unless explicitly changed.

---

# 29. CURRENT COURSES

Current Courses are different from the simple course list shown under campuses.

Campus course list is simple:
- A1 German
- A2 German
- B1 German
- B2 German

Current Course is rich structured content.

A Current Course can:
- appear as an Info
- optionally appear in public Courses
- be managed from provider dashboard

Provider chooses among the three publication possibilities:
- Info only
- Courses only
- both

The option to publish neither may also be used for private/profile management.

---

# 30. CURRENT COURSE FIELDS

### Basic identity
- course title
- language (German by default in V1)
- level
- short description
- full description

### Media
- 0–3 photos
- 0–1 video
- no additional document upload in V1

### Schedule
- one start date
- no multiple dates inside one published course
- provider publishes another course for another date
- delay/period/duration
- no end-date requirement

### Campus
Provider selects an existing campus.

Selection automatically associates:
- campus
- location
- campus contacts

Users cannot contact a campus as a separate provider identity.

### Price
- total course price
- optional short note

Example:
"Course and workbooks included."

### Capacity
Provider may specify capacity.

Provider manually enters current enrolled-student count.

If capacity is configured:
- show "X places remaining" when places remain
- show the final full/unavailable state when zero remains

The provider manually updates enrollment count.

---

# 31. CURRENT COURSE MANAGEMENT

Provider can:
- create
- edit
- update enrolled count
- publish
- delete

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact course expiration timing.

---

# 32. COURSE SEARCH

Initial search asks for:
- level
- language

Additional filters:
- location
- start date
- schedule
- distance
- price

Sorting:
- earliest start
- latest start
- lowest price
- highest price
- relevant/nearest

German is the V1 default language.

---

# 33. COURSE CONTACT FLOW

V1 does not automatically enroll students.

Flow:
1. discover course
2. contact provider
3. provider sees contact is course-related
4. discuss
5. user decides to follow course
6. provider manually increments enrolled-student count

---

# 34. FOLLOW PROVIDER

Users can follow providers.

Following is informational and notification-oriented.

Followers should be notified about relevant changes such as:
- new Info
- relevant profile changes
- course changes
- price changes
- other publishable updates

User-to-user following is future functionality and excluded from V1.

---

# 35. PROVIDER CONTACT

Users can contact providers without being friends.

The provider profile has a persistent floating Contact button.

Contact opens an in-app conversation.

Providers cannot refuse contact merely because the user is not a friend.

Providers can block users.

Provider conversations are private and associated with the provider role.

---

# 36. FRIENDS

Registered users can:
- search friends mainly by name/username
- send friend request
- accept friend request
- reject friend request
- remove friend
- block user
- private message
- create private groups
- share photos/files privately

Friends are mutual.

Profile visibility:
- Public
- Friends only
- Private

Private profiles do not appear in public friend search.

---

# 37. BLOCKING

When A blocks B:
- B cannot message A
- communication is disabled
- B cannot access A's profile
- B cannot send friend requests to A
- discovery access is restricted

Backend must enforce blocking.

Providers can block users too.

---

# 38. FRIENDS HOME UX

No friends:
- empty state
- large visual
- search bar
- prompt such as "Search for friends"

With friends:
- friend list
- conversations
- recent/active conversations higher in list

V1 Friends is primarily communication, not a social-media feed.

---

# 39. PRIVATE MESSAGING

Friend messages support:
- text
- photos
- files

V1 supports private groups.

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** file size/type limits, editing/deletion, read receipts, typing indicators, voice messages, calls, retention.

---

# 40. FUTURE SOCIAL FEATURES

Excluded from V1:
- user following
- stories
- TikTok-style feed
- short videos
- long-form user publishing
- creator ecosystem

---

# 41. NOTIFICATIONS

Notifications include:
- friend request
- friend request accepted
- new message
- provider contact
- provider follow updates
- relevant course notifications
- subscription expiration
- report decision
- payment events

Channels:
- in-app
- push
- email for serious events

Payment:
- in-app
- email
- push according to final notification matrix

Report decision:
- in-app
- email

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** exact event-by-event notification matrix and email templates.

---

# 42. REPORTING / MODERATION

Users can report:
- profiles
- fake identities
- impersonation
- scams
- fraud
- harassment
- Infos
- comments
- conversations
- inappropriate content

Standard flow:
3 dots → Report → modal → reason/details → submit → review → decision.

Admin can:
- view reports
- review content/profile
- decide action
- suspend
- deactivate provider
- remove content
- perform other authorized moderation actions

---

# 43. ADMIN DASHBOARD

Admin capabilities:
- reports
- report review
- account suspension
- provider deactivation
- content removal
- payment management
- user management
- category management
- relevant platform management
- moderation
- system activity

Admin permissions must be role-based.

---

# 44. SECURITY / PRIVACY

Security is mandatory.

Architecture must include:
- secure authentication
- secure password hashing
- backend authorization on every protected operation
- RBAC
- ownership checks
- provider-role isolation
- server-side validation
- input sanitization
- secure upload validation
- file size limits
- MIME/content verification
- rate limiting
- abuse prevention
- secure session/token handling
- secure password reset
- appropriate verification
- CSRF protection where applicable
- XSS protection
- SQL/NoSQL injection protection
- secure headers
- secrets outside source code
- environment variables/secret management
- encryption in transit
- encryption at rest where appropriate
- secure API authentication
- audit logging for sensitive admin actions
- payment webhook verification
- payment idempotency
- webhook replay protection
- least privilege
- secure database access
- privacy-aware logging
- no sensitive personal information in logs
- no API keys in Git
- separate development/production credentials
- backups and recovery planning

Security applies to:
- accounts
- provider roles
- messages
- files
- locations
- payments
- reports
- admin functions
- private data

---

# 45. LOCATION PRIVACY

Do not automatically expose exact addresses publicly.

Users can display a general area.

Provider professional locations are for discovery/navigation while respecting the final exact-display policy.

System must distinguish:
- stored exact location
- public displayed location
- calculated distance
- user-selected search location

---

# 46. PAYMENT SECURITY

Payment architecture must include:
- Orange Money API
- secure server-side processing
- webhook verification
- transaction verification
- idempotency
- no trusting client-side success
- transaction records
- activation only after confirmed payment
- payment notifications
- secure payment references

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION:** final Orange Money integration contract and other African payment providers.

---

# 47. DATABASE PRINCIPLES

Database must enforce:
- ownership
- role separation
- subscription state
- provider status
- privacy
- relationships
- unique constraints
- referential integrity
- timestamps
- soft deletion where required
- auditability

Sensitive fields must not be unnecessarily exposed in public APIs.

Normalize source-of-truth data while optimizing for search/read-heavy workloads.

---

# 48. CONTENT OWNERSHIP

Every provider-generated content item identifies its owning provider role.

Examples:
- Info → provider_role_id
- Current Course → provider_role_id
- provider statistics → provider_role_id
- provider conversation → provider_role_id

This prevents cross-role access.

---

# 49. UI / NAVIGATION

Main experience:
- Info
- Search
- provider categories
- Friends through a floating bottom button

Friends floating button is NOT the language switcher.

Provider profiles use section bars/tabs.

Deutsch Institut may include:
- Info
- Courses
- Current Courses
- Campuses
- Content/media
- course prices associated directly with courses
- other approved sections

Lehrer/Betreuer/Visa Companion use the same general profile design without the institution-specific campus/course architecture.

---

# 50. PROVIDER DASHBOARDS

Each provider dashboard manages:
- Profile
- Infos
- Current Courses where applicable
- Courses/public course listings where applicable
- Campuses for Deutsch Institut
- Contacts
- Conversations
- Followers
- Statistics
- Subscription
- Role settings

Each role dashboard is isolated.

Only the role that owns content can manage it.

---

# 51. PROVIDER VISIBILITY

Visibility depends on:
- subscription status
- publication status
- moderation status
- role ownership
- privacy settings

Inactive providers may remain discoverable through explicit search but have lower priority than active providers.

---

# 52. ANALYTICS

Minimal V1 provider analytics:
- profile views
- Info views
- Info likes
- Info comments
- Info shares
- provider follows
- provider contacts

Do not build a complex analytics suite.

---

# 53. API PRINCIPLES

API must:
- validate all input
- authenticate protected requests
- authorize every resource action
- enforce ownership
- never rely on frontend restrictions
- return only permitted fields
- rate-limit sensitive endpoints
- validate files
- use secure pagination
- protect search against abuse
- protect messaging against spam
- protect reports against abuse
- make payment operations idempotent

---

# 54. SEARCH ARCHITECTURE

Search supports:
- text
- role
- category
- location
- distance
- rating
- price
- language
- course level
- course start date
- relevance
- sorting

Filters are role-aware.

Irrelevant filters must not be applied to roles that do not support them.

Search uses user-selected locations, not only current GPS.

---

# 55. TRUST MODEL

Trust is built through:
- complete provider profiles
- structured information
- ratings
- comments
- reporting
- moderation
- blocking
- provider status
- secure communication
- admin review

Complex certificate verification is not part of V1.

---

# 56. PRODUCT PHILOSOPHY

Recherche should feel:
- trustworthy
- clean
- efficient
- contextual
- easy to search
- useful
- professional
- not overloaded

V1 prioritizes discovery and communication over social entertainment.

---

# 57. AI IMPLEMENTATION PRINCIPLES

For every module:
1. Read this specification.
2. Inspect existing code.
3. Inspect database/migrations.
4. Identify dependencies.
5. Propose implementation plan.
6. Implement only approved scope.
7. Add tests.
8. Run tests/lint/type checks.
9. Review security.
10. Update documentation.
11. Report changes.
12. Report undefined decisions.

Never rewrite working architecture unnecessarily.

Never create duplicate models/services/routes when an existing component should be reused.

---

# 58. CHANGE CONTROL

Any change to a validated V1 rule requires:
- explicit product decision
- documentation update
- database/API impact assessment
- migration plan if needed
- test impact assessment

AI must not silently make product decisions.

---

# 59. V1 COMPLETION CRITERIA

A feature is complete only when:
- frontend exists
- backend exists
- database behavior exists
- authorization exists
- validation exists
- error handling exists
- loading/empty states exist
- security is addressed
- tests exist
- documentation is updated

---

# 60. MASTER UNDEFINED REGISTER

The following remain intentionally unresolved:

- exact technology stack
- exact final 30-entity database model confirmation
- exact rating rules
- exact review moderation rules
- exact provider filter vocabulary
- exact Orange Money API/provider contract
- exact Google Maps API selection/configuration
- exact subscription duration implementation details
- exact inactive/grace-period mechanics
- exact Current Course expiration mechanics
- exact notification matrix
- exact file upload limits
- exact messaging retention rules
- exact legal deletion/retention rules
- exact admin role hierarchy
- exact category taxonomy
- exact privacy field-by-field matrix
- exact search ranking algorithm
- exact price/rating sorting implementation
- exact frontend/backend technology choices

**Do not invent these.**

---

# 61. IMPLEMENTATION ORDER

Recommended dependency-aware order:

1. Repository/project foundation
2. Environment and secrets management
3. Database foundation
4. Authentication
5. User profile
6. Role architecture
7. Role subscriptions
8. Provider profiles
9. Provider location
10. Search/filter engine
11. Deutsch Institut campuses
12. Current Courses
13. Infos
14. Follow provider
15. Provider contact/messaging
16. Friends
17. Private messaging/groups/files
18. Notifications
19. Ratings/comments
20. Reports/moderation
21. Admin dashboard
22. Orange Money payments
23. Analytics
24. Security hardening
25. Automated tests
26. End-to-end tests
27. Deployment
28. Production monitoring

Adjust order only when dependency requires it.

---

# 62. FINAL AI DIRECTIVE

You are implementing Recherche V1.

Treat this document as the authoritative product specification.

Do not:
- invent missing business rules
- implement future social features
- merge provider roles
- allow one role to manage another role's content
- expose private information
- trust frontend authorization
- activate subscriptions from client claims
- skip security
- silently modify database architecture

When an undefined requirement is encountered, report:

**UNDEFINED — DO NOT IMPLEMENT WITHOUT DECISION**

When a decision is made, update the appropriate documentation before continuing.

Build Recherche as a secure, maintainable, modular production system rather than a disposable prototype.
