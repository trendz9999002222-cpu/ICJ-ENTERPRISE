import { getSystemSettings, saveSystemSettings } from "./database";
import AuditLogService from "./auditLogService";
import DocumentService from "./documentService";
import FinanceService from "./financeService";
import NotificationService from "./notificationService";
import OrganizationService from "./organizationService";
import WorkflowService from "./workflowService";

const defaultSettings = {
  id: 1,
  enableNotifications: true,
  enableAuditLog: true,
  compactView: false,
  membership: {
    idFormat: {
      prefix: "ICJ",
      startingNumber: 1,
      paddingLength: 6,
      includeFinancialYear: false,
      includeBranchCode: false,
      includeOrganizationCode: false,
    },
    lifecycleStates: [
      "Draft",
      "Pending Verification",
      "Pending Approval",
      "Approved",
      "Active",
      "Suspended",
      "Inactive",
      "Archived",
    ],
    lifecycleTransitions: {
      Draft: ["Pending Verification", "Archived"],
      "Pending Verification": ["Pending Approval", "Active", "Inactive", "Archived"],
      "Pending Approval": ["Approved", "Inactive", "Archived"],
      Approved: ["Active", "Inactive", "Archived"],
      Active: ["Suspended", "Inactive", "Archived"],
      Suspended: ["Active", "Inactive", "Archived"],
      Inactive: ["Active", "Archived"],
      Archived: [],
    },
  },
};

const hasPermissionConfigurationChanged = (previousSettings = {}, nextSettings = {}) => {
  const previousAuthorization = previousSettings?.membership?.authorization;
  const nextAuthorization = nextSettings?.membership?.authorization;
  return JSON.stringify(previousAuthorization || {}) !== JSON.stringify(nextAuthorization || {});
};

const writeSettingsAudit = async (action, previousState, newState, context = {}) => {
  try {
    await AuditLogService.logBusinessEvent({
      action,
      module: "administration",
      entity: "settings",
      entityUuid: "system-settings",
      actorUuid: context.actorUuid || context.userId || null,
      actorRole: context.actorRole || context.role || null,
      actorName: context.actorName || null,
      requestSource: context.requestSource || "web",
      previousState,
      newState,
      result: "success",
      metadata: {
        message: action === "permission_changed" ? "Permission configuration updated." : "System settings updated.",
      },
    });
  } catch {
    // Keep settings updates non-blocking when audit writes fail.
  }
};

const SettingsService = {
  async get() {
    const data = await getSystemSettings();
    return { ...defaultSettings, ...(data || {}) };
  },

  async save(settings, context = {}) {
    const current = await this.get();
    const next = { ...defaultSettings, ...settings };
    const saved = await saveSystemSettings(next);
    await writeSettingsAudit("settings_changed", current, saved, context);
    await writeSettingsAudit("configuration_changed", current, saved, context);
    if (hasPermissionConfigurationChanged(current, saved)) {
      await writeSettingsAudit("permission_changed", current?.membership?.authorization || {}, saved?.membership?.authorization || {}, context);
    }
    return saved;
  },

  async getMembershipSettings() {
    const current = await this.get();
    return {
      ...defaultSettings.membership,
      ...(current?.membership || {}),
    };
  },

  async saveMembershipSettings(membershipSettings = {}, context = {}) {
    const current = await this.get();
    return await this.save({
      ...current,
      membership: {
        ...defaultSettings.membership,
        ...(current?.membership || {}),
        ...(membershipSettings || {}),
      },
    }, context);
  },

  async getOrganizationSettings(organizationId) {
    return await OrganizationService.getOrganizationSettings(organizationId);
  },

  async saveOrganizationSettings(organizationId, settings) {
    return await OrganizationService.saveOrganizationSettings(organizationId, settings);
  },

  async getFinanceSettings(scope = {}) {
    return await FinanceService.getFinanceSettings(scope);
  },

  async saveFinanceSettings(settings, role = "member", scope = {}) {
    return await FinanceService.saveFinanceSettings(settings, role, scope);
  },

  async getDocumentSettings(scope = {}) {
    return await DocumentService.getSettings(scope);
  },

  async saveDocumentSettings(settings, role = "member", scope = {}) {
    return await DocumentService.saveSettings(settings, role, scope);
  },

  async getWorkflowSettings(scope = {}) {
    return await WorkflowService.getSettings(scope);
  },

  async saveWorkflowSettings(settings, role = "member", scope = {}) {
    return await WorkflowService.saveSettings(settings, role, scope);
  },

  async getNotificationSettings(scope = {}) {
    return await NotificationService.getSettings(scope);
  },

  async saveNotificationSettings(settings, role = "member", scope = {}) {
    return await NotificationService.saveSettings(settings, role, scope);
  },
};

export default SettingsService;
