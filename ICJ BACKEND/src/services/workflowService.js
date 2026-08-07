import {
    addWorkflow,
    addWorkflowAssignment,
    addWorkflowDefinition,
    addWorkflowHistory,
    addWorkflowSettings,
    getWorkflowAssignments,
    getWorkflowDefinitions,
    getWorkflowHistory,
    getWorkflows,
    getWorkflowSettings,
    updateWorkflow,
    updateWorkflowAssignment,
    updateWorkflowDefinition,
    updateWorkflowSettings,
} from "./database";
import { hasPermission } from "../core/permissions";
import AuditLogService from "./auditLogService";
import FinanceService from "./financeService";
import DocumentService from "./documentService";
import { requireString } from "../utils/validation";

const WORKFLOW_STATUS = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    IN_REVIEW: "IN_REVIEW",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
};

const DEFAULT_APPROVAL_LEVELS = [
    { level_no: 1, role_code: "employee", title: "Level 1 Approval" },
    { level_no: 2, role_code: "organization_admin", title: "Level 2 Approval" },
];

const nowIso = () => new Date().toISOString();
const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const normalizeRole = (role) => String(role || "member").toLowerCase();

const toPermissionState = (role = "member") => ({
    canDefine: hasPermission(role, "workflow.define"),
    canStart: hasPermission(role, "workflow.start"),
    canApprove: hasPermission(role, "workflow.approve"),
    canReject: hasPermission(role, "workflow.reject"),
    canAssign: hasPermission(role, "workflow.assign"),
    canViewAll: hasPermission(role, "workflow.view.all"),
    canViewOwn: hasPermission(role, "workflow.view.own"),
    canManageSettings: hasPermission(role, "workflow.settings.manage"),
});

const normalizeScope = (filters = {}) => ({
    organization_id: filters.organization_id || filters.organizationId || null,
    person_id: filters.person_id || filters.personId || null,
    member_id: filters.member_id || filters.memberId || null,
});

const matchScope = (row = {}, filters = {}) => {
    const scope = normalizeScope(filters);
    if (scope.organization_id && String(row.organization_id || row.organizationId || "") !== String(scope.organization_id)) return false;
    if (scope.person_id && String(row.person_id || row.personId || "") !== String(scope.person_id)) return false;
    if (scope.member_id && String(row.member_id || row.memberId || "") !== String(scope.member_id)) return false;
    return true;
};

const sortByUpdatedDesc = (rows = []) =>
    [...rows].sort((a, b) => new Date(b.updated_at || b.updatedAt || b.created_at || 0).getTime() - new Date(a.updated_at || a.updatedAt || a.created_at || 0).getTime());

const normalizeDefinition = (row = {}) => ({
    id: row.id || nextId("WDEF"),
    code: String(row.code || row.name || "WORKFLOW").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "_"),
    name: requireString(row.name || row.code || "Workflow", "Workflow name"),
    module: String(row.module || "GENERAL").trim().toUpperCase(),
    status: String(row.status || "ACTIVE").trim().toUpperCase(),
    approval_levels: Array.isArray(row.approval_levels || row.approvalLevels)
        ? (row.approval_levels || row.approvalLevels)
        : DEFAULT_APPROVAL_LEVELS,
    dynamic_rules: Array.isArray(row.dynamic_rules || row.dynamicRules)
        ? (row.dynamic_rules || row.dynamicRules)
        : [],
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    organization_id: row.organization_id || row.organizationId || null,
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeWorkflow = (row = {}) => ({
    id: row.id || nextId("WF"),
    workflow_no: row.workflow_no || row.workflowNo || `WF-${Date.now()}`,
    definition_id: row.definition_id || row.definitionId || null,
    definition_code: row.definition_code || row.definitionCode || "GENERAL",
    title: requireString(row.title || "Workflow", "Workflow title"),
    module: String(row.module || "GENERAL").trim().toUpperCase(),
    status: String(row.status || WORKFLOW_STATUS.PENDING).trim().toUpperCase(),
    current_level: Number(row.current_level || row.currentLevel || 1),
    max_level: Number(row.max_level || row.maxLevel || 1),
    payload: row.payload && typeof row.payload === "object" ? row.payload : {},
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    organization_id: row.organization_id || row.organizationId || null,
    finance_reference_id: row.finance_reference_id || row.financeReferenceId || null,
    finance_transaction_id: row.finance_transaction_id || row.financeTransactionId || null,
    document_id: row.document_id || row.documentId || null,
    case_id: row.case_id || row.caseId || null,
    requested_by: row.requested_by || row.requestedBy || null,
    approved_by: row.approved_by || row.approvedBy || null,
    rejected_by: row.rejected_by || row.rejectedBy || null,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeAssignment = (row = {}) => ({
    id: row.id || nextId("WASG"),
    workflow_id: row.workflow_id || row.workflowId,
    level_no: Number(row.level_no || row.levelNo || 1),
    assignee_member_id: row.assignee_member_id || row.assigneeMemberId || null,
    assignee_person_id: row.assignee_person_id || row.assigneePersonId || null,
    assignee_role_code: row.assignee_role_code || row.assigneeRoleCode || "member",
    status: String(row.status || "PENDING").trim().toUpperCase(),
    due_at: row.due_at || row.dueAt || null,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const normalizeHistory = (row = {}) => ({
    id: row.id || nextId("WHIS"),
    workflow_id: row.workflow_id || row.workflowId,
    action: String(row.action || "CREATED").trim().toUpperCase(),
    from_status: row.from_status || row.fromStatus || null,
    to_status: row.to_status || row.toStatus || null,
    level_no: Number(row.level_no || row.levelNo || 1),
    actor_member_id: row.actor_member_id || row.actorMemberId || null,
    actor_person_id: row.actor_person_id || row.actorPersonId || null,
    actor_role_code: row.actor_role_code || row.actorRoleCode || "member",
    remarks: row.remarks || "",
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
});

const normalizeSettings = (row = {}) => ({
    id: row.id || `WSET-${row.scope_type || row.scopeType || "system"}-${row.scope_id || row.scopeId || "global"}`,
    scope_type: row.scope_type || row.scopeType || "system",
    scope_id: row.scope_id || row.scopeId || "global",
    auto_assignment_enabled: row.auto_assignment_enabled ?? row.autoAssignmentEnabled ?? true,
    strict_level_ordering: row.strict_level_ordering ?? row.strictLevelOrdering ?? true,
    default_approval_levels: Array.isArray(row.default_approval_levels || row.defaultApprovalLevels)
        ? (row.default_approval_levels || row.defaultApprovalLevels)
        : DEFAULT_APPROVAL_LEVELS,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: row.updated_at || row.updatedAt || nowIso(),
});

const writeAudit = async (action, metadata = {}, source = "admin") => {
    try {
        await AuditLogService.logAuthEvent({ action, source, metadata });
    } catch {
        // Keep workflow operations non-blocking when audit write fails.
    }
};

const resolveDynamicLevels = (baseLevels = [], rules = [], payload = {}) => {
    const next = [...baseLevels];
    const evalRule = (rule) => {
        const field = rule?.field;
        const op = String(rule?.operator || "eq").toLowerCase();
        const value = payload?.[field];
        const expected = rule?.value;
        if (op === "eq") return value === expected;
        if (op === "gt") return Number(value || 0) > Number(expected || 0);
        if (op === "gte") return Number(value || 0) >= Number(expected || 0);
        if (op === "lt") return Number(value || 0) < Number(expected || 0);
        if (op === "lte") return Number(value || 0) <= Number(expected || 0);
        if (op === "in") return Array.isArray(expected) && expected.includes(value);
        return false;
    };

    rules.forEach((rule) => {
        if (!evalRule(rule)) return;
        if (rule?.append_level && typeof rule.append_level === "object") {
            next.push(rule.append_level);
        }
    });

    return next
        .map((level, index) => ({
            level_no: Number(level.level_no || level.levelNo || index + 1),
            role_code: String(level.role_code || level.roleCode || "member").toLowerCase(),
            title: String(level.title || `Level ${index + 1}`),
            assignee_member_id: level.assignee_member_id || level.assigneeMemberId || null,
            assignee_person_id: level.assignee_person_id || level.assigneePersonId || null,
        }))
        .sort((a, b) => a.level_no - b.level_no);
};

const ensureFinanceReference = async (payload = {}) => {
    if (!payload.finance_reference_id && !payload.financeReferenceId && !payload.finance_transaction_id && !payload.financeTransactionId) {
        return true;
    }
    const rows = await FinanceService.getTransactions({
        organizationId: payload.organization_id || payload.organizationId || undefined,
    }, "system_admin");
    const wantedRef = String(payload.finance_reference_id || payload.financeReferenceId || "");
    const wantedTxn = String(payload.finance_transaction_id || payload.financeTransactionId || "");
    const found = rows.find((row) => String(row.reference_no || row.reference || "") === wantedRef || String(row.id || "") === wantedTxn);
    if (!found) throw new Error("Mapped finance reference was not found.");
    return true;
};

const ensureDocumentReference = async (payload = {}) => {
    if (!payload.document_id && !payload.documentId) return true;
    const rows = await DocumentService.getAll({ documentId: payload.document_id || payload.documentId });
    if (!rows.length) throw new Error("Mapped document was not found.");
    return true;
};

const canAccessWorkflow = (workflow, permissions, actor = {}) => {
    if (permissions.canViewAll) return true;
    if (!permissions.canViewOwn) return false;
    const memberId = actor.member_id || actor.memberId || actor.id;
    return String(workflow.member_id || "") === String(memberId || "");
};

const WorkflowService = {
    getPermissions(role) {
        return toPermissionState(normalizeRole(role));
    },

    async getSettings(scope = {}) {
        const rows = Array.isArray(await getWorkflowSettings()) ? await getWorkflowSettings() : [];
        const scopeType = scope.scopeType || scope.scope_type || "system";
        const scopeId = scope.scopeId || scope.scope_id || "global";
        const existing = rows.find((row) => String(row.scope_type || row.scopeType || "") === String(scopeType) && String(row.scope_id || row.scopeId || "") === String(scopeId));
        if (existing) return normalizeSettings(existing);

        const created = normalizeSettings({ scope_type: scopeType, scope_id: scopeId });
        await addWorkflowSettings(created);
        return created;
    },

    async saveSettings(settings = {}, role = "member", scope = {}) {
        const permissions = this.getPermissions(role);
        if (!permissions.canManageSettings) throw new Error("You do not have permission to update workflow settings.");

        const current = await this.getSettings(scope);
        const next = normalizeSettings({ ...current, ...settings, updated_at: nowIso() });
        await updateWorkflowSettings(current.id, next);
        await writeAudit("workflow_settings_updated", {
            scope_type: next.scope_type,
            scope_id: next.scope_id,
            actor_role: normalizeRole(role),
            message: "Workflow settings updated",
        });
        return next;
    },

    async getDefinitions(filters = {}) {
        const rows = Array.isArray(await getWorkflowDefinitions()) ? await getWorkflowDefinitions() : [];
        return sortByUpdatedDesc(rows.map((row) => normalizeDefinition(row)).filter((row) => matchScope(row, filters)));
    },

    async createDefinition(payload = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canDefine) throw new Error("You do not have permission to define workflows.");

        const definition = normalizeDefinition(payload);
        const saved = await addWorkflowDefinition(definition);
        await writeAudit("workflow_definition_created", {
            definition_id: definition.id,
            definition_code: definition.code,
            actor_role: normalizeRole(role),
            message: "Workflow definition created",
        });
        return normalizeDefinition(saved || definition);
    },

    async updateDefinition(id, values = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canDefine) throw new Error("You do not have permission to define workflows.");

        const definitions = await this.getDefinitions();
        const current = definitions.find((row) => String(row.id) === String(id));
        if (!current) throw new Error("Workflow definition not found.");

        const next = normalizeDefinition({ ...current, ...values, id, updated_at: nowIso() });
        await updateWorkflowDefinition(id, next);
        return next;
    },

    async getAll(filters = {}, role = "member", actor = {}) {
        const rows = Array.isArray(await getWorkflows()) ? await getWorkflows() : [];
        return sortByUpdatedDesc(
            rows
                .map((row) => normalizeWorkflow(row))
                .filter((row) => matchScope(row, filters))
                .filter((row) => canAccessWorkflow(row, this.getPermissions(role), actor))
        );
    },

    async getHistory(workflowId) {
        const rows = Array.isArray(await getWorkflowHistory()) ? await getWorkflowHistory() : [];
        return sortByUpdatedDesc(rows.map((row) => normalizeHistory(row)).filter((row) => String(row.workflow_id) === String(workflowId)));
    },

    async getAssignments(filters = {}, role = "member", actor = {}) {
        const permissions = this.getPermissions(role);
        const memberId = actor.member_id || actor.memberId || actor.id;
        const rows = Array.isArray(await getWorkflowAssignments()) ? await getWorkflowAssignments() : [];
        return sortByUpdatedDesc(
            rows
                .map((row) => normalizeAssignment(row))
                .filter((row) => matchScope(row, filters))
                .filter((row) => permissions.canViewAll || String(row.assignee_member_id || "") === String(memberId || ""))
        );
    },

    async startWorkflow(payload = {}, role = "member", actor = {}) {
        const permissions = this.getPermissions(role);
        if (!permissions.canStart) throw new Error("You do not have permission to start workflows.");

        const title = requireString(payload.title || payload.workflowTitle || "Workflow Request", "Workflow title");
        const definitionCode = String(payload.definition_code || payload.definitionCode || "GENERAL").trim().toUpperCase();
        const definitions = await this.getDefinitions({ organization_id: payload.organization_id || payload.organizationId || undefined });
        const definition = definitions.find((row) => String(row.code) === definitionCode) || normalizeDefinition({
            code: definitionCode,
            name: definitionCode,
            module: payload.module || "GENERAL",
            approval_levels: DEFAULT_APPROVAL_LEVELS,
            dynamic_rules: [],
            organization_id: payload.organization_id || payload.organizationId || null,
        });

        await ensureFinanceReference(payload);
        await ensureDocumentReference(payload);

        const baseLevels = Array.isArray(definition.approval_levels) ? definition.approval_levels : DEFAULT_APPROVAL_LEVELS;
        const rules = Array.isArray(definition.dynamic_rules) ? definition.dynamic_rules : [];
        const levels = resolveDynamicLevels(baseLevels, rules, payload.payload || payload);

        const workflow = normalizeWorkflow({
            workflow_no: `WF-${Date.now()}`,
            definition_id: definition.id,
            definition_code: definition.code,
            title,
            module: payload.module || definition.module || "GENERAL",
            status: WORKFLOW_STATUS.PENDING,
            current_level: 1,
            max_level: levels.length,
            payload: payload.payload && typeof payload.payload === "object" ? payload.payload : payload,
            person_id: payload.person_id || payload.personId || actor.person_id || actor.personId || null,
            member_id: payload.member_id || payload.memberId || actor.member_id || actor.memberId || actor.id || null,
            organization_id: payload.organization_id || payload.organizationId || null,
            finance_reference_id: payload.finance_reference_id || payload.financeReferenceId || null,
            finance_transaction_id: payload.finance_transaction_id || payload.financeTransactionId || null,
            document_id: payload.document_id || payload.documentId || null,
            case_id: payload.case_id || payload.caseId || null,
            requested_by: actor.member_id || actor.memberId || actor.id || null,
            metadata: { levels },
        });

        const created = await addWorkflow(workflow);

        for (const level of levels) {
            const assignment = normalizeAssignment({
                workflow_id: workflow.id,
                level_no: level.level_no,
                assignee_member_id: level.assignee_member_id || payload.assignee_member_id || payload.assigneeMemberId || null,
                assignee_person_id: level.assignee_person_id || payload.assignee_person_id || payload.assigneePersonId || null,
                assignee_role_code: level.role_code,
                status: level.level_no === 1 ? "PENDING" : "QUEUED",
                metadata: { title: level.title || "Approval" },
            });
            await addWorkflowAssignment(assignment);
        }

        const history = normalizeHistory({
            workflow_id: workflow.id,
            action: "CREATED",
            from_status: WORKFLOW_STATUS.DRAFT,
            to_status: WORKFLOW_STATUS.PENDING,
            level_no: 1,
            actor_member_id: workflow.requested_by,
            actor_person_id: workflow.person_id,
            actor_role_code: normalizeRole(role),
            remarks: "Workflow started",
            metadata: { definition_code: workflow.definition_code },
        });
        await addWorkflowHistory(history);

        await writeAudit("workflow_started", {
            workflow_id: workflow.id,
            workflow_no: workflow.workflow_no,
            definition_code: workflow.definition_code,
            actor_role: normalizeRole(role),
            message: "Workflow started",
        });

        return normalizeWorkflow(created || workflow);
    },

    async assign(workflowId, assignment = {}, role = "member") {
        const permissions = this.getPermissions(role);
        if (!permissions.canAssign) throw new Error("You do not have permission to assign workflows.");

        const assignments = await this.getAssignments({}, "system_admin");
        const current = assignments.find((row) => String(row.workflow_id) === String(workflowId) && Number(row.level_no) === Number(assignment.level_no || assignment.levelNo || 1));
        if (!current) throw new Error("Workflow assignment not found.");

        const next = normalizeAssignment({ ...current, ...assignment, workflow_id: workflowId, status: "PENDING", updated_at: nowIso() });
        await updateWorkflowAssignment(current.id, next);

        const history = normalizeHistory({
            workflow_id: workflowId,
            action: "ASSIGNED",
            from_status: null,
            to_status: null,
            level_no: next.level_no,
            actor_member_id: assignment.actor_member_id || assignment.actorMemberId || null,
            actor_person_id: assignment.actor_person_id || assignment.actorPersonId || null,
            actor_role_code: normalizeRole(role),
            remarks: assignment.remarks || "Workflow reassigned",
            metadata: { assignee_member_id: next.assignee_member_id, assignee_role_code: next.assignee_role_code },
        });
        await addWorkflowHistory(history);
        return next;
    },

    async transition(workflowId, decision = "approve", role = "member", actor = {}, remarks = "") {
        const normalized = String(decision || "approve").toLowerCase();
        const permissions = this.getPermissions(role);
        if (normalized === "approve" && !permissions.canApprove) throw new Error("You do not have permission to approve workflows.");
        if (normalized === "reject" && !permissions.canReject) throw new Error("You do not have permission to reject workflows.");

        const workflows = await this.getAll({}, "system_admin", actor);
        const current = workflows.find((row) => String(row.id) === String(workflowId));
        if (!current) throw new Error("Workflow not found.");
        if ([WORKFLOW_STATUS.APPROVED, WORKFLOW_STATUS.REJECTED, WORKFLOW_STATUS.CANCELLED].includes(current.status)) {
            throw new Error("Workflow is already closed.");
        }

        const assignments = await this.getAssignments({}, "system_admin");
        const levelAssignment = assignments.find((row) => String(row.workflow_id) === String(workflowId) && Number(row.level_no) === Number(current.current_level));
        if (levelAssignment) {
            await updateWorkflowAssignment(levelAssignment.id, {
                ...levelAssignment,
                status: normalized === "approve" ? "APPROVED" : "REJECTED",
                updated_at: nowIso(),
            });
        }

        const nextLevel = current.current_level + 1;
        const isFinalLevel = nextLevel > current.max_level;
        const nextStatus = normalized === "reject"
            ? WORKFLOW_STATUS.REJECTED
            : isFinalLevel
                ? WORKFLOW_STATUS.APPROVED
                : WORKFLOW_STATUS.IN_REVIEW;

        const next = normalizeWorkflow({
            ...current,
            status: nextStatus,
            current_level: normalized === "reject" ? current.current_level : Math.min(nextLevel, current.max_level),
            approved_by: normalized === "approve" && isFinalLevel ? (actor.member_id || actor.memberId || actor.id || null) : current.approved_by,
            rejected_by: normalized === "reject" ? (actor.member_id || actor.memberId || actor.id || null) : current.rejected_by,
            updated_at: nowIso(),
        });
        await updateWorkflow(workflowId, next);

        if (normalized === "approve" && !isFinalLevel) {
            const queued = assignments.find((row) => String(row.workflow_id) === String(workflowId) && Number(row.level_no) === Number(nextLevel));
            if (queued) {
                await updateWorkflowAssignment(queued.id, {
                    ...queued,
                    status: "PENDING",
                    updated_at: nowIso(),
                });
            }
        }

        const history = normalizeHistory({
            workflow_id: workflowId,
            action: normalized === "approve" ? "APPROVED" : "REJECTED",
            from_status: current.status,
            to_status: nextStatus,
            level_no: current.current_level,
            actor_member_id: actor.member_id || actor.memberId || actor.id || null,
            actor_person_id: actor.person_id || actor.personId || null,
            actor_role_code: normalizeRole(role),
            remarks: remarks || (normalized === "approve" ? "Approved" : "Rejected"),
        });
        await addWorkflowHistory(history);

        await writeAudit(normalized === "approve" ? "workflow_approved" : "workflow_rejected", {
            workflow_id: workflowId,
            workflow_no: current.workflow_no,
            level_no: current.current_level,
            actor_role: normalizeRole(role),
            message: normalized === "approve" ? "Workflow approved" : "Workflow rejected",
        });

        return next;
    },

    async getDashboard(filters = {}, role = "member", actor = {}) {
        const [workflows, assignments] = await Promise.all([
            this.getAll(filters, role, actor),
            this.getAssignments(filters, role, actor),
        ]);

        return {
            totalWorkflows: workflows.length,
            pending: workflows.filter((row) => row.status === WORKFLOW_STATUS.PENDING || row.status === WORKFLOW_STATUS.IN_REVIEW).length,
            approved: workflows.filter((row) => row.status === WORKFLOW_STATUS.APPROVED).length,
            rejected: workflows.filter((row) => row.status === WORKFLOW_STATUS.REJECTED).length,
            assignedToMe: assignments.filter((row) => row.status === "PENDING").length,
            byModule: workflows.reduce((acc, row) => {
                const key = row.module || "GENERAL";
                acc[key] = Number(acc[key] || 0) + 1;
                return acc;
            }, {}),
            recent: workflows.slice(0, 20),
            updatedAt: nowIso(),
        };
    },
};

export default WorkflowService;
