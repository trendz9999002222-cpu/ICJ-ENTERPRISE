/**
 * ICJ ENTERPRISE PLATFORM — DATABASE MIGRATION ENGINE
 * Step 11.1 Schema Migration & Rollback System
 */

const MIGRATIONS_KEY = "icj_migration_history";
const BACKUP_SNAPSHOT_KEY = "icj_pre_migration_backup";

export const MIGRATIONS = [
  { version: "1.0.0", name: "001_initial_core_tables.sql", description: "Create users, roles, and master lookup tables" },
  { version: "2.0.0", name: "002_legal_and_membership_tables.sql", description: "Create legal_cases, advocate_profiles, and cause_lists" },
  { version: "3.0.0", name: "003_finance_wallet_and_documents.sql", description: "Create digital_wallets, gst_ledgers, document_vault, and audit_logs" },
];

export class MigrationEngine {
  static getHistory() {
    try {
      const raw = localStorage.getItem(MIGRATIONS_KEY);
      return raw ? JSON.parse(raw) : MIGRATIONS.map((m) => ({ ...m, status: "Applied", executedAt: new Date().toISOString() }));
    } catch {
      return [];
    }
  }

  static createBackupSnapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      version: "3.0.0",
      users: localStorage.getItem("icj_enterprise_users") || "[]",
      cases: localStorage.getItem("icj_legal_cases") || "[]",
      documents: localStorage.getItem("icj_documents") || "[]",
      reports: localStorage.getItem("icj_reports") || "[]",
    };
    localStorage.setItem(BACKUP_SNAPSHOT_KEY, JSON.stringify(snapshot));
    return snapshot;
  }

  static runMigrations() {
    this.createBackupSnapshot();
    const history = MIGRATIONS.map((m) => ({
      ...m,
      status: "Applied",
      executedAt: new Date().toISOString(),
    }));
    localStorage.setItem(MIGRATIONS_KEY, JSON.stringify(history));
    return { success: true, count: history.length, history };
  }

  static rollbackMigration(version) {
    const history = this.getHistory().map((m) =>
      m.version === version ? { ...m, status: "Rolled Back", executedAt: new Date().toISOString() } : m
    );
    localStorage.setItem(MIGRATIONS_KEY, JSON.stringify(history));
    return { success: true, version, history };
  }
}
