import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_request_history";

const cap = (rows, max = 1000) => rows.slice(0, max);

const AIRequestHistory = {
  getAll() {
    return readJson(STORAGE_KEY, []);
  },

  create(entry = {}) {
    const rows = this.getAll();
    const record = {
      id: `air-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      moduleId: entry.moduleId || "global",
      provider: entry.provider || "internal-foundation",
      promptId: entry.promptId || "",
      promptText: entry.promptText || "",
      status: entry.status || "PENDING",
      actorRole: entry.actorRole || "system",
      response: entry.response || "",
      error: entry.error || "",
      durationMs: Number(entry.durationMs || 0),
    };

    writeJson(STORAGE_KEY, cap([record, ...rows]));
    return record;
  },

  update(id, values = {}) {
    const rows = this.getAll();
    const next = rows.map((item) =>
      item.id === id
        ? {
            ...item,
            ...values,
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    writeJson(STORAGE_KEY, next);
    return next.find((item) => item.id === id) || null;
  },

  clear() {
    writeJson(STORAGE_KEY, []);
  },
};

export default AIRequestHistory;
