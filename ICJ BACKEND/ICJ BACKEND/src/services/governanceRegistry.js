/**
 * ICJ ENTERPRISE PLATFORM — ENTERPRISE CORE GOVERNANCE FRAMEWORK
 * Phase 12.1 Permanent Governance Registry & Auto-Discovery Engine
 */

const GOVERNANCE_REGISTRY_KEY = "icj_enterprise_governance_registry";

export const MASTER_ENTERPRISE_CATALOG = [
  { id: "mod_dashboard", name: "Super Admin Dashboard", category: "Core", route: "/", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_membership", name: "Master Membership Engine", category: "Membership", route: "/membership", roleAccess: ["admin", "employee"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_legal", name: "Master Legal Registry", category: "Legal", route: "/legal", roleAccess: ["admin", "employee"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_advocate", name: "Enterprise Advocate Centre", category: "Legal", route: "/advocate-dashboard", roleAccess: ["admin", "employee"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_client", name: "Client Command Portal", category: "Client", route: "/client-portal", roleAccess: ["admin", "member", "client"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_calendar", name: "Court Cause List Calendar", category: "Legal", route: "/court-calendar", roleAccess: ["admin", "employee", "member"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_ai_drafter", name: "16-Template AI Legal Drafter", category: "AI & Legal", route: "/ai-drafter", roleAccess: ["admin", "employee", "member"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_finance", name: "Finance, Accounts & Wallet", category: "Finance", route: "/wallet", roleAccess: ["admin", "employee"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_analytics", name: "Reports & AI Analytics", category: "Analytics", route: "/reports", roleAccess: ["admin", "employee"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_documents", name: "Master Digital Vault", category: "Vault", route: "/documents", roleAccess: ["admin", "employee", "member"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_notifications", name: "Notification Centre", category: "Core", route: "/notifications", roleAccess: ["admin", "employee", "member", "client"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_administration", name: "System Administration", category: "Core", route: "/administration", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_settings", name: "Master Enterprise Settings", category: "Core", route: "/settings", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_database", name: "PostgreSQL Database Engine", category: "Infrastructure", route: "/database-config", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_governance", name: "Enterprise Governance Center", category: "Governance", route: "/governance-center", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_api_config", name: "Enterprise API Configuration Center", category: "Infrastructure", route: "/api-config", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_deployment_center", name: "Enterprise Deployment Center", category: "Infrastructure", route: "/deployment-center", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
  { id: "mod_system_health", name: "Enterprise System Health Dashboard", category: "Infrastructure", route: "/system-health", roleAccess: ["admin"], visibility: "Visible", auditEnabled: true, searchIndexed: true, featureFlag: "Active", version: "v3.2.0" },
];

export class GovernanceRegistry {
  static getModules() {
    try {
      const raw = localStorage.getItem(GOVERNANCE_REGISTRY_KEY);
      return raw ? JSON.parse(raw) : MASTER_ENTERPRISE_CATALOG;
    } catch {
      return MASTER_ENTERPRISE_CATALOG;
    }
  }

  static autoRegister(componentDef) {
    const modules = this.getModules();
    const exists = modules.find((m) => m.id === componentDef.id || m.route === componentDef.route);
    if (exists) {
      return this.updateModule(exists.id, componentDef);
    }

    const newModule = {
      id: componentDef.id || `mod_${Date.now()}`,
      name: componentDef.name,
      category: componentDef.category || "Custom",
      route: componentDef.route,
      roleAccess: componentDef.roleAccess || ["admin"],
      visibility: "Visible",
      auditEnabled: true,
      searchIndexed: true,
      featureFlag: "Active",
      version: "v3.2.0-auto-discovered",
      registeredAt: new Date().toISOString(),
    };

    modules.push(newModule);
    localStorage.setItem(GOVERNANCE_REGISTRY_KEY, JSON.stringify(modules));
    return newModule;
  }

  static updateModule(id, updates) {
    const modules = this.getModules();
    const index = modules.findIndex((m) => m.id === id);
    if (index === -1) return null;

    modules[index] = { ...modules[index], ...updates };
    localStorage.setItem(GOVERNANCE_REGISTRY_KEY, JSON.stringify(modules));
    return modules[index];
  }

  static toggleFeatureFlag(id) {
    const modules = this.getModules();
    const index = modules.findIndex((m) => m.id === id);
    if (index === -1) return null;

    modules[index].featureFlag = modules[index].featureFlag === "Active" ? "Disabled" : "Active";
    localStorage.setItem(GOVERNANCE_REGISTRY_KEY, JSON.stringify(modules));
    return modules[index];
  }
}
