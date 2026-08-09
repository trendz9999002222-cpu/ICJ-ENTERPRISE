import { getTokens, addToken, updateToken, deleteToken } from "./database";

const TokenService = {
	async getAll() {
		return await getTokens();
	},

	async create(tokenData = {}) {
		const token = {
			id: Date.now(),
			tokenNo: `TOK-${Date.now()}`,
			memberId: tokenData.memberId || null,
			amount: Number(tokenData.amount || 0),
			type: tokenData.type || "Credit",
			status: tokenData.status || "Active",
			createdAt: new Date().toISOString(),
			...tokenData,
		};

		return await addToken(token);
	},

	async update(id, values) {
		await updateToken(id, values);
	},

	async remove(id) {
		await deleteToken(id);
	},
};

export default TokenService;
