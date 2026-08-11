# RECHERCHE V1 — Search, Discovery & Spatial Filtering Architecture

## 1. Overview
The Search & Discovery system provides server-authoritative provider and course discovery across all four provider roles (`LEHRER`, `BETREUER`, `VISA_COMPANION`, `DEUTSCH_INSTITUT`).

---

## 2. Location Model & Separation of Concepts
The platform maintains strict separation between location types:
1. **User Permanent Location (`User.permanentLocationGeom`):** Where the user resides. Saved to profile. Never mutated by search operations.
2. **Search Target Location (`lat`, `lng` query params):** Explicitly supplied search center point selected by user or map picker.
3. **Provider Fixed Location (`ProviderProfile.fixedLocationGeom`):** Professional location of individual provider.
4. **Campus Location (`Campus.locationGeom`):** Location of institution campus branch.

---

## 3. PostGIS Spatial Search & Multi-Campus Distance

### Individual Providers:
- Spatial distance calculated between search target `(lat, lng)` and `ProviderProfile.fixedLocationGeom`.

### Multi-Campus Institutions (`DEUTSCH_INSTITUT`):
- Distance evaluated against **all** associated `Campus.locationGeom` points for that institution.
- Returns institution result with distance to the **nearest campus** (`nearestCampusName`).
- Radius filtering (`radiusKm`) excludes institutions whose nearest campus is outside radius bounds.

---

## 4. Privacy & Block Security Enforcement
- **Public Publication Requirement:** Only provider profiles with `publicationStatus == 'PUBLISHED'` and `userRole.status == 'ACTIVE'` appear in search results.
- **Block Filtering:** Excludes profiles belonging to users who have blocked or been blocked by the requester.
- **Coordinate Masking:** Raw PostGIS spatial WKT coordinates (`fixedLocationGeom`) are **masked** from public DTOs unless `UserPrivacySettings.showExactAddress` is set to `true`. Computed distance in km is safely returned.

---

## 5. API Reference

### GET `/api/v1/search/providers`
- Query Params: `roleCode`, `query`, `lat`, `lng`, `radiusKm`, `level`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`.
- Sort Options: `nearest`, `farthest`, `best_rated`, `lowest_price`, `highest_price`, `recently_published`, `popularity`.

### GET `/api/v1/search/courses`
- Query Params: `query`, `level`, `language`, `lat`, `lng`, `radiusKm`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`.
- Sort Options: `earliest_start`, `latest_start`, `lowest_price`, `highest_price`, `nearest`.

### GET `/api/v1/search/categories`
- Returns active Category taxonomy.
