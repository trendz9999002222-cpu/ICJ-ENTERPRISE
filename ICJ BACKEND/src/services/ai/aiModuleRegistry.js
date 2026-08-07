import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_module_registry";

const DEFAULT_MODULES = [
  {
    id: "membership",
    name: "Membership",
    enabled: true,
    bridgeKey: "membershipBridgeEnabled",
    contextSchema: ["memberId", "memberType", "verificationStatus"],
  },
  {
    id: "finance",
    name: "Finance",
    enabled: true,
    bridgeKey: "financeBridgeEnabled",
    contextSchema: ["voucherNo", "amount", "type", "mode"],
  },
  {
    id: "wallet",
    name: "Wallet",
    enabled: true,
    bridgeKey: "walletBridgeEnabled",
    contextSchema: ["walletId", "memberId", "balance", "currency"],
  },
  {
    id: "token",
    name: "Token",
    enabled: true,
    bridgeKey: "tokenBridgeEnabled",
    contextSchema: ["tokenNo", "amount", "operationType"],
  },
  {
    id: "legal",
    name: "Legal",
    enabled: true,
    bridgeKey: "legalBridgeEnabled",
    contextSchema: ["caseNumber", "status", "nextHearing"],
  },
  {
    id: "documents",
    name: "Documents",
    enabled: true,
    bridgeKey: "documentsBridgeEnabled",
    contextSchema: ["documentNo", "category", "owner"],
  },
  {
    id: "reports",
    name: "Reports",
    enabled: true,
    bridgeKey: "reportsBridgeEnabled",
    contextSchema: ["moduleKey", "dateRange", "recordCount"],
  },
  {
    id: "dashboard",
    name: "Dashboard",
    enabled: true,
    bridgeKey: null,
    contextSchema: ["kpi", "value", "timestamp"],
  },
];

const readModules = () => {
  const existing = readJson(STORAGE_KEY, null);
  if (Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  writeJson(STORAGE_KEY, DEFAULT_MODULES);
  return DEFAULT_MODULES;
};

const AIModuleRegistry = {
  getAll() {
    return readModules();
  },

  getById(moduleId) {
    return readModules().find((module) => module.id === moduleId) || null;
  },

  update(moduleId, values = {}) {
    const rows = readModules();
    const next = rows.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            ...values,
            enabled: values.enabled === undefined ? module.enabled : Boolean(values.enabled),
            updatedAt: new Date().toISOString(),
          }
        : module
    );
    writeJson(STORAGE_KEY, next);
    return next.find((module) => module.id === moduleId) || null;
  },
};

export default AIModuleRegistry;
