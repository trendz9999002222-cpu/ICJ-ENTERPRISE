# ICJ ENTERPRISE PLATFORM — COPILOT MASTER POLICY & GOVERNANCE FRAMEWORK

=======================================================================
SINGLE SOURCE OF TRUTH (MANDATORY)
=======================================================================

0. **MASTER WORKSPACE (CONFIRMED BY USER):**
   - `C:\Users\Pawan\OneDrive\Desktop\ICJ DEVELOPMENT\ICJ BACKEND\ICJ BACKEND`
   - This is the ONLY authoritative working directory for all development, testing, builds, and deployments.
   - The outer parent folder `C:\Users\Pawan\OneDrive\Desktop\ICJ DEVELOPMENT\ICJ BACKEND` is a wrapper directory only — NOT the active project.
   - All operations must be performed within the Master Workspace path above.

1. **Active Development Server Rule (DYNAMIC DETECTION MANDATORY):**
   - NEVER assume or hardcode any fixed port (e.g. 5173, 5174, 5175).
   - Before every browser test, build verification, or live audit:
     1. Read the running Vite terminal output to find the current `Local:` URL.
     2. Probe that URL via HTTP GET to confirm it is alive and responding.
     3. Use ONLY the confirmed live URL for all subsequent tests.
   - The active port may be 5173, 5174, 5175, or any other — accept whatever Vite reports.
   - If multiple ports are responding, use the one matching the Master Workspace (Rule 0).
   - Log the detected URL as: `[ACTIVE SERVER DETECTED] http://localhost:<port>/` before every test run.

2. **Master Policy Directives:**
   - Obey `MASTER_POLICY.md`, `ICJ_MASTER_PROJECT_STATUS.md`, `ICJ_BUSINESS_RULES.md`, `ICJ_CHANGELOG.md`, `ICJ_VERSION_HISTORY.md`, `ICJ_TECHNICAL_DEBT.md`, `ICJ_NEXT_PRIORITY.md`, and `ICJ_RELEASE_NOTES.md` as the permanent Single Source of Truth.
   - Never redesign completed production-ready modules.
   - Maintain backward compatibility across all APIs and routes.
   - Extend existing service layers (`MemberService.js`, `ConsentService.js`, `LocationService.js`, `database.js`).

3. **Membership Portal Status:**
   - `src/components/member-registration/*` is currently in **Temporary Governance Hold Mode** for ongoing feature completion until explicit restore command is received.
   - All other platform modules remain in **Locked Master Governance Mode**.

4. **Git Repository:**
   - Repository Root: `C:\Users\Pawan\OneDrive\Desktop\ICJ DEVELOPMENT\ICJ BACKEND`
   - Active Branch: `ai-policy-system`
   - All commits must target this branch from within the Master Workspace.
