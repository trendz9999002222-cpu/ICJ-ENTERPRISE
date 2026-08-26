/**
 * SafeDelegationGuardService — ICJ Enterprise Platform
 * Safe Admin Role Delegation Guardrails & Sandbox Permission Engine
 *
 * Core Principle:
 * Prevents accidental or unauthorized delegation of Root Master Powers (Database Wipe,
 * Financial Payouts, Root Keys) while allowing granular delegation of safe sub-powers.
 */

const STORAGE_KEY = "icj_safe_delegations_registry_v1";

export const PERMISSION_SCOPES = [
  {
    id: "SCOPE_MEMBER_VERIFY",
    name: "सदस्य सत्यापन व ई-KYC (Member KYC Verification)",
    desc: "मुवक्किलों व वकीलों के अपलोड किए गए पहचान पत्रों की जांच व स्वीकृति।",
    isDestructive: false,
  },
  {
    id: "SCOPE_CATEGORY_ENROLL",
    name: "42-कैटेगरी रजिस्ट्रेशन नियंत्रण (Category Switchboard)",
    desc: "पब्लिक रजिस्ट्रेशन फॉर्म में श्रेणियों को खोलना या बंद करना।",
    isDestructive: false,
  },
  {
    id: "SCOPE_AUDIT_LOG_VIEW",
    name: "सुरक्षा ऑडिट लॉग अवलोकन (Read-Only Audit Logs)",
    desc: "सुरक्षा घटनाओं, लॉगिन हिस्ट्री व टेलीमेट्री डेटा को देखना।",
    isDestructive: false,
  },
  {
    id: "SCOPE_SUPPORT_TICKETS",
    name: "हेल्पडेस्क टिकट समाधान (Helpdesk Operations)",
    desc: "मुवक्किलों की सहायता टिकटों का उत्तर देना।",
    isDestructive: false,
  },
  {
    id: "SCOPE_STATUTORY_AUDIT",
    name: "विधिक कंप्लायंस समीक्षा (Statutory Compliance Review)",
    desc: "IT एक्ट धारा 79 व DPDP एक्ट के अनुपालन की जांच करना।",
    isDestructive: false,
  },
  // ROOT RESTRICTED POWERS (LOCKED TO SUPER ADMIN ONLY)
  {
    id: "SCOPE_ROOT_DATABASE_RESET",
    name: "डेटाबेस रीसेट / डिलीट (Database Wipe / Reset)",
    desc: "संपूर्ण डेटाबेस को रीसेट या क्लीन करना। (केवल सुप्रीम एडमिन हेतु आरक्षित)",
    isDestructive: true,
  },
  {
    id: "SCOPE_FINANCIAL_DISBURSEMENT",
    name: "मास्टर वॉलेट व वित्तीय संवितरण (Master Financial Gate)",
    desc: "ट्रस्ट फंड्स का ट्रांसफर व बैंक संवितरण। (केवल सुप्रीम एडमिन हेतु आरक्षित)",
    isDestructive: true,
  },
  {
    id: "SCOPE_TIME_MACHINE_ROLLBACK",
    name: "8-दिवसीय टाइम मशीन रोलबैक (System Disaster Rollback)",
    desc: "पूरे सिस्टम को पिछले दिनों की स्थिति में वापस ले जाना। (केवल सुप्रीम एडमिन हेतु आरक्षित)",
    isDestructive: true,
  },
];

let inMemoryStore = null;

export const SafeDelegationGuardService = {
  /**
   * Get all active delegations
   */
  getDelegations() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } else if (inMemoryStore) {
        return inMemoryStore;
      }
    } catch {}

    const defaultList = [
      {
        id: "DEL-001",
        delegateId: "26ADM08AA0007",
        delegateName: "ICJ Operations Admin",
        delegateEmail: "admin.operations@icj.org",
        assignedRoleTitle: "Operations & KYC Officer",
        grantedScopes: ["SCOPE_MEMBER_VERIFY", "SCOPE_SUPPORT_TICKETS", "SCOPE_AUDIT_LOG_VIEW"],
        delegatedBy: "26SAD08AA0001 (Super Admin)",
        delegatedAt: "2026-08-10T10:00:00.000Z",
        status: "ACTIVE",
      },
    ];
    inMemoryStore = defaultList;
    return defaultList;
  },

  /**
   * Safely delegate sub-powers ensuring destructive root powers CANNOT be delegated
   */
  createDelegation({ delegateId, delegateName, delegateEmail, assignedRoleTitle, requestedScopes = [] }) {
    // SECURITY GUARDRAIL: Automatically strip out any destructive scopes!
    const safeScopes = requestedScopes.filter((scopeId) => {
      const found = PERMISSION_SCOPES.find((s) => s.id === scopeId);
      return found && !found.isDestructive;
    });

    const newDelegation = {
      id: `DEL-${Date.now()}`,
      delegateId,
      delegateName,
      delegateEmail,
      assignedRoleTitle: assignedRoleTitle || "Authorized Operations Specialist",
      grantedScopes: safeScopes,
      delegatedBy: "26SAD08AA0001 (Hon'ble Super Admin)",
      delegatedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    const list = this.getDelegations();
    const updated = [newDelegation, ...list.filter((d) => d.delegateId !== delegateId)];
    inMemoryStore = updated;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}

    return {
      success: true,
      delegation: newDelegation,
      strippedDestructiveScopesCount: requestedScopes.length - safeScopes.length,
    };
  },

  /**
   * Revoke delegation
   */
  revokeDelegation(delegationId) {
    const list = this.getDelegations();
    const updated = list.filter((d) => d.id !== delegationId);
    inMemoryStore = updated;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
    return true;
  },

  /**
   * Check if a user has a specific permission
   */
  hasPermission(userId, scopeId) {
    if (userId === "26SAD08AA0001") return true; // Super Admin has all powers
    const delegations = this.getDelegations();
    const userDel = delegations.find((d) => d.delegateId === userId && d.status === "ACTIVE");
    return userDel ? userDel.grantedScopes.includes(scopeId) : false;
  },
};

export default SafeDelegationGuardService;
