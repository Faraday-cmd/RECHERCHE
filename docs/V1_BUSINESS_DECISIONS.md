# RECHERCHE V1 — Unresolved Business Decisions & Safe System Defaults

This document tracks unresolved product owner decisions and records the active safe system defaults implemented in V1.

---

## 1. Rating Anti-Abuse Weighting Algorithm
- **DECISION:** Anti-abuse weighting for provider ratings.
- **CURRENT STATUS:** `BUSINESS DECISION REQUIRED`
- **WHY IT MATTERS:** Prevents malicious rating manipulation.
- **CURRENT SYSTEM DEFAULT:** Unweighted arithmetic mean (`averageRating = sum(stars) / count`). Stars bounded 1 to 5. One rating per user per provider profile.
- **WHAT MUST BE DECIDED:** Whether to apply exponential decay, verified client weighting, or minimum rating thresholds.
- **RECOMMENDED OWNER:** Product Manager / Data Analyst

---

## 2. Provider Filter Taxonomy Vocabulary
- **DECISION:** Normalized category taxonomy vocabulary.
- **CURRENT STATUS:** `BUSINESS DECISION REQUIRED`
- **WHY IT MATTERS:** Controls searchable tags for services and courses.
- **CURRENT SYSTEM DEFAULT:** Dynamic `Category` database taxonomy model (`code`, `name`, `description`).
- **WHAT MUST BE DECIDED:** Finalized list of approved service codes and category names.
- **RECOMMENDED OWNER:** Content Lead / Domain Specialist

---

## 3. Subscription Grace Period Duration
- **DECISION:** Duration of grace period before subscription expiration disables profile.
- **CURRENT STATUS:** `BUSINESS DECISION REQUIRED`
- **WHY IT MATTERS:** Gives providers extra time to renew subscriptions without immediate service disruption.
- **CURRENT SYSTEM DEFAULT:** Strict zero-day grace period (Status transitions immediately from `ACTIVE` to `EXPIRED` upon reaching expiration timestamp).
- **WHAT MUST BE DECIDED:** Grace period duration in days (e.g., 3 days vs 7 days).
- **RECOMMENDED OWNER:** Commercial / Monetization Lead

---

## 4. Current Course Expiration Timing
- **DECISION:** Automatic archiving timing for finished courses.
- **CURRENT STATUS:** `BUSINESS DECISION REQUIRED`
- **WHY IT MATTERS:** Keeps public course feeds fresh and clean.
- **CURRENT SYSTEM DEFAULT:** Single start date constraint (`startDate: DateTime`). Manual provider publication toggle (`publishToCourses`).
- **WHAT MUST BE DECIDED:** Automatic expiration countdown rules for courses after start date.
- **RECOMMENDED OWNER:** Product Manager

---

## 5. Attachment Size Limits & Retention Policies
- **DECISION:** File attachment size limits and retention lifecycle.
- **CURRENT STATUS:** `BUSINESS DECISION REQUIRED`
- **WHY IT MATTERS:** Controls storage cost and prevents server memory exhaustion.
- **CURRENT SYSTEM DEFAULT:** Attachment metadata validation active. Maximum 10MB per file recommendation.
- **WHAT MUST BE DECIDED:** Storage quota per role and retention window (e.g. 30 days vs 90 days).
- **RECOMMENDED OWNER:** Infrastructure Lead
