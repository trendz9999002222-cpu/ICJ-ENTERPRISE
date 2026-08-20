/**
 * ICJ ENTERPRISE PLATFORM — DYNAMIC ENTERPRISE GOVERNANCE ENGINE
 * Phase 12.2 — Complete Governance Service Layer
 * Extends Phase 12.1 GovernanceRegistry
 */

import { GovernanceRegistry, MASTER_ENTERPRISE_CATALOG } from "./governanceRegistry";

// ─────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────
const KEYS = {
  MODULE_STATE:    "icj_gov_module_state",
  MENU_CONFIG:     "icj_gov_menu_config",
  BUTTON_CONFIG:   "icj_gov_button_config",
  FIELD_CONFIG:    "icj_gov_field_config",
  ROLE_MATRIX:     "icj_gov_role_matrix",
  FEATURE_FLAGS:   "icj_gov_feature_flags",
  DASHBOARD_CARDS: "icj_gov_dashboard_cards",
  SECURITY:        "icj_gov_security",
  AUDIT_LOG:       "icj_gov_audit_log",
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function load(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────
// PHASE A — MODULE CONTROL
// ─────────────────────────────────────────────────────────────
const DEFAULT_MODULE_STATES = MASTER_ENTERPRISE_CATALOG.reduce((acc, m) => {
  acc[m.id] = {
    id: m.id,
    name: m.name,
    route: m.route,
    category: m.category,
    enabled: true,
    visible: true,
    locked: false,
    maintenance: false,
  };
  return acc;
}, {});

export const ModuleControl = {
  getAll() {
    return load(KEYS.MODULE_STATE, DEFAULT_MODULE_STATES);
  },
  update(id, patch) {
    const state = this.getAll();
    const old = { ...state[id] };
    state[id] = { ...state[id], ...patch };
    save(KEYS.MODULE_STATE, state);
    GovernanceAudit.log({ action: "MODULE_UPDATE", target: id, old, newVal: state[id] });
    return state[id];
  },
  toggle(id, field) {
    const state = this.getAll();
    if (!state[id]) return null;
    const old = state[id][field];
    state[id][field] = !state[id][field];
    save(KEYS.MODULE_STATE, state);
    GovernanceAudit.log({ action: `MODULE_TOGGLE_${field.toUpperCase()}`, target: id, old, newVal: state[id][field] });
    return state[id];
  },
  autoRegisterModule(def) {
    const state = this.getAll();
    if (!state[def.id]) {
      state[def.id] = {
        id: def.id,
        name: def.name,
        route: def.route || "",
        category: def.category || "Custom",
        enabled: true,
        visible: true,
        locked: false,
        maintenance: false,
      };
      save(KEYS.MODULE_STATE, state);
      GovernanceRegistry.autoRegister(def);
    }
    return state[def.id];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE B — MENU CONTROL
// ─────────────────────────────────────────────────────────────
export const DEFAULT_MENU_CONFIG = [
  { id: "menu_dashboard",       label: "Dashboard",          icon: "Dashboard",      location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
  { id: "menu_membership",      label: "Membership",         icon: "Group",          location: "sidebar", visible: true, enabled: true, roles: ["admin","employee"] },
  { id: "menu_legal",           label: "Legal Registry",     icon: "Gavel",          location: "sidebar", visible: true, enabled: true, roles: ["admin","employee"] },
  { id: "menu_advocate",        label: "Advocate Centre",    icon: "AccountBalance", location: "sidebar", visible: true, enabled: true, roles: ["admin","employee"] },
  { id: "menu_client",          label: "Client Portal",      icon: "Person",         location: "sidebar", visible: true, enabled: true, roles: ["admin","member","client"] },
  { id: "menu_calendar",        label: "Court Calendar",     icon: "CalendarMonth",  location: "sidebar", visible: true, enabled: true, roles: ["admin","employee","member"] },
  { id: "menu_ai_drafter",      label: "AI Legal Drafter",   icon: "AutoAwesome",    location: "sidebar", visible: true, enabled: true, roles: ["admin","employee","member"] },
  { id: "menu_finance",         label: "Finance & Wallet",   icon: "AccountBalance", location: "sidebar", visible: true, enabled: true, roles: ["admin","employee"] },
  { id: "menu_reports",         label: "Reports",            icon: "BarChart",       location: "sidebar", visible: true, enabled: true, roles: ["admin","employee"] },
  { id: "menu_documents",       label: "Document Vault",     icon: "Folder",         location: "sidebar", visible: true, enabled: true, roles: ["admin","employee","member"] },
  { id: "menu_notifications",   label: "Notifications",      icon: "Notifications",  location: "sidebar", visible: true, enabled: true, roles: ["admin","employee","member","client"] },
  { id: "menu_settings",        label: "Settings",           icon: "Settings",       location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
  { id: "menu_administration",  label: "Administration",     icon: "ManageAccounts", location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
  { id: "menu_governance",      label: "Governance Center",  icon: "Security",       location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
  { id: "menu_database",        label: "Database Engine",    icon: "Storage",        location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
  { id: "menu_api_config",      label: "API Configuration",  icon: "SettingsInputAntenna", location: "sidebar", visible: true, enabled: true, roles: ["admin"] },
];

export const MenuControl = {
  getAll() { return load(KEYS.MENU_CONFIG, DEFAULT_MENU_CONFIG); },
  update(id, patch) {
    const menus = this.getAll();
    const idx = menus.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const old = { ...menus[idx] };
    menus[idx] = { ...menus[idx], ...patch };
    save(KEYS.MENU_CONFIG, menus);
    GovernanceAudit.log({ action: "MENU_UPDATE", target: id, old, newVal: menus[idx] });
    return menus[idx];
  },
  toggle(id, field) {
    const menus = this.getAll();
    const idx = menus.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const old = menus[idx][field];
    menus[idx][field] = !menus[idx][field];
    save(KEYS.MENU_CONFIG, menus);
    GovernanceAudit.log({ action: `MENU_TOGGLE_${field.toUpperCase()}`, target: id, old, newVal: menus[idx][field] });
    return menus[idx];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE C — BUTTON CONTROL
// ─────────────────────────────────────────────────────────────
export const DEFAULT_BUTTON_CONFIG = [
  "Add", "Edit", "Delete", "Save", "Print", "Export", "Import",
  "Approve", "Reject", "Upload", "Download", "Share",
  "Payment", "Wallet", "AI_Action",
].map(id => ({
  id: `btn_${id.toLowerCase()}`,
  label: id.replace(/_/g, " "),
  visible: true,
  enabled: true,
  roles: ["admin"],
}));

export const ButtonControl = {
  getAll() { return load(KEYS.BUTTON_CONFIG, DEFAULT_BUTTON_CONFIG); },
  toggle(id, field) {
    const btns = this.getAll();
    const idx = btns.findIndex(b => b.id === id);
    if (idx === -1) return null;
    const old = btns[idx][field];
    btns[idx][field] = !btns[idx][field];
    save(KEYS.BUTTON_CONFIG, btns);
    GovernanceAudit.log({ action: `BTN_TOGGLE_${field.toUpperCase()}`, target: id, old, newVal: btns[idx][field] });
    return btns[idx];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE D — FIELD GOVERNANCE
// ─────────────────────────────────────────────────────────────
export const DEFAULT_FIELD_CONFIG = [
  "full_name","email","mobile","role","status","membership_id",
  "aadhar","pan","gstin","address","case_title","case_type","court",
  "judge_bench","filing_date","amount","wallet_balance",
].map(id => ({
  id: `field_${id}`,
  label: id.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),
  visible: true,
  editable: true,
  mandatory: false,
  readOnly: false,
  defaultValue: "",
  validation: "",
  roleVisibility: ["admin","employee"],
}));

export const FieldControl = {
  getAll() { return load(KEYS.FIELD_CONFIG, DEFAULT_FIELD_CONFIG); },
  update(id, patch) {
    const fields = this.getAll();
    const idx = fields.findIndex(f => f.id === id);
    if (idx === -1) return null;
    const old = { ...fields[idx] };
    fields[idx] = { ...fields[idx], ...patch };
    save(KEYS.FIELD_CONFIG, fields);
    GovernanceAudit.log({ action: "FIELD_UPDATE", target: id, old, newVal: fields[idx] });
    return fields[idx];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE E — ROLE MATRIX
// ─────────────────────────────────────────────────────────────
const ROLES = ["super_admin","admin","advocate","client","member","finance","auditor","guest","read_only"];
const PERMISSIONS = ["view","create","update","delete","export","print","approve","reject","ai","finance","documents","reports"];

function buildDefaultMatrix() {
  const matrix = {};
  ROLES.forEach(role => {
    matrix[role] = {};
    PERMISSIONS.forEach(perm => {
      matrix[role][perm] = role === "super_admin" || role === "admin";
    });
  });
  // Fine-grained defaults
  ["advocate"].forEach(r => { matrix[r].view = true; matrix[r].create = true; matrix[r].update = true; matrix[r].documents = true; });
  ["client","member"].forEach(r => { matrix[r].view = true; matrix[r].documents = true; });
  ["finance"].forEach(r => { matrix[r].view = true; matrix[r].finance = true; matrix[r].reports = true; matrix[r].export = true; });
  ["auditor"].forEach(r => { matrix[r].view = true; matrix[r].reports = true; matrix[r].export = true; matrix[r].print = true; });
  return matrix;
}

export const RoleMatrix = {
  ROLES,
  PERMISSIONS,
  getMatrix() { return load(KEYS.ROLE_MATRIX, buildDefaultMatrix()); },
  toggle(role, permission) {
    const matrix = this.getMatrix();
    const old = matrix[role]?.[permission];
    if (!matrix[role]) matrix[role] = {};
    matrix[role][permission] = !matrix[role][permission];
    save(KEYS.ROLE_MATRIX, matrix);
    GovernanceAudit.log({ action: "ROLE_MATRIX_TOGGLE", target: `${role}.${permission}`, old, newVal: matrix[role][permission] });
    return matrix[role][permission];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE F — FEATURE FLAGS
// ─────────────────────────────────────────────────────────────
const DEFAULT_FEATURE_FLAGS = [
  { id: "ff_ai",               label: "AI Legal Drafter",    enabled: true,  category: "AI" },
  { id: "ff_wallet",           label: "Digital Wallet",       enabled: true,  category: "Finance" },
  { id: "ff_finance",          label: "Finance & Accounts",   enabled: true,  category: "Finance" },
  { id: "ff_court_calendar",   label: "Court Calendar",       enabled: true,  category: "Legal" },
  { id: "ff_reports",          label: "Reports & Analytics",  enabled: true,  category: "Analytics" },
  { id: "ff_notifications",    label: "Notifications",        enabled: true,  category: "Communication" },
  { id: "ff_email",            label: "Email Gateway",        enabled: true,  category: "Communication" },
  { id: "ff_sms",              label: "SMS Gateway",          enabled: false, category: "Communication" },
  { id: "ff_whatsapp",         label: "WhatsApp Gateway",     enabled: false, category: "Communication" },
  { id: "ff_payment",          label: "Payment Gateway",      enabled: true,  category: "Finance" },
  { id: "ff_ocr",              label: "OCR Document Scan",    enabled: true,  category: "AI" },
  { id: "ff_digital_sign",     label: "Digital Signature",    enabled: true,  category: "Legal" },
  { id: "ff_api",              label: "Public API Access",    enabled: false, category: "Infrastructure" },
  { id: "ff_search",           label: "Global Search",        enabled: true,  category: "Core" },
  { id: "ff_analytics",        label: "Business Analytics",   enabled: true,  category: "Analytics" },
  { id: "ff_api_config",       label: "API Configuration Center", enabled: true, category: "Infrastructure" },
];

export const FeatureFlagEngine = {
  getAll() { return load(KEYS.FEATURE_FLAGS, DEFAULT_FEATURE_FLAGS); },
  toggle(id) {
    const flags = this.getAll();
    const idx = flags.findIndex(f => f.id === id);
    if (idx === -1) return null;
    const old = flags[idx].enabled;
    flags[idx].enabled = !flags[idx].enabled;
    save(KEYS.FEATURE_FLAGS, flags);
    GovernanceAudit.log({ action: "FEATURE_FLAG_TOGGLE", target: id, old, newVal: flags[idx].enabled });
    return flags[idx];
  },
  isEnabled(id) {
    return this.getAll().find(f => f.id === id)?.enabled ?? true;
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE G — DASHBOARD CARD CONTROL
// ─────────────────────────────────────────────────────────────
const DEFAULT_DASHBOARD_CARDS = [
  { id: "card_members",    label: "Total Members",       visible: true,  showChart: true },
  { id: "card_advocates",  label: "Total Advocates",     visible: true,  showChart: true },
  { id: "card_cases",      label: "Total Cases",         visible: true,  showChart: true },
  { id: "card_hearings",   label: "Today's Hearings",    visible: true,  showChart: false },
  { id: "card_revenue",    label: "Revenue",             visible: true,  showChart: true },
  { id: "card_documents",  label: "Documents",           visible: true,  showChart: false },
  { id: "card_wallet",     label: "Wallet Balance",      visible: true,  showChart: true },
  { id: "card_pending",    label: "Pending Approvals",   visible: true,  showChart: false },
  { id: "card_online",     label: "Online Users",        visible: true,  showChart: false },
  { id: "card_ai",         label: "AI Actions Today",    visible: true,  showChart: true },
];

export const DashboardControl = {
  getAll() { return load(KEYS.DASHBOARD_CARDS, DEFAULT_DASHBOARD_CARDS); },
  toggle(id, field) {
    const cards = this.getAll();
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const old = cards[idx][field];
    cards[idx][field] = !cards[idx][field];
    save(KEYS.DASHBOARD_CARDS, cards);
    GovernanceAudit.log({ action: `DASHBOARD_TOGGLE_${field.toUpperCase()}`, target: id, old, newVal: cards[idx][field] });
    return cards[idx];
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE H — SYSTEM SECURITY
// ─────────────────────────────────────────────────────────────
const DEFAULT_SECURITY = {
  maintenanceMode:   false,
  readOnlyMode:      false,
  copyRestriction:   false,
  printRestriction:  false,
  exportRestriction: false,
  sessionTimeoutMin: 60,
  ipRestriction:     false,
  allowedIPs:        "",
  deviceRestriction: false,
};

export const SecurityControl = {
  get() { return load(KEYS.SECURITY, DEFAULT_SECURITY); },
  update(patch) {
    const old = this.get();
    const updated = { ...old, ...patch };
    save(KEYS.SECURITY, updated);
    GovernanceAudit.log({ action: "SECURITY_UPDATE", target: "system_security", old, newVal: updated });
    return updated;
  },
  toggle(field) {
    const cfg = this.get();
    const old = cfg[field];
    cfg[field] = !cfg[field];
    save(KEYS.SECURITY, cfg);
    GovernanceAudit.log({ action: `SECURITY_TOGGLE_${field.toUpperCase()}`, target: field, old, newVal: cfg[field] });
    return cfg;
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE I — AUDIT ENGINE
// ─────────────────────────────────────────────────────────────
export const GovernanceAudit = {
  log({ action, target, old, newVal, user = "Super Admin" }) {
    const logs = load(KEYS.AUDIT_LOG, []);
    const entry = {
      id: `audit_${Date.now()}`,
      action,
      target,
      user,
      oldValue: JSON.stringify(old),
      newValue: JSON.stringify(newVal),
      timestamp: now(),
      canRollback: true,
    };
    logs.unshift(entry);
    save(KEYS.AUDIT_LOG, logs.slice(0, 500)); // Keep last 500 entries
    return entry;
  },
  getAll() { return load(KEYS.AUDIT_LOG, []); },
  rollback(auditId) {
    const logs = this.getAll();
    const entry = logs.find(l => l.id === auditId);
    if (!entry) return null;
    // Mark rolled back
    const idx = logs.findIndex(l => l.id === auditId);
    logs[idx].rolledBack = true;
    logs[idx].rolledBackAt = now();
    save(KEYS.AUDIT_LOG, logs);
    return entry;
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE J — AUTO REGISTRATION HOOK
// ─────────────────────────────────────────────────────────────
export function autoRegisterComponent(def) {
  ModuleControl.autoRegisterModule(def);
  GovernanceAudit.log({ action: "AUTO_REGISTER", target: def.id || def.name, old: null, newVal: def });
  return def;
}
