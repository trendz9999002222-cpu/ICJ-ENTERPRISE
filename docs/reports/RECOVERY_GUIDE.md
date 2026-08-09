# Disaster Recovery Guide
**ICJ Enterprise Platform — System Recovery & Emergency Procedures**
**Date:** August 7, 2026

---

## 1. Disaster Recovery Overview

This guide outlines step-by-step instructions to restore the ICJ Enterprise Platform to its certified `v1.0-pre-production` baseline in the event of environment corruption, server crash, or hardware failure.

---

## 2. Emergency Recovery Steps

### Step 1: Clone or Checkout Certified Baseline
```bash
git checkout tags/v1.0-pre-production -b recovery-v1.0
```

### Step 2: Clear Stale Build & Package Caches
```powershell
Remove-Item -Recurse -Force node_modules/.vite, dist -ErrorAction SilentlyContinue
```

### Step 3: Re-install Dependencies & Environment Variables
```bash
npm install
cp .env.example .env
# Edit .env with valid production database credentials
```

### Step 4: Verify Governance & Route Auto-Registration
```bash
node scripts/validate_governance.mjs
```

### Step 5: Execute Hard Production Build
```bash
npm run build
```

---

## 3. Recovery Verification Matrix

- [x] `node scripts/validate_governance.mjs` returns `🟢 100% GOVERNANCE VALIDATED`.
- [x] `npm run build` exits with code 0 (`✓ built in ~4s`).
- [x] Local server starts cleanly via `npm run dev` at `http://localhost:5173/`.

---

*Guide generated for ICJ Enterprise Platform v1.0 Pre-Production Baseline.*
