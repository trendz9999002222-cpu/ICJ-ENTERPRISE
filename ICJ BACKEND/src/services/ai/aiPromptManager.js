import { readJson, writeJson } from "./aiStorage";

const STORAGE_KEY = "icj_ai_prompts";

const DEFAULT_PROMPTS = [
  {
    id: "pr-membership-summary",
    name: "Membership Summary Template",
    moduleId: "membership",
    promptText: "Generate a structured summary using member records, verification status and membership level.",
    tags: ["membership", "summary"],
    status: "Active",
  },
  {
    id: "pr-finance-summary",
    name: "Finance Snapshot Template",
    moduleId: "finance",
    promptText: "Generate a concise snapshot using transactions, income, expenses, and outstanding items.",
    tags: ["finance", "snapshot"],
    status: "Active",
  },
  {
    id: "pr-wallet-summary",
    name: "Wallet Position Template",
    moduleId: "wallet",
    promptText: "Generate wallet position summary using balances, status, and member linkage.",
    tags: ["wallet", "balance"],
    status: "Active",
  },
  {
    id: "pr-legal-summary",
    name: "Legal Case Review Template",
    moduleId: "legal",
    promptText: "Generate timeline-style summary using case number, stage, status and next hearing date.",
    tags: ["legal", "timeline"],
    status: "Active",
  },
  {
    id: "pr-documents-summary",
    name: "Document Compliance Template",
    moduleId: "documents",
    promptText: "Generate inventory summary by category, status, and owner.",
    tags: ["documents", "compliance"],
    status: "Active",
  },
  {
    id: "pr-reports-summary",
    name: "Reports Consolidation Template",
    moduleId: "reports",
    promptText: "Generate module-wise KPI summary for selected date range and filters.",
    tags: ["reports", "kpi"],
    status: "Active",
  },
];

const readPrompts = () => {
  const rows = readJson(STORAGE_KEY, null);
  if (Array.isArray(rows) && rows.length > 0) return rows;
  writeJson(STORAGE_KEY, DEFAULT_PROMPTS);
  return DEFAULT_PROMPTS;
};

const nextId = () => `pr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const AIPromptManager = {
  getAll() {
    return readPrompts();
  },

  getByModule(moduleId) {
    return readPrompts().filter((item) => item.moduleId === moduleId);
  },

  create(payload = {}) {
    const name = String(payload.name || "").trim();
    const promptText = String(payload.promptText || "").trim();
    const moduleId = String(payload.moduleId || "").trim();

    if (!name) throw new Error("Prompt name is required.");
    if (!promptText) throw new Error("Prompt text is required.");
    if (!moduleId) throw new Error("Module is required.");

    const current = readPrompts();
    const item = {
      id: nextId(),
      name,
      moduleId,
      promptText,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    writeJson(STORAGE_KEY, [item, ...current]);
    return item;
  },

  update(id, values = {}) {
    const current = readPrompts();
    const next = current.map((item) =>
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

  remove(id) {
    const current = readPrompts();
    const next = current.filter((item) => item.id !== id);
    writeJson(STORAGE_KEY, next);
  },
};

export default AIPromptManager;
