import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_feature_flags";

const DEFAULT_FLAGS = {
  aiFoundationEnabled: true,
  requestHistoryEnabled: true,
  promptManagerEnabled: true,
  providerSwitchingEnabled: true,
  moduleRegistrationEnabled: true,
  membershipBridgeEnabled: true,
  financeBridgeEnabled: true,
  walletBridgeEnabled: true,
  tokenBridgeEnabled: true,
  legalBridgeEnabled: true,
  documentsBridgeEnabled: true,
  reportsBridgeEnabled: true,
};

const AIFeatureFlags = {
  getAll() {
    return {
      ...DEFAULT_FLAGS,
      ...(readJson(STORAGE_KEY, {}) || {}),
    };
  },

  setFlag(key, value) {
    const current = this.getAll();
    const next = {
      ...current,
      [key]: Boolean(value),
      updatedAt: new Date().toISOString(),
    };
    writeJson(STORAGE_KEY, next);
    return next;
  },

  saveAll(values = {}) {
    const next = {
      ...this.getAll(),
      ...values,
      updatedAt: new Date().toISOString(),
    };
    writeJson(STORAGE_KEY, next);
    return next;
  },
};

export default AIFeatureFlags;
