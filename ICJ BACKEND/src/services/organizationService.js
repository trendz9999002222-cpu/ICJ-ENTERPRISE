import organisationTypes from "../data/organisationTypes";
import {
    getOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationMemberships,
    addOrganizationMembership,
    updateOrganizationMembership,
    deleteOrganizationMembership,
    getMembers,
} from "./database";

const normalizeCode = (value = "") =>
    String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "_");

const nowIso = () => new Date().toISOString();

const normalizeOrg = (organization = {}) => {
    const id = String(organization.id || organization.organization_id || "").trim() || `ORG-${Date.now()}`;
    const code = normalizeCode(organization.code || organization.name || id);
    const typeCode = normalizeCode(organization.type_code || organization.typeCode || "OTHER") || "OTHER";

    return {
        ...organization,
        id,
        organization_id: id,
        code,
        type_code: typeCode,
        parent_org_id: String(organization.parent_org_id || organization.parentOrgId || "").trim() || null,
        branch_code: organization.branch_code || organization.branchCode || null,
        branch_name: organization.branch_name || organization.branchName || null,
        status: organization.status || "ACTIVE",
        settings: organization.settings && typeof organization.settings === "object" ? organization.settings : {},
        metadata: organization.metadata && typeof organization.metadata === "object" ? organization.metadata : {},
        updated_at: organization.updated_at || nowIso(),
        created_at: organization.created_at || nowIso(),
    };
};

const normalizeMembership = (membership = {}) => {
    const orgId = String(membership.organization_id || membership.organizationId || "").trim();
    const memberId = String(membership.member_id || membership.memberId || "").trim();
    const roleCode = normalizeCode(membership.role_code || membership.roleCode || "MEMBER");
    const id = String(membership.id || `ORGM-${orgId}-${memberId}-${roleCode}`).trim();

    return {
        ...membership,
        id,
        organization_id: orgId,
        member_id: memberId,
        role_code: roleCode,
        status: membership.status || "ACTIVE",
        updated_at: membership.updated_at || nowIso(),
        created_at: membership.created_at || nowIso(),
    };
};

const OrganizationService = {
    getTypes() {
        return organisationTypes;
    },

    async getAll() {
        const rows = await getOrganizations();
        return Array.isArray(rows) ? rows.map((row) => normalizeOrg(row)) : [];
    },

    async create(payload = {}) {
        const org = normalizeOrg(payload);
        await addOrganization(org);
        return org;
    },

    async update(id, updates = {}) {
        const next = normalizeOrg({ ...updates, id, organization_id: id, created_at: updates.created_at || undefined });
        await updateOrganization(id, next);
        return next;
    },

    async remove(id) {
        await deleteOrganization(id);
        return true;
    },

    async getHierarchy(rootId = "") {
        const all = await this.getAll();
        const rootKey = String(rootId || "").trim();
        const childrenByParent = new Map();

        all.forEach((org) => {
            const parent = String(org.parent_org_id || "").trim();
            if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
            childrenByParent.get(parent).push(org);
        });

        const buildNode = (org) => ({
            ...org,
            children: (childrenByParent.get(String(org.id || "")) || []).map((child) => buildNode(child)),
        });

        if (rootKey) {
            const root = all.find((org) => String(org.id) === rootKey || String(org.organization_id) === rootKey);
            return root ? buildNode(root) : null;
        }

        return (childrenByParent.get("") || []).concat(childrenByParent.get("null") || []).map((org) => buildNode(org));
    },

    async getBranches(organizationId = "") {
        const all = await this.getAll();
        const key = String(organizationId || "").trim();
        return all.filter((org) => String(org.parent_org_id || "") === key);
    },

    async getMemberships(filters = {}) {
        const rows = await getOrganizationMemberships();
        const list = Array.isArray(rows) ? rows.map((row) => normalizeMembership(row)) : [];

        return list.filter((row) => {
            if (filters.organizationId && String(row.organization_id) !== String(filters.organizationId)) return false;
            if (filters.memberId && String(row.member_id) !== String(filters.memberId)) return false;
            if (filters.roleCode && normalizeCode(row.role_code) !== normalizeCode(filters.roleCode)) return false;
            return true;
        });
    },

    async addMembership(payload = {}) {
        const membership = normalizeMembership(payload);
        const existing = await this.getMemberships({
            organizationId: membership.organization_id,
            memberId: membership.member_id,
            roleCode: membership.role_code,
        });

        if (existing.length > 0) {
            const current = { ...existing[0], ...membership, id: existing[0].id };
            await updateOrganizationMembership(current.id, current);
            return current;
        }

        await addOrganizationMembership(membership);
        return membership;
    },

    async removeMembership(id) {
        await deleteOrganizationMembership(id);
        return true;
    },

    async switchOrganization(memberId = "", organizationId = "") {
        const memberships = await this.getMemberships({ memberId, organizationId });
        const active = memberships.find((row) => row.status === "ACTIVE");
        if (!active) {
            throw new Error("Member does not belong to the selected organization.");
        }

        const organizations = await this.getAll();
        const currentOrg = organizations.find((org) => String(org.id) === String(organizationId));
        if (!currentOrg) {
            throw new Error("Organization not found.");
        }

        return {
            organization: currentOrg,
            membership: active,
        };
    },

    async getOrganizationPermissions(memberId = "", organizationId = "") {
        const memberships = await this.getMemberships({ memberId, organizationId });
        const activeRoles = memberships.filter((row) => row.status === "ACTIVE").map((row) => normalizeCode(row.role_code));

        const orgRolePermissionMap = {
            ORG_OWNER: ["organization.view", "organization.manage", "organization.settings.update", "organization.switch"],
            ORG_ADMIN: ["organization.view", "organization.manage", "organization.settings.update", "organization.switch"],
            BRANCH_MANAGER: ["organization.view", "organization.branch.manage", "organization.switch"],
            MEMBER: ["organization.view", "organization.switch"],
        };

        const permissions = [...new Set(activeRoles.flatMap((role) => orgRolePermissionMap[role] || ["organization.view"]))];
        return permissions;
    },

    async getOrganizationDashboard(organizationId = "") {
        const [organizations, memberships, members] = await Promise.all([
            this.getAll(),
            this.getMemberships({ organizationId }),
            getMembers(),
        ]);

        const org = organizations.find((item) => String(item.id) === String(organizationId)) || null;
        const memberMap = new Map((Array.isArray(members) ? members : []).map((m) => [String(m.id || m.member_id || m.members), m]));
        const activeMemberships = memberships.filter((row) => row.status === "ACTIVE");

        return {
            organization: org,
            totalMembers: activeMemberships.length,
            activeMembers: activeMemberships.filter((row) => {
                const member = memberMap.get(String(row.member_id));
                const status = String(member?.verification_status || member?.status || "").toUpperCase();
                return status === "APPROVED" || status === "ACTIVE";
            }).length,
            roleDistribution: activeMemberships.reduce((acc, row) => {
                const key = normalizeCode(row.role_code || "MEMBER");
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {}),
            branches: organizations.filter((item) => String(item.parent_org_id || "") === String(organizationId)).length,
            updatedAt: nowIso(),
        };
    },

    async getOrganizationSettings(organizationId = "") {
        const organizations = await this.getAll();
        const org = organizations.find((item) => String(item.id) === String(organizationId));
        return org?.settings || {};
    },

    async saveOrganizationSettings(organizationId = "", settings = {}) {
        const organizations = await this.getAll();
        const org = organizations.find((item) => String(item.id) === String(organizationId));
        if (!org) throw new Error("Organization not found.");

        const next = {
            ...org,
            settings: {
                ...(org.settings || {}),
                ...(settings && typeof settings === "object" ? settings : {}),
            },
            updated_at: nowIso(),
        };

        await updateOrganization(next.id, next);
        return next.settings;
    },
};

export default OrganizationService;
