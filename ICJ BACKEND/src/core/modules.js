// ======================================================
// ICJ Enterprise Platform
// Core Module Registry
// Version : 1.0.0
// ======================================================

const Modules = [
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Core",
    route: "/dashboard",
    icon: "dashboard",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 1,
    version: "1.0.0",
    permissions: ["dashboard.view"],
  },

  {
    id: "membership",
    name: "Membership Management",
    category: "Core",
    route: "/membership",
    icon: "groups",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 2,
    version: "1.0.0",
    permissions: [
      "member.view",
      "member.create",
      "member.edit",
      "member.delete",
      "member.grade",
      "member.award",
      "member.wallet",
      "member.token",
      "member.report",
    ],
  },

  {
    id: "identity",
    name: "Digital Identity",
    category: "Core",
    route: "/identity",
    icon: "badge",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 3,
    version: "1.0.0",
    permissions: [
      "identity.view",
      "identity.create",
      "identity.edit",
    ],
  },

  {
    id: "wallet",
    name: "Community Wallet",
    category: "Finance",
    route: "/wallet",
    icon: "account_balance_wallet",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 4,
    version: "1.0.0",
    permissions: [
      "wallet.view",
      "wallet.credit",
      "wallet.debit",
      "wallet.transfer",
    ],
  },

  {
    id: "finance",
    name: "Finance Overview",
    category: "Finance",
    route: "/finance",
    icon: "account_balance_wallet",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 5,
    version: "1.0.0",
    permissions: [
      "finance.view",
      "finance.report",
    ],
  },

  {
    id: "token",
    name: "Community Token",
    category: "Finance",
    route: "/token",
    icon: "token",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 6,
    version: "1.0.0",
    permissions: [
      "token.issue",
      "token.transfer",
      "token.redeem",
      "token.report",
    ],
  },

  {
    id: "donation",
    name: "Donation Management",
    category: "Finance",
    route: "/donation",
    icon: "volunteer_activism",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 7,
    version: "1.0.0",
    permissions: [
      "donation.view",
      "donation.create",
      "donation.approve",
      "donation.report",
    ],
  },

  {
    id: "legal",
    name: "Legal Services",
    category: "Legal",
    route: "/legal",
    icon: "gavel",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 8,
    version: "1.0.0",
    permissions: [
      "legal.view",
      "legal.create",
      "legal.edit",
    ],
  },

  {
    id: "documents",
    name: "Document Vault",
    category: "Documents",
    route: "/documents",
    icon: "folder",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 9,
    version: "1.0.0",
    permissions: [
      "document.view",
      "document.upload",
      "document.download",
    ],
  },

  {
    id: "ai",
    name: "AI Assistant",
    category: "AI",
    route: "/ai",
    icon: "smart_toy",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 10,
    version: "1.0.0",
    permissions: ["ai.use"],
  },

  {
    id: "research",
    name: "Research",
    category: "Research",
    route: "/research",
    icon: "science",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 11,
    version: "1.0.0",
    permissions: ["research.view"],
  },

  {
    id: "settings",
    name: "Settings",
    category: "System",
    route: "/settings",
    icon: "settings",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 99,
    version: "1.0.0",
    permissions: ["settings.manage"],
  },

  {
    id: "administration",
    name: "Administration",
    category: "System",
    route: "/administration",
    icon: "settings",
    enabled: true,
    sidebar: true,
    dashboard: true,
    searchable: true,
    order: 100,
    version: "1.0.0",
    permissions: [
      "admin.view",
      "admin.users.manage",
      "admin.audit.view",
    ],
  },
];

// ==========================
// Helper Functions
// ==========================

export const getAllModules = () => Modules;

export const getEnabledModules = () =>
  Modules.filter((module) => module.enabled);

export const getSidebarModules = () =>
  Modules.filter((module) => module.enabled && module.sidebar);

export const getDashboardModules = () =>
  Modules.filter((module) => module.dashboard);

export const getModuleById = (id) =>
  Modules.find((module) => module.id === id);

export default Modules;