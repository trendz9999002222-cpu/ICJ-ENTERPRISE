# System Baseline Document
**ICJ Enterprise Platform — Comprehensive System Architecture & Specs**
**Date:** August 7, 2026

---

## 1. System Inventory & Specifications

- **Application Name:** ICJ Enterprise Platform
- **Version Tag:** `v1.0-pre-production`
- **Core Runtime:** Node.js v20.x+ & Vite v8.1.5
- **UI Framework:** React 19 + Material-UI v9.2.0
- **Database Engine:** PostgreSQL 15+ & Prisma ORM v5.22.0
- **Client Cache Store:** Browser LocalStorage / IndexedDB Fallback
- **Build Tooling:** Vite + Rollup Manual Vendor Chunking

---

## 2. Route & Component Architecture Baseline

- **Total App Routes:** 45 (100% Governed)
- **Protected Routes:** 42 (Protected via `ProtectedRoute.jsx`)
- **Public Routes:** 3 (`/login`, `/register` -> redirect, `/recovery`)
- **Primary Enterprise Modules:** 16 Modules
- **UI Components:** 27 Decoupled Sub-Components

---

## 3. Security & Governance Baseline

- **Secret Masking:** 100% (`••••••••`)
- **Environment Key Storage:** `.env` & `apiKeyVault.js`
- **Authentication:** Argon2 / SHA-256 Hashing with Force Password Change
- **Governance Self-Registration:** `scripts/validate_governance.mjs`

---

*Document finalized for ICJ Enterprise Platform v1.0 Pre-Production.*
