import { SUPABASE_ENABLED, supabase } from "./supabase";

const STORAGE_KEYS = {
  members: "icj_members",
  organizations: "icj_organizations",
  organizationMemberships: "icj_organization_memberships",
  financeAccounts: "icj_finance_accounts",
  financeLedgers: "icj_finance_ledgers",
  financeTransactions: "icj_finance_transactions",
  financeSettings: "icj_finance_settings",
  wallets: "icj_wallets",
  tokens: "icj_tokens",
  donations: "icj_donations",
  legalCases: "icj_legal_cases",
  documents: "icj_documents",
  documentFolders: "icj_document_folders",
  documentVersions: "icj_document_versions",
  documentSettings: "icj_document_settings",
  workflowDefinitions: "icj_workflow_definitions",
  workflows: "icj_workflows",
  workflowHistory: "icj_workflow_history",
  workflowAssignments: "icj_workflow_assignments",
  workflowSettings: "icj_workflow_settings",
  notifications: "icj_notifications",
  notificationTemplates: "icj_notification_templates",
  notificationQueues: "icj_notification_queues",
  notificationPreferences: "icj_notification_preferences",
  notificationSettings: "icj_notification_settings",
  reports: "icj_reports",
  settings: "icj_settings",
};

const CLOUD_MIGRATION_STATE_KEY = "icj_cloud_migration_state_v1";

const isSupabaseConfigured = SUPABASE_ENABLED;

const TABLE_COLUMNS = {
  members: [
    "id",
    "uuid",
    "membership_id",
    "member_id",
    "full_name",
    "name",
    "email",
    "mobile",
    "whatsapp",
    "role",
    "role_code",
    "role_category",
    "legacy_role",
    "person_id",
    "person_roles",
    "role_codes",
    "person_profile",
    "member_type",
    "profession",
    "organisation",
    "gender",
    "dob",
    "aadhar",
    "pan",
    "gst",
    "address",
    "city",
    "district",
    "state",
    "pincode",
    "verification_status",
    "verification_date",
    "verified_by",
    "verification_history",
    "member_level",
    "membership_type",
    "lifecycle_status",
    "registration_date",
    "valid_till",
    "remarks",
    "experience",
    "wallet_balance",
    "token_balance",
    "status",
    "profile_photo",
    "organization_id",
    "branch_code",
    "trust_id",
    "company_id",
    "version_no",
    "extension_fields",
    "is_deleted",
    "deleted_at",
    "deleted_by",
    "delete_reason",
    "created_by",
    "created_at",
    "updated_by",
    "updated_at",
  ],
  organizations: [
    "id",
    "organization_id",
    "name",
    "code",
    "type_code",
    "parent_org_id",
    "branch_code",
    "branch_name",
    "status",
    "settings",
    "metadata",
    "created_at",
    "updated_at",
  ],
  organization_memberships: [
    "id",
    "organization_id",
    "member_id",
    "role_code",
    "status",
    "created_at",
    "updated_at",
  ],
  finance_accounts: [
    "id",
    "code",
    "name",
    "group",
    "category",
    "account_type",
    "parent_account_id",
    "currency",
    "organization_id",
    "person_id",
    "member_id",
    "status",
    "metadata",
    "created_at",
    "updated_at",
  ],
  finance_ledgers: [
    "id",
    "ledger_no",
    "transaction_id",
    "entry_type",
    "account_id",
    "account_code",
    "account_name",
    "debit_amount",
    "credit_amount",
    "amount",
    "currency",
    "exchange_rate",
    "wallet_id",
    "source_wallet_id",
    "target_wallet_id",
    "organization_id",
    "person_id",
    "member_id",
    "reference_no",
    "voucher_no",
    "narration",
    "source_module",
    "status",
    "metadata",
    "created_at",
    "updated_at",
  ],
  finance_transactions: [
    "id",
    "transaction_no",
    "transaction_type",
    "amount",
    "currency",
    "exchange_rate",
    "base_amount",
    "base_currency",
    "organization_id",
    "person_id",
    "member_id",
    "wallet_id",
    "counterparty_wallet_id",
    "debit_account_id",
    "credit_account_id",
    "debit_account_code",
    "credit_account_code",
    "reference_no",
    "voucher_no",
    "narration",
    "source_module",
    "status",
    "metadata",
    "created_at",
    "updated_at",
  ],
  finance_settings: [
    "id",
    "scope_type",
    "scope_id",
    "base_currency",
    "allowed_currencies",
    "wallet_enabled",
    "double_entry_required",
    "metadata",
    "created_at",
    "updated_at",
  ],
  wallets: [
    "id",
    "member_id",
    "person_id",
    "organization_id",
    "account_id",
    "balance",
    "currency",
    "status",
    "created_at",
    "updated_at",
  ],
  tokens: ["id", "token_no", "member_id", "amount", "type", "status", "created_at"],
  donations: ["id", "receipt_no", "donor_name", "member_id", "amount", "payment_mode", "status", "created_at"],
  legal_cases: ["id", "case_number", "title", "client_name", "advocate_name", "court_name", "status", "next_hearing", "created_at", "updated_at"],
  documents: [
    "id",
    "document_no",
    "title",
    "category",
    "owner",
    "folder_id",
    "folder_path",
    "module_type",
    "reference_id",
    "description",
    "tags",
    "person_id",
    "member_id",
    "organization_id",
    "case_id",
    "finance_reference_id",
    "finance_transaction_id",
    "finance_account_id",
    "current_version",
    "metadata",
    "file_name",
    "file_type",
    "file_path",
    "file_url",
    "file_size",
    "status",
    "verification_status",
    "verification_remarks",
    "verification_date",
    "verified_by",
    "document_history",
    "created_at",
    "updated_at",
  ],
  document_folders: [
    "id",
    "name",
    "parent_folder_id",
    "path",
    "organization_id",
    "person_id",
    "member_id",
    "case_id",
    "finance_reference_id",
    "status",
    "metadata",
    "created_at",
    "updated_at",
  ],
  document_versions: [
    "id",
    "document_id",
    "version_no",
    "note",
    "file_name",
    "file_type",
    "file_path",
    "file_url",
    "file_size",
    "metadata",
    "created_at",
    "updated_at",
  ],
  document_settings: [
    "id",
    "scope_type",
    "scope_id",
    "categories",
    "allowed_file_types",
    "max_upload_size_bytes",
    "versioning_enabled",
    "metadata",
    "created_at",
    "updated_at",
  ],
  workflow_definitions: [
    "id",
    "code",
    "name",
    "module",
    "status",
    "approval_levels",
    "dynamic_rules",
    "metadata",
    "organization_id",
    "created_at",
    "updated_at",
  ],
  workflows: [
    "id",
    "workflow_no",
    "definition_id",
    "definition_code",
    "title",
    "module",
    "status",
    "current_level",
    "max_level",
    "payload",
    "person_id",
    "member_id",
    "organization_id",
    "finance_reference_id",
    "finance_transaction_id",
    "document_id",
    "case_id",
    "requested_by",
    "approved_by",
    "rejected_by",
    "metadata",
    "created_at",
    "updated_at",
  ],
  workflow_history: [
    "id",
    "workflow_id",
    "action",
    "from_status",
    "to_status",
    "level_no",
    "actor_member_id",
    "actor_person_id",
    "actor_role_code",
    "remarks",
    "metadata",
    "created_at",
  ],
  workflow_assignments: [
    "id",
    "workflow_id",
    "level_no",
    "assignee_member_id",
    "assignee_person_id",
    "assignee_role_code",
    "status",
    "due_at",
    "metadata",
    "created_at",
    "updated_at",
  ],
  workflow_settings: [
    "id",
    "scope_type",
    "scope_id",
    "auto_assignment_enabled",
    "strict_level_ordering",
    "default_approval_levels",
    "metadata",
    "created_at",
    "updated_at",
  ],
  notifications: [
    "id",
    "title",
    "message",
    "type",
    "channel",
    "status",
    "template_code",
    "template_id",
    "person_id",
    "member_id",
    "organization_id",
    "role_code",
    "payload",
    "sent_at",
    "read_at",
    "created_at",
    "updated_at",
  ],
  notification_templates: [
    "id",
    "code",
    "name",
    "subject",
    "body",
    "channel",
    "module",
    "status",
    "organization_id",
    "metadata",
    "created_at",
    "updated_at",
  ],
  notification_queues: [
    "id",
    "queue_no",
    "channel",
    "status",
    "priority",
    "recipient",
    "template_code",
    "template_id",
    "person_id",
    "member_id",
    "organization_id",
    "role_code",
    "payload",
    "scheduled_at",
    "processed_at",
    "error_message",
    "retry_count",
    "metadata",
    "created_at",
    "updated_at",
  ],
  notification_preferences: [
    "id",
    "scope_type",
    "scope_id",
    "person_id",
    "member_id",
    "organization_id",
    "role_code",
    "email_enabled",
    "sms_enabled",
    "whatsapp_enabled",
    "push_enabled",
    "inapp_enabled",
    "metadata",
    "created_at",
    "updated_at",
  ],
  notification_settings: [
    "id",
    "scope_type",
    "scope_id",
    "email_queue_enabled",
    "sms_queue_enabled",
    "whatsapp_queue_enabled",
    "push_enabled",
    "inapp_enabled",
    "default_priority",
    "max_retry_count",
    "metadata",
    "created_at",
    "updated_at",
  ],
  reports: ["id", "report_no", "title", "category", "description", "created_by", "status", "created_at"],
  system_settings: ["id", "enable_notifications", "enable_audit_log", "compact_view", "updated_at"],
};

const sanitizeRecord = (table, record) => {
  if (!record || typeof record !== "object") return record;

  const normalized = {
    ...record,
    uuid: record.uuid,
    membership_id: record.membership_id ?? record.membershipId ?? record.member_id ?? record.memberId,
    member_id: record.member_id ?? record.memberId,
    full_name: record.full_name ?? record.fullName ?? record.name,
    membership_type: record.membership_type ?? record.membershipType ?? record.member_type,
    lifecycle_status: record.lifecycle_status ?? record.lifecycleStatus,
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
    file_size: record.file_size ?? record.fileSize,
    folder_id: record.folder_id ?? record.folderId,
    folder_path: record.folder_path ?? record.folderPath,
    module_type: record.module_type ?? record.moduleType,
    reference_id: record.reference_id ?? record.referenceId,
    person_id: record.person_id ?? record.personId,
    organization_id: record.organization_id ?? record.organizationId,
    case_id: record.case_id ?? record.caseId,
    finance_reference_id: record.finance_reference_id ?? record.financeReferenceId,
    finance_transaction_id: record.finance_transaction_id ?? record.financeTransactionId,
    finance_account_id: record.finance_account_id ?? record.financeAccountId,
    current_version: record.current_version ?? record.currentVersion,
    parent_folder_id: record.parent_folder_id ?? record.parentFolderId,
    version_no: record.version_no ?? record.versionNo,
    scope_type: record.scope_type ?? record.scopeType,
    scope_id: record.scope_id ?? record.scopeId,
    allowed_file_types: record.allowed_file_types ?? record.allowedFileTypes,
    max_upload_size_bytes: record.max_upload_size_bytes ?? record.maxUploadSizeBytes,
    versioning_enabled: record.versioning_enabled ?? record.versioningEnabled,
    workflow_no: record.workflow_no ?? record.workflowNo,
    definition_id: record.definition_id ?? record.definitionId,
    definition_code: record.definition_code ?? record.definitionCode,
    current_level: record.current_level ?? record.currentLevel,
    max_level: record.max_level ?? record.maxLevel,
    requested_by: record.requested_by ?? record.requestedBy,
    approved_by: record.approved_by ?? record.approvedBy,
    rejected_by: record.rejected_by ?? record.rejectedBy,
    workflow_id: record.workflow_id ?? record.workflowId,
    from_status: record.from_status ?? record.fromStatus,
    to_status: record.to_status ?? record.toStatus,
    level_no: record.level_no ?? record.levelNo,
    actor_member_id: record.actor_member_id ?? record.actorMemberId,
    actor_person_id: record.actor_person_id ?? record.actorPersonId,
    actor_role_code: record.actor_role_code ?? record.actorRoleCode,
    assignee_member_id: record.assignee_member_id ?? record.assigneeMemberId,
    assignee_person_id: record.assignee_person_id ?? record.assigneePersonId,
    assignee_role_code: record.assignee_role_code ?? record.assigneeRoleCode,
    due_at: record.due_at ?? record.dueAt,
    auto_assignment_enabled: record.auto_assignment_enabled ?? record.autoAssignmentEnabled,
    strict_level_ordering: record.strict_level_ordering ?? record.strictLevelOrdering,
    default_approval_levels: record.default_approval_levels ?? record.defaultApprovalLevels,
    channel: record.channel,
    template_code: record.template_code ?? record.templateCode,
    template_id: record.template_id ?? record.templateId,
    payload: record.payload,
    sent_at: record.sent_at ?? record.sentAt,
    queue_no: record.queue_no ?? record.queueNo,
    priority: record.priority,
    recipient: record.recipient,
    scheduled_at: record.scheduled_at ?? record.scheduledAt,
    processed_at: record.processed_at ?? record.processedAt,
    error_message: record.error_message ?? record.errorMessage,
    retry_count: record.retry_count ?? record.retryCount,
    email_enabled: record.email_enabled ?? record.emailEnabled,
    sms_enabled: record.sms_enabled ?? record.smsEnabled,
    whatsapp_enabled: record.whatsapp_enabled ?? record.whatsappEnabled,
    push_enabled: record.push_enabled ?? record.pushEnabled,
    inapp_enabled: record.inapp_enabled ?? record.inappEnabled,
    email_queue_enabled: record.email_queue_enabled ?? record.emailQueueEnabled,
    sms_queue_enabled: record.sms_queue_enabled ?? record.smsQueueEnabled,
    whatsapp_queue_enabled: record.whatsapp_queue_enabled ?? record.whatsappQueueEnabled,
    default_priority: record.default_priority ?? record.defaultPriority,
    max_retry_count: record.max_retry_count ?? record.maxRetryCount,
    branch_code: record.branch_code ?? record.branchCode,
    trust_id: record.trust_id ?? record.trustId,
    company_id: record.company_id ?? record.companyId,
    extension_fields: record.extension_fields ?? record.extensionFields,
    is_deleted: record.is_deleted ?? record.isDeleted,
    deleted_at: record.deleted_at ?? record.deletedAt,
    deleted_by: record.deleted_by ?? record.deletedBy,
    delete_reason: record.delete_reason ?? record.deleteReason,
    created_by: record.created_by ?? record.createdBy,
    updated_by: record.updated_by ?? record.updatedBy,
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
    uuid: row.uuid,
    membershipId: row.membershipId ?? row.membership_id ?? row.member_id,
    memberId: row.memberId ?? row.member_id,
    fullName: row.fullName ?? row.full_name ?? row.name,
    membershipType: row.membershipType ?? row.membership_type ?? row.member_type,
    lifecycleStatus: row.lifecycleStatus ?? row.lifecycle_status,
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
    fileSize: row.fileSize ?? row.file_size,
    folderId: row.folderId ?? row.folder_id,
    folderPath: row.folderPath ?? row.folder_path,
    moduleType: row.moduleType ?? row.module_type,
    referenceId: row.referenceId ?? row.reference_id,
    personId: row.personId ?? row.person_id,
    organizationId: row.organizationId ?? row.organization_id,
    caseId: row.caseId ?? row.case_id,
    financeReferenceId: row.financeReferenceId ?? row.finance_reference_id,
    financeTransactionId: row.financeTransactionId ?? row.finance_transaction_id,
    financeAccountId: row.financeAccountId ?? row.finance_account_id,
    currentVersion: row.currentVersion ?? row.current_version,
    parentFolderId: row.parentFolderId ?? row.parent_folder_id,
    versionNo: row.versionNo ?? row.version_no,
    scopeType: row.scopeType ?? row.scope_type,
    scopeId: row.scopeId ?? row.scope_id,
    allowedFileTypes: row.allowedFileTypes ?? row.allowed_file_types,
    maxUploadSizeBytes: row.maxUploadSizeBytes ?? row.max_upload_size_bytes,
    versioningEnabled: row.versioningEnabled ?? row.versioning_enabled,
    workflowNo: row.workflowNo ?? row.workflow_no,
    definitionId: row.definitionId ?? row.definition_id,
    definitionCode: row.definitionCode ?? row.definition_code,
    currentLevel: row.currentLevel ?? row.current_level,
    maxLevel: row.maxLevel ?? row.max_level,
    requestedBy: row.requestedBy ?? row.requested_by,
    approvedBy: row.approvedBy ?? row.approved_by,
    rejectedBy: row.rejectedBy ?? row.rejected_by,
    workflowId: row.workflowId ?? row.workflow_id,
    fromStatus: row.fromStatus ?? row.from_status,
    toStatus: row.toStatus ?? row.to_status,
    levelNo: row.levelNo ?? row.level_no,
    actorMemberId: row.actorMemberId ?? row.actor_member_id,
    actorPersonId: row.actorPersonId ?? row.actor_person_id,
    actorRoleCode: row.actorRoleCode ?? row.actor_role_code,
    assigneeMemberId: row.assigneeMemberId ?? row.assignee_member_id,
    assigneePersonId: row.assigneePersonId ?? row.assignee_person_id,
    assigneeRoleCode: row.assigneeRoleCode ?? row.assignee_role_code,
    dueAt: row.dueAt ?? row.due_at,
    autoAssignmentEnabled: row.autoAssignmentEnabled ?? row.auto_assignment_enabled,
    strictLevelOrdering: row.strictLevelOrdering ?? row.strict_level_ordering,
    defaultApprovalLevels: row.defaultApprovalLevels ?? row.default_approval_levels,
    channel: row.channel,
    templateCode: row.templateCode ?? row.template_code,
    templateId: row.templateId ?? row.template_id,
    payload: row.payload,
    sentAt: row.sentAt ?? row.sent_at,
    queueNo: row.queueNo ?? row.queue_no,
    priority: row.priority,
    recipient: row.recipient,
    scheduledAt: row.scheduledAt ?? row.scheduled_at,
    processedAt: row.processedAt ?? row.processed_at,
    errorMessage: row.errorMessage ?? row.error_message,
    retryCount: row.retryCount ?? row.retry_count,
    emailEnabled: row.emailEnabled ?? row.email_enabled,
    smsEnabled: row.smsEnabled ?? row.sms_enabled,
    whatsappEnabled: row.whatsappEnabled ?? row.whatsapp_enabled,
    pushEnabled: row.pushEnabled ?? row.push_enabled,
    inappEnabled: row.inappEnabled ?? row.inapp_enabled,
    emailQueueEnabled: row.emailQueueEnabled ?? row.email_queue_enabled,
    smsQueueEnabled: row.smsQueueEnabled ?? row.sms_queue_enabled,
    whatsappQueueEnabled: row.whatsappQueueEnabled ?? row.whatsapp_queue_enabled,
    defaultPriority: row.defaultPriority ?? row.default_priority,
    maxRetryCount: row.maxRetryCount ?? row.max_retry_count,
    branchCode: row.branchCode ?? row.branch_code,
    trustId: row.trustId ?? row.trust_id,
    companyId: row.companyId ?? row.company_id,
    extensionFields: row.extensionFields ?? row.extension_fields,
    isDeleted: row.isDeleted ?? row.is_deleted,
    deletedAt: row.deletedAt ?? row.deleted_at,
    deletedBy: row.deletedBy ?? row.deleted_by,
    deleteReason: row.deleteReason ?? row.delete_reason,
    createdBy: row.createdBy ?? row.created_by,
    updatedBy: row.updatedBy ?? row.updated_by,
    readAt: row.readAt ?? row.read_at,
    enableNotifications: row.enableNotifications ?? row.enable_notifications,
    enableAuditLog: row.enableAuditLog ?? row.enable_audit_log,
    compactView: row.compactView ?? row.compact_view,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };

  if (table === "members") {
    normalized.id = normalized.id || normalized.members || normalized.uuid;
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

const readMigrationState = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CLOUD_MIGRATION_STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeMigrationState = (state) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLOUD_MIGRATION_STATE_KEY, JSON.stringify(state || {}));
};

const migrateLocalTableToSupabase = async (table, localKey) => {
  if (!isSupabaseConfigured || typeof window === "undefined") return;

  const state = readMigrationState();
  if (state[table]) return;

  const localRows = readStore(localKey);
  if (!Array.isArray(localRows) || localRows.length === 0) {
    writeMigrationState({ ...state, [table]: true });
    return;
  }

  for (const row of localRows) {
    try {
      const payload = sanitizeRecord(table, normalizeRecord(table, row));
      await supabase
        .from(table)
        .upsert([payload], { onConflict: "id", ignoreDuplicates: false });
    } catch {
      // Preserve backward compatibility; failures stay in local fallback.
    }
  }

  writeMigrationState({ ...state, [table]: true });
};

const resolveRecordId = (table, record = {}) => {
  if (!record || typeof record !== "object") return "";
  if (table === "members") {
    return String(record.id ?? record.members ?? record.member_id ?? "");
  }
  return String(record.id ?? "");
};

const mergeRecords = (table, remoteRows = [], localRows = []) => {
  const map = new Map();

  (Array.isArray(localRows) ? localRows : []).forEach((row) => {
    const normalized = normalizeRecord(table, row);
    const id = resolveRecordId(table, normalized);
    if (id) map.set(id, normalized);
  });

  (Array.isArray(remoteRows) ? remoteRows : []).forEach((row) => {
    const normalized = normalizeRecord(table, row);
    const id = resolveRecordId(table, normalized);
    if (!id) return;
    const existing = map.get(id) || {};
    map.set(id, {
      ...existing,
      ...normalized,
    });
  });

  return [...map.values()];
};

export { mergeRecords };

const upsertStoreRecord = (key, record, idField = "id") => {
  const list = readStore(key);
  const id = record[idField];
  const index = list.findIndex((item) => item[idField] === id);

  if (index === -1) {
    const next = [record, ...list];
    writeStore(key, next);
    return record;
  }

  const next = [...list];
  next[index] = { ...next[index], ...record };
  writeStore(key, next);
  return next[index];
};

const removeStoreRecord = (key, id, idField = "id") => {
  const list = readStore(key);
  const next = list.filter((item) => item[idField] !== id);
  writeStore(key, next);
};

const listTable = async (table, localKey, orderBy = "created_at") => {
  if (!isSupabaseConfigured) return readStore(localKey);

  try {
    await migrateLocalTableToSupabase(table, localKey);

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => normalizeRecord(table, row));
  } catch {
    return readStore(localKey).map((row) => normalizeRecord(table, row));
  }
};

const insertTable = async (table, record, localKey) => {
  const payload = sanitizeRecord(table, record);

  if (!isSupabaseConfigured) {
    upsertStoreRecord(localKey, record);
    return normalizeRecord(table, record);
  }

  try {
    await migrateLocalTableToSupabase(table, localKey);

    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return normalizeRecord(table, data);
  } catch {
    upsertStoreRecord(localKey, record);
    return normalizeRecord(table, record);
  }
};

const updateTable = async (table, id, values, localKey, idField = "id") => {
  const payload = sanitizeRecord(table, values);

  if (isSupabaseConfigured) {
    try {
      await migrateLocalTableToSupabase(table, localKey);

      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq(idField, id);

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
// Members
// ===========================

export const getMembers = async () =>
  listTable("members", STORAGE_KEYS.members);

export const addMember = async (member) =>
  insertTable("members", member, STORAGE_KEYS.members);

export const updateMember = async (id, values) => {
  const payload = sanitizeRecord("members", values);

  if (isSupabaseConfigured) {
    try {
      await migrateLocalTableToSupabase("members", STORAGE_KEYS.members);

      const { error } = await supabase
        .from("members")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
      return;
    } catch {
      await updateTable("members", id, values, STORAGE_KEYS.members);
      return;
    }
  }

  await updateTable("members", id, values, STORAGE_KEYS.members);
};

export const deleteMember = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      removeStoreRecord(STORAGE_KEYS.members, id);
      return;
    } catch {
      await deleteTable("members", id, STORAGE_KEYS.members);
      return;
    }
  }

  await deleteTable("members", id, STORAGE_KEYS.members);
};

// ===========================
// Organizations
// ===========================

export const getOrganizations = async () =>
  listTable("organizations", STORAGE_KEYS.organizations);

export const addOrganization = async (organization) =>
  insertTable("organizations", organization, STORAGE_KEYS.organizations);

export const updateOrganization = async (id, values) =>
  updateTable("organizations", id, values, STORAGE_KEYS.organizations);

export const deleteOrganization = async (id) =>
  deleteTable("organizations", id, STORAGE_KEYS.organizations);

// ===========================
// Organization Memberships
// ===========================

export const getOrganizationMemberships = async () =>
  listTable("organization_memberships", STORAGE_KEYS.organizationMemberships);

export const addOrganizationMembership = async (membership) =>
  insertTable("organization_memberships", membership, STORAGE_KEYS.organizationMemberships);

export const updateOrganizationMembership = async (id, values) =>
  updateTable("organization_memberships", id, values, STORAGE_KEYS.organizationMemberships);

export const deleteOrganizationMembership = async (id) =>
  deleteTable("organization_memberships", id, STORAGE_KEYS.organizationMemberships);

// ===========================
// Finance Accounts
// ===========================

export const getFinanceAccounts = async () =>
  listTable("finance_accounts", STORAGE_KEYS.financeAccounts);

export const addFinanceAccount = async (record) =>
  insertTable("finance_accounts", record, STORAGE_KEYS.financeAccounts);

export const updateFinanceAccount = async (id, values) =>
  updateTable("finance_accounts", id, values, STORAGE_KEYS.financeAccounts);

export const deleteFinanceAccount = async (id) =>
  deleteTable("finance_accounts", id, STORAGE_KEYS.financeAccounts);

// ===========================
// Finance Ledger
// ===========================

export const getFinanceLedgers = async () =>
  listTable("finance_ledgers", STORAGE_KEYS.financeLedgers);

export const addFinanceLedger = async (record) =>
  insertTable("finance_ledgers", record, STORAGE_KEYS.financeLedgers);

export const updateFinanceLedger = async (id, values) =>
  updateTable("finance_ledgers", id, values, STORAGE_KEYS.financeLedgers);

export const deleteFinanceLedger = async (id) =>
  deleteTable("finance_ledgers", id, STORAGE_KEYS.financeLedgers);

// ===========================
// Finance Transactions
// ===========================

export const getFinanceTransactions = async () =>
  listTable("finance_transactions", STORAGE_KEYS.financeTransactions);

export const addFinanceTransaction = async (record) =>
  insertTable("finance_transactions", record, STORAGE_KEYS.financeTransactions);

export const updateFinanceTransaction = async (id, values) =>
  updateTable("finance_transactions", id, values, STORAGE_KEYS.financeTransactions);

export const deleteFinanceTransaction = async (id) =>
  deleteTable("finance_transactions", id, STORAGE_KEYS.financeTransactions);

// ===========================
// Finance Settings
// ===========================

export const getFinanceSettings = async () =>
  listTable("finance_settings", STORAGE_KEYS.financeSettings, "updated_at");

export const addFinanceSettings = async (record) =>
  insertTable("finance_settings", record, STORAGE_KEYS.financeSettings);

export const updateFinanceSettings = async (id, values) =>
  updateTable("finance_settings", id, values, STORAGE_KEYS.financeSettings);

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
// Document Folders
// ===========================

export const getDocumentFolders = async () =>
  listTable("document_folders", STORAGE_KEYS.documentFolders);

export const addDocumentFolder = async (folder) =>
  insertTable("document_folders", folder, STORAGE_KEYS.documentFolders);

export const updateDocumentFolder = async (id, values) =>
  updateTable("document_folders", id, values, STORAGE_KEYS.documentFolders);

export const deleteDocumentFolder = async (id) =>
  deleteTable("document_folders", id, STORAGE_KEYS.documentFolders);

// ===========================
// Document Versions
// ===========================

export const getDocumentVersions = async () =>
  listTable("document_versions", STORAGE_KEYS.documentVersions);

export const addDocumentVersion = async (version) =>
  insertTable("document_versions", version, STORAGE_KEYS.documentVersions);

export const updateDocumentVersion = async (id, values) =>
  updateTable("document_versions", id, values, STORAGE_KEYS.documentVersions);

// ===========================
// Document Settings
// ===========================

export const getDocumentSettings = async () =>
  listTable("document_settings", STORAGE_KEYS.documentSettings, "updated_at");

export const addDocumentSettings = async (settings) =>
  insertTable("document_settings", settings, STORAGE_KEYS.documentSettings);

export const updateDocumentSettings = async (id, values) =>
  updateTable("document_settings", id, values, STORAGE_KEYS.documentSettings);

// ===========================
// Workflow Definitions
// ===========================

export const getWorkflowDefinitions = async () =>
  listTable("workflow_definitions", STORAGE_KEYS.workflowDefinitions);

export const addWorkflowDefinition = async (record) =>
  insertTable("workflow_definitions", record, STORAGE_KEYS.workflowDefinitions);

export const updateWorkflowDefinition = async (id, values) =>
  updateTable("workflow_definitions", id, values, STORAGE_KEYS.workflowDefinitions);

// ===========================
// Workflows
// ===========================

export const getWorkflows = async () =>
  listTable("workflows", STORAGE_KEYS.workflows);

export const addWorkflow = async (record) =>
  insertTable("workflows", record, STORAGE_KEYS.workflows);

export const updateWorkflow = async (id, values) =>
  updateTable("workflows", id, values, STORAGE_KEYS.workflows);

// ===========================
// Workflow History
// ===========================

export const getWorkflowHistory = async () =>
  listTable("workflow_history", STORAGE_KEYS.workflowHistory);

export const addWorkflowHistory = async (record) =>
  insertTable("workflow_history", record, STORAGE_KEYS.workflowHistory);

// ===========================
// Workflow Assignments
// ===========================

export const getWorkflowAssignments = async () =>
  listTable("workflow_assignments", STORAGE_KEYS.workflowAssignments);

export const addWorkflowAssignment = async (record) =>
  insertTable("workflow_assignments", record, STORAGE_KEYS.workflowAssignments);

export const updateWorkflowAssignment = async (id, values) =>
  updateTable("workflow_assignments", id, values, STORAGE_KEYS.workflowAssignments);

// ===========================
// Workflow Settings
// ===========================

export const getWorkflowSettings = async () =>
  listTable("workflow_settings", STORAGE_KEYS.workflowSettings, "updated_at");

export const addWorkflowSettings = async (record) =>
  insertTable("workflow_settings", record, STORAGE_KEYS.workflowSettings);

export const updateWorkflowSettings = async (id, values) =>
  updateTable("workflow_settings", id, values, STORAGE_KEYS.workflowSettings);

// ===========================
// Notifications
// ===========================

export const getNotifications = async () =>
  listTable("notifications", STORAGE_KEYS.notifications);

export const addNotification = async (notification) =>
  insertTable("notifications", notification, STORAGE_KEYS.notifications);

export const updateNotification = async (id, values) =>
  updateTable("notifications", id, values, STORAGE_KEYS.notifications);

export const deleteNotification = async (id) =>
  deleteTable("notifications", id, STORAGE_KEYS.notifications);

// ===========================
// Notification Templates
// ===========================

export const getNotificationTemplates = async () =>
  listTable("notification_templates", STORAGE_KEYS.notificationTemplates);

export const addNotificationTemplate = async (record) =>
  insertTable("notification_templates", record, STORAGE_KEYS.notificationTemplates);

export const updateNotificationTemplate = async (id, values) =>
  updateTable("notification_templates", id, values, STORAGE_KEYS.notificationTemplates);

// ===========================
// Notification Queues
// ===========================

export const getNotificationQueues = async () =>
  listTable("notification_queues", STORAGE_KEYS.notificationQueues);

export const addNotificationQueue = async (record) =>
  insertTable("notification_queues", record, STORAGE_KEYS.notificationQueues);

export const updateNotificationQueue = async (id, values) =>
  updateTable("notification_queues", id, values, STORAGE_KEYS.notificationQueues);

// ===========================
// Notification Preferences
// ===========================

export const getNotificationPreferences = async () =>
  listTable("notification_preferences", STORAGE_KEYS.notificationPreferences);

export const addNotificationPreference = async (record) =>
  insertTable("notification_preferences", record, STORAGE_KEYS.notificationPreferences);

export const updateNotificationPreference = async (id, values) =>
  updateTable("notification_preferences", id, values, STORAGE_KEYS.notificationPreferences);

// ===========================
// Notification Settings
// ===========================

export const getNotificationSettings = async () =>
  listTable("notification_settings", STORAGE_KEYS.notificationSettings, "updated_at");

export const addNotificationSetting = async (record) =>
  insertTable("notification_settings", record, STORAGE_KEYS.notificationSettings);

export const updateNotificationSetting = async (id, values) =>
  updateTable("notification_settings", id, values, STORAGE_KEYS.notificationSettings);

// ===========================
// Reports
// ===========================

export const getReports = async () =>
  listTable("reports", STORAGE_KEYS.reports);

export const addReport = async (report) =>
  insertTable("reports", report, STORAGE_KEYS.reports);

export const updateReport = async (id, values) =>
  updateTable("reports", id, values, STORAGE_KEYS.reports);

export const deleteReport = async (id) =>
  deleteTable("reports", id, STORAGE_KEYS.reports);

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
