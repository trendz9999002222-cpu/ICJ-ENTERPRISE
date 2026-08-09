# ICJ ENTERPRISE PLATFORM — MASTER POLICY & SYSTEM RULES

1. **Single Source of Truth:** `ICJ_MASTER_PROJECT_STATUS.md` must be loaded before performing any task.
2. **Zero Redesign:** Production-ready modules must never be rewritten or redesigned.
3. **No Duplicate Code:** Always extend existing implementations and reuse established service layers (`LegalEcosystemService.js`, `PaymentBillingService.js`, `aiCoreEngine.js`, `database.js`).
4. **Dual Resilience:** Maintain Supabase PostgreSQL + LocalStorage 2000ms race condition timeout fallback across all data access.
5. **Incremental Memory Update:** Update all 7 memory files and create a Git commit after completing any implementation.
