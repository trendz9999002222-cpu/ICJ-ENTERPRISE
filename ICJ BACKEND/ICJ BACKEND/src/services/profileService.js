import { getMembers, getDocuments, getWallets, getTokens } from "./database.js";
import LegalEcosystemService from "./legalEcosystemService.js";
import {
	normalizeMemberId,
	normalizeMemberType,
	normalizeMembershipLevel,
} from "./memberService.js";

const ProfileService = {
	async getProfiles() {
		const [members, documents, wallets, tokens] = await Promise.all([
			getMembers(),
			getDocuments().catch(() => []),
			getWallets().catch(() => []),
			getTokens().catch(() => []),
		]);

		const legalCases = LegalEcosystemService.getCases() || [];
		const advocatesList = LegalEcosystemService.getAdvocates() || [];

		return (members || []).map((member) => {
			const memberId = normalizeMemberId(member) || member.name || "UNNAMED";
			const memberIdStr = String(memberId).toLowerCase();
			const memberNameStr = String(member.name || "").toLowerCase();

			// 1. Linked Wallet (Strict ID Match)
			const userWallet = (wallets || []).find(
				(w) => String(w.member_id || w.memberId).toLowerCase() === memberIdStr
			);
			const walletBalance = userWallet ? Number(userWallet.balance) : Number(member.wallet_balance || 0);

			// 2. Linked Tokens (Strict ID Match)
			const userTokens = (tokens || []).filter(
				(t) => String(t.member_id || t.memberId).toLowerCase() === memberIdStr
			);
			const tokenBalance = userTokens.length > 0
				? userTokens.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
				: Number(member.token_balance || 0);

			// 3. Linked Documents (Strict ID / Owner Match)
			const memberDocs = (documents || []).filter(
				(d) =>
					String(d.owner || d.member_id || d.memberId).toLowerCase() === memberIdStr ||
					(memberNameStr && String(d.owner || "").toLowerCase() === memberNameStr)
			);

			// 4. Linked Legal Cases (Client or Advocate Match)
			const memberCases = (legalCases || []).filter(
				(c) =>
					(memberNameStr && String(c.clientName || "").toLowerCase() === memberNameStr) ||
					(memberNameStr && String(c.advocateName || "").toLowerCase() === memberNameStr) ||
					String(c.advocateId || "").toLowerCase() === memberIdStr ||
					String(c.member_id || "").toLowerCase() === memberIdStr
			);

			// 5. Linked Advocate Information
			const linkedAdvocate = (advocatesList || []).find(
				(a) =>
					String(a.id || "").toLowerCase() === memberIdStr ||
					(memberNameStr && String(a.name || "").toLowerCase() === memberNameStr)
			);

			// Dynamic Age Calculation from DOB if age field is not explicitly present
			let age = member.age || "";
			if (!age && member.dob) {
				const dobDate = new Date(member.dob);
				if (!isNaN(dobDate.getTime())) {
					const today = new Date();
					let years = today.getFullYear() - dobDate.getFullYear();
					const m = today.getMonth() - dobDate.getMonth();
					if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
						years--;
					}
					if (years >= 0) age = years;
				}
			}

			const rawType = member.member_type || member.memberType || member.regType || "";
			const rawLevel = member.member_level || member.memberLevel || "";

			return {
				id: memberId,
				memberId: member.member_id || member.memberId || memberId,
				namePrefix: member.name_prefix || member.namePrefix || "",
				name: member.name || "Unnamed Member",
				email: member.email || "",
				mobile: member.mobile || "",
				whatsapp: member.whatsapp || "",
				gender: member.gender || "",
				dob: member.dob || "",
				birthYear: member.birth_year || member.birthYear || "",
				age: age ? String(age) : "",
				address: member.address || "",
				city: member.city || "",
				district: member.district || "",
				state: member.state || "",
				pincode: member.pincode || "",
				memberType: normalizeMemberType(rawType),
				rawMemberType: rawType,
				memberLevel: normalizeMembershipLevel(rawLevel),
				rawMemberLevel: rawLevel,
				role: member.role || "member",
				status: member.status || "Active",
				verificationStatus: member.verification_status || member.verificationStatus || "Pending",
				registrationDate: member.registration_date || member.created_at || "",
				validTill: member.valid_till || "",
				remarks: member.remarks || "",
				profilePhoto: member.profile_photo || "",
				aadhar: member.aadhar || member.aadhaar || "",
				pan: member.pan || "",
				gst: member.gst || "",
				profession: member.profession || "",
				organisation: member.organisation || "",
				experience: member.experience || "",
				entityJurisdiction: member.entity_jurisdiction || member.entityJurisdiction || "",
				entityCategory: member.entity_category || member.entityCategory || "",
				entityType: member.entity_type || member.entityType || "",
				legalPersonality: member.legal_personality || member.legalPersonality || "",
				functionalClassification: member.functional_classification || member.functionalClassification || "",
				walletBalance,
				tokenBalance,
				linkedDocuments: memberDocs,
				linkedCases: memberCases,
				linkedAdvocate: linkedAdvocate || null,
				source: member,
			};
		});
	},

	async getProfileById(id) {
		const profiles = await this.getProfiles();
		return profiles.find((profile) => String(profile.id) === String(id) || String(profile.memberId) === String(id)) || null;
	},
};

export default ProfileService;
