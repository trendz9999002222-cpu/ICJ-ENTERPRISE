// Central role catalog for registration, auth normalization, and role-based redirects.
// This file stays framework-agnostic so services and UI can reuse it.

const role = (code, label, {
    categoryKey,
    publicRegistration = false,
    defaultRoute = "/dashboard",
    legacyRole = code,
    hidden = false,
} = {}) => ({
    code,
    label,
    categoryKey,
    publicRegistration,
    defaultRoute,
    legacyRole,
    hidden,
});

export const ROLE_CATEGORIES = [
    {
        key: "community",
        label: "Community",
        roles: [
            role("member", "Member", {
                categoryKey: "community",
                publicRegistration: true,
                defaultRoute: "/membership",
            }),
            role("volunteer", "Volunteer", {
                categoryKey: "community",
                defaultRoute: "/membership",
            }),
        ],
    },
    {
        key: "professional",
        label: "Professional",
        roles: [
            role("advocate", "Advocate", {
                categoryKey: "professional",
                defaultRoute: "/legal",
            }),
            role("arbitrator", "Arbitrator", {
                categoryKey: "professional",
                defaultRoute: "/legal",
            }),
            role("mediator", "Mediator", {
                categoryKey: "professional",
                defaultRoute: "/legal",
            }),
            role("trustee", "Trustee", {
                categoryKey: "professional",
                defaultRoute: "/dashboard",
            }),
        ],
    },
    {
        key: "leadership",
        label: "Leadership",
        roles: [
            role("district_president", "District President", {
                categoryKey: "leadership",
                defaultRoute: "/dashboard",
            }),
            role("state_president", "State President", {
                categoryKey: "leadership",
                defaultRoute: "/dashboard",
            }),
            role("national_executive", "National Executive", {
                categoryKey: "leadership",
                defaultRoute: "/dashboard",
            }),
        ],
    },
    {
        key: "administration",
        label: "Administration",
        roles: [
            role("admin", "Admin", {
                categoryKey: "administration",
                defaultRoute: "/dashboard",
            }),
            role("operator", "Operator", {
                categoryKey: "administration",
                defaultRoute: "/membership",
            }),
            role("reviewer", "Reviewer", {
                categoryKey: "administration",
                defaultRoute: "/member-verification",
            }),
            role("viewer", "Viewer", {
                categoryKey: "administration",
                defaultRoute: "/member-directory",
            }),
            role("system_admin", "System Admin", {
                categoryKey: "administration",
                defaultRoute: "/administration",
                legacyRole: "admin",
            }),
            role("super_admin", "Super Admin", {
                categoryKey: "administration",
                defaultRoute: "/administration",
                legacyRole: "admin",
            }),
        ],
    },
    {
        key: "legacy",
        label: "Legacy",
        roles: [
            role("employee", "Employee", {
                categoryKey: "legacy",
                defaultRoute: "/dashboard",
                hidden: true,
            }),
            role("organization_admin", "Organization Admin", {
                categoryKey: "legacy",
                defaultRoute: "/dashboard",
                hidden: true,
            }),
            role("professional_member", "Professional Member", {
                categoryKey: "legacy",
                defaultRoute: "/membership",
                hidden: true,
            }),
            role("support_partner", "Support Partner", {
                categoryKey: "legacy",
                defaultRoute: "/dashboard",
                hidden: true,
            }),
            role("guest", "Guest", {
                categoryKey: "legacy",
                defaultRoute: "/dashboard",
                hidden: true,
            }),
            role("help_seeker", "Help Seeker", {
                categoryKey: "legacy",
                defaultRoute: "/documents",
                hidden: true,
            }),
            role("service_applicant", "Service Applicant", {
                categoryKey: "legacy",
                defaultRoute: "/documents",
                hidden: true,
            }),
            role("citizen_applicant", "Citizen Applicant", {
                categoryKey: "legacy",
                defaultRoute: "/documents",
                hidden: true,
            }),
        ],
    },
];

const ROLE_INDEX = ROLE_CATEGORIES.flatMap((category) =>
    category.roles.map((item) => ({
        ...item,
        categoryLabel: category.label,
    }))
).reduce((acc, item) => {
    acc[item.code] = item;
    return acc;
}, {});

const LEGACY_ALIASES = {
    admin: "admin",
    manager: "system_admin",
    staff: "operator",
    member: "member",
    reviewer: "reviewer",
    viewer: "viewer",
    operator: "operator",
};

const MANAGED_ROLE_CODES = [
    "viewer",
    "reviewer",
    "operator",
    "admin",
    "member",
    "volunteer",
    "advocate",
    "arbitrator",
    "mediator",
    "trustee",
    "district_president",
    "state_president",
    "national_executive",
    "system_admin",
    "super_admin",
];

export const getRole = (code) => ROLE_INDEX[String(code || "").toLowerCase()] || null;

export const normalizeRoleCode = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "member";
    if (ROLE_INDEX[raw]) return raw;
    if (LEGACY_ALIASES[raw]) return LEGACY_ALIASES[raw];
    return "member";
};

export const getLegacyRole = (roleCode) => {
    const normalized = normalizeRoleCode(roleCode);
    return getRole(normalized)?.legacyRole || normalized;
};

export const getRoleCategory = (roleCode) => {
    const normalized = normalizeRoleCode(roleCode);
    return getRole(normalized)?.categoryKey || "community";
};

export const isPublicRegistrationRole = (roleCode) => {
    const normalized = normalizeRoleCode(roleCode);
    const found = getRole(normalized);
    return Boolean(found?.publicRegistration);
};

export const getPublicRoleCategories = () =>
    ROLE_CATEGORIES.map((category) => ({
        ...category,
        roles: category.roles.filter((item) => item.publicRegistration),
    })).filter((category) => category.roles.length > 0);

export const getAssignableRoles = () =>
    MANAGED_ROLE_CODES.map((code) => getRole(code)).filter(Boolean);

export const getRolesByCategory = (categoryKey, options = {}) => {
    const category = ROLE_CATEGORIES.find((item) => item.key === categoryKey);
    if (!category) return [];
    if (options.publicOnly) {
        return category.roles.filter((item) => item.publicRegistration);
    }
    return category.roles;
};

export const getPostLoginRoute = (roleCode) => {
    const normalized = normalizeRoleCode(roleCode);
    return getRole(normalized)?.defaultRoute || "/dashboard";
};

export const resolveRoleCode = (profile, user = null) => {
    const candidate =
        user?.role_code ||
        user?.roleCode ||
        user?.role ||
        user?.user_metadata?.role_code ||
        user?.user_metadata?.role ||
        user?.legacy_role ||
        profile?.role_code ||
        profile?.roleCode ||
        profile?.role ||
        profile?.legacy_role ||
        user?.profile?.role_code ||
        "member";

    return normalizeRoleCode(candidate);
};
