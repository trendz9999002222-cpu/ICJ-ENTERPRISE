import {
    addDocument,
    addDocumentFolder,
    addDocumentSettings,
    addDocumentVersion,
    deleteDocument,
    getDocumentFolders,
    getDocumentSettings,
    getDocuments,
    getDocumentVersions,
    updateDocument,
    updateDocumentSettings,
} from "./database";
import { SUPABASE_ENABLED, supabase } from "./supabase";
import { hasPermission } from "../core/permissions";
import { optionalString, requireString } from "../utils/validation";
import { MemberService } from "./memberService";
import LegalService from "./legalService";
import FinanceService from "./financeService";
import TokenService from "./tokenService";
import AuditLogService from "./auditLogService";

const canUseStorage = SUPABASE_ENABLED;
const AUTH_AUDIT_KEY = "icj_auth_audit_logs";
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_ALLOWED_UPLOAD_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
];
const DEFAULT_CATEGORIES = [
    "Identity Documents",
    "Legal Case Documents",
    "Finance Documents",
    "Membership Documents",
    "Token Documents",
    "General",
];

const nowIso = () => new Date().toISOString();
const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const normalizeRole = (role) => String(role || "member").toLowerCase();

const readLocalAuditRows = () => {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(AUTH_AUDIT_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const sortByCreatedAtDesc = (rows = []) =>
    [...rows].sort((a, b) => new Date(b.createdAt || b.created_at || b.event_time || 0).getTime() - new Date(a.createdAt || a.created_at || a.event_time || 0).getTime());

const toCsv = (rows = [], columns = []) => {
    const escape = (value) => {
        const raw = value === null || value === undefined ? "" : String(value);
        return `"${raw.replace(/"/g, '""')}"`;
    };

    const header = columns.map((column) => escape(column.label)).join(",");
    const body = rows
        .map((row) =>
            columns
                .map((column) => {
                    const value = row?.[column.key];
                    if (Array.isArray(value)) return escape(value.join("|"));
                    return escape(value);
                })
                .join(",")
        )
        .join("\n");

    return `${header}\n${body}`;
};

const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const normalizeDocumentSettings = (row = {}) => ({
    id: row.id || `DOC-SET-${row.scope_type || row.scopeType || "system"}-${row.scope_id || row.scopeId || "global"}`,
    scope_type: row.scope_type || row.scopeType || "system",
    scope_id: row.scope_id || row.scopeId || "global",
    categories: Array.isArray(row.categories) && row.categories.length > 0 ? row.categories : DEFAULT_CATEGORIES,
    allowed_file_types: Array.isArray(row.allowed_file_types || row.allowedFileTypes)
        ? (row.allowed_file_types || row.allowedFileTypes)
        : DEFAULT_ALLOWED_UPLOAD_TYPES,
    max_upload_size_bytes: Number(row.max_upload_size_bytes || row.maxUploadSizeBytes || MAX_UPLOAD_SIZE_BYTES),
    versioning_enabled: row.versioning_enabled ?? row.versioningEnabled ?? true,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeFolder = (row = {}) => ({
    ...row,
    id: String(row.id || nextId("DFLD")).trim(),
    name: requireString(row.name, "Folder name"),
    parent_folder_id: row.parent_folder_id || row.parentFolderId || null,
    path: row.path || row.folderPath || `/${String(row.name || "folder").trim()}`,
    organization_id: row.organization_id || row.organizationId || null,
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    case_id: row.case_id || row.caseId || null,
    finance_reference_id: row.finance_reference_id || row.financeReferenceId || null,
    status: row.status || "Active",
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeDocument = (row = {}) => ({
    ...row,
    id: row.id || Date.now(),
    documentNo: row.documentNo || row.document_no || `DOC-${Date.now()}`,
    category: row.category || "General",
    owner: row.owner || "",
    folderId: row.folderId || row.folder_id || null,
    folderPath: row.folderPath || row.folder_path || "/",
    moduleType: row.moduleType || row.module_type || "General",
    referenceId: optionalString(row.referenceId || row.reference_id),
    description: optionalString(row.description),
    tags: Array.isArray(row.tags) ? row.tags : [],
    personId: row.personId || row.person_id || null,
    memberId: row.memberId || row.member_id || null,
    organizationId: row.organizationId || row.organization_id || null,
    caseId: row.caseId || row.case_id || null,
    financeReferenceId: row.financeReferenceId || row.finance_reference_id || null,
    financeTransactionId: row.financeTransactionId || row.finance_transaction_id || null,
    financeAccountId: row.financeAccountId || row.finance_account_id || null,
    currentVersion: Number(row.currentVersion || row.current_version || 1),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    fileName: row.fileName || row.file_name || "",
    fileType: row.fileType || row.file_type || "",
    filePath: row.filePath || row.file_path || "",
    fileUrl: row.fileUrl || row.file_url || "",
    fileSize: Number(row.fileSize || row.file_size || 0),
    status: row.status || "Active",
    verification_status: row.verification_status || row.verificationStatus || "Pending",
    verification_remarks: row.verification_remarks || row.verificationRemarks || "",
    verification_date: row.verification_date || row.verificationDate || null,
    verified_by: row.verified_by || row.verifiedBy || null,
    document_history: Array.isArray(row.document_history || row.documentHistory)
        ? (row.document_history || row.documentHistory)
        : [],
    createdAt: row.createdAt || row.created_at || nowIso(),
    updatedAt: row.updatedAt || row.updated_at || row.createdAt || row.created_at || nowIso(),
});

const normalizeVersion = (row = {}) => ({
    ...row,
    id: String(row.id || nextId("DVER")).trim(),
    document_id: row.document_id || row.documentId,
    version: Number(row.version || row.version_no || row.versionNo || 1),
    version_no: Number(row.version_no || row.versionNo || row.version || 1),
    note: optionalString(row.note) || "Version update",
    fileName: row.fileName || row.file_name || "",
    fileType: row.fileType || row.file_type || "",
    filePath: row.filePath || row.file_path || "",
    fileUrl: row.fileUrl || row.file_url || "",
    fileSize: Number(row.fileSize || row.file_size || 0),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    createdAt: row.createdAt || row.created_at || nowIso(),
    updatedAt: row.updatedAt || row.updated_at || row.createdAt || row.created_at || nowIso(),
});

const getDocumentPermissionState = (role = "member") => ({
    canUpload: hasPermission(role, "documents.upload"),
    canEdit: hasPermission(role, "documents.update"),
    canDelete: hasPermission(role, "documents.delete"),
    canDownload: hasPermission(role, "documents.download"),
    canPreview: hasPermission(role, "documents.view"),
    canVersion: hasPermission(role, "documents.version.manage"),
    canManageCategories: hasPermission(role, "documents.categories.manage"),
    canManageFolders: hasPermission(role, "documents.folders.manage"),
    canAuditView: hasPermission(role, "documents.audit.view"),
    canExport: hasPermission(role, "documents.export") || hasPermission(role, "reports.export"),
    canManageSettings: hasPermission(role, "documents.settings.manage"),
});

const getSettingsRow = async (scope = {}) => {
    const rows = Array.isArray(await getDocumentSettings()) ? await getDocumentSettings() : [];
    const scopeType = scope.scopeType || scope.scope_type || "system";
    const scopeId = scope.scopeId || scope.scope_id || "global";
    const existing = rows.find((row) => String(row.scope_type || row.scopeType || "") === String(scopeType) && String(row.scope_id || row.scopeId || "") === String(scopeId));
    if (existing) return normalizeDocumentSettings(existing);

    const created = normalizeDocumentSettings({ scope_type: scopeType, scope_id: scopeId });
    await addDocumentSettings(created);
    return created;
};

const uploadFile = async (file, settings) => {
    let fileUrl = "";
    let filePath = "";

    if (!(typeof File !== "undefined" && file instanceof File)) {
        return { fileUrl, filePath, fileName: "", fileType: "", fileSize: 0 };
    }

    const allowedTypes = new Set((settings?.allowed_file_types || DEFAULT_ALLOWED_UPLOAD_TYPES).map((item) => String(item).toLowerCase()));
    if (!allowedTypes.has(String(file.type || "").toLowerCase())) {
        throw new Error("Unsupported file type.");
    }

    if (Number(file.size || 0) > Number(settings?.max_upload_size_bytes || MAX_UPLOAD_SIZE_BYTES)) {
        throw new Error("File exceeds upload limit.");
    }

    const safeFileName = String(file.name || "file")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
    const uploadName = `${Date.now()}-${safeFileName}`;

    if (canUseStorage) {
        try {
            const { error } = await supabase.storage.from("documents").upload(uploadName, file, { upsert: true });
            if (!error) {
                const { data } = supabase.storage.from("documents").getPublicUrl(uploadName);
                fileUrl = data?.publicUrl || "";
                filePath = uploadName;
                return { fileUrl, filePath, fileName: file.name || "", fileType: file.type || "", fileSize: Number(file.size || 0) };
            }
        } catch {
            // Fall back to local data URL when storage upload fails.
        }
    }

    fileUrl = await fileToDataUrl(file);
    return { fileUrl, filePath, fileName: file.name || "", fileType: file.type || "", fileSize: Number(file.size || 0) };
};

const logDocumentAudit = async (action, metadata = {}) => {
    try {
        await AuditLogService.logAuthEvent({
            action,
            source: "web",
            metadata,
        });
    } catch {
        // Keep document workflow non-blocking when audit write fails.
    }
};

const mapAuditRow = (row) => ({
    id: row.id || `audit-${row.event_time || Date.now()}`,
    timestamp: row.event_time || row.created_at || nowIso(),
    action: row.action || "document_updated",
    documentId: row?.metadata?.document_id || row?.metadata?.documentId || "",
    documentNo: row?.metadata?.document_no || row?.metadata?.documentNo || "",
    detail: row?.metadata?.detail || row?.metadata?.message || row.action || "",
    actorRole: row?.metadata?.actor_role || row?.metadata?.actorRole || "system",
});

const getDocumentAuditActions = () => new Set([
    "document_uploaded",
    "document_updated",
    "document_deleted",
    "document_version_uploaded",
    "document_downloaded",
    "document_previewed",
    "document_category_added",
    "document_folder_created",
    "document_settings_updated",
]);

const getAuditRows = async (documentId = null) => {
    const allowed = getDocumentAuditActions();

    if (SUPABASE_ENABLED) {
        try {
            const { data, error } = await supabase
                .from("auth_audit_logs")
                .select("id, action, metadata, event_time, created_at")
                .order("event_time", { ascending: false })
                .limit(500);
            if (!error && Array.isArray(data)) {
                return data
                    .filter((row) => allowed.has(row.action))
                    .map(mapAuditRow)
                    .filter((row) => !documentId || String(row.documentId) === String(documentId));
            }
        } catch {
            // Fall back to local audit cache.
        }
    }

    return readLocalAuditRows()
        .filter((row) => allowed.has(row?.action))
        .map(mapAuditRow)
        .filter((row) => !documentId || String(row.documentId) === String(documentId));
};

const matchDocument = (row, filters = {}) => {
    if (filters.category && filters.category !== "ALL" && String(row.category || "") !== String(filters.category)) return false;
    if (filters.moduleType && filters.moduleType !== "ALL" && String(row.moduleType || "") !== String(filters.moduleType)) return false;
    if (filters.status && filters.status !== "ALL" && String(row.status || "") !== String(filters.status)) return false;
    if (filters.owner && filters.owner !== "ALL" && String(row.owner || "") !== String(filters.owner)) return false;
    if (filters.documentId && String(row.id) !== String(filters.documentId)) return false;
    if (filters.personId && String(row.personId || "") !== String(filters.personId)) return false;
    if (filters.organizationId && String(row.organizationId || "") !== String(filters.organizationId)) return false;
    if (filters.caseId && String(row.caseId || "") !== String(filters.caseId)) return false;
    if (filters.financeReferenceId && String(row.financeReferenceId || "") !== String(filters.financeReferenceId)) return false;
    if (filters.memberId && String(row.memberId || "") !== String(filters.memberId)) return false;
    return true;
};

const DocumentService = {
    getPermissions(role) {
        return getDocumentPermissionState(normalizeRole(role));
    },

    async getSettings(scope = {}) {
        return getSettingsRow(scope);
    },

    async saveSettings(settings = {}, role = "member", scope = {}) {
        const permissions = this.getPermissions(role);
        if (!permissions.canManageSettings) {
            throw new Error("You do not have permission to update document settings.");
        }

        const current = await getSettingsRow(scope);
        const next = normalizeDocumentSettings({
            ...current,
            ...settings,
            categories: Array.isArray(settings.categories) ? settings.categories : current.categories,
            allowed_file_types: Array.isArray(settings.allowed_file_types || settings.allowedFileTypes)
                ? (settings.allowed_file_types || settings.allowedFileTypes)
                : current.allowed_file_types,
        });
        await updateDocumentSettings(current.id, next);
        await logDocumentAudit("document_settings_updated", {
            scope_type: next.scope_type,
            scope_id: next.scope_id,
            actor_role: normalizeRole(role),
            message: "Document settings updated",
        });
        return next;
    },

    async getCategories(scope = {}) {
        const settings = await getSettingsRow(scope);
        return settings.categories;
    },

    async addCategory(name, role = "member", scope = {}) {
        const permissions = this.getPermissions(role);
        if (!permissions.canManageCategories) {
            throw new Error("You do not have permission to manage document categories.");
        }

        const label = requireString(name, "Category");
        const settings = await getSettingsRow(scope);
        if (settings.categories.includes(label)) return settings.categories;
        const next = [...settings.categories, label];
        await updateDocumentSettings(settings.id, { ...settings, categories: next, updated_at: nowIso() });
        await logDocumentAudit("document_category_added", {
            actor_role: normalizeRole(role),
            detail: `${label} category added`,
            message: `${label} category added`,
        });
        return next;
    },

    async getFolders(filters = {}) {
        const rows = Array.isArray(await getDocumentFolders()) ? await getDocumentFolders() : [];
        return sortByCreatedAtDesc(rows.map((row) => normalizeFolder(row)).filter((row) => matchDocument(row, filters)));
    },

    async createFolder(payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManageFolders) {
            throw new Error("You do not have permission to manage folders.");
        }

        const parentPath = payload.parentPath || "/";
        const folder = normalizeFolder({
            ...payload,
            path: payload.path || `${parentPath === "/" ? "" : parentPath}/${requireString(payload.name, "Folder name")}`,
        });
        const created = await addDocumentFolder(folder);
        await logDocumentAudit("document_folder_created", {
            actor_role: normalizeRole(role),
            detail: `${folder.name} folder created`,
            message: `${folder.name} folder created`,
            folder_id: folder.id,
        });
        return normalizeFolder(created || folder);
    },

    async getAll(filters = {}) {
        const rows = await getDocuments();
        return sortByCreatedAtDesc((Array.isArray(rows) ? rows : []).map((row) => normalizeDocument(row)).filter((row) => matchDocument(row, filters)));
    },

    async search({
        query = "",
        category = "ALL",
        moduleType = "ALL",
        status = "ALL",
        owner = "ALL",
        tags = [],
        ...scope
    } = {}) {
        const rows = await this.getAll({ category, moduleType, status, owner, ...scope });
        const keyword = String(query || "").toLowerCase();
        const requiredTags = Array.isArray(tags)
            ? tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
            : [];

        return rows.filter((item) => {
            const itemTags = Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).toLowerCase()) : [];
            const matchesSearch =
                !keyword ||
                String(item.documentNo || "").toLowerCase().includes(keyword) ||
                String(item.title || "").toLowerCase().includes(keyword) ||
                String(item.owner || "").toLowerCase().includes(keyword) ||
                String(item.referenceId || "").toLowerCase().includes(keyword) ||
                String(item.description || "").toLowerCase().includes(keyword);
            const matchesTags = requiredTags.every((tag) => itemTags.includes(tag));
            return matchesSearch && matchesTags;
        });
    },

    async getDashboard(filters = {}) {
        const rows = await this.getAll(filters);
        const byCategory = rows.reduce((acc, item) => {
            const key = item.category || "General";
            acc[key] = Number(acc[key] || 0) + 1;
            return acc;
        }, {});
        const byModule = rows.reduce((acc, item) => {
            const key = item.moduleType || "General";
            acc[key] = Number(acc[key] || 0) + 1;
            return acc;
        }, {});
        const totalSizeBytes = rows.reduce((sum, item) => sum + Number(item.fileSize || 0), 0);
        const folders = await this.getFolders(filters);

        return {
            totalDocuments: rows.length,
            activeDocuments: rows.filter((item) => String(item.status || "Active") === "Active").length,
            draftDocuments: rows.filter((item) => String(item.status || "Active") === "Draft").length,
            archivedDocuments: rows.filter((item) => String(item.status || "") === "Archived").length,
            totalFolders: folders.length,
            totalSizeBytes,
            byCategory,
            byModule,
            recent: rows.slice(0, 20),
        };
    },

    async getIntegrationSources() {
        const [members, legalCases, financeRows, tokens] = await Promise.all([
            MemberService.getAll(),
            LegalService.getAll(),
            FinanceService.getTransactionHistory(),
            TokenService.getAll(),
        ]);

        return {
            membership: (Array.isArray(members) ? members : []).map((item) => ({
                value: item.member_id || item.id,
                label: `${item.name || "Member"} (${item.member_id || item.id || "-"})`,
            })),
            legal: (Array.isArray(legalCases) ? legalCases : []).map((item) => ({
                value: item.caseNumber || item.id,
                label: `${item.caseNumber || item.id} - ${item.title || "Case"}`,
            })),
            finance: (Array.isArray(financeRows) ? financeRows : []).slice(0, 200).map((item) => ({
                value: item.reference || item.id,
                label: `${item.reference || item.id} (${item.type || "Finance"})`,
            })),
            token: (Array.isArray(tokens) ? tokens : []).map((item) => ({
                value: item.tokenNo || item.token_no || item.id,
                label: `${item.tokenNo || item.token_no || item.id} (${item.memberId || item.member_id || "-"})`,
            })),
        };
    },

    async create(documentData = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canUpload) {
            throw new Error("You do not have permission to upload documents.");
        }

        const title = requireString(documentData.title, "Document title");
        const settings = await getSettingsRow({ scopeType: documentData.organizationId ? "organization" : "system", scopeId: documentData.organizationId || "global" });
        const { file, ...safeData } = documentData;
        const upload = await uploadFile(file, settings);
        const tags = Array.isArray(documentData.tags)
            ? documentData.tags
            : String(documentData.tags || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

        const document = normalizeDocument({
            id: Date.now(),
            documentNo: `DOC-${Date.now()}`,
            title,
            category: documentData.category || "General",
            owner: documentData.owner || documentData.createdBy || "",
            folderId: documentData.folderId || null,
            folderPath: documentData.folderPath || "/",
            moduleType: documentData.moduleType || "General",
            referenceId: optionalString(documentData.referenceId),
            description: optionalString(documentData.description),
            tags,
            personId: documentData.personId || null,
            memberId: documentData.memberId || null,
            organizationId: documentData.organizationId || null,
            caseId: documentData.caseId || null,
            financeReferenceId: documentData.financeReferenceId || null,
            financeTransactionId: documentData.financeTransactionId || null,
            financeAccountId: documentData.financeAccountId || null,
            currentVersion: 1,
            metadata: documentData.metadata || {},
            fileName: upload.fileName || documentData.fileName || "",
            fileType: upload.fileType || documentData.fileType || "",
            filePath: upload.filePath || documentData.filePath || "",
            fileUrl: upload.fileUrl || documentData.fileUrl || "",
            fileSize: upload.fileSize || Number(documentData.fileSize || 0),
            status: documentData.status || "Active",
            verification_status: documentData.verification_status || "Pending",
            verification_remarks: documentData.verification_remarks || "",
            verification_date: documentData.verification_date || null,
            verified_by: documentData.verified_by || null,
            document_history: [
                {
                    id: `doc-hist-${Date.now()}`,
                    timestamp: nowIso(),
                    action: "Uploaded",
                    status: documentData.status || "Active",
                    verification_status: documentData.verification_status || "Pending",
                    remarks: documentData.verification_remarks || "",
                },
            ],
            createdAt: nowIso(),
            updatedAt: nowIso(),
            ...safeData,
        });

        const created = await addDocument(document);
        const documentId = created?.id || document.id;
        const version = normalizeVersion({
            document_id: documentId,
            version_no: 1,
            note: "Initial upload",
            file_name: document.fileName,
            file_type: document.fileType,
            file_path: document.filePath,
            file_url: document.fileUrl,
            file_size: document.fileSize,
            metadata: { actor_role: normalizeRole(role) },
        });
        await addDocumentVersion(version);

        await logDocumentAudit("document_uploaded", {
            document_id: documentId,
            document_no: document.documentNo,
            actor_role: normalizeRole(role),
            detail: `${title} uploaded under ${document.category}`,
            message: `${title} uploaded under ${document.category}`,
        });

        return normalizeDocument(created || document);
    },

    async update(id, values, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canEdit) {
            throw new Error("You do not have permission to update documents.");
        }

        const existingRows = await this.getAll();
        const existing = existingRows.find((item) => String(item.id) === String(id));
        if (!existing) {
            throw new Error("Document not found.");
        }

        const next = normalizeDocument({ ...existing, ...values, id, updatedAt: nowIso() });
        await updateDocument(id, next);
        await logDocumentAudit("document_updated", {
            document_id: id,
            document_no: existing.documentNo,
            actor_role: normalizeRole(role),
            detail: `Document ${existing.title || existing.documentNo} updated`,
            message: `Document ${existing.title || existing.documentNo} updated`,
        });
        return next;
    },

    async remove(id, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canDelete) {
            throw new Error("You do not have permission to delete documents.");
        }

        const existingRows = await this.getAll();
        const existing = existingRows.find((item) => String(item.id) === String(id));
        await deleteDocument(id);
        await logDocumentAudit("document_deleted", {
            document_id: id,
            document_no: existing?.documentNo || "",
            actor_role: normalizeRole(role),
            detail: `Document ${existing?.title || existing?.documentNo || id} deleted`,
            message: `Document ${existing?.title || existing?.documentNo || id} deleted`,
        });
    },

    async addVersion(id, payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canVersion) {
            throw new Error("You do not have permission to upload new versions.");
        }

        const rows = await this.getAll();
        const doc = rows.find((item) => String(item.id) === String(id));
        if (!doc) {
            throw new Error("Document not found.");
        }

        const settings = await getSettingsRow({ scopeType: doc.organizationId ? "organization" : "system", scopeId: doc.organizationId || "global" });
        const upload = await uploadFile(payload.file, settings);
        const versions = await this.getVersions(id);
        const nextVersionNumber = (versions[0]?.version || doc.currentVersion || 1) + 1;
        const versionEntry = normalizeVersion({
            document_id: id,
            version_no: nextVersionNumber,
            note: optionalString(payload.note) || "Version update",
            file_name: upload.fileName || doc.fileName,
            file_type: upload.fileType || doc.fileType,
            file_path: upload.filePath || doc.filePath,
            file_url: upload.fileUrl || doc.fileUrl,
            file_size: upload.fileSize || doc.fileSize,
            metadata: { actor_role: normalizeRole(role) },
        });

        await addDocumentVersion(versionEntry);
        await updateDocument(id, {
            ...doc,
            currentVersion: nextVersionNumber,
            fileName: versionEntry.fileName,
            fileType: versionEntry.fileType,
            filePath: versionEntry.filePath,
            fileUrl: versionEntry.fileUrl,
            fileSize: versionEntry.fileSize,
            updatedAt: nowIso(),
        });

        await logDocumentAudit("document_version_uploaded", {
            document_id: id,
            document_no: doc.documentNo,
            actor_role: normalizeRole(role),
            detail: `Version ${nextVersionNumber} uploaded`,
            message: `Version ${nextVersionNumber} uploaded`,
        });

        return versionEntry;
    },

    async getVersions(id) {
        const rows = Array.isArray(await getDocumentVersions()) ? await getDocumentVersions() : [];
        return sortByCreatedAtDesc(rows.filter((row) => String(row.document_id || row.documentId) === String(id)).map((row) => normalizeVersion(row)));
    },

    async getAuditLog(documentId = null) {
        return getAuditRows(documentId);
    },

    async getHistory(documentId = null) {
        return this.getAuditLog(documentId);
    },

    async setVerificationStatus(id, payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canEdit) {
            throw new Error("You do not have permission to update documents.");
        }

        const rows = await this.getAll();
        const doc = rows.find((item) => String(item.id) === String(id));
        if (!doc) {
            throw new Error("Document not found.");
        }

        const status = String(payload.status || "Pending").trim();
        const remarks = String(payload.remarks || "").trim();
        const now = nowIso();
        const verifiedBy = payload.verifiedBy || payload.verified_by || "system";
        const historyEntry = {
            id: `doc-hist-${Date.now()}`,
            timestamp: now,
            action: "Verification Updated",
            status: doc.status || "Active",
            verification_status: status,
            remarks,
            verified_by: verifiedBy,
        };

        const next = await this.update(id, {
            verification_status: status,
            verification_remarks: remarks,
            verification_date: now,
            verified_by: verifiedBy,
            document_history: [historyEntry, ...(Array.isArray(doc.document_history) ? doc.document_history : [])].slice(0, 100),
        }, role);

        await logDocumentAudit("document_updated", {
            document_id: id,
            document_no: doc.documentNo,
            actor_role: normalizeRole(role),
            detail: `Verification status set to ${status}`,
            message: `Verification status set to ${status}`,
        });

        return next;
    },

    async getTags(filters = {}) {
        const rows = await this.getAll(filters);
        const set = new Set();
        rows.forEach((item) => {
            (Array.isArray(item.tags) ? item.tags : []).forEach((tag) => set.add(String(tag)));
        });
        return [...set].sort((a, b) => a.localeCompare(b));
    },

    buildExport(rows = []) {
        const columns = [
            { key: "documentNo", label: "Document No" },
            { key: "title", label: "Title" },
            { key: "category", label: "Category" },
            { key: "moduleType", label: "Module" },
            { key: "referenceId", label: "Reference" },
            { key: "owner", label: "Owner" },
            { key: "status", label: "Status" },
            { key: "currentVersion", label: "Version" },
            { key: "folderPath", label: "Folder" },
            { key: "fileName", label: "File Name" },
            { key: "fileType", label: "File Type" },
            { key: "fileSize", label: "File Size" },
            { key: "createdAt", label: "Created At" },
        ];

        return {
            fileName: `documents-${new Date().toISOString().slice(0, 10)}.csv`,
            content: toCsv(rows, columns),
        };
    },

    async markPreview(document, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canPreview) {
            throw new Error("You do not have permission to preview documents.");
        }

        await logDocumentAudit("document_previewed", {
            document_id: document.id,
            document_no: document.documentNo,
            actor_role: normalizeRole(role),
            detail: `${document.title || document.documentNo} previewed`,
            message: `${document.title || document.documentNo} previewed`,
        });
    },

    async getDownloadUrl(document, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canDownload) {
            throw new Error("You do not have permission to download documents.");
        }

        await logDocumentAudit("document_downloaded", {
            document_id: document.id,
            document_no: document.documentNo,
            actor_role: normalizeRole(role),
            detail: `${document.title || document.documentNo} downloaded`,
            message: `${document.title || document.documentNo} downloaded`,
        });

        if (document.fileUrl) return document.fileUrl;
        if (!document.filePath || !canUseStorage) return "";

        try {
            const { data } = supabase.storage.from("documents").getPublicUrl(document.filePath);
            return data?.publicUrl || "";
        } catch {
            return "";
        }
    },

    async getPreviewUrl(document, role = "member") {
        await this.markPreview(document, role);
        return this.getDownloadUrl(document, role);
    },
};

export default DocumentService;
