import { getMembers, addMember, updateMember } from "./database";
import { normalizeRoleCode } from "../core/roles";

const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();
const normalizeMobile = (value = "") => String(value || "").replace(/\D/g, "");

const asTrimmedString = (value = "") => String(value || "").trim();

const hasMeaningfulValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
};

const normalizeRoleList = (...sources) => {
    const roles = [];

    sources.flat().forEach((value) => {
        if (Array.isArray(value)) {
            roles.push(...value);
            return;
        }

        if (typeof value === "string" && value.includes(",")) {
            roles.push(...value.split(","));
            return;
        }

        roles.push(value);
    });

    const normalized = roles
        .map((role) => normalizeRoleCode(role || "member"))
        .filter(Boolean);

    return [...new Set(normalized)];
};

const identityMatches = (member = {}, identity = {}) => {
    const memberEmail = normalizeEmail(member.email || "");
    const identityEmail = normalizeEmail(identity.email || "");
    if (memberEmail && identityEmail && memberEmail === identityEmail) return true;

    const memberMobile = normalizeMobile(member.mobile || "");
    const identityMobile = normalizeMobile(identity.mobile || "");
    if (memberMobile && identityMobile && memberMobile === identityMobile) return true;

    const memberId = asTrimmedString(member.member_id || member.id || member.members || "").toLowerCase();
    const identityId = asTrimmedString(identity.member_id || identity.id || identity.members || "").toLowerCase();
    return Boolean(memberId && identityId && memberId === identityId);
};

const getMemberIdentity = (member = {}) => {
    const id = member.id || member.members || member.member_id || "";
    return asTrimmedString(id);
};

const buildPersonId = (member = {}, preferredIdentity = {}) => {
    const existing = asTrimmedString(member.person_id || "");
    if (existing) return existing;

    const memberIdentity = asTrimmedString(
        member.member_id || member.id || member.members || preferredIdentity.member_id || preferredIdentity.id || ""
    );
    if (memberIdentity) return `PER-${memberIdentity}`;

    const email = normalizeEmail(member.email || preferredIdentity.email || "");
    if (email) return `PER-EMAIL-${email}`;

    const mobile = normalizeMobile(member.mobile || preferredIdentity.mobile || "");
    if (mobile) return `PER-MOBILE-${mobile}`;

    return `PER-${Date.now()}`;
};

const mergePersonProfile = (base = {}, incoming = {}) => {
    const next = { ...(base && typeof base === "object" ? base : {}) };

    Object.entries(incoming || {}).forEach(([key, value]) => {
        if (!hasMeaningfulValue(value)) return;
        if (!hasMeaningfulValue(next[key])) {
            next[key] = value;
            return;
        }

        if (key === "updated_at") {
            next[key] = value;
        }
    });

    return next;
};

const buildPersonProfile = (member = {}) => ({
    full_name: asTrimmedString(member.full_name || member.name || ""),
    name: asTrimmedString(member.name || member.full_name || ""),
    email: normalizeEmail(member.email || ""),
    mobile: normalizeMobile(member.mobile || ""),
    whatsapp: normalizeMobile(member.whatsapp || ""),
    gender: asTrimmedString(member.gender || ""),
    date_of_birth: member.date_of_birth || member.dob || "",
    address: asTrimmedString(member.address || ""),
    city: asTrimmedString(member.city || ""),
    district: asTrimmedString(member.district || ""),
    state: asTrimmedString(member.state || ""),
    country: asTrimmedString(member.country || "India"),
    pin_code: asTrimmedString(member.pin_code || member.pincode || ""),
    status: asTrimmedString(member.status || "Pending"),
    verification_status: asTrimmedString(member.verification_status || "Pending"),
    updated_at: new Date().toISOString(),
});

const applyPersonShape = (member = {}, options = {}) => {
    const roleCode = normalizeRoleCode(options.roleCode || member.role_code || member.role || "member");
    const existingRoles = normalizeRoleList(member.person_roles, member.role_codes, member.role_code, member.role);
    const mergedRoles = normalizeRoleList(existingRoles, roleCode);
    const personId = buildPersonId(member, options.identity || {});
    const personProfile = mergePersonProfile(member.person_profile, buildPersonProfile(member));

    return {
        ...member,
        person_id: personId,
        person_roles: mergedRoles,
        role_codes: mergedRoles,
        role_code: member.role_code || roleCode,
        role: member.role || roleCode,
        person_profile: personProfile,
    };
};

const needsPersonShapeUpdate = (current = {}, next = {}) => {
    if ((current.person_id || "") !== (next.person_id || "")) return true;

    const currentRoles = normalizeRoleList(current.person_roles, current.role_codes, current.role_code, current.role);
    const nextRoles = normalizeRoleList(next.person_roles, next.role_codes, next.role_code, next.role);
    if (JSON.stringify(currentRoles) !== JSON.stringify(nextRoles)) return true;

    const currentProfile = current.person_profile || {};
    const nextProfile = next.person_profile || {};
    return JSON.stringify(currentProfile) !== JSON.stringify(nextProfile);
};

const toPersonProjection = (member = {}) => {
    const canonical = applyPersonShape(member);
    return {
        person_id: canonical.person_id,
        full_name: canonical.person_profile?.full_name || canonical.full_name || canonical.name || "",
        email: canonical.person_profile?.email || canonical.email || "",
        mobile: canonical.person_profile?.mobile || canonical.mobile || "",
        person_roles: normalizeRoleList(canonical.person_roles, canonical.role_codes, canonical.role_code, canonical.role),
        status: canonical.person_profile?.status || canonical.status || "Pending",
        verification_status:
            canonical.person_profile?.verification_status || canonical.verification_status || canonical.status || "Pending",
        member_refs: [getMemberIdentity(canonical)].filter(Boolean),
        updated_at: canonical.person_profile?.updated_at || canonical.updated_at || canonical.created_at || new Date().toISOString(),
    };
};

const PersonService = {
    normalizeIdentity(identity = {}) {
        return {
            ...identity,
            email: normalizeEmail(identity.email || ""),
            mobile: normalizeMobile(identity.mobile || ""),
            member_id: asTrimmedString(identity.member_id || identity.id || identity.members || ""),
        };
    },

    extractRoleCodes(member = {}) {
        return normalizeRoleList(member.person_roles, member.role_codes, member.role_code, member.role);
    },

    async ensureForMemberRecord(member = {}, options = {}) {
        if (!member || typeof member !== "object") return member;

        const shaped = applyPersonShape(member, options);

        const persist = Boolean(options.persist);
        if (!persist) return shaped;

        const memberIdentity = getMemberIdentity(shaped);
        if (!memberIdentity) return shaped;

        if (needsPersonShapeUpdate(member, shaped)) {
            await updateMember(memberIdentity, shaped);
        }

        return shaped;
    },

    async findMemberByIdentity(identity = {}) {
        const normalizedIdentity = this.normalizeIdentity(identity);
        const rows = await getMembers();
        const members = Array.isArray(rows) ? rows : [];

        return (
            members.find((member) => identityMatches(member, normalizedIdentity)) ||
            members.find((member) => asTrimmedString(member.person_id || "") === asTrimmedString(normalizedIdentity.person_id || "")) ||
            null
        );
    },

    async upsertPersonMembership(payload = {}, options = {}) {
        const normalizedIdentity = this.normalizeIdentity(payload);
        const existing = await this.findMemberByIdentity(normalizedIdentity);

        if (existing) {
            const merged = applyPersonShape(
                {
                    ...existing,
                    ...payload,
                    id: existing.id || existing.members || existing.member_id,
                    member_id: existing.member_id || payload.member_id,
                    email: normalizeEmail(payload.email || existing.email || ""),
                    mobile: normalizeMobile(payload.mobile || existing.mobile || ""),
                },
                options
            );

            await updateMember(getMemberIdentity(existing), merged);
            return merged;
        }

        const created = applyPersonShape(payload, options);
        await addMember(created);
        return created;
    },

    async getPersonById(personId = "") {
        const value = asTrimmedString(personId);
        if (!value) return null;

        const rows = await getMembers();
        const members = Array.isArray(rows) ? rows : [];
        const linked = members.filter((member) => asTrimmedString(member.person_id || "") === value);
        if (linked.length === 0) return null;

        const person = toPersonProjection(linked[0]);
        linked.slice(1).forEach((member) => {
            const next = toPersonProjection(member);
            person.person_roles = normalizeRoleList(person.person_roles, next.person_roles);
            person.member_refs = [...new Set([...(person.member_refs || []), ...(next.member_refs || [])])];
            person.updated_at = next.updated_at || person.updated_at;
        });

        return person;
    },

    async listPersons() {
        const rows = await getMembers();
        const members = Array.isArray(rows) ? rows : [];
        const map = new Map();

        members.forEach((member) => {
            const person = toPersonProjection(member);
            const key = person.person_id;
            if (!key) return;

            if (!map.has(key)) {
                map.set(key, person);
                return;
            }

            const existing = map.get(key);
            map.set(key, {
                ...existing,
                person_roles: normalizeRoleList(existing.person_roles, person.person_roles),
                member_refs: [...new Set([...(existing.member_refs || []), ...(person.member_refs || [])])],
                updated_at: person.updated_at || existing.updated_at,
            });
        });

        return [...map.values()];
    },

    async ensureAllMembersCanonical() {
        const rows = await getMembers();
        const members = Array.isArray(rows) ? rows : [];

        for (const member of members) {
            await this.ensureForMemberRecord(member, { persist: true });
        }

        return members.length;
    },
};

export default PersonService;
