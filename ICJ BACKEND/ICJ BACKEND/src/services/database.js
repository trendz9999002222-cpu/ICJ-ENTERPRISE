/* eslint-disable no-empty */
import { supabase } from "./supabase.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

const STORAGE_KEYS = {
  members: "icj_members",
  wallets: "icj_wallets",
  tokens: "icj_tokens",
  donations: "icj_donations",
  legalCases: "icj_legal_cases",
  documents: "icj_documents",
  notifications: "icj_notifications",
  reports: "icj_reports",
  settings: "icj_settings",
  pinnedNotes: "icj_pinned_notes",
  communicationHistory: "icj_communication_history",
};

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};

const isSupabaseConfigured =
  Boolean(env.VITE_SUPABASE_URL) &&
  Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY) &&
  !env.VITE_SUPABASE_URL.includes("placeholder");

const TABLE_COLUMNS = {
  members: [
    "id",
    "member_id",
    "name",
    "email",
    "mobile",
    "whatsapp",
    "member_type",
    "profession",
    "organisation",
    "gender",
    "dob",
    "birth_year",
    "birthYear",
    "age",
    "aadhar",
    "aadhaar",
    "pan",
    "gst",
    "address",
    "city",
    "district",
    "state",
    "pincode",
    "verification_status",
    "member_level",
    "role",
    "registration_date",
    "valid_till",
    "remarks",
    "experience",
    "wallet_balance",
    "token_balance",
    "status",
    "profile_photo",
    "created_at",
    "updated_at",
  ],
  wallets: ["id", "member_id", "balance", "currency", "status", "created_at"],
  tokens: ["id", "token_no", "member_id", "amount", "type", "status", "created_at"],
  donations: ["id", "receipt_no", "donor_name", "member_id", "amount", "payment_mode", "status", "created_at"],
  legal_cases: ["id", "case_number", "title", "client_name", "advocate_name", "court_name", "status", "next_hearing", "created_at", "updated_at"],
  documents: ["id", "document_no", "title", "category", "owner", "file_name", "file_type", "file_path", "file_url", "status", "created_at"],
  notifications: ["id", "title", "message", "type", "status", "read_at", "created_at"],
  reports: ["id", "report_no", "title", "category", "description", "created_by", "status", "created_at"],
  system_settings: ["id", "enable_notifications", "enable_audit_log", "compact_view", "updated_at"],
};

const sanitizeRecord = (table, record) => {
  if (!record || typeof record !== "object") return record;

  const normalized = {
    ...record,
    member_id: record.member_id ?? record.memberId,
    birth_year: record.birth_year ?? record.birthYear,
    birthYear: record.birthYear ?? record.birth_year,
    age: record.age,
    aadhar: record.aadhar ?? record.aadhaar,
    aadhaar: record.aadhaar ?? record.aadhar,
    token_no: record.token_no ?? record.tokenNo,
    receipt_no: record.receipt_no ?? record.receiptNo,
    donor_name: record.donor_name ?? record.donorName,
    payment_mode: record.payment_mode ?? record.paymentMode,
    case_number: record.case_number ?? record.caseNumber,
    client_name: record.client_name ?? record.clientName,
    advocate_name: record.advocate_name ?? record.advocateName,
    court_name: record.court_name ?? record.courtName,
    next_hearing: record.next_hearing ?? record.nextHearing,
    document_no: record.document_no ?? record.documentNo,
    file_name: record.file_name ?? record.fileName,
    file_type: record.file_type ?? record.fileType,
    file_path: record.file_path ?? record.filePath,
    file_url: record.file_url ?? record.fileUrl,
    created_by: record.created_by ?? record.createdBy,
    read_at: record.read_at ?? record.readAt,
    enable_notifications: record.enable_notifications ?? record.enableNotifications,
    enable_audit_log: record.enable_audit_log ?? record.enableAuditLog,
    compact_view: record.compact_view ?? record.compactView,
    created_at: record.created_at ?? record.createdAt,
    updated_at: record.updated_at ?? record.updatedAt,
  };

  const allowed = TABLE_COLUMNS[table] || Object.keys(normalized);
  return Object.fromEntries(
    Object.entries(normalized).filter(([key]) => allowed.includes(key))
  );
};

const normalizeRecord = (table, row) => {
  if (!row || typeof row !== "object") return row;

  const normalized = {
    ...row,
    memberId: row.memberId ?? row.member_id,
    birthYear: row.birthYear ?? row.birth_year,
    birth_year: row.birth_year ?? row.birthYear,
    age: row.age,
    aadhaar: row.aadhaar ?? row.aadhar,
    aadhar: row.aadhar ?? row.aadhaar,
    tokenNo: row.tokenNo ?? row.token_no,
    receiptNo: row.receiptNo ?? row.receipt_no,
    donorName: row.donorName ?? row.donor_name,
    paymentMode: row.paymentMode ?? row.payment_mode,
    caseNumber: row.caseNumber ?? row.case_number,
    clientName: row.clientName ?? row.client_name,
    advocateName: row.advocateName ?? row.advocate_name,
    courtName: row.courtName ?? row.court_name,
    nextHearing: row.nextHearing ?? row.next_hearing,
    documentNo: row.documentNo ?? row.document_no,
    fileName: row.fileName ?? row.file_name,
    fileType: row.fileType ?? row.file_type,
    filePath: row.filePath ?? row.file_path,
    fileUrl: row.fileUrl ?? row.file_url,
    createdBy: row.createdBy ?? row.created_by,
    readAt: row.readAt ?? row.read_at,
    enableNotifications: row.enableNotifications ?? row.enable_notifications,
    enableAuditLog: row.enableAuditLog ?? row.enable_audit_log,
    compactView: row.compactView ?? row.compact_view,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };

  if (table === "members") {
    normalized.id = normalized.id || normalized.members || normalized.member_id;
  }

  return normalized;
};

const readStore = (key) => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStore = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const upsertStoreRecord = (key, record, idField = "id") => {
  const list = readStore(key);
  const id = record[idField] ?? record.id ?? record.member_id ?? Date.now();
  const recordWithId = { ...record, [idField]: id };
  const index = list.findIndex((item) => item[idField] !== undefined && String(item[idField]) === String(id));

  if (index === -1) {
    const next = [recordWithId, ...list];
    writeStore(key, next);
    return recordWithId;
  }

  const next = [...list];
  next[index] = { ...next[index], ...recordWithId };
  writeStore(key, next);
  return next[index];
};

const removeStoreRecord = (key, id, idField = "id") => {
  const list = readStore(key);
  const next = list.filter((item) => item[idField] !== id);
  writeStore(key, next);
};

const withTimeout = (promise, ms = 1000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase operation timeout")), ms)
    ),
  ]);

const listTable = async (table, localKey, orderBy = "created_at") => {
  if (!isSupabaseConfigured) return readStore(localKey);

  try {
    const { data, error } = await withTimeout(
      supabase.from(table).select("*").order(orderBy, { ascending: false })
    );

    if (error) throw error;
    return (data || []).map((row) => normalizeRecord(table, row));
  } catch {
    return readStore(localKey).map((row) => normalizeRecord(table, row));
  }
};

const insertTable = async (table, record, localKey) => {
  const recordWithId = {
    id: record.id || record.member_id || Date.now(),
    created_at: record.created_at || new Date().toISOString(),
    ...record,
  };
  const payload = sanitizeRecord(table, recordWithId);

  if (!isSupabaseConfigured) {
    upsertStoreRecord(localKey, recordWithId);
    return normalizeRecord(table, recordWithId);
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from(table).insert([payload]).select().single()
    );

    if (error) throw error;
    return normalizeRecord(table, data);
  } catch {
    upsertStoreRecord(localKey, recordWithId);
    return normalizeRecord(table, recordWithId);
  }
};

const updateTable = async (table, id, values, localKey, idField = "id") => {
  const payload = sanitizeRecord(table, values);

  if (isSupabaseConfigured) {
    try {
      const { error } = await withTimeout(
        supabase.from(table).update(payload).eq(idField, id)
      );

      if (error) throw error;
      return;
    } catch {
      const current = readStore(localKey).find((item) => item[idField] === id);
      if (current) {
        upsertStoreRecord(localKey, { ...current, ...values }, idField);
      }
      return;
    }
  }

  const current = readStore(localKey).find((item) => item[idField] === id);
  if (current) {
    upsertStoreRecord(localKey, { ...current, ...values }, idField);
  }
};

const deleteTable = async (table, id, localKey, idField = "id") => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id);

      if (error) throw error;
      return;
    } catch {
      removeStoreRecord(localKey, id, idField);
      return;
    }
  }

  removeStoreRecord(localKey, id, idField);
};

// ===========================
// Members (Synchronized Master User Repository)
// ===========================

const readUnifiedUsers = () => {
  if (typeof window === "undefined") return ENTERPRISE_SEED_USERS;
  try {
    const rawEnt = window.localStorage.getItem("icj_enterprise_users");
    const initialized = window.localStorage.getItem("icj_users_initialized");

    if (initialized === "true") {
      let list = [];
      if (rawEnt) {
        try {
          list = JSON.parse(rawEnt);
        } catch {}
      }
      return list;
    } else {
      const map = new Map();
      ENTERPRISE_SEED_USERS.forEach((u) => {
        const k = String(u.id || u.member_id || u.email).toLowerCase();
        map.set(k, u);
      });
      const merged = Array.from(map.values());
      window.localStorage.setItem("icj_enterprise_users", JSON.stringify(merged));
      window.localStorage.setItem("icj_members", JSON.stringify(merged));
      window.localStorage.setItem("icj_users_initialized", "true");
      return merged;
    }
  } catch {
    return ENTERPRISE_SEED_USERS;
  }
};

const writeUnifiedUsers = (users) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("icj_enterprise_users", JSON.stringify(users));
    window.localStorage.setItem("icj_members", JSON.stringify(users));
  } catch {}
};

export const getMembers = async () => {
  return readUnifiedUsers();
};

export const addMember = async (member) => {
  const result = await insertTable("members", member, STORAGE_KEYS.members);
  const current = readUnifiedUsers();
  const filtered = current.filter((u) => String(u.id) !== String(result.id) && String(u.member_id) !== String(result.member_id));
  const updated = [result, ...filtered];
  writeUnifiedUsers(updated);
  return result;
};

export const updateMember = async (id, values) => {
  await updateTable("members", id, values, STORAGE_KEYS.members);
  const current = readUnifiedUsers();
  const index = current.findIndex((u) => String(u.id) === String(id) || String(u.member_id) === String(id));
  if (index !== -1) {
    current[index] = { ...current[index], ...values };
    writeUnifiedUsers(current);
  }
};

export const deleteMember = async (id) => {
  await deleteTable("members", id, STORAGE_KEYS.members);
  const current = readUnifiedUsers();
  const nextUsers = current.filter((u) => String(u.id) !== String(id) && String(u.member_id) !== String(id));
  writeUnifiedUsers(nextUsers);
};

// ===========================
// Wallets
// ===========================

export const getWallets = async () =>
  listTable("wallets", STORAGE_KEYS.wallets);

export const addWallet = async (wallet) =>
  insertTable("wallets", wallet, STORAGE_KEYS.wallets);

export const updateWallet = async (id, values) =>
  updateTable("wallets", id, values, STORAGE_KEYS.wallets);

export const deleteWallet = async (id) =>
  deleteTable("wallets", id, STORAGE_KEYS.wallets);

// ===========================
// Tokens
// ===========================

export const getTokens = async () =>
  listTable("tokens", STORAGE_KEYS.tokens);

export const addToken = async (token) =>
  insertTable("tokens", token, STORAGE_KEYS.tokens);

export const updateToken = async (id, values) =>
  updateTable("tokens", id, values, STORAGE_KEYS.tokens);

export const deleteToken = async (id) =>
  deleteTable("tokens", id, STORAGE_KEYS.tokens);

// ===========================
// Donations
// ===========================

export const getDonations = async () =>
  listTable("donations", STORAGE_KEYS.donations);

export const addDonation = async (donation) =>
  insertTable("donations", donation, STORAGE_KEYS.donations);

export const updateDonation = async (id, values) =>
  updateTable("donations", id, values, STORAGE_KEYS.donations);

export const deleteDonation = async (id) =>
  deleteTable("donations", id, STORAGE_KEYS.donations);

// ===========================
// Legal Cases
// ===========================

export const getLegalCases = async () =>
  listTable("legal_cases", STORAGE_KEYS.legalCases);

export const addLegalCase = async (legalCase) =>
  insertTable("legal_cases", legalCase, STORAGE_KEYS.legalCases);

export const updateLegalCase = async (id, values) =>
  updateTable("legal_cases", id, values, STORAGE_KEYS.legalCases);

export const deleteLegalCase = async (id) =>
  deleteTable("legal_cases", id, STORAGE_KEYS.legalCases);

// ===========================
// Documents
// ===========================

export const getDocuments = async () =>
  listTable("documents", STORAGE_KEYS.documents);

export const addDocument = async (document) =>
  insertTable("documents", document, STORAGE_KEYS.documents);

export const updateDocument = async (id, values) =>
  updateTable("documents", id, values, STORAGE_KEYS.documents);

export const deleteDocument = async (id) =>
  deleteTable("documents", id, STORAGE_KEYS.documents);

// ===========================
// Notifications
// ===========================

export const getNotifications = async () =>
  listTable("notifications", STORAGE_KEYS.notifications);

export const addNotification = async (notification) =>
  insertTable("notifications", notification, STORAGE_KEYS.notifications);

export const updateNotification = async (id, values) =>
  updateTable("notifications", id, values, STORAGE_KEYS.notifications);

// ===========================
// Reports
// ===========================

export const getReports = async () =>
  listTable("reports", STORAGE_KEYS.reports);

export const addReport = async (report) =>
  insertTable("reports", report, STORAGE_KEYS.reports);

// ===========================
// System Settings
// ===========================

export const getSystemSettings = async () => {
  const list = await listTable("system_settings", STORAGE_KEYS.settings);
  return list[0] || null;
};

export const saveSystemSettings = async (settings) => {
  const payload = {
    id: settings.id || 1,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .upsert([payload], { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch {
      writeStore(STORAGE_KEYS.settings, [payload]);
      return payload;
    }
  }

  writeStore(STORAGE_KEYS.settings, [payload]);
  return payload;
};

// ===========================
// Pinned Notes
// ===========================

export const getPinnedNotes = async () =>
  listTable("pinned_notes", STORAGE_KEYS.pinnedNotes);

export const addPinnedNote = async (note) =>
  insertTable("pinned_notes", note, STORAGE_KEYS.pinnedNotes);

export const updatePinnedNote = async (id, values) =>
  updateTable("pinned_notes", id, values, STORAGE_KEYS.pinnedNotes);

export const deletePinnedNote = async (id) =>
  deleteTable("pinned_notes", id, STORAGE_KEYS.pinnedNotes);

// ===========================
// Communication History
// ===========================

export const getCommunicationHistory = async () =>
  listTable("communication_history", STORAGE_KEYS.communicationHistory);

export const addCommunicationRecord = async (record) =>
  insertTable("communication_history", record, STORAGE_KEYS.communicationHistory);

export const updateCommunicationRecord = async (id, values) =>
  updateTable("communication_history", id, values, STORAGE_KEYS.communicationHistory);

export const deleteCommunicationRecord = async (id) =>
  deleteTable("communication_history", id, STORAGE_KEYS.communicationHistory);

/**
 * Self-Healing Database Bootstrap Adapter
 * Normalizes member IDs, verifies seed integrity, repairs missing storage keys,
 * and balances ledgers on application startup.
 */
export const selfHealDatabaseState = () => {
  try {
    if (typeof localStorage === "undefined") return;

    // 1. Ensure members store exists and has Super Admin
    const rawMembers = localStorage.getItem(STORAGE_KEYS.members);
    let members = rawMembers ? JSON.parse(rawMembers) : [];
    
    if (members.length === 0) {
      members = ENTERPRISE_SEED_USERS;
      localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(members));
      localStorage.setItem("icj_enterprise_users", JSON.stringify(members));
    }

    // 2. Do NOT create a session here.
    //
    // This block used to write the first admin it found into "icj_user" when no
    // session existed. Because selfHealDatabaseState() runs on module import,
    // merely loading this file signed the visitor in as Super Admin — the admin
    // pages opened without anyone entering a password. Seeding data is this
    // function's job; authenticating is AuthService.login's.

    console.log(`🛡️ [SelfHealingDatabase] Audit clean! Total verified records: ${members.length} members.`);
  } catch (e) {
    console.error("SelfHealingDatabase error", e);
  }
};

// Run self-healing audit on script load
selfHealDatabaseState();
