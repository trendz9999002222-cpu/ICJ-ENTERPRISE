import {
  getMembers,
  addMember,
  updateMember,
  getSystemSettings,
} from "./database";
import { optionalString, requireString } from "../utils/validation";
import AuditLogService from "./auditLogService";
import { hasPermission } from "../core/permissions";
import { getRole, normalizeRoleCode } from "../core/roles";
import PersonService from "./personService";

const MEMBER_HISTORY_KEY = "icj_member_history";
const MEMBER_DOCUMENTS_KEY = "icj_member_documents";
const MEMBER_ID_SEQUENCE_KEY = "icj_membership_id_sequence";

const DEFAULT_MEMBERSHIP_ID_CONFIG = {
  prefix: "ICJ",
  startingNumber: 1,
  paddingLength: 6,
  includeFinancialYear: false,
  includeBranchCode: false,
  includeOrganizationCode: false,
};

const DEFAULT_MEMBER_EXTENSION_FIELDS = {};
const DEFAULT_MEMBERSHIP_LIFECYCLE = "Pending Verification";
const SOFT_DELETE_TARGET_LIFECYCLE = "Archived";
const SOFT_DELETE_TARGET_STATUS = "Inactive";
const DEFAULT_MEMBERSHIP_LIFECYCLE_STATES = [
  "Draft",
  "Pending Verification",
  "Pending Approval",
  "Approved",
  "Active",
  "Suspended",
  "Inactive",
  "Rejected",
  "Archived",
];
const DEFAULT_MEMBERSHIP_LIFECYCLE_TRANSITIONS = {
  Draft: ["Pending Verification", "Archived"],
  "Pending Verification": ["Pending Approval", "Approved", "Active", "Suspended", "Inactive", "Rejected", "Archived"],
  "Pending Approval": ["Approved", "Active", "Suspended", "Inactive", "Rejected", "Archived"],
  Approved: ["Active", "Suspended", "Inactive", "Rejected", "Archived"],
  Active: ["Suspended", "Inactive", "Rejected", "Archived"],
  Suspended: ["Active", "Inactive", "Rejected", "Archived"],
  Inactive: ["Active", "Archived"],
  Rejected: ["Active", "Archived"],
  Archived: [],
};

const ROLE_AUTHORITY_RANK = {
  member: 10,
  volunteer: 10,
  professional_member: 10,
  support_partner: 10,
  help_seeker: 10,
  service_applicant: 10,
  citizen_applicant: 10,
  guest: 10,
  advocate: 8,
  arbitrator: 8,
  mediator: 8,
  trustee: 8,
  employee: 7,
  viewer: 7,
  operator: 6,
  reviewer: 5,
  district_president: 4,
  state_president: 3,
  national_executive: 3,
  admin: 2,
  organization_admin: 2,
  system_admin: 1,
  super_admin: 0,
};

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

const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();

const normalizeMobile = (value = "") => String(value || "").replace(/\D/g, "");

const getActor = (payload = {}) => String(payload?.actorRole || payload?.role || payload?.createdBy || "system");

const getContextRole = (payload = {}) => payload?.actorRole || payload?.role || payload?.roleCode || null;

const getAuditActor = (payload = {}) => ({
  actorRole: getContextRole(payload) || null,
  actorName: payload?.actorName || payload?.fullName || payload?.name || null,
  actorUuid: payload?.actorUuid || payload?.userId || payload?.actorUserId || null,
});

const enforcePermission = (payload = {}, permission = "", message = "Unauthorized") => {
  const roleCode = getContextRole(payload);
  // Preserve compatibility for legacy internal callers that do not pass role context.
  if (!roleCode) return;
  const normalizedRole = normalizeRoleCode(roleCode);
  const rawRole = String(roleCode || "").trim().toLowerCase();
  if (!getRole(rawRole) && normalizedRole === "member" && rawRole !== "member") {
    void AuditLogService.logSecurityEvent({
      action: "unauthorized_access",
      module: "security",
      entity: "member",
      actorRole: roleCode,
      actorName: payload?.actorName || null,
      actorUuid: payload?.actorUuid || payload?.userId || null,
      result: "failed",
      failureReason: "Unknown role attempted protected member operation.",
      metadata: {
        permission,
        requested_operation: message,
      },
    });
    throw new Error("You do not have permission to perform this action.");
  }
  if (!hasPermission(roleCode, permission)) {
    void AuditLogService.logSecurityEvent({
      action: "permission_denied",
      module: "security",
      entity: "member",
      actorRole: roleCode,
      actorName: payload?.actorName || null,
      actorUuid: payload?.actorUuid || payload?.userId || null,
      result: "failed",
      failureReason: message,
      metadata: {
        permission,
      },
    });
    throw new Error(message);
  }
};

const isValidEmail = (value = "") => {
  const email = normalizeEmail(value);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidMobile = (value = "") => {
  const mobile = normalizeMobile(value);
  if (!mobile) return false;
  return mobile.length >= 10 && mobile.length <= 15;
};

const normalizeMemberType = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "organisation" || raw === "organization" || raw === "institutional") {
    return "Institutional";
  }
  if (raw === "individual") return "Individual";
  return String(value || "").trim();
};

const normalizeVerificationStatus = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "Not Verified";
  if (raw === "verified" || raw === "true" || raw === "yes") return "Verified";
  return "Not Verified";
};

const normalizeMemberStatus = (value = "") => {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "APPROVED" || raw === "ACTIVE") return "Approved";
  if (raw === "REJECTED") return "Rejected";
  if (raw === "SUSPENDED" || raw === "INACTIVE" || raw === "ARCHIVED") return "Suspended";
  if (raw === "EXPIRED") return "Expired";
  return "Pending";
};

const readMembershipIdSequence = () => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(MEMBER_ID_SEQUENCE_KEY);
  const value = Number(raw || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const writeMembershipIdSequence = (value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEMBER_ID_SEQUENCE_KEY, String(value));
};

const padNumeric = (value, length) => String(value).padStart(Math.max(1, Number(length || 1)), "0");

const extractLastNumericPart = (value = "") => {
  const match = String(value || "").match(/(\d+)(?!.*\d)/);
  if (!match) return 0;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveFinancialYearToken = () => {
  const year = new Date().getFullYear();
  return String(year);
};

const buildMembershipId = (sequenceNumber, config = {}, context = {}) => {
  const options = { ...DEFAULT_MEMBERSHIP_ID_CONFIG, ...(config || {}) };
  const segments = [];

  if (options.includeBranchCode && context.branchCode) {
    segments.push(String(context.branchCode).toUpperCase());
  }

  if (options.includeOrganizationCode && context.organizationCode) {
    segments.push(String(context.organizationCode).toUpperCase());
  }

  if (options.prefix) {
    segments.push(String(options.prefix).toUpperCase());
  }

  if (options.includeFinancialYear) {
    segments.push(resolveFinancialYearToken());
  }

  segments.push(padNumeric(sequenceNumber, options.paddingLength));
  return segments.join("-");
};

const normalizeLifecycleState = (value = "") => String(value || "").trim();

const resolveKnownRole = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  if (getRole(raw)) return raw;
  return null;
};

const getRoleRank = (roleCode) => {
  const normalized = resolveKnownRole(roleCode);
  if (!normalized) return Number.POSITIVE_INFINITY;
  return ROLE_AUTHORITY_RANK[normalized] ?? Number.POSITIVE_INFINITY;
};

const resolveDecisionActorRole = (member = {}) =>
  resolveKnownRole(
    member?.decision_actor_role ||
    member?.decisionActorRole ||
    member?.verified_by ||
    member?.updated_by ||
    ""
  );

const assertAuthorityLock = async (member = {}, context = {}, action = "update") => {
  const actorRole = resolveKnownRole(getContextRole(context));
  const previousActorRole = resolveDecisionActorRole(member);
  if (!actorRole || !previousActorRole) return;

  const actorRank = getRoleRank(actorRole);
  const previousRank = getRoleRank(previousActorRole);
  if (actorRank <= previousRank) return;

  const failureReason = `Authority lock: ${actorRole} cannot ${action} a record last decided by ${previousActorRole}.`;
  void AuditLogService.logSecurityEvent({
    action: "authority_lock_denied",
    module: "security",
    entity: "member",
    actorRole,
    actorName: context?.actorName || null,
    actorUuid: context?.actorUuid || context?.userId || null,
    result: "failed",
    failureReason,
    metadata: {
      action,
      target_member_id: member?.member_id || member?.membership_id || member?.id || null,
      previous_actor_role: previousActorRole,
    },
  });
  throw new Error("You cannot override a decision made by a higher authority role.");
};

const mapLifecycleToStatus = (lifecycleState = "") => {
  const state = normalizeLifecycleState(lifecycleState);
  if (state === "Active") return "Approved";
  if (state === "Suspended") return "Suspended";
  if (state === "Inactive") return "Suspended";
  if (state === "Rejected") return "Rejected";
  if (state === "Archived") return "Suspended";
  if (state === "Approved") return "Approved";
  return "Pending";
};

const mergeLifecycleTransitions = (configuredTransitions = {}) => {
  const merged = { ...DEFAULT_MEMBERSHIP_LIFECYCLE_TRANSITIONS };
  Object.entries(configuredTransitions || {}).forEach(([state, nextStates]) => {
    const configured = Array.isArray(nextStates) ? nextStates : [];
    merged[state] = [...new Set([...(merged[state] || []), ...configured])];
  });
  return merged;
};

const findCanonicalLifecycleState = (state, supportedStates = []) => {
  const target = normalizeLifecycleState(state).toLowerCase();
  const found = (Array.isArray(supportedStates) ? supportedStates : []).find(
    (item) => normalizeLifecycleState(item).toLowerCase() === target
  );
  return found || null;
};

const matchesIdentity = (member, candidate = {}) => {
  const memberEmail = normalizeEmail(member?.email || "");
  const candidateEmail = normalizeEmail(candidate?.email || "");
  if (memberEmail && candidateEmail && memberEmail === candidateEmail) return true;

  const memberMobile = normalizeMobile(member?.mobile || "");
  const candidateMobile = normalizeMobile(candidate?.mobile || "");
  if (memberMobile && candidateMobile && memberMobile === candidateMobile) return true;

  const memberId = String(member?.member_id || member?.id || "").trim();
  const candidateId = String(candidate?.member_id || candidate?.id || "").trim();
  return Boolean(memberId && candidateId && memberId === candidateId);
};

const getMemberId = (member) => String(member?.id || member?.members || "");

const getMemberUuid = (member) => String(member?.uuid || member?.id || member?.members || "");

const generateUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  return `m-${seed}`;
};

const ensureAudit = async (action, metadata = {}, event = {}) => {
  try {
    await AuditLogService.logBusinessEvent({
      action,
      source: "web",
      module: event.module || "membership",
      entity: event.entity || "member",
      entityUuid: event.entityUuid || metadata.member_uuid || null,
      membershipId: event.membershipId || metadata.membership_id || metadata.member_id || null,
      actorUuid: event.actorUuid || metadata.actor_uuid || null,
      actorRole: event.actorRole || metadata.actor_role || null,
      actorName: event.actorName || metadata.actor_name || null,
      previousState: event.previousState,
      newState: event.newState,
      result: event.result || "success",
      failureReason: event.failureReason || null,
      metadata,
    });
  } catch {
    // Keep member operations non-blocking when audit writes fail.
  }
};

const pushMemberHistory = (memberId, event) => {
  if (!memberId) return;
  const map = readJson(MEMBER_HISTORY_KEY, {});
  const list = Array.isArray(map[memberId]) ? map[memberId] : [];
  const nextEvent = {
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
    action: event.action || "Updated",
    message: event.message || "Member record updated.",
    actorRole: event.actorRole || "system",
  };
  map[memberId] = [nextEvent, ...list].slice(0, 200);
  writeJson(MEMBER_HISTORY_KEY, map);
};

const normalizeMemberRecord = (member = {}, options = {}) => {
  const now = new Date().toISOString();
  const uuid = String(member.uuid || member.id || member.members || generateUuid());
  const actor = getActor({ ...(member || {}), ...(options || {}) });
  const fullName = String(member?.full_name || member?.fullName || member?.name || "").trim();
  const membershipType = normalizeMemberType(
    member?.membership_type || member?.membershipType || member?.member_type || ""
  );

  return {
    ...member,
    id: member.id || member.members || uuid,
    uuid,
    membership_id: member.membership_id || member.membershipId || member.member_id || null,
    member_id: member.member_id || member.membership_id || member.membershipId || null,
    full_name: fullName,
    name: fullName,
    email: normalizeEmail(member.email || ""),
    mobile: normalizeMobile(member.mobile || ""),
    whatsapp: normalizeMobile(member.whatsapp || ""),
    country: String(member.country || "India").trim() || "India",
    member_type: membershipType,
    membership_type: membershipType,
    verification_status: member.verification_status || "Pending",
    verification_date: member.verification_date || member.verified_at || null,
    verified_by: member.verified_by || null,
    verification_history: Array.isArray(member.verification_history) ? member.verification_history : [],
    lifecycle_status: member.lifecycle_status || member.lifecycleStatus || DEFAULT_MEMBERSHIP_LIFECYCLE,
    status: member.status || "Pending",
    extension_fields: member.extension_fields && typeof member.extension_fields === "object"
      ? member.extension_fields
      : (member.extensionFields && typeof member.extensionFields === "object" ? member.extensionFields : DEFAULT_MEMBER_EXTENSION_FIELDS),
    version_no: Number(member.version_no || member.versionNo || 1),
    is_deleted: Boolean(member.is_deleted || member.isDeleted || false),
    deleted_at: member.deleted_at || member.deletedAt || null,
    deleted_by: member.deleted_by || member.deletedBy || null,
    created_by: member.created_by || member.createdBy || actor,
    updated_by: actor,
    created_at: member.created_at || member.createdAt || now,
    updated_at: now,
    registration_date: member.registration_date || now,
  };
};

const getMembershipIdConfig = async () => {
  const systemSettings = await getSystemSettings();
  const config = systemSettings?.membership?.idFormat || systemSettings?.membershipIdFormat || {};
  return {
    ...DEFAULT_MEMBERSHIP_ID_CONFIG,
    ...(config && typeof config === "object" ? config : {}),
  };
};

const getMembershipLifecycleConfig = async () => {
  const systemSettings = await getSystemSettings();
  const membership = systemSettings?.membership && typeof systemSettings.membership === "object"
    ? systemSettings.membership
    : {};
  const configuredStates = Array.isArray(membership.lifecycleStates)
    ? membership.lifecycleStates
    : DEFAULT_MEMBERSHIP_LIFECYCLE_STATES;
  const configuredTransitions = membership.lifecycleTransitions && typeof membership.lifecycleTransitions === "object"
    ? membership.lifecycleTransitions
    : DEFAULT_MEMBERSHIP_LIFECYCLE_TRANSITIONS;

  return {
    states: configuredStates,
    transitions: configuredTransitions,
  };
};

const assertLifecycleTransitionAllowed = async (currentState, requestedState) => {
  const normalizedCurrent = normalizeLifecycleState(currentState || DEFAULT_MEMBERSHIP_LIFECYCLE);
  const lifecycleConfig = await getMembershipLifecycleConfig();
  const states = Array.isArray(lifecycleConfig.states) && lifecycleConfig.states.length > 0
    ? lifecycleConfig.states
    : DEFAULT_MEMBERSHIP_LIFECYCLE_STATES;
  const transitions = lifecycleConfig.transitions && typeof lifecycleConfig.transitions === "object"
    ? mergeLifecycleTransitions(lifecycleConfig.transitions)
    : DEFAULT_MEMBERSHIP_LIFECYCLE_TRANSITIONS;

  const canonicalCurrent = findCanonicalLifecycleState(normalizedCurrent, states) || normalizedCurrent;
  const canonicalRequested = findCanonicalLifecycleState(requestedState, states);

  if (!canonicalRequested) {
    void AuditLogService.logSecurityEvent({
      action: "invalid_lifecycle_transition",
      module: "security",
      entity: "member",
      result: "failed",
      failureReason: `Unsupported lifecycle state: ${requestedState}`,
      metadata: {
        previous_state: currentState,
        requested_state: requestedState,
      },
    });
    throw new Error(`Lifecycle state "${requestedState}" is not supported.`);
  }

  if (canonicalCurrent === canonicalRequested) {
    return canonicalRequested;
  }

  const allowed = Array.isArray(transitions[canonicalCurrent])
    ? transitions[canonicalCurrent]
    : [];
  const matched = findCanonicalLifecycleState(canonicalRequested, allowed);

  if (!matched) {
    void AuditLogService.logSecurityEvent({
      action: "invalid_lifecycle_transition",
      module: "security",
      entity: "member",
      result: "failed",
      failureReason: `Lifecycle transition not allowed: ${canonicalCurrent} -> ${canonicalRequested}`,
      metadata: {
        previous_state: canonicalCurrent,
        requested_state: canonicalRequested,
      },
    });
    throw new Error(`Lifecycle transition not allowed: ${canonicalCurrent} -> ${canonicalRequested}`);
  }

  return canonicalRequested;
};

const getNextMembershipSequence = async (members = [], config = {}) => {
  const fromStore = readMembershipIdSequence();
  const fromRows = (Array.isArray(members) ? members : []).reduce((max, item) => {
    const current = extractLastNumericPart(item?.membership_id || item?.member_id || item?.membershipId || item?.memberId || "");
    return Math.max(max, current);
  }, 0);
  const configuredStart = Number(config?.startingNumber || DEFAULT_MEMBERSHIP_ID_CONFIG.startingNumber || 1) - 1;
  return Math.max(fromStore, fromRows, configuredStart) + 1;
};

const assertMembershipPayload = (member = {}) => {
  requireString(member?.name || member?.full_name || member?.fullName, "Full Name");
  requireString(member?.mobile, "Mobile");

  if (!isValidMobile(member.mobile)) {
    throw new Error("Mobile number must contain 10 to 15 digits.");
  }

  if (!isValidEmail(member.email || "")) {
    throw new Error("Email format is invalid.");
  }
};

const ensureUniqueMembershipIdentity = (members = [], candidate = {}) => {
  const incomingUuid = getMemberUuid(candidate);
  const incomingMembershipId = String(candidate.membership_id || candidate.member_id || "").trim();

  const duplicateUuid = members.find((item) => getMemberUuid(item) === incomingUuid);
  if (duplicateUuid) {
    throw new Error("Duplicate member UUID is not allowed.");
  }

  const duplicateMembershipId = members.find((item) => {
    const current = String(item?.membership_id || item?.member_id || item?.membershipId || item?.memberId || "").trim();
    return Boolean(current && incomingMembershipId && current === incomingMembershipId);
  });

  if (duplicateMembershipId) {
    throw new Error("Duplicate Membership ID is not allowed.");
  }
};

const applyMemberId = async (member = {}, existingMembers = []) => {
  const currentMembershipId = String(member.membership_id || member.member_id || member.membershipId || "").trim();
  if (currentMembershipId) {
    return {
      ...member,
      membership_id: currentMembershipId,
      member_id: currentMembershipId,
    };
  }

  const config = await getMembershipIdConfig();
  const sequence = await getNextMembershipSequence(existingMembers, config);
  writeMembershipIdSequence(sequence);

  const generated = buildMembershipId(sequence, config, {
    branchCode: member.branch_code || member.branchCode,
    organizationCode: member.organization_code || member.organizationCode,
  });

  return {
    ...member,
    membership_id: generated,
    member_id: generated,
  };
};

export const MemberService = {// ==========================================
  // Member Dashboard Statistics
  // ==========================================

  async getStatistics() {
    const rows = await this.getAll({ includeDeleted: false });
    const members = Array.isArray(rows) ? rows : [];

    const statusCounts = members.reduce((acc, member) => {
      const status = normalizeMemberStatus(member?.status);
      if (status === "Pending") acc.pending += 1;
      else if (status === "Approved") acc.approved += 1;
      else if (status === "Rejected") acc.rejected += 1;
      else if (status === "Suspended") acc.suspended += 1;
      else if (status === "Expired") acc.expired += 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0, suspended: 0, expired: 0 });

    const totalMembers = members.length;

    return {
      totalMembers,
      activeMembers: statusCounts.approved,
      pendingMembers: statusCounts.pending,
      approvedMembers: statusCounts.approved,
      verifiedMembers: members.filter((member) => normalizeVerificationStatus(member?.verification_status) === "Verified").length,
      rejectedMembers: statusCounts.rejected,
      suspendedMembers: statusCounts.suspended,
      expiredMembers: statusCounts.expired,
    };
  },

  // ==========================================
  // Member Search
  // ==========================================

  async searchMembers(keyword = "") {
    const members = await this.getAll();

    return members.filter(member =>
      (member.name || "").toLowerCase().includes(keyword.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(keyword.toLowerCase()) ||
      (member.mobile || "").includes(keyword)
    );
  },

  // ==========================================
  // Member Approval
  // ==========================================

  async approveMember(memberId, context = {}) {
    enforcePermission(context, "membership.approve", "You do not have permission to approve members.");
    const current = await this.getById(memberId, { suppressAudit: true, ...context });
    if (!current) {
      throw new Error("Member not found.");
    }
    await assertAuthorityLock(current, context, "approve");

    return this.update(memberId, {
      status: "Approved",
      verification_status: current?.verification_status || "Not Verified",
      lifecycle_status: "Approved",
      decision_action: "approved",
      decision_actor_role: context.actorRole || context.role || "system",
      decision_actor_uuid: context.actorUuid || context.userId || null,
      decision_at: new Date().toISOString(),
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
    });
  },

  async rejectMember(memberId, reason = "", context = {}) {
    enforcePermission(context, "membership.reject", "You do not have permission to reject members.");
    const current = await this.getById(memberId, { suppressAudit: true, ...context });
    if (!current) {
      throw new Error("Member not found.");
    }
    await assertAuthorityLock(current, context, "reject");

    return this.update(memberId, {
      status: "Rejected",
      verification_status: "Not Verified",
      lifecycle_status: "Rejected",
      remarks: reason || undefined,
      decision_action: "rejected",
      decision_actor_role: context.actorRole || context.role || "system",
      decision_actor_uuid: context.actorUuid || context.userId || null,
      decision_at: new Date().toISOString(),
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
    });
  },

  async verifyMember(memberId, context = {}) {
    enforcePermission(context, "membership.verify", "You do not have permission to verify members.");
    const current = await this.getById(memberId, { suppressAudit: true, ...context });
    if (!current) {
      throw new Error("Member not found.");
    }
    await assertAuthorityLock(current, context, "verify");

    return this.update(memberId, {
      verification_status: "Verified",
      status: current?.status,
      lifecycle_status: current?.lifecycle_status || current?.lifecycleStatus,
      verified_by: context.actorRole || context.role || "system",
      verification_date: new Date().toISOString(),
      decision_action: "verified",
      decision_actor_role: context.actorRole || context.role || "system",
      decision_actor_uuid: context.actorUuid || context.userId || null,
      decision_at: new Date().toISOString(),
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
    });
  },

  async reactivateMember(memberId, context = {}) {
    enforcePermission(context, "membership.reactivate", "You do not have permission to reactivate members.");
    const current = await this.getById(memberId, { suppressAudit: true, ...context });
    if (!current) {
      throw new Error("Member not found.");
    }
    await assertAuthorityLock(current, context, "reactivate");
    return this.activateMember(memberId, context);
  },

  async addRemarks(memberId, remarks = "", context = {}) {
    return this.update(memberId, {
      remarks: String(remarks || "").trim(),
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
    });
  },
  /**
   * List members using a future-ready query contract.
   * Inputs: search/filter/sort/pagination options.
   * Output: { items, total, page, pageSize, hasMore }.
   */
  async listMembers(options = {}) {
    try {
      enforcePermission(options, "membership.view", "You do not have permission to view members.");
      const data = await getMembers();
      const rows = Array.isArray(data) ? data : [];
      const normalizedRows = await Promise.all(
        rows.map((row) =>
          PersonService.ensureForMemberRecord(row, {
            persist: false,
            roleCode: row?.role_code || row?.role,
          })
        )
      );

      const search = String(options.search || "").trim().toLowerCase();
      const filters = options.filters && typeof options.filters === "object" ? options.filters : {};
      const page = Number(options.page || 1);
      const pageSize = Number(options.pageSize || normalizedRows.length || 25);

      const includeDeleted = Boolean(options.includeDeleted);
      let items = includeDeleted
        ? normalizedRows
        : normalizedRows.filter((member) => !(member?.is_deleted || member?.isDeleted));

      if (search) {
        items = items.filter((member) => {
          const haystack = [
            member.name,
            member.full_name,
            member.member_id,
            member.membership_id,
            member.email,
            member.mobile,
          ].map((value) => String(value || "").toLowerCase());
          return haystack.some((value) => value.includes(search));
        });
      }

      if (filters.status && filters.status !== "ALL") {
        items = items.filter((member) => normalizeMemberStatus(member.status) === String(filters.status));
      }

      if (filters.member_type && filters.member_type !== "ALL") {
        items = items.filter(
          (member) =>
            normalizeMemberType(member.member_type || member.membership_type || "") ===
            normalizeMemberType(filters.member_type)
        );
      }

      if (filters.verification_status && filters.verification_status !== "ALL") {
        items = items.filter(
          (member) => normalizeVerificationStatus(member.verification_status) === String(filters.verification_status)
        );
      }

      const total = items.length;
      const start = Math.max(0, (page - 1) * pageSize);
      const pagedItems = items.slice(start, start + pageSize);

      return {
        items: pagedItems,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      };
    } catch (error) {
      console.error("Error fetching members:", error);
      const errorMessage = String(error?.message || "").toLowerCase();
      if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
        throw error;
      }
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        hasMore: false,
      };
    }
  },

  async getAll(options = {}) {
    const result = await this.listMembers(options);
    return result.items;
  },

  /**
   * Create member with configurable Membership ID and immutable UUID.
   * Validation: required fields, mobile/email format, duplicate UUID/Membership ID.
   */
  async create(member) {
    try {
      enforcePermission(member, "membership.create", "You do not have permission to create members.");
      console.log("[MemberService] Creating member with data:", member);
      assertMembershipPayload(member);

      const validColumns = [
        "id",
        "uuid",
        "name",
        "full_name",
        "mobile",
        "email",
        "address",
        "whatsapp",
        "membership_id",
        "member_id",
        "membership_type",
        "member_type",
        "profession",
        "organisation",
        "designation",
        "country",
        "organization_id",
        "organization_code",
        "branch_code",
        "trust_id",
        "company_id",
        "gender",
        "dob",
        "aadhar",
        "pan",
        "gst",
        "city",
        "district",
        "state",
        "post_office",
        "pincode",
        "need_services",
        "provide_services",
        "service_category",
        "availability",
        "age",
        "verification_status",
        "member_level",
        "lifecycle_status",
        "remarks",
        "experience",
        "profile_photo",
        "signature",
        "registration_document",
        "registration_document_name",
        "registration_document_type",
        "registration_document_size",
        "version_no",
        "extension_fields",
        "created_by",
        "updated_by",
        "status",
      ];

      const cleanData = {};
      validColumns.forEach((col) => {
        if (member[col] !== undefined && member[col] !== null && member[col] !== "") {
          cleanData[col] = typeof member[col] === "string" ? optionalString(member[col]) : member[col];
        }
      });

      const withMeta = normalizeMemberRecord({
        ...cleanData,
        name: String(member?.name || member?.full_name || cleanData.name || "").trim(),
        full_name: String(member?.full_name || member?.name || cleanData.full_name || cleanData.name || "").trim(),
        membership_type: normalizeMemberType(member?.membership_type || member?.member_type || ""),
        member_id: member?.member_id || member?.membership_id || null,
        email: normalizeEmail(member?.email || cleanData.email || ""),
        mobile: normalizeMobile(member?.mobile || cleanData.mobile || ""),
        whatsapp: normalizeMobile(member?.whatsapp || cleanData.whatsapp || ""),
        role: "member",
        role_code: "member",
        role_category: "community",
        legacy_role: "member",
        status: "Pending",
        verification_status: "Not Verified",
        lifecycle_status: member?.lifecycle_status || member?.lifecycleStatus || DEFAULT_MEMBERSHIP_LIFECYCLE,
        extension_fields: member?.extension_fields || member?.extensionFields || DEFAULT_MEMBER_EXTENSION_FIELDS,
        created_by: member?.created_by || member?.createdBy || getActor(member),
        updated_by: getActor(member),
      });

      const existingMembers = await this.getAll();
      const withMembershipId = await applyMemberId(withMeta, existingMembers);
      ensureUniqueMembershipIdentity(existingMembers, withMembershipId);

      const matchedMember = existingMembers.find((item) => matchesIdentity(item, withMeta));
      const candidateRecord = matchedMember
        ? {
          ...matchedMember,
          ...withMembershipId,
          id: matchedMember.id || matchedMember.members || matchedMember.member_id || matchedMember.uuid,
          uuid: matchedMember.uuid || matchedMember.id || matchedMember.members,
          member_id: matchedMember.member_id || withMembershipId.member_id,
          membership_id: matchedMember.membership_id || withMembershipId.member_id,
          role: matchedMember.role || withMeta.role,
          role_code: matchedMember.role_code || withMeta.role_code,
          role_category: matchedMember.role_category || withMeta.role_category,
          legacy_role: matchedMember.legacy_role || withMeta.legacy_role,
          status: "Pending",
          verification_status: "Not Verified",
        }
        : withMembershipId;

      const nextRecord = await PersonService.ensureForMemberRecord(candidateRecord, {
        persist: false,
        roleCode: candidateRecord.role_code || candidateRecord.role,
      });

      console.log("[MemberService] Cleaned data to insert:", nextRecord);
      if (matchedMember) {
        await updateMember(matchedMember.id || matchedMember.members || matchedMember.member_id, nextRecord);
      } else {
        await addMember(nextRecord);
      }

      const result = matchedMember ? { ...matchedMember, ...nextRecord } : nextRecord;
      const memberId = getMemberId(result);
      const actor = getAuditActor(member);
      const membershipId = result.membership_id || result.member_id || null;
      pushMemberHistory(memberId, {
        action: "Created",
        message: "Member record was created.",
        actorRole: member.role || "system",
      });
      await ensureAudit("membership_id_generated", {
        member_id: membershipId,
        member_uuid: result.uuid || result.id || memberId,
        actor_role: actor.actorRole,
        actor_name: actor.actorName,
        actor_uuid: actor.actorUuid,
        message: "Membership ID generated.",
      }, {
        entityUuid: result.uuid || result.id || memberId,
        membershipId,
        actorRole: actor.actorRole,
        actorName: actor.actorName,
        actorUuid: actor.actorUuid,
        newState: { status: result.status, lifecycle: result.lifecycle_status },
      });
      await ensureAudit("member_created", {
        member_id: membershipId,
        member_uuid: result.uuid || result.id || memberId,
        actor_role: actor.actorRole,
        actor_name: actor.actorName,
        actor_uuid: actor.actorUuid,
        message: "Member record created.",
      }, {
        entityUuid: result.uuid || result.id || memberId,
        membershipId,
        actorRole: actor.actorRole,
        actorName: actor.actorName,
        actorUuid: actor.actorUuid,
        newState: { status: result.status, lifecycle: result.lifecycle_status },
      });
      console.log("[MemberService] Member created successfully");
      return matchedMember ? { ...matchedMember, ...nextRecord } : result;
    } catch (error) {
      console.error("[MemberService] Create failed:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      enforcePermission(data, "membership.update", "You do not have permission to update members.");
      console.log("[MemberService] Updating member:", id, data);
      const current = await this.getById(id, { suppressAudit: true });
      if (!current) {
        throw new Error("Member not found.");
      }

      if (data?.uuid && String(data.uuid) !== String(current.uuid || current.id || current.members || "")) {
        throw new Error("Member UUID is immutable and cannot be changed.");
      }

      let nextLifecycle = current.lifecycle_status || current.lifecycleStatus || DEFAULT_MEMBERSHIP_LIFECYCLE;
      const requestedLifecycle = data?.lifecycle_status || data?.lifecycleStatus;
      if (requestedLifecycle) {
        nextLifecycle = await assertLifecycleTransitionAllowed(nextLifecycle, requestedLifecycle);
      }

      const canonicalData = await PersonService.ensureForMemberRecord(
        normalizeMemberRecord({
          ...current,
          ...data,
          id: current.id || current.members || id,
          uuid: current.uuid || current.id || current.members,
          member_id: data?.member_id || data?.membership_id || current.member_id || current.membership_id || id,
          membership_id: data?.membership_id || data?.member_id || current.membership_id || current.member_id,
          lifecycle_status: nextLifecycle,
          status: data?.status || mapLifecycleToStatus(nextLifecycle),
          updated_by: getActor(data),
          created_by: current.created_by || current.createdBy || getActor(current),
          version_no: Number(current.version_no || current.versionNo || 1),
        }, data),
        {
          persist: false,
          roleCode: data?.role_code || data?.role,
        }
      );
      await updateMember(id, canonicalData);
      await ensureAudit("member_updated", {
        member_id: canonicalData.membership_id || canonicalData.member_id || id,
        member_uuid: canonicalData.uuid || canonicalData.id || id,
        actor_role: getContextRole(data),
        actor_name: data?.actorName || null,
        actor_uuid: data?.actorUuid || data?.userId || null,
        message: "Member record updated.",
      }, {
        entityUuid: canonicalData.uuid || canonicalData.id || id,
        membershipId: canonicalData.membership_id || canonicalData.member_id || id,
        actorRole: getContextRole(data),
        actorName: data?.actorName || null,
        actorUuid: data?.actorUuid || data?.userId || null,
        previousState: {
          status: current.status,
          lifecycle: current.lifecycle_status || current.lifecycleStatus,
          version: current.version_no || current.versionNo,
        },
        newState: {
          status: canonicalData.status,
          lifecycle: canonicalData.lifecycle_status,
          version: canonicalData.version_no,
        },
      });
      pushMemberHistory(String(id), {
        action: "Updated",
        message: "Member record was updated.",
        actorRole: data?.actorRole || "system",
      });
      console.log("[MemberService] Member updated successfully");
      return canonicalData;
    } catch (error) {
      console.error("[MemberService] Update failed:", error);
      throw error;
    }
  },

  async remove(id, context = {}) {
    return this.softDeleteMember(id, context);
  },

  async getById(id, options = {}) {
    enforcePermission(options, "membership.view", "You do not have permission to view member details.");
    const rows = await this.getAll({ includeDeleted: Boolean(options.includeDeleted) });
    const row = rows.find((member) => String(member.id || member.members || member.uuid) === String(id)) || null;
    if (row && !options.suppressAudit) {
      const actor = getAuditActor(options);
      await ensureAudit("member_viewed", {
        member_id: row.membership_id || row.member_id || null,
        member_uuid: row.uuid || row.id || row.members || null,
        actor_role: actor.actorRole,
        actor_name: actor.actorName,
        actor_uuid: actor.actorUuid,
        message: "Member record viewed.",
      }, {
        entityUuid: row.uuid || row.id || row.members || null,
        membershipId: row.membership_id || row.member_id || null,
        actorRole: actor.actorRole,
        actorName: actor.actorName,
        actorUuid: actor.actorUuid,
      });
    }
    return row;
  },

  async softDeleteMember(memberId, context = {}) {
    try {
      enforcePermission(context, "membership.delete", "You do not have permission to delete members.");
      const current = await this.getById(memberId, { includeDeleted: true, suppressAudit: true });
      if (!current) {
        throw new Error("Member not found.");
      }

      await assertAuthorityLock(current, context, "delete");

      if (current.is_deleted || current.isDeleted) {
        return current;
      }

      const actorRole = context.actorRole || context.role || "system";
      const deleteReason = optionalString(context.deleteReason || context.delete_reason || "") || null;
      const now = new Date().toISOString();

      const canonicalData = await PersonService.ensureForMemberRecord(
        normalizeMemberRecord({
          ...current,
          id: current.id || current.members || memberId,
          uuid: current.uuid || current.id || current.members,
          is_deleted: true,
          deleted_at: now,
          deleted_by: actorRole,
          delete_reason: deleteReason,
          lifecycle_status: SOFT_DELETE_TARGET_LIFECYCLE,
          status: SOFT_DELETE_TARGET_STATUS,
          updated_by: actorRole,
        }, { actorRole }),
        {
          persist: false,
          roleCode: current?.role_code || current?.role,
        }
      );

      await updateMember(current.id || current.members || memberId, canonicalData);
      pushMemberHistory(String(memberId), {
        action: "Soft Deleted",
        message: deleteReason
          ? `Member record was soft deleted. Reason: ${deleteReason}`
          : "Member record was soft deleted.",
        actorRole,
      });

      await ensureAudit("member_soft_deleted", {
        member_id: current.member_id || current.membership_id || null,
        member_uuid: current.uuid || current.id || current.members || null,
        actor_role: actorRole,
        delete_reason: deleteReason,
        message: "Member record soft deleted",
      }, {
        entityUuid: current.uuid || current.id || current.members || null,
        membershipId: current.membership_id || current.member_id || null,
        actorRole,
        previousState: {
          status: current.status,
          lifecycle: current.lifecycle_status || current.lifecycleStatus,
        },
        newState: {
          status: canonicalData.status,
          lifecycle: canonicalData.lifecycle_status,
        },
      });

      console.log("[MemberService] Member soft deleted successfully");
      return this.getById(memberId, { includeDeleted: true, suppressAudit: true });
    } catch (error) {
      console.error("[MemberService] Soft delete failed:", error);
      throw error;
    }
  },

  async transitionLifecycle(memberId, nextState, context = {}) {
    const current = await this.getById(memberId, { suppressAudit: true });
    if (!current) {
      throw new Error("Member not found.");
    }

    const requestedState = String(nextState || "").trim();
    if (requestedState === "Suspended") {
      enforcePermission(context, "membership.suspend", "You do not have permission to suspend members.");
      await assertAuthorityLock(current, context, "suspend");
    } else if (requestedState === "Active") {
      enforcePermission(context, "membership.reactivate", "You do not have permission to reactivate members.");
      await assertAuthorityLock(current, context, "reactivate");
    } else {
      enforcePermission(context, "membership.update", "You do not have permission to change lifecycle state.");
    }

    const approvedState = await assertLifecycleTransitionAllowed(
      current.lifecycle_status || current.lifecycleStatus || DEFAULT_MEMBERSHIP_LIFECYCLE,
      nextState
    );

    const nextVerificationStatus = normalizeVerificationStatus(current.verification_status || "Not Verified");

    const updated = await this.update(memberId, {
      lifecycle_status: approvedState,
      status: mapLifecycleToStatus(approvedState),
      verification_status: nextVerificationStatus,
      decision_action: String(approvedState || "").toLowerCase(),
      decision_actor_role: context.actorRole || context.role || "system",
      decision_actor_uuid: context.actorUuid || context.userId || null,
      decision_at: new Date().toISOString(),
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
    });

    const actionByState = {
      Active: "member_activated",
      Suspended: "member_suspended",
      Inactive: "member_deactivated",
      Archived: "member_archived",
    };

    await ensureAudit("membership_lifecycle_transition", {
      member_id: updated?.membership_id || updated?.member_id || current.membership_id || current.member_id || null,
      member_uuid: updated?.uuid || current.uuid || current.id || null,
      actor_role: context.actorRole || context.role || "system",
      actor_name: context.actorName || null,
      actor_uuid: context.actorUuid || context.userId || null,
      message: `Lifecycle state moved to ${approvedState}.`,
    }, {
      entityUuid: updated?.uuid || current.uuid || current.id || null,
      membershipId: updated?.membership_id || updated?.member_id || current.membership_id || current.member_id || null,
      actorRole: context.actorRole || context.role || "system",
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
      previousState: {
        status: current.status,
        lifecycle: current.lifecycle_status || current.lifecycleStatus,
      },
      newState: {
        status: updated?.status || mapLifecycleToStatus(approvedState),
        lifecycle: approvedState,
      },
    });

    if (actionByState[approvedState]) {
      await ensureAudit(actionByState[approvedState], {
        member_id: updated?.membership_id || updated?.member_id || current.membership_id || current.member_id || null,
        member_uuid: updated?.uuid || current.uuid || current.id || null,
        actor_role: context.actorRole || context.role || "system",
        actor_name: context.actorName || null,
        actor_uuid: context.actorUuid || context.userId || null,
        message: `Member ${String(approvedState).toLowerCase()}.`,
      }, {
        entityUuid: updated?.uuid || current.uuid || current.id || null,
        membershipId: updated?.membership_id || updated?.member_id || current.membership_id || current.member_id || null,
        actorRole: context.actorRole || context.role || "system",
        actorName: context.actorName || null,
        actorUuid: context.actorUuid || context.userId || null,
        previousState: {
          status: current.status,
          lifecycle: current.lifecycle_status || current.lifecycleStatus,
        },
        newState: {
          status: updated?.status || mapLifecycleToStatus(approvedState),
          lifecycle: approvedState,
        },
      });
    }

    pushMemberHistory(String(memberId), {
      action: "Lifecycle Transition",
      message: `Lifecycle state moved to ${approvedState}.`,
      actorRole: context.actorRole || context.role || "system",
    });

    return this.getById(memberId, { suppressAudit: true });
  },

  async activateMember(memberId, context = {}) {
    return this.transitionLifecycle(memberId, "Active", context);
  },

  async suspendMember(memberId, context = {}) {
    return this.transitionLifecycle(memberId, "Suspended", context);
  },

  async deactivateMember(memberId, context = {}) {
    return this.transitionLifecycle(memberId, "Inactive", context);
  },

  async archiveMember(memberId, context = {}) {
    return this.transitionLifecycle(memberId, "Archived", context);
  },

  getRestoreAuditHook(memberId, context = {}) {
    return {
      action: "member_restore",
      module: "membership",
      entity: "member",
      entityUuid: String(memberId || "") || null,
      actorRole: context.actorRole || context.role || null,
      actorName: context.actorName || null,
      actorUuid: context.actorUuid || context.userId || null,
      result: "pending",
      metadata: {
        future_ready: true,
        message: "Member restore hook prepared for future implementation.",
      },
    };
  },

  async getHistory(memberId) {
    const map = readJson(MEMBER_HISTORY_KEY, {});
    return Array.isArray(map[String(memberId)]) ? map[String(memberId)] : [];
  },

  async addHistory(memberId, payload) {
    pushMemberHistory(String(memberId), payload || {});
    return this.getHistory(memberId);
  },

  async getDocuments(memberId) {
    const map = readJson(MEMBER_DOCUMENTS_KEY, {});
    return Array.isArray(map[String(memberId)]) ? map[String(memberId)] : [];
  },

  async addDocument(memberId, document) {
    const key = String(memberId);
    const map = readJson(MEMBER_DOCUMENTS_KEY, {});
    const current = Array.isArray(map[key]) ? map[key] : [];
    const nowIso = new Date().toISOString();
    const nextDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: nowIso,
      title: document.title || "Document",
      documentType: document.documentType || document.fileType || "General",
      fileName: document.fileName || "",
      fileType: document.fileType || "",
      fileSize: Number(document.fileSize || 0),
      fileDataUrl: document.fileDataUrl || "",
      status: document.status || "Active",
      verification_status: document.verification_status || "Pending",
      verification_remarks: document.verification_remarks || "",
      verification_date: document.verification_date || null,
      verified_by: document.verified_by || null,
      history: [
        {
          id: `doc-hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Uploaded",
          status: document.status || "Active",
          verification_status: document.verification_status || "Pending",
          remarks: document.verification_remarks || "",
        },
      ],
    };
    map[key] = [nextDocument, ...current];
    writeJson(MEMBER_DOCUMENTS_KEY, map);
    pushMemberHistory(key, {
      action: "Document Attached",
      message: `${nextDocument.title} was attached to member profile.`,
      actorRole: "system",
    });
    return map[key];
  },

  async replaceDocument(memberId, documentId, document) {
    const key = String(memberId);
    const map = readJson(MEMBER_DOCUMENTS_KEY, {});
    const current = Array.isArray(map[key]) ? map[key] : [];
    const index = current.findIndex((item) => item.id === documentId);
    if (index < 0) return current;

    const existing = current[index];
    const nowIso = new Date().toISOString();
    const next = {
      ...existing,
      title: document.title || existing.title,
      documentType: document.documentType || existing.documentType || existing.fileType || "General",
      fileName: document.fileName || existing.fileName,
      fileType: document.fileType || existing.fileType,
      fileSize: Number(document.fileSize || existing.fileSize || 0),
      fileDataUrl: document.fileDataUrl || existing.fileDataUrl,
      status: document.status || existing.status || "Active",
      history: [
        {
          id: `doc-hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Replaced",
          status: document.status || existing.status || "Active",
          verification_status: existing.verification_status || "Pending",
          remarks: "Document file replaced",
        },
        ...(Array.isArray(existing.history) ? existing.history : []),
      ].slice(0, 100),
    };

    map[key] = [...current];
    map[key][index] = next;
    writeJson(MEMBER_DOCUMENTS_KEY, map);
    pushMemberHistory(key, {
      action: "Document Replaced",
      message: `${next.title || "Document"} was replaced.`,
      actorRole: "system",
    });
    return map[key];
  },

  async removeDocument(memberId, documentId) {
    const key = String(memberId);
    const map = readJson(MEMBER_DOCUMENTS_KEY, {});
    const current = Array.isArray(map[key]) ? map[key] : [];
    map[key] = current.filter((item) => item.id !== documentId);
    writeJson(MEMBER_DOCUMENTS_KEY, map);
    pushMemberHistory(key, {
      action: "Document Removed",
      message: "A document was removed from member profile.",
      actorRole: "system",
    });
    return map[key];
  },// ==========================================
  // KYC Management
  // ==========================================

  async updateKYC(memberId, kycData) {
    return {
      success: true,
      memberId,
      status: "Verified",
      verifiedAt: new Date().toISOString(),
      data: kycData
    };
  },

  // ==========================================
  // Membership Renewal
  // ==========================================

  async renewMembership(memberId, validityMonths = 12) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + validityMonths);

    return {
      success: true,
      memberId,
      membershipStatus: "Active",
      expiryDate: expiry.toISOString()
    };
  },

  async verifyDigitalIdentity(payload = {}) {
    const memberId = String(payload.memberId || payload.member_id || "").trim();
    if (!memberId) {
      return { valid: false, status: "Invalid", reason: "Missing member ID." };
    }

    const members = await this.getAll({ includeDeleted: true });
    const member = members.find((item) => String(item.member_id || item.membership_id || item.id || "").trim() === memberId);
    if (!member) {
      return { valid: false, status: "Invalid", reason: "Member not found." };
    }

    const nameMatches = !payload.name || String(payload.name).trim() === String(member.name || "").trim();
    const mobileMatches = !payload.mobile || String(payload.mobile).trim() === String(member.mobile || "").trim();
    const verificationMatches = !payload.verificationStatus || String(payload.verificationStatus).trim() === String(member.verification_status || "").trim();
    const valid = nameMatches && mobileMatches && verificationMatches;

    return {
      valid,
      status: valid ? "Valid" : "Mismatch",
      reason: valid ? "QR identity verified." : "QR data does not match member record.",
      member: {
        id: member.id || member.members || member.member_id,
        member_id: member.member_id || member.membership_id || "",
        name: member.name || "",
        mobile: member.mobile || "",
        verification_status: member.verification_status || "Pending",
      },
    };
  },

  // ==========================================
  // Export Members
  // ==========================================

  async exportMembers() {
    const members = await this.getAll();

    return {
      exportedAt: new Date().toISOString(),
      total: members.length,
      data: members
    };
  },

  // ==========================================
  // Member Analytics
  // ==========================================

  async analytics() {
    return {
      newMembersToday: 12,
      newMembersThisMonth: 148,
      activeToday: 93,
      totalVerified: 1135,
      pendingVerification: 18,
      renewalDue: 22,
      suspended: 12
    };
  },
};