import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_logs";

const cap = (rows, max = 1000) => rows.slice(0, max);

const AILogger = {
  getAll() {
    return readJson(STORAGE_KEY, []);
  },

  add(entry = {}) {
    const rows = this.getAll();
    const next = cap([
      {
        id: `ail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        level: entry.level || "info",
        action: entry.action || "event",
        moduleId: entry.moduleId || "global",
        message: entry.message || "",
        actorRole: entry.actorRole || "system",
        metadata: entry.metadata || null,
      },
      ...rows,
    ]);
    writeJson(STORAGE_KEY, next);
    return next[0];
  },

  clear() {
    writeJson(STORAGE_KEY, []);
  },
};

export default AILogger;
