import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_configuration";

const DEFAULT_AI_CONFIGURATION = {
  enabled: true,
  defaultProvider: "internal-foundation",
  requestTimeoutMs: 15000,
  maxPromptLength: 4000,
  retentionDays: 90,
  redactSensitiveFields: true,
  providers: {
    "internal-foundation": {
      enabled: true,
      mode: "foundation",
      endpoint: "",
      apiKeyConfigured: false,
    },
  },
};

const AIConfiguration = {
  get() {
    return {
      ...DEFAULT_AI_CONFIGURATION,
      ...(readJson(STORAGE_KEY, {}) || {}),
      providers: {
        ...DEFAULT_AI_CONFIGURATION.providers,
        ...(readJson(STORAGE_KEY, {})?.providers || {}),
      },
    };
  },

  save(values = {}) {
    const current = this.get();
    const next = {
      ...current,
      ...values,
      providers: {
        ...current.providers,
        ...(values.providers || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    writeJson(STORAGE_KEY, next);
    return next;
  },
};

export default AIConfiguration;
