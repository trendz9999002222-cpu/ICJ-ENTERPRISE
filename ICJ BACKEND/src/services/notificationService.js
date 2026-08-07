import {
    addNotification,
    addNotificationPreference,
    addNotificationQueue,
    addNotificationSetting,
    addNotificationTemplate,
    deleteNotification,
    getNotificationPreferences,
    getNotifications,
    getNotificationQueues,
    getNotificationSettings,
    getNotificationTemplates,
    updateNotification,
    updateNotificationPreference,
    updateNotificationQueue,
    updateNotificationSetting,
    updateNotificationTemplate,
} from "./database";
import { hasPermission } from "../core/permissions";
import AuditLogService from "./auditLogService";
import NotificationFoundationService from "./notificationFoundationService";
import { requireString } from "../utils/validation";

const NOTIFICATION_STATUS = {
    UNREAD: "Unread",
    READ: "Read",
    QUEUED: "Queued",
    SENT: "Sent",
    FAILED: "Failed",
};

const DEFAULT_SETTINGS = {
    scope_type: "system",
    scope_id: "global",
    email_queue_enabled: true,
    sms_queue_enabled: true,
    whatsapp_queue_enabled: true,
    push_enabled: true,
    inapp_enabled: true,
    default_priority: "NORMAL",
    max_retry_count: 3,
    metadata: {},
};

const DEFAULT_PREFERENCES = {
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: true,
    push_enabled: true,
    inapp_enabled: true,
    metadata: {},
};

const nowIso = () => new Date().toISOString();
const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const normalizeRole = (role) => String(role || "member").toLowerCase();

const toPermissionState = (role = "member") => ({
    canView: hasPermission(role, "notifications.view"),
    canManage: hasPermission(role, "notifications.manage"),
    canTemplateManage: hasPermission(role, "notifications.templates.manage") || hasPermission(role, "notifications.manage"),
    canQueueManage: hasPermission(role, "notifications.queue.manage") || hasPermission(role, "notifications.manage"),
    canSettingsManage: hasPermission(role, "notifications.settings.manage") || hasPermission(role, "notifications.manage"),
});

const normalizeTemplate = (row = {}) => ({
    id: row.id || nextId("NTPL"),
    code: String(row.code || row.name || "NOTIFICATION_TEMPLATE").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "_"),
    name: requireString(row.name || row.code || "Template", "Template name"),
    subject: String(row.subject || "").trim(),
    body: requireString(row.body || "Template body", "Template body"),
    channel: String(row.channel || "inapp").toLowerCase(),
    module: String(row.module || "general").toLowerCase(),
    status: String(row.status || "active").toLowerCase(),
    organization_id: row.organization_id || row.organizationId || null,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeQueue = (row = {}) => ({
    id: row.id || nextId("NQ"),
    queue_no: row.queue_no || row.queueNo || `NQ-${Date.now()}`,
    channel: String(row.channel || "inapp").toLowerCase(),
    status: String(row.status || NOTIFICATION_STATUS.QUEUED).trim(),
    priority: String(row.priority || "NORMAL").toUpperCase(),
    recipient: String(row.recipient || "").trim(),
    template_code: row.template_code || row.templateCode || null,
    template_id: row.template_id || row.templateId || null,
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    organization_id: row.organization_id || row.organizationId || null,
    role_code: row.role_code || row.roleCode || null,
    payload: row.payload && typeof row.payload === "object" ? row.payload : {},
    scheduled_at: row.scheduled_at || row.scheduledAt || nowIso(),
    processed_at: row.processed_at || row.processedAt || null,
    error_message: row.error_message || row.errorMessage || null,
    retry_count: Number(row.retry_count || row.retryCount || 0),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeNotification = (row = {}) => ({
    id: row.id || Date.now(),
    title: row.title || "",
    message: row.message || "",
    type: row.type || "Info",
    channel: String(row.channel || "inapp").toLowerCase(),
    status: row.status || NOTIFICATION_STATUS.UNREAD,
    template_code: row.template_code || row.templateCode || null,
    template_id: row.template_id || row.templateId || null,
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    organization_id: row.organization_id || row.organizationId || null,
    role_code: row.role_code || row.roleCode || null,
    payload: row.payload && typeof row.payload === "object" ? row.payload : {},
    sent_at: row.sent_at || row.sentAt || null,
    read_at: row.read_at || row.readAt || null,
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizePreference = (row = {}) => ({
    id: row.id || nextId("NPREF"),
    scope_type: row.scope_type || row.scopeType || "person",
    scope_id: row.scope_id || row.scopeId || row.person_id || row.personId || row.member_id || row.memberId || row.organization_id || row.organizationId || "global",
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    organization_id: row.organization_id || row.organizationId || null,
    role_code: row.role_code || row.roleCode || null,
    email_enabled: row.email_enabled ?? row.emailEnabled ?? true,
    sms_enabled: row.sms_enabled ?? row.smsEnabled ?? true,
    whatsapp_enabled: row.whatsapp_enabled ?? row.whatsappEnabled ?? true,
    push_enabled: row.push_enabled ?? row.pushEnabled ?? true,
    inapp_enabled: row.inapp_enabled ?? row.inappEnabled ?? true,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeSetting = (row = {}) => ({
    id: row.id || `NSET-${row.scope_type || row.scopeType || "system"}-${row.scope_id || row.scopeId || "global"}`,
    ...DEFAULT_SETTINGS,
    ...row,
    scope_type: row.scope_type || row.scopeType || "system",
    scope_id: row.scope_id || row.scopeId || "global",
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const sortByCreatedAtDesc = (rows = []) =>
    [...rows].sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());

const channelPreferenceKey = (channel = "inapp") => {
    if (channel === "email") return "email_enabled";
    if (channel === "sms") return "sms_enabled";
    if (channel === "whatsapp") return "whatsapp_enabled";
    if (channel === "push") return "push_enabled";
    return "inapp_enabled";
};

const channelSettingKey = (channel = "inapp") => {
    if (channel === "email") return "email_queue_enabled";
    if (channel === "sms") return "sms_queue_enabled";
    if (channel === "whatsapp") return "whatsapp_queue_enabled";
    if (channel === "push") return "push_enabled";
    return "inapp_enabled";
};

const ensureAudit = async (action, metadata = {}) => {
    try {
        await AuditLogService.logAuthEvent({ action, source: "web", metadata });
    } catch {
        // Keep notification flow non-blocking when audit write fails.
    }
};

const findMatchingScope = (rows = [], scope = {}) => {
    const scopeType = scope.scopeType || scope.scope_type || "system";
    const scopeId = scope.scopeId || scope.scope_id || "global";
    return rows.find((row) => String(row.scope_type || row.scopeType || "") === String(scopeType) && String(row.scope_id || row.scopeId || "") === String(scopeId));
};

const resolveTemplateBody = (template, payload = {}) => {
    const compile = (text = "") => String(text).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
        const value = payload?.[key];
        return value === undefined || value === null ? "" : String(value);
    });
    return {
        subject: compile(template?.subject || ""),
        body: compile(template?.body || ""),
    };
};

const NotificationService = {
    getPermissions(role) {
        return toPermissionState(normalizeRole(role));
    },

    async getSettings(scope = {}) {
        const rows = Array.isArray(await getNotificationSettings()) ? await getNotificationSettings() : [];
        const found = findMatchingScope(rows, scope);
        if (found) return normalizeSetting(found);

        const created = normalizeSetting(scope);
        await addNotificationSetting(created);
        return created;
    },

    async saveSettings(settings = {}, role = "member", scope = {}) {
        const permissions = this.getPermissions(role);
        if (!permissions.canSettingsManage) {
            throw new Error("You do not have permission to update notification settings.");
        }

        const current = await this.getSettings(scope);
        const next = normalizeSetting({ ...current, ...settings, updated_at: nowIso() });
        await updateNotificationSetting(current.id, next);
        await ensureAudit("notification_settings_updated", {
            scope_type: next.scope_type,
            scope_id: next.scope_id,
            actor_role: normalizeRole(role),
            message: "Notification settings updated",
        });
        return next;
    },

    async getPreferences(filters = {}) {
        const rows = Array.isArray(await getNotificationPreferences()) ? await getNotificationPreferences() : [];
        return rows
            .map((row) => normalizePreference(row))
            .filter((row) => {
                if (filters.scopeType && String(row.scope_type) !== String(filters.scopeType)) return false;
                if (filters.scopeId && String(row.scope_id) !== String(filters.scopeId)) return false;
                if (filters.organizationId && String(row.organization_id || "") !== String(filters.organizationId)) return false;
                if (filters.personId && String(row.person_id || "") !== String(filters.personId)) return false;
                if (filters.memberId && String(row.member_id || "") !== String(filters.memberId)) return false;
                if (filters.roleCode && String(row.role_code || "") !== String(filters.roleCode)) return false;
                return true;
            });
    },

    async savePreference(preference = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManage) {
            throw new Error("You do not have permission to update notification preferences.");
        }

        const normalized = normalizePreference(preference);
        const rows = await this.getPreferences({
            scopeType: normalized.scope_type,
            scopeId: normalized.scope_id,
            personId: normalized.person_id || undefined,
            memberId: normalized.member_id || undefined,
            organizationId: normalized.organization_id || undefined,
            roleCode: normalized.role_code || undefined,
        });

        if (rows.length === 0) {
            await addNotificationPreference(normalized);
            return normalized;
        }

        const current = rows[0];
        const next = normalizePreference({ ...current, ...normalized, id: current.id, updated_at: nowIso() });
        await updateNotificationPreference(current.id, next);
        return next;
    },

    async getTemplates(filters = {}) {
        const rows = Array.isArray(await getNotificationTemplates()) ? await getNotificationTemplates() : [];
        return sortByCreatedAtDesc(rows.map((row) => normalizeTemplate(row)).filter((row) => {
            if (filters.code && String(row.code) !== String(filters.code).toUpperCase()) return false;
            if (filters.channel && String(row.channel) !== String(filters.channel).toLowerCase()) return false;
            if (filters.module && String(row.module) !== String(filters.module).toLowerCase()) return false;
            if (filters.organizationId && String(row.organization_id || "") !== String(filters.organizationId)) return false;
            return true;
        }));
    },

    async createTemplate(payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canTemplateManage) {
            throw new Error("You do not have permission to manage notification templates.");
        }

        const template = normalizeTemplate(payload);
        const saved = await addNotificationTemplate(template);
        await ensureAudit("notification_template_created", {
            template_code: template.code,
            channel: template.channel,
            actor_role: normalizeRole(role),
            message: "Notification template created",
        });
        return normalizeTemplate(saved || template);
    },

    async updateTemplate(id, values = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canTemplateManage) {
            throw new Error("You do not have permission to manage notification templates.");
        }

        const rows = await this.getTemplates();
        const current = rows.find((row) => String(row.id) === String(id));
        if (!current) throw new Error("Notification template not found.");
        const next = normalizeTemplate({ ...current, ...values, id, updated_at: nowIso() });
        await updateNotificationTemplate(id, next);
        return next;
    },

    async getQueues(filters = {}) {
        const rows = Array.isArray(await getNotificationQueues()) ? await getNotificationQueues() : [];
        return sortByCreatedAtDesc(rows.map((row) => normalizeQueue(row)).filter((row) => {
            if (filters.channel && String(row.channel) !== String(filters.channel).toLowerCase()) return false;
            if (filters.status && String(row.status) !== String(filters.status)) return false;
            if (filters.organizationId && String(row.organization_id || "") !== String(filters.organizationId)) return false;
            if (filters.personId && String(row.person_id || "") !== String(filters.personId)) return false;
            if (filters.memberId && String(row.member_id || "") !== String(filters.memberId)) return false;
            if (filters.roleCode && String(row.role_code || "") !== String(filters.roleCode)) return false;
            return true;
        }));
    },

    async enqueue(channel, payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManage && !permissions.canQueueManage) {
            throw new Error("You do not have permission to queue notifications.");
        }

        const normalizedChannel = String(channel || "inapp").toLowerCase();
        const settings = await this.getSettings({
            scopeType: payload.organization_id || payload.organizationId ? "organization" : "system",
            scopeId: payload.organization_id || payload.organizationId || "global",
        });
        if (!settings[channelSettingKey(normalizedChannel)]) {
            throw new Error(`Notification channel ${normalizedChannel} is disabled in settings.`);
        }

        const prefRows = await this.getPreferences({
            personId: payload.person_id || payload.personId || undefined,
            memberId: payload.member_id || payload.memberId || undefined,
            organizationId: payload.organization_id || payload.organizationId || undefined,
            roleCode: payload.role_code || payload.roleCode || undefined,
        });
        const preference = prefRows[0] ? normalizePreference(prefRows[0]) : normalizePreference({
            scope_type: payload.person_id || payload.personId ? "person" : payload.member_id || payload.memberId ? "member" : payload.organization_id || payload.organizationId ? "organization" : "role",
            scope_id: payload.person_id || payload.personId || payload.member_id || payload.memberId || payload.organization_id || payload.organizationId || payload.role_code || payload.roleCode || "global",
            person_id: payload.person_id || payload.personId || null,
            member_id: payload.member_id || payload.memberId || null,
            organization_id: payload.organization_id || payload.organizationId || null,
            role_code: payload.role_code || payload.roleCode || null,
            ...DEFAULT_PREFERENCES,
        });

        if (!preference[channelPreferenceKey(normalizedChannel)]) {
            throw new Error(`Notification channel ${normalizedChannel} is disabled in preferences.`);
        }

        const queue = normalizeQueue({
            channel: normalizedChannel,
            status: NOTIFICATION_STATUS.QUEUED,
            priority: payload.priority || settings.default_priority || "NORMAL",
            recipient: payload.recipient || "",
            template_code: payload.template_code || payload.templateCode || null,
            template_id: payload.template_id || payload.templateId || null,
            person_id: payload.person_id || payload.personId || null,
            member_id: payload.member_id || payload.memberId || null,
            organization_id: payload.organization_id || payload.organizationId || null,
            role_code: payload.role_code || payload.roleCode || null,
            payload: payload.payload && typeof payload.payload === "object" ? payload.payload : payload,
            scheduled_at: payload.scheduled_at || payload.scheduledAt || nowIso(),
            retry_count: 0,
            metadata: payload.metadata || {},
        });

        const saved = await addNotificationQueue(queue);
        await ensureAudit("notification_queued", {
            queue_no: queue.queue_no,
            channel: queue.channel,
            actor_role: normalizeRole(role),
            message: "Notification queued",
        });

        return normalizeQueue(saved || queue);
    },

    async enqueueEmail(payload = {}, role = "member") {
        return this.enqueue("email", payload, role);
    },

    async enqueueSms(payload = {}, role = "member") {
        return this.enqueue("sms", payload, role);
    },

    async enqueueWhatsApp(payload = {}, role = "member") {
        return this.enqueue("whatsapp", payload, role);
    },

    async enqueuePush(payload = {}, role = "member") {
        return this.enqueue("push", payload, role);
    },

    async enqueueInApp(payload = {}, role = "member") {
        return this.enqueue("inapp", payload, role);
    },

    async processQueue(queueId, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManage && !permissions.canQueueManage) {
            throw new Error("You do not have permission to process notification queues.");
        }

        const rows = await this.getQueues();
        const queue = rows.find((row) => String(row.id) === String(queueId));
        if (!queue) throw new Error("Notification queue record not found.");

        try {
            const dispatchResult = await NotificationFoundationService.dispatch(queue.channel, queue.payload || {});
            const sent = dispatchResult?.success === true || dispatchResult?.status === "notification_provider_not_implemented";
            const nextStatus = sent ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED;

            await updateNotificationQueue(queue.id, {
                ...queue,
                status: nextStatus,
                processed_at: nowIso(),
                error_message: sent ? null : (dispatchResult?.status || "dispatch_failed"),
                retry_count: Number(queue.retry_count || 0),
                updated_at: nowIso(),
            });

            if (nextStatus === NOTIFICATION_STATUS.SENT) {
                await this.create({
                    title: queue.payload?.title || "Notification",
                    message: queue.payload?.message || queue.payload?.body || "",
                    type: queue.payload?.type || "Info",
                    channel: queue.channel,
                    status: NOTIFICATION_STATUS.UNREAD,
                    template_code: queue.template_code,
                    template_id: queue.template_id,
                    person_id: queue.person_id,
                    member_id: queue.member_id,
                    organization_id: queue.organization_id,
                    role_code: queue.role_code,
                    payload: queue.payload || {},
                    sent_at: nowIso(),
                }, role);
            }

            await ensureAudit("notification_processed", {
                queue_no: queue.queue_no,
                status: nextStatus,
                channel: queue.channel,
                actor_role: normalizeRole(role),
                message: "Notification queue processed",
            });

            return { ...queue, status: nextStatus };
        } catch (error) {
            const nextRetryCount = Number(queue.retry_count || 0) + 1;
            await updateNotificationQueue(queue.id, {
                ...queue,
                status: NOTIFICATION_STATUS.FAILED,
                processed_at: nowIso(),
                error_message: error?.message || "dispatch_failed",
                retry_count: nextRetryCount,
                updated_at: nowIso(),
            });
            throw error;
        }
    },

    async getAll(filters = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canView && !permissions.canManage) {
            return [];
        }

        const rows = Array.isArray(await getNotifications()) ? await getNotifications() : [];
        return sortByCreatedAtDesc(
            rows
                .map((row) => normalizeNotification(row))
                .filter((row) => {
                    if (filters.organizationId && String(row.organization_id || "") !== String(filters.organizationId)) return false;
                    if (filters.personId && String(row.person_id || "") !== String(filters.personId)) return false;
                    if (filters.memberId && String(row.member_id || "") !== String(filters.memberId)) return false;
                    if (filters.roleCode && String(row.role_code || "") !== String(filters.roleCode)) return false;
                    if (filters.channel && String(row.channel || "") !== String(filters.channel).toLowerCase()) return false;
                    if (filters.status && String(row.status || "") !== String(filters.status)) return false;
                    return true;
                })
        );
    },

    async create(notificationData = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManage && !permissions.canView) {
            throw new Error("You do not have permission to create notifications.");
        }

        const templateCode = notificationData.template_code || notificationData.templateCode || null;
        let compiled = {
            subject: notificationData.title || "",
            body: notificationData.message || "",
        };

        if (templateCode) {
            const templates = await this.getTemplates({ code: templateCode });
            const template = templates[0] || null;
            if (template) {
                compiled = resolveTemplateBody(template, notificationData.payload || {});
            }
        }

        const notification = normalizeNotification({
            id: notificationData.id || Date.now(),
            title: compiled.subject || notificationData.title || "",
            message: compiled.body || notificationData.message || "",
            type: notificationData.type || "Info",
            channel: notificationData.channel || "inapp",
            status: notificationData.status || NOTIFICATION_STATUS.UNREAD,
            template_code: templateCode,
            template_id: notificationData.template_id || notificationData.templateId || null,
            person_id: notificationData.person_id || notificationData.personId || null,
            member_id: notificationData.member_id || notificationData.memberId || null,
            organization_id: notificationData.organization_id || notificationData.organizationId || null,
            role_code: notificationData.role_code || notificationData.roleCode || null,
            payload: notificationData.payload || {},
            sent_at: notificationData.sent_at || notificationData.sentAt || null,
            read_at: notificationData.read_at || notificationData.readAt || null,
            created_at: notificationData.created_at || notificationData.createdAt || nowIso(),
            updated_at: nowIso(),
            ...notificationData,
        });

        const created = await addNotification(notification);
        await ensureAudit("notification_created", {
            notification_id: notification.id,
            channel: notification.channel,
            actor_role: normalizeRole(role),
            message: "In-app notification created",
        });
        return normalizeNotification(created || notification);
    },

    async markAsRead(id, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canView && !permissions.canManage) {
            throw new Error("You do not have permission to read notifications.");
        }

        await updateNotification(id, {
            status: NOTIFICATION_STATUS.READ,
            read_at: nowIso(),
            updated_at: nowIso(),
        });
    },

    async remove(id, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canManage) {
            throw new Error("You do not have permission to remove notifications.");
        }
        await deleteNotification(id);
    },

    async getDashboard(filters = {}, role = "member") {
        const [notifications, queues, templates] = await Promise.all([
            this.getAll(filters, role),
            this.getQueues(filters),
            this.getTemplates({ organizationId: filters.organizationId }),
        ]);

        return {
            totalNotifications: notifications.length,
            unreadNotifications: notifications.filter((row) => row.status === NOTIFICATION_STATUS.UNREAD).length,
            queued: queues.filter((row) => row.status === NOTIFICATION_STATUS.QUEUED).length,
            sent: queues.filter((row) => row.status === NOTIFICATION_STATUS.SENT).length,
            failed: queues.filter((row) => row.status === NOTIFICATION_STATUS.FAILED).length,
            templates: templates.length,
            byChannel: notifications.reduce((acc, row) => {
                const key = row.channel || "inapp";
                acc[key] = Number(acc[key] || 0) + 1;
                return acc;
            }, {}),
            recent: notifications.slice(0, 20),
            updatedAt: nowIso(),
        };
    },
};

export default NotificationService;
