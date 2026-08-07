import { getMembers } from "./database";

const ProfileService = {
	async getProfiles() {
		const members = await getMembers();
		return (members || []).map((member) => ({
			id: member.members || member.id || member.uuid,
			name: member.name || "Unnamed Member",
			email: member.email || "",
			mobile: member.mobile || "",
			city: member.city || "",
			memberType: member.member_type || "General",
			verificationStatus: member.verification_status || "Pending",
			walletBalance: Number(member.wallet_balance || 0),
			tokenBalance: Number(member.token_balance || 0),
			source: member,
		}));
	},

	async getProfileById(id) {
		const profiles = await this.getProfiles();
		return profiles.find((profile) => profile.id === id) || null;
	},
};

export default ProfileService;
