import { getMembers, updateMember } from "./database";
import SettingsService from "./settingsService";
import { getLegacyRole, getRoleCategory, getAssignableRoles, normalizeRoleCode, resolveRoleCode } from "../core/roles";
import PersonService from "./personService";
import AuditLogService from "./auditLogService";

const AUDIT_LOG_KEY = "icj_admin_audit";
const SESSION_KEY = "icj_user";

const readJson = (key, fallback) => {
    if (typeof window === "undefined") return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
};

const getSessionUser = () => readJson(SESSION_KEY, null);

const getActorContext = () => {
    const session = getSessionUser();
    const roleCode = resolveRoleCode(session?.profile, session?.user);

    return {
        userId: session?.user?.id || session?.profile?.id || null,
        email: session?.user?.email || session?.profile?.email || null,
        fullName: session?.profile?.full_name || session?.user?.full_name || session?.user?.email || "System Admin",
        roleCode,
    };
};

const assertSystemAdmin = () => {
    const actor = getActorContext();
    if (actor.roleCode !== "system_admin") {
        void AuditLogService.logSecurityEvent({
            action: "unauthorized_access",
            module: "security",
            entity: "administration",
            actorUuid: actor.userId,
            actorRole: actor.roleCode,
            actorName: actor.fullName,
            result: "failed",
            failureReason: "Only System Admin can perform approval and role management actions.",
        });
        throw new Error("Only System Admin can perform approval and role management actions.");
    }
    return actor;
};

const normalizeMemberRecord = (row = {}) => {
    const roleCode = normalizeRoleCode(row.role_code || row.role || "member");
    const roleCategory = row.role_category || getRoleCategory(roleCode);
    const legacyRole = row.legacy_role || getLegacyRole(roleCode);
    const status = row.status || row.verification_status || "Pending";
    const verificationStatus = row.verification_status || status || "Pending";

    return {
        ...row,
        id: row.id || row.members || row.member_id || "",
        member_id: row.member_id || row.id || row.members || "",
        name: row.name || row.full_name || "",
        full_name: row.full_name || row.name || "",
        email: row.email || "",
        mobile: row.mobile || "",
        role: roleCode,
        role_code: roleCode,
        role_category: roleCategory,
        legacy_role: legacyRole,
        status,
        verification_status: verificationStatus,
        updated_at: row.updated_at || new Date().toISOString(),
    };
};

const getMembersByIdentity = async () => {
    const rows = await getMembers();
    if (!Array.isArray(rows)) return [];

    const canonicalRows = await Promise.all(
        rows.map((row) =>
            PersonService.ensureForMemberRecord(row, {
                persist: false,
                roleCode: row?.role_code || row?.role,
            })
        )
    );

    return canonicalRows.map((row) => normalizeMemberRecord(row));
};

const findMember = async (memberId) => {
    const rows = await getMembersByIdentity();
    const value = String(memberId || "").trim();
    if (!value) return null;

    return rows.find((row) => {
        const identities = [row.id, row.member_id, row.members, row.email].map((item) => String(item || "").trim().toLowerCase());
        return identities.includes(value.toLowerCase());
    }) || null;
};

const saveMember = async (memberId, values = {}) => {
    const current = await findMember(memberId);
    if (!current) {
        throw new Error("Member not found.");
    }

    const next = normalizeMemberRecord({
        ...current,
        ...values,
        updated_at: new Date().toISOString(),
    });

    await updateMember(current.id || current.member_id || current.members, next);
    return next;
};

const appendAuditLog = (entry = {}) => {
    const logs = readJson(AUDIT_LOG_KEY, []);
    const next = [
        {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: entry.action || "member_update",
            actor_user_id: entry.actorUserId || null,
            actor_name: entry.actorName || null,
            actor_role: entry.actorRole || null,
            target_user_id: entry.targetUserId || null,
            target_name: entry.targetName || null,
            target_email: entry.targetEmail || null,
            previous_status: entry.previousStatus || null,
            new_status: entry.newStatus || null,
            previous_role: entry.previousRole || null,
            new_role: entry.newRole || null,
            notes: entry.notes || "",
            message: entry.message || "Member record updated.",
        },
        ...logs,
    ];

    writeJson(AUDIT_LOG_KEY, next.slice(0, 500));

    AuditLogService.logBusinessEvent({
        action: entry.action || "manual_audit",
        userId: entry.actorUserId || null,
        actorUuid: entry.actorUserId || null,
        actorRole: entry.actorRole || null,
        actorName: entry.actorName || null,
        email: entry.targetEmail || null,
        source: "admin",
        module: entry.module || "administration",
        entity: entry.entity || "member",
        entityUuid: entry.targetUserId || null,
        previousState: {
            status: entry.previousStatus || null,
            role: entry.previousRole || null,
        },
        newState: {
            status: entry.newStatus || null,
            role: entry.newRole || null,
        },
        metadata: {
            notes: entry.notes || "",
            message: entry.message || "Member record updated.",
            target_user_id: entry.targetUserId || null,
            target_name: entry.targetName || null,
            previous_status: entry.previousStatus || null,
            new_status: entry.newStatus || null,
            previous_role: entry.previousRole || null,
            new_role: entry.newRole || null,
        },
    }).catch(() => {
        // Keep admin operations non-blocking when audit sync fails.
    });
};

const buildStatusMessage = (action, member, actor, previousStatus, nextStatus) => {
    const actorName = actor.fullName || actor.email || "System Admin";
    const memberName = member.name || member.email || member.member_id || "member";
    return `${actorName} ${action} ${memberName} (${previousStatus || "Unknown"} -> ${nextStatus})`;
};

const normalizeVerificationStatus = (value = "") => {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "VERIFIED") return "APPROVED";
    if (["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(normalized)) {
        return normalized;
    }

    return null;
};

const mapStatusFromVerification = (verificationStatus) => {
    if (verificationStatus === "APPROVED") return "Active";
    if (verificationStatus === "REJECTED") return "Rejected";
    if (verificationStatus === "SUSPENDED") return "Suspended";
    return "Pending";
};

const toHumanVerificationStatus = (verificationStatus) => {
    if (verificationStatus === "APPROVED") return "Verified";
    if (verificationStatus === "REJECTED") return "Rejected";
    if (verificationStatus === "SUSPENDED") return "Suspended";
    return "Pending";
};

const AdminService = {
    getAssignableRoles,

    async getOverview() {
        const [members, systemSettings, auditLogs] = await Promise.all([
            getMembersByIdentity(),
            SettingsService.get(),
            AuditLogService.getAdminAuditEvents(500),
        ]);

        return {
            users: members,
            members,
            settings: systemSettings || {},
            auditLogs: Array.isArray(auditLogs) ? auditLogs : readJson(AUDIT_LOG_KEY, []),
        };
    },

    async approveMember(memberId, notes = "") {
        return this.setMemberVerificationStatus(memberId, "Approved", notes);
    },

    async rejectMember(memberId, notes = "") {
        return this.setMemberVerificationStatus(memberId, "Rejected", notes);
    },

    async suspendMember(memberId, notes = "") {
        return this.setMemberVerificationStatus(memberId, "Suspended", notes);
    },

    async setMemberVerificationStatus(memberId, verificationStatus, notes = "") {
        const actor = assertSystemAdmin();
        const current = await findMember(memberId);
        if (!current) throw new Error("Member not found.");

        const normalizedVerificationStatus = normalizeVerificationStatus(verificationStatus);
        if (!normalizedVerificationStatus) {
            await AuditLogService.logSecurityEvent({
                action: "invalid_status_change",
                module: "security",
                entity: "member",
                actorUuid: actor.userId,
                actorRole: actor.roleCode,
                actorName: actor.fullName,
                result: "failed",
                failureReason: `Unsupported verification status: ${verificationStatus}`,
                metadata: {
                    target_user_id: current.id,
                    requested_status: verificationStatus,
                },
            });
            throw new Error(`Unsupported verification status: ${verificationStatus}`);
        }
        const nowIso = new Date().toISOString();
        const notesText = String(notes || "").trim();
        const humanVerificationStatus = toHumanVerificationStatus(normalizedVerificationStatus);
        const mappedStatus = mapStatusFromVerification(normalizedVerificationStatus);
        const verifierName = actor.fullName || actor.email || "System Admin";
        const verificationHistory = [
            {
                id: `verify-${Date.now()}`,
                timestamp: nowIso,
                status: humanVerificationStatus,
                remarks: notesText,
                verifiedBy: verifierName,
            },
            ...(Array.isArray(current.verification_history) ? current.verification_history : []),
        ].slice(0, 100);

        const updated = await saveMember(memberId, {
            verification_status: humanVerificationStatus,
            status: mappedStatus,
            remarks: notesText || current.remarks || "",
            verification_date: normalizedVerificationStatus === "PENDING" ? null : nowIso,
            verified_by: normalizedVerificationStatus === "PENDING" ? null : verifierName,
            verification_history: verificationHistory,
        });

        const actionByStatus = {
            APPROVED: "member_approved",
            REJECTED: "member_rejected",
            SUSPENDED: "member_suspended",
            PENDING: "member_pending",
        };

        const statusVerbByStatus = {
            APPROVED: "approved",
            REJECTED: "rejected",
            SUSPENDED: "suspended",
            PENDING: "set pending for",
        };

        appendAuditLog({
            action: actionByStatus[normalizedVerificationStatus] || "member_update",
            actorUserId: actor.userId,
            actorName: actor.fullName,
            actorRole: actor.roleCode,
            targetUserId: updated.id,
            targetName: updated.name,
            targetEmail: updated.email,
            previousStatus: current.verification_status || current.status || "Pending",
            newStatus: updated.verification_status,
            previousRole: current.role_code || current.role || "member",
            newRole: updated.role_code || updated.role,
            notes: notesText,
            message: buildStatusMessage(
                statusVerbByStatus[normalizedVerificationStatus] || "updated",
                updated,
                actor,
                current.verification_status || current.status,
                updated.verification_status
            ),
        });

        return updated;
    },

    async changeMemberRole(memberId, roleCode, notes = "") {
        const actor = assertSystemAdmin();
        const current = await findMember(memberId);
        if (!current) throw new Error("Member not found.");

        const normalizedRoleCode = normalizeRoleCode(roleCode);
        const updated = await saveMember(memberId, {
            role: normalizedRoleCode,
            role_code: normalizedRoleCode,
            role_category: getRoleCategory(normalizedRoleCode),
            legacy_role: getLegacyRole(normalizedRoleCode),
        });

        const canonicalUpdated = await PersonService.ensureForMemberRecord(updated, {
            persist: true,
            roleCode: normalizedRoleCode,
        });

        appendAuditLog({
            action: "role_changed",
            actorUserId: actor.userId,
            actorName: actor.fullName,
            actorRole: actor.roleCode,
            targetUserId: canonicalUpdated.id,
            targetName: canonicalUpdated.name,
            targetEmail: canonicalUpdated.email,
            previousStatus: current.verification_status || current.status || "Pending",
            newStatus: canonicalUpdated.verification_status || canonicalUpdated.status || "Pending",
            previousRole: current.role_code || current.role || "member",
            newRole: canonicalUpdated.role_code || canonicalUpdated.role,
            notes: String(notes || "").trim(),
            message: `${actor.fullName || actor.email || "System Admin"} changed role for ${canonicalUpdated.name || canonicalUpdated.email || canonicalUpdated.member_id || "member"} from ${current.role_code || current.role || "member"} to ${canonicalUpdated.role_code || canonicalUpdated.role}`,
            entity: "member_role",
        });

        return canonicalUpdated;
    },

    async updateUserRole(memberId, roleCode, notes = "") {
        return this.changeMemberRole(memberId, roleCode, notes);
    },

    createAuditLog(message) {
        appendAuditLog({ message, action: "manual_audit" });
    },
};

export default AdminService;
