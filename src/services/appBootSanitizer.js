/**
 * ICJ ENTERPRISE PLATFORM — BOOT SANITIZER V50
 * Root Cause Zero-Defect Startup Cleaner & Immutable Virgin State Engine
 * Runs automatically on application startup (main.jsx).
 */

import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

const VIRGIN_PURGE_KEY = "icj_virgin_state_2026_v51_PURE_7_AUTHENTIC_USERS";

const KEYS_TO_SANITIZE = [
  "icj_members",
  "icj_enterprise_users",
  "icj_wallets",
  "icj_tokens",
  "icj_donations",
  "icj_legal_cases",
  "icj_legal_cases_v2",
  "icj_documents",
  "icj_notifications",
  "icj_reports",
  "icj_settings",
  "icj_pinned_notes",
  "icj_communication_history",
  "icj_case_timelines",
  "icj_court_hearings",
  "icj_advocates",
  "icj_court_orders",
  "icj_invoices",
  "icj_trust_approvals",
  "icj_ai_drafts",
  "icj_case_memory_vault",
  "icj_citizen_active_case",
  "icj_franchise_applications",
  "icj_virtual_offices",
  "icj_ai_legal_consultations",
  "icj_client_messages",
];

const DUMMY_MEMBER_IDS = [
  "26ADM08AA0002",
  "26ICJ08AA0003",
  "26ICJ08AA0004",
  "26ICJ08AA0005",
  "26ICJ08AA0006",
  "26ICJ08AA0007",
  "ICJ-2026-DOC-9801",
  "ICJ-2026-DOC-9802",
  "ICJ/CS/2026/1001",
  "FRAN-2026-001",
  "ICJ-2026-INV-1001",
];

export const AppBootSanitizer = {
  run() {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      const currentVer = localStorage.getItem("icj_purge_version");

      if (currentVer !== VIRGIN_PURGE_KEY) {
        console.warn(`[AppBootSanitizer V50] Executing Full Virgin Purge (Previous: ${currentVer}) -> ${VIRGIN_PURGE_KEY}`);

        // 1. Clear target residual keys
        KEYS_TO_SANITIZE.forEach((key) => {
          localStorage.removeItem(key);
        });

        // 2. Write pristine seed user (1 Super Admin only)
        localStorage.setItem("icj_enterprise_users", JSON.stringify(ENTERPRISE_SEED_USERS));
        localStorage.setItem("icj_members", JSON.stringify(ENTERPRISE_SEED_USERS));
        localStorage.setItem("icj_purge_version", VIRGIN_PURGE_KEY);

        console.info("[AppBootSanitizer V50] Pure Virgin State Initialized Successfully. 1 Super Admin active.");
      } else {
        // 3. Secondary defensive sanitizer: check & remove any dummy member IDs if found in storage
        const rawMembers = localStorage.getItem("icj_members");
        if (rawMembers) {
          try {
            const list = JSON.parse(rawMembers);
            if (Array.isArray(list)) {
              const sanitized = list.filter((m) => {
                const id = m.member_id || m.id;
                return !DUMMY_MEMBER_IDS.includes(id);
              });
              if (sanitized.length !== list.length) {
                localStorage.setItem("icj_members", JSON.stringify(sanitized.length > 0 ? sanitized : ENTERPRISE_SEED_USERS));
                localStorage.setItem("icj_enterprise_users", JSON.stringify(sanitized.length > 0 ? sanitized : ENTERPRISE_SEED_USERS));
              }
            }
          } catch (e) {
            console.error("[AppBootSanitizer V50] Error parsing members:", e);
          }
        }

        // Automatic ID Migration for Pawan Gupta (Advocate ID #2: 26ICJ08AA0002)
        const currentMembersRaw = localStorage.getItem("icj_members");
        if (currentMembersRaw) {
          try {
            const list = JSON.parse(currentMembersRaw);
            let modified = false;
            const updated = list.map((m) => {
              if (
                (m?.fullName?.toUpperCase().includes("PAWAN") || m?.email === "advocate9999002222@gmail.com" || String(m?.mobile || "").includes("9999002222")) &&
                (m?.member_id === "26ICJ08AA0001" || m?.id === "26ICJ08AA0001")
              ) {
                modified = true;
                return {
                  ...m,
                  id: "26ICJ08AA0002",
                  member_id: "26ICJ08AA0002",
                  memberId: "26ICJ08AA0002",
                  username: "26ICJ08AA0002",
                };
              }
              return m;
            });
            if (modified) {
              localStorage.setItem("icj_members", JSON.stringify(updated));
              localStorage.setItem("icj_enterprise_users", JSON.stringify(updated));
              const currentUser = localStorage.getItem("icj_user");
              if (currentUser) {
                const u = JSON.parse(currentUser);
                if (u?.member_id === "26ICJ08AA0001" || u?.email === "advocate9999002222@gmail.com") {
                  localStorage.setItem("icj_user", JSON.stringify({
                    ...u,
                    id: "26ICJ08AA0002",
                    member_id: "26ICJ08AA0002",
                    memberId: "26ICJ08AA0002",
                    username: "26ICJ08AA0002",
                  }));
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("[AppBootSanitizer V50] Sanitization warning:", err);
    }
  },
};

export default AppBootSanitizer;
