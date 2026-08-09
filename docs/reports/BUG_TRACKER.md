# Enterprise Bug Tracker Report
**ICJ Enterprise Platform — Defect Classification & Risk Matrix**
**Date:** August 7, 2026

---

## 1. Defect Classification Summary

- **P1 – Critical Defects:** 0
- **P2 – High Priority Defects:** 1
- **P3 – Medium Priority Defects:** 3
- **P4 – Low Priority Defects:** 1
- **Total Tracked Defects:** 5

---

## 2. Detailed Bug Tracker Log

### Bug #1: Monolithic Bundle Size / Absence of Dynamic Code Splitting (P2 – High)
- **Module Name:** Core Architecture / Router
- **Screen Name:** All Screens (`AppRouter`)
- **Reproduction Steps:**
  1. Open terminal in workspace root.
  2. Execute `npm run build`.
  3. Observe build output logs.
- **Expected Result:** Application routes are split dynamically via `React.lazy()`, producing bundle chunks under 500 kB.
- **Actual Result:** Vite outputs a single monolithic JavaScript bundle chunk `dist/assets/index-C0LFVU-H.js` (1.31 MB minified / 350.86 kB gzip) with a chunk size warning.
- **Root Cause:** All 45 route page components in `src/router/index.jsx` are statically imported (`import Home from "../components/Home"`).
- **Recommended Fix:** Refactor route imports in `src/router/index.jsx` to use `React.lazy(() => import("./pages/..."))` and wrap `<Routes>` in `<Suspense fallback={<LoadingSpinner />}>`.
- **Estimated Risk:** High load times on slow mobile networks; increased Largest Contentful Paint (LCP).

---

### Bug #2: SMS Gateway Feature Flag Disabled by Default (P3 – Medium)
- **Module Name:** Infrastructure / Communication
- **Screen Name:** API Configuration Center (`/api-config`)
- **Reproduction Steps:**
  1. Login as Admin.
  2. Navigate to `/api-config`.
  3. Inspect SMS Gateway provider item.
- **Expected Result:** SMS Gateway active with provider credentials configured.
- **Actual Result:** `ff_sms` feature flag is set to `enabled: false` by default.
- **Root Cause:** Phase 13.1 security boundary awaiting SMS provider API key population in host `.env`.
- **Recommended Fix:** Populate `SMS_API_KEY` and `SMS_SENDER_ID` in production `.env` and enable flag in `/governance-center`.
- **Estimated Risk:** Medium — SMS OTP fallback to email notifications until credentials configured.

---

### Bug #3: WhatsApp Gateway Feature Flag Disabled by Default (P3 – Medium)
- **Module Name:** Infrastructure / Communication
- **Screen Name:** API Configuration Center (`/api-config`)
- **Reproduction Steps:**
  1. Login as Admin.
  2. Navigate to `/api-config`.
  3. Inspect WhatsApp Business API item.
- **Expected Result:** Meta WhatsApp Business API active.
- **Actual Result:** `ff_whatsapp` feature flag is set to `enabled: false` by default.
- **Root Cause:** Phase 13.1 security boundary awaiting Meta Access Token in `.env`.
- **Recommended Fix:** Populate `WA_ACCESS_TOKEN` and `WA_PHONE_NUMBER_ID` in production `.env`.
- **Estimated Risk:** Medium — WhatsApp notifications fall back to in-app Notification Centre.

---

### Bug #4: Public REST API Access Disabled by Default (P3 – Medium)
- **Module Name:** Infrastructure / Security
- **Screen Name:** Governance Center / API Config (`/governance-center`)
- **Reproduction Steps:**
  1. Inspect `FeatureFlagEngine.getAll()`.
  2. Check status of `ff_api`.
- **Expected Result:** Public REST endpoints active for external integrations.
- **Actual Result:** `ff_api` is set to `enabled: false`.
- **Root Cause:** Infrastructure security boundary protecting public REST endpoints prior to cloud key deployment.
- **Recommended Fix:** Enable `ff_api` in `FeatureFlagEngine` once OAuth keys & Rate Limiting rules are deployed.
- **Estimated Risk:** Low — External third-party REST API integrations disabled until cloud launch.

---

### Bug #5: Browser LocalStorage State Reset Dependency (P4 – Low)
- **Module Name:** Governance & Infrastructure Service
- **Screen Name:** Governance Center & API Config Center
- **Reproduction Steps:**
  1. Open DevTools -> Application -> Local Storage.
  2. Clear all storage keys (`icj_infra_providers`, `icj_gov_menu_config`).
  3. Refresh the page.
- **Expected Result:** Platform re-hydrates default state seamlessly from backend API.
- **Actual Result:** Configuration resets to initial static array defaults (`DEFAULT_MENU_CONFIG`, `MASTER_ENTERPRISE_CATALOG`).
- **Root Cause:** Client-side fallback state relies on local storage keys when backend API endpoints are offline.
- **Recommended Fix:** Connect `InfraService` and `GovernanceRegistry` to backend database API endpoints (`/api/v1/governance`).
- **Estimated Risk:** Low — Static fallback arrays ensure UI remains functional without crashing.

---

*Report generated automatically during Enterprise Defect & Risk Audit.*
