import { getMembers } from "./database";
import { MemberService } from "./memberService";

const REQUIRED_PROFILE_FIELDS = [
	"name",
	"mobile",
	"dob",
	"gender",
	"address",
	"state",
	"district",
	"city",
	"pincode",
];

const OPTIONAL_PROFILE_FIELDS = [
	"email",
	"whatsapp",
	"profession",
	"organisation",
	"profile_photo",
];

const hasValue = (value) => {
	if (value === null || value === undefined) return false;
	return String(value).trim().length > 0;
};

const toAge = (value) => {
	const raw = String(value || "").trim();
	if (!raw) return "";
	const dob = new Date(raw);
	if (Number.isNaN(dob.getTime())) return "";
	const now = new Date();
	let age = now.getFullYear() - dob.getFullYear();
	const monthDiff = now.getMonth() - dob.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
		age -= 1;
	}
	return age >= 0 ? age : "";
};

const buildCompletion = (member = {}) => {
	const requiredFilled = REQUIRED_PROFILE_FIELDS.filter((field) => hasValue(member[field]));
	const optionalFilled = OPTIONAL_PROFILE_FIELDS.filter((field) => hasValue(member[field]));
	const totalTracked = REQUIRED_PROFILE_FIELDS.length + OPTIONAL_PROFILE_FIELDS.length;
	const totalFilled = requiredFilled.length + optionalFilled.length;

	return {
		completionPercentage: totalTracked > 0 ? Math.round((totalFilled / totalTracked) * 100) : 0,
		requiredFields: REQUIRED_PROFILE_FIELDS,
		optionalFields: OPTIONAL_PROFILE_FIELDS,
		missingRequiredFields: REQUIRED_PROFILE_FIELDS.filter((field) => !hasValue(member[field])),
		missingOptionalFields: OPTIONAL_PROFILE_FIELDS.filter((field) => !hasValue(member[field])),
		requiredFilledCount: requiredFilled.length,
		requiredTotalCount: REQUIRED_PROFILE_FIELDS.length,
	};
};

const ProfileService = {
	async getProfiles() {
		const members = await getMembers();
		const rows = Array.isArray(members) ? members : [];
		return Promise.all(rows.map(async (member) => {
			const id = member.members || member.id || member.uuid;
			const documents = await MemberService.getDocuments(id);
			const profileHistory = await MemberService.getHistory(id);
			const verificationHistory = Array.isArray(member.verification_history) && member.verification_history.length > 0
				? member.verification_history
				: profileHistory.filter((item) => String(item?.action || "").toLowerCase().includes("verification"));
			const dob = member.dob || member.date_of_birth || "";
			const pincode = member.pincode || member.pin_code || "";
			const age = member.age ?? toAge(dob);

			return {
				id,
				name: member.name || "Unnamed Member",
				memberId: member.member_id || member.membership_id || "",
				email: member.email || "",
				mobile: member.mobile || "",
				whatsapp: member.whatsapp || member.whats_app || "",
				dob,
				age,
				gender: member.gender || "",
				address: member.address || "",
				state: member.state || "",
				district: member.district || "",
				city: member.city || "",
				pincode,
				profession: member.profession || "",
				organisation: member.organisation || "",
				profilePhoto: member.profile_photo || "",
				memberType: member.member_type || "General",
				verificationStatus: member.verification_status || "Pending",
				verificationDate: member.verification_date || null,
				verifiedBy: member.verified_by || "",
				remarks: member.remarks || "",
				verificationHistory,
				documents,
				completion: buildCompletion(member),
				walletBalance: Number(member.wallet_balance || 0),
				tokenBalance: Number(member.token_balance || 0),
				source: member,
			};
		}));
	},

	async getProfileById(id) {
		const profiles = await this.getProfiles();
		return profiles.find((profile) => profile.id === id) || null;
	},
};

export default ProfileService;
