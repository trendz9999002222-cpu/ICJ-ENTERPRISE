/**
 * UNIVERSAL 5-COLOR PERMISSION CLASSIFICATION CONSTANTS
 */
export const UNIVERSAL_PERMISSION_COLORS = {
  FREQUENT: {
    code: "FREQUENT",
    label: "Frequent / Operational",
    hex: "#10b981", // Green
    chipColor: "success",
    badgeIcon: "🟢",
    description: "Daily work, active cases, today's hearings, client operations",
  },
  NORMAL: {
    code: "NORMAL",
    label: "Normal / Functional",
    hex: "#f97316", // Orange
    chipColor: "warning",
    badgeIcon: "🟠",
    description: "Reports, secondary workflows, general administration",
  },
  CRITICAL: {
    code: "CRITICAL",
    label: "Critical / Restricted",
    hex: "#ef4444", // Red
    chipColor: "error",
    badgeIcon: "🔴",
    description: "Security, Role & Permission Management, System Configuration, Access Control",
  },
  SYSTEM: {
    code: "SYSTEM",
    label: "System / Reference",
    hex: "#3b82f6", // Blue
    chipColor: "info",
    badgeIcon: "🔵",
    description: "System info, Help, Documentation, Reference data",
  },
  FINANCE: {
    code: "FINANCE",
    label: "Finance / Payment",
    hex: "#8b5cf6", // Violet
    chipColor: "secondary",
    badgeIcon: "🟣",
    description: "Payments, Transactions, Wallet, Accounts, Billing, Refunds",
  },
};

const Modules = [
  // ─── GROUP A: ACTIVE MEMBER MODULES ─────────────────────────────────────────
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Core",
    group: "A",
    route: "/",
    icon: "dashboard",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "membership",
    name: "Membership Engine",
    category: "Membership",
    group: "A",
    route: "/membership",
    icon: "groups",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 2,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view", "create", "edit", "delete"],
  },
  {
    id: "member-directory",
    name: "Member Directory",
    category: "Membership",
    group: "A",
    route: "/member-directory",
    icon: "badge",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 2.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "member-verification",
    name: "Member Verification",
    category: "Membership",
    group: "A",
    route: "/member-verification",
    icon: "how_to_reg",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 2.2,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view", "edit"],
  },
  {
    id: "member-profile",
    name: "Member Profile",
    category: "Membership",
    group: "A",
    route: "/member-profile",
    icon: "badge",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 2.3,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.NORMAL,
    version: "1.0.0",
    permissions: ["view", "edit"],
  },

  // LEGAL & ADVOCACY (MEMBER DATA FLOW)
  {
    id: "legal",
    name: "Legal Registry",
    category: "Legal",
    group: "A",
    route: "/legal",
    icon: "gavel",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view", "create", "edit", "delete"],
  },
  {
    id: "advocate-dashboard",
    name: "Advocate Centre",
    category: "Legal",
    group: "A",
    route: "/advocate-dashboard",
    icon: "gavel",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "client-portal",
    name: "Client Portal",
    category: "Legal",
    group: "A",
    route: "/client-portal",
    icon: "folder",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3.2,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "court-calendar",
    name: "Court Calendar",
    category: "Legal",
    group: "A",
    route: "/court-calendar",
    icon: "dashboard",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3.4,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },

  // AI & INTELLIGENCE (MEMBER DATA FLOW)
  {
    id: "ai-drafter",
    name: "AI Legal Drafter",
    category: "AI",
    group: "A",
    route: "/ai-drafter",
    icon: "smart_toy",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 4,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.SYSTEM,
    version: "1.0.0",
    permissions: ["view"],
  },

  // FINANCE & WALLET (MEMBER DATA FLOW)
  {
    id: "billing",
    name: "Billing & Revenue",
    category: "Finance",
    group: "A",
    route: "/billing",
    icon: "receipt_long",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 5,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FINANCE,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "finance",
    name: "Finance & Wallet",
    category: "Finance",
    group: "A",
    route: "/finance",
    icon: "account_balance_wallet",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 5.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FINANCE,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "payment-management",
    name: "Payment Management",
    category: "Finance",
    group: "A",
    route: "/payment-management",
    icon: "account_balance_wallet",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 5.2,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FINANCE,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "token",
    name: "Token Governance",
    category: "Finance",
    group: "A",
    route: "/token",
    icon: "savings",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 5.3,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FINANCE,
    version: "1.0.0",
    permissions: ["view"],
  },

  // DOCUMENTS & REPOSITORY (MEMBER DATA FLOW)
  {
    id: "documents",
    name: "Document Vault",
    category: "Core",
    group: "A",
    route: "/documents",
    icon: "folder",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 6,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view", "upload", "delete"],
  },

  // ─── GROUP B: UNFROZEN TECHNICAL INFRASTRUCTURE ─────────────────────────────
  {
    id: "trust-dashboard",
    name: "Trust Executive",
    category: "Legal",
    group: "B",
    route: "/trust-dashboard",
    icon: "account_balance_wallet",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3.3,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.FREQUENT,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "ai",
    name: "AI Assistant",
    category: "AI",
    group: "B",
    route: "/ai",
    icon: "smart_toy",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 4.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.SYSTEM,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "research",
    name: "Research Engine",
    category: "Research",
    group: "B",
    route: "/research",
    icon: "science",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 6.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.SYSTEM,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "administration",
    name: "Administration Desk",
    category: "Admin",
    group: "B",
    route: "/administration",
    icon: "admin_panel_settings",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "governance-center",
    name: "Governance Center",
    category: "Admin",
    group: "B",
    route: "/governance-center",
    icon: "verified_user",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "location-master",
    name: "Location Master",
    category: "Admin",
    group: "B",
    route: "/location-master",
    icon: "location_on",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.2,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.NORMAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "database-config",
    name: "Database Config",
    category: "Admin",
    group: "B",
    route: "/database-config",
    icon: "storage",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.3,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "api-config",
    name: "API Gateway & Config",
    category: "Admin",
    group: "B",
    route: "/api-config",
    icon: "api",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.4,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "deployment-center",
    name: "Deployment Center",
    category: "Admin",
    group: "B",
    route: "/deployment-center",
    icon: "cloud_upload",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.5,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "system-health",
    name: "System Health & Metrics",
    category: "Admin",
    group: "B",
    route: "/system-health",
    icon: "monitor_heart",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7.6,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.SYSTEM,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "reports",
    name: "Reports Registry",
    category: "Analytics",
    group: "B",
    route: "/reports",
    icon: "assessment",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 8,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.NORMAL,
    version: "1.0.0",
    permissions: ["view", "create"],
  },
  {
    id: "activity-log",
    name: "Activity & Audit Log",
    category: "Analytics",
    group: "B",
    route: "/activity-log",
    icon: "history",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 8.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.NORMAL,
    version: "1.0.0",
    permissions: ["view"],
  },
  {
    id: "settings",
    name: "System Settings",
    category: "System",
    group: "B",
    route: "/settings",
    icon: "settings",
    enabled: true,
    sidebar: true,
    dashboard: false,
    searchable: false,
    order: 9,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.CRITICAL,
    version: "1.0.0",
    permissions: ["view", "admin"],
  },
  {
    id: "notifications",
    name: "Notifications",
    category: "System",
    group: "B",
    route: "/notifications",
    icon: "notifications",
    enabled: true,
    sidebar: true,
    dashboard: false,
    searchable: false,
    order: 9.1,
    colorClassification: UNIVERSAL_PERMISSION_COLORS.SYSTEM,
    version: "1.0.0",
    permissions: ["view"],
  },
];

export const getAllModules = () => Modules;
export const getEnabledModules = () => Modules.filter((m) => m.enabled);
export const getSidebarModules = () => Modules.filter((m) => m.enabled && m.sidebar);
export const getGroupAModules = () => Modules.filter((m) => m.enabled && m.group === "A");
export const getGroupBModules = () => Modules.filter((m) => m.enabled && m.group === "B");
export const getDashboardModules = () => Modules.filter((m) => m.enabled && m.dashboard);
export const getSearchModules = () => Modules.filter((m) => m.enabled && m.searchable);
export const getModuleById = (id) => Modules.find((m) => m.id === id);

/**
 * ROLE-BASED INTELLIGENT MODULE ORDERING LOGIC
 * Combines Operational Relevancy (#1, #2, #3 daily workflow) with Strict Color Safety Hierarchy:
 * 🟢 GREEN (Safe / Operational) -> Weight 1 (TOP)
 * 🔵 BLUE (System / Reference) -> Weight 2
 * 🟣 VIOLET (Finance / Payments) -> Weight 3
 * 🟠 ORANGE (Normal / Functional Admin) -> Weight 4
 * 🔴 RED (Critical / Security / Restricted) -> Weight 5 (STRICTLY LAST AT VERY BOTTOM)
 */
export const COLOR_SAFETY_WEIGHTS = {
  FREQUENT: 1, // 🟢 Green
  SYSTEM: 2,   // 🔵 Blue
  FINANCE: 3,  // 🟣 Violet
  NORMAL: 4,   // 🟠 Orange
  CRITICAL: 5, // 🔴 Red (Strictly at very bottom)
};

export const ROLE_MODULE_PRIORITY = {
  client: [
    "dashboard", "client-portal", "member-directory", "documents",
    "court-calendar", "ai-drafter", "notifications", "finance",
    "member-profile"
  ],
  advocate: [
    "advocate-dashboard", "legal", "member-directory", "court-calendar",
    "member-verification", "ai-drafter", "research", "documents",
    "trust-dashboard", "reports", "member-profile"
  ],
  admin: [
    "dashboard", "member-directory", "member-verification",
    "legal", "documents", "payment-management", "billing",
    "reports", "administration", "settings"
  ],
  super_admin: [
    "super-admin-dashboard", "member-directory", "legal",
    "documents", "payment-management", "token", "billing",
    "reports", "activity-log", "administration", "governance-center",
    "api-config", "database-config", "deployment-center", "settings"
  ]
};

export const getRoleOrderedModules = (roleKey = "member") => {
  const normalized = String(roleKey).toLowerCase();
  let priorityList = ROLE_MODULE_PRIORITY[normalized];
  if (!priorityList) {
    if (normalized.includes("super")) priorityList = ROLE_MODULE_PRIORITY.super_admin;
    else if (normalized.includes("admin")) priorityList = ROLE_MODULE_PRIORITY.admin;
    else if (normalized.includes("advocate")) priorityList = ROLE_MODULE_PRIORITY.advocate;
    else priorityList = ROLE_MODULE_PRIORITY.client;
  }

  const enabled = getEnabledModules();

  return [...enabled].sort((a, b) => {
    // Primary Sort: Color Safety Hierarchy (Green 1 -> Blue 2 -> Violet 3 -> Orange 4 -> Red 5)
    const colorWeightA = COLOR_SAFETY_WEIGHTS[a.colorClassification?.code || "FREQUENT"] || 1;
    const colorWeightB = COLOR_SAFETY_WEIGHTS[b.colorClassification?.code || "FREQUENT"] || 1;

    if (colorWeightA !== colorWeightB) {
      return colorWeightA - colorWeightB;
    }

    // Secondary Sort: Role Operational Relevancy Index (#1, #2, #3 daily workflow)
    const idxA = priorityList.indexOf(a.id);
    const idxB = priorityList.indexOf(b.id);
    const posA = idxA !== -1 ? idxA : 999;
    const posB = idxB !== -1 ? idxB : 999;

    if (posA !== posB) {
      return posA - posB;
    }

    return (a.order || 99) - (b.order || 99);
  });
};

export default Modules;