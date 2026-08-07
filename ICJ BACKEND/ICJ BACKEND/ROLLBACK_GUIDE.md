# System Rollback Guide
**ICJ Enterprise Platform — Version Rollback Procedures**
**Date:** August 7, 2026

---

## 1. Rollback Policy & Scope

This rollback guide defines how to safely revert production or staging environments to the pre-production baseline `v1.0-pre-production` or a previous git commit without data corruption.

---

## 2. Emergency Rollback Commands

### Rollback to Tag `v1.0-pre-production`
```bash
# 1. Stash or discard uncommitted changes
git reset --hard HEAD
git clean -fd

# 2. Revert workspace to release tag
git checkout tags/v1.0-pre-production

# 3. Clean Vite build cache
powershell -Command "Remove-Item -Recurse -Force node_modules/.vite, dist -ErrorAction SilentlyContinue"

# 4. Verify build & governance
npm run build
node scripts/validate_governance.mjs
```

---

## 3. Database Migration Rollback

If database migrations were executed:
```bash
npx prisma migrate status
npx prisma db push --force-reset
```

---

*Guide generated for ICJ Enterprise Platform v1.0 Pre-Production Baseline.*
