import {
  getTokens,
  addToken,
  updateToken,
  deleteToken,
  getWallets,
  updateWallet,
  getMembers,
  updateMember,
} from "./database";
import { optionalString, requirePositiveNumber, requireString } from "../utils/validation";

const STORAGE_KEYS = {
  master: "icj_token_master",
  transactions: "icj_token_transactions",
  allocations: "icj_token_allocations",
};

const DEFAULT_MASTER = {
  id: "TM-1",
  name: "ICJ Community Token",
  symbol: "ICJT",
  unitValue: 1,
  maxSupply: 1000000,
  circulatingSupply: 0,
  status: "Active",
  createdAt: new Date().toISOString(),
};

const permissionMap = {
  admin: {
    canManageMaster: true,
    canIssue: true,
    canAllocate: true,
    canTransfer: true,
    canRedeem: true,
    canExport: true,
    canDelete: true,
    canViewAll: true,
  },
  employee: {
    canManageMaster: false,
    canIssue: true,
    canAllocate: true,
    canTransfer: true,
    canRedeem: true,
    canExport: true,
    canDelete: false,
    canViewAll: true,
  },
  member: {
    canManageMaster: false,
    canIssue: false,
    canAllocate: false,
    canTransfer: false,
    canRedeem: false,
    canExport: false,
    canDelete: false,
    canViewAll: false,
  },
};

const normalizeRole = (role) => String(role || "member").toLowerCase();

const readStore = (key, fallback = []) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const ensureMaster = () => {
  const list = readStore(STORAGE_KEYS.master, []);
  if (list.length > 0) return list[0];
  writeStore(STORAGE_KEYS.master, [DEFAULT_MASTER]);
  return DEFAULT_MASTER;
};

const appendTransaction = (entry) => {
  const rows = readStore(STORAGE_KEYS.transactions, []);
  writeStore(STORAGE_KEYS.transactions, [entry, ...rows]);
};

const adjustMemberTokenBalance = async (memberId, delta) => {
  if (!memberId) return;
  const members = Array.isArray(await getMembers()) ? await getMembers() : [];
  const row = members.find(
    (item) => String(item.member_id || item.memberId || item.id || "") === String(memberId)
  );
  if (!row) return;

  const id = row.id || row.members;
  const current = Number(row.token_balance || 0);
  const next = current + Number(delta || 0);
	if (next < 0) {
		throw new Error("Insufficient member token balance for this operation.");
	}
	await updateMember(id, { token_balance: next });
};

const adjustWalletBalance = async (walletId, delta) => {
  if (!walletId) return;
  const wallets = Array.isArray(await getWallets()) ? await getWallets() : [];
  const wallet = wallets.find((item) => String(item.id) === String(walletId));
  if (!wallet) return;

  const current = Number(wallet.balance || 0);
  const next = current + Number(delta || 0);
  if (next < 0) {
    throw new Error("Insufficient wallet balance for token operation.");
  }
  await updateWallet(wallet.id, { balance: next });
};

const createTokenRow = (payload) => ({
  id: Date.now(),
  tokenNo: payload.tokenNo || `TOK-${Date.now()}`,
  memberId: payload.memberId || null,
  amount: Number(payload.amount || 0),
  type: payload.type || "Issue",
  status: payload.status || "Posted",
  createdAt: payload.createdAt || new Date().toISOString(),
});

const toCsv = (rows, columns) => {
  const head = columns.map((column) => column.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((column) => `"${String(row[column.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return `${head}\n${body}`;
};

const TokenService = {
	getPermissions(role) {
		return permissionMap[normalizeRole(role)] || permissionMap.member;
	},

	async getMaster() {
		return ensureMaster();
	},

	async updateMaster(values, role = "member") {
		const permissions = this.getPermissions(role);
		if (!permissions.canManageMaster) {
			throw new Error("You do not have permission to update token master.");
		}

		const current = ensureMaster();
		const next = {
			...current,
			name: values?.name ? requireString(values.name, "Token name") : current.name,
			symbol: values?.symbol ? requireString(values.symbol, "Token symbol") : current.symbol,
			unitValue: values?.unitValue ? requirePositiveNumber(values.unitValue, "Unit value") : current.unitValue,
			maxSupply: values?.maxSupply ? requirePositiveNumber(values.maxSupply, "Max supply") : current.maxSupply,
			status: values?.status || current.status,
			updatedAt: new Date().toISOString(),
		};

		if (next.maxSupply < Number(next.circulatingSupply || 0)) {
			throw new Error("Max supply cannot be lower than circulating supply.");
		}

		writeStore(STORAGE_KEYS.master, [next]);
		return next;
	},

	async getAll() {
		return await getTokens();
	},

	async getTransactionHistory(filters = {}, role = "member", actorProfile = null) {
		const permissions = this.getPermissions(role);
		const rows = readStore(STORAGE_KEYS.transactions, []);
		const actorMemberId = actorProfile?.member_id || actorProfile?.memberId || actorProfile?.id;
		const scoped = permissions.canViewAll
			? rows
			: rows.filter(
					(item) =>
						String(item.memberId || "") === String(actorMemberId || "") ||
						String(item.toMemberId || "") === String(actorMemberId || "")
				);

		const keyword = String(filters.search || "").toLowerCase();
		return scoped.filter((item) => {
			const matchesType = filters.type && filters.type !== "ALL" ? String(item.type || "") === filters.type : true;
			const matchesStatus = filters.status && filters.status !== "ALL" ? String(item.status || "") === filters.status : true;
			const matchesMember = filters.memberId && filters.memberId !== "ALL"
				? String(item.memberId || item.toMemberId || "") === String(filters.memberId)
				: true;
			const matchesSearch = !keyword
				|| String(item.tokenNo || "").toLowerCase().includes(keyword)
				|| String(item.referenceNo || "").toLowerCase().includes(keyword)
				|| String(item.narration || "").toLowerCase().includes(keyword);

			return matchesType && matchesStatus && matchesMember && matchesSearch;
		});
	},

	async getReports() {
		const [master, history] = await Promise.all([this.getMaster(), this.getTransactionHistory()]);
		const byType = history.reduce((map, item) => {
			const key = item.type || "OTHER";
			map[key] = Number(map[key] || 0) + Number(item.amount || 0);
			return map;
		}, {});

		const issued = Number(byType.ISSUE || 0);
		const redeemed = Number(byType.REDEMPTION || 0);
		const transferred = Number(byType.TRANSFER || 0);
		const allocated = Number(byType.ALLOCATION || 0);

		return {
			master,
			totalTransactions: history.length,
			issued,
			redeemed,
			transferred,
			allocated,
			netSupply: issued - redeemed,
			byType,
		};
	},

	async issue(payload, role = "member") {
		const permissions = this.getPermissions(role);
		if (!permissions.canIssue) {
			throw new Error("You do not have permission to issue tokens.");
		}

		const memberId = requireString(payload?.memberId, "Member ID");
		const amount = requirePositiveNumber(payload?.amount, "Token amount");
		const master = ensureMaster();
		const nextCirculating = Number(master.circulatingSupply || 0) + amount;
		if (nextCirculating > Number(master.maxSupply || 0)) {
			throw new Error("Issue exceeds maximum token supply.");
		}

		const createdAt = new Date().toISOString();
		const tokenNo = `TOK-${Date.now()}`;
		const token = await addToken(
			createTokenRow({
				tokenNo,
				memberId,
				amount,
				type: "ISSUE",
				status: "Posted",
				createdAt,
			})
		);

		await adjustMemberTokenBalance(memberId, amount);
		if (payload?.walletId) {
			await adjustWalletBalance(payload.walletId, -amount * Number(master.unitValue || 1));
		}

		appendTransaction({
			id: nextId("TT"),
			tokenNo,
			type: "ISSUE",
			memberId,
			amount,
			status: "Posted",
			walletId: payload?.walletId || "",
			referenceNo: optionalString(payload?.referenceNo),
			narration: optionalString(payload?.narration),
			createdAt,
			createdByRole: normalizeRole(role),
		});

		writeStore(STORAGE_KEYS.master, [{ ...master, circulatingSupply: nextCirculating }]);
		return token;
	},

	async allocate(payload, role = "member") {
		const permissions = this.getPermissions(role);
		if (!permissions.canAllocate) {
			throw new Error("You do not have permission to allocate tokens.");
		}

		const memberId = requireString(payload?.memberId, "Member ID");
		const amount = requirePositiveNumber(payload?.amount, "Allocation amount");
		const master = ensureMaster();
		const tokenNo = `TAL-${Date.now()}`;
		const createdAt = new Date().toISOString();

		await addToken(
			createTokenRow({
				tokenNo,
				memberId,
				amount,
				type: "ALLOCATION",
				status: "Posted",
				createdAt,
			})
		);
		await adjustMemberTokenBalance(memberId, amount);

		const allocations = readStore(STORAGE_KEYS.allocations, []);
		const allocation = {
			id: nextId("TA"),
			tokenNo,
			memberId,
			amount,
			batchNo: payload?.batchNo || `BATCH-${Date.now()}`,
			status: "Allocated",
			createdAt,
			narration: optionalString(payload?.narration),
		};
		writeStore(STORAGE_KEYS.allocations, [allocation, ...allocations]);

		appendTransaction({
			id: nextId("TT"),
			tokenNo,
			type: "ALLOCATION",
			memberId,
			amount,
			status: "Posted",
			referenceNo: allocation.batchNo,
			narration: optionalString(payload?.narration),
			createdAt,
			createdByRole: normalizeRole(role),
		});

		writeStore(STORAGE_KEYS.master, [
			{ ...master, circulatingSupply: Number(master.circulatingSupply || 0) + amount },
		]);
		return allocation;
	},

	async transfer(payload, role = "member") {
		const permissions = this.getPermissions(role);
		if (!permissions.canTransfer) {
			throw new Error("You do not have permission to transfer tokens.");
		}

		const fromMemberId = requireString(payload?.fromMemberId, "From Member ID");
		const toMemberId = requireString(payload?.toMemberId, "To Member ID");
		if (fromMemberId === toMemberId) {
			throw new Error("Cannot transfer tokens to the same member.");
		}
		const amount = requirePositiveNumber(payload?.amount, "Transfer amount");

		await adjustMemberTokenBalance(fromMemberId, -amount);
		await adjustMemberTokenBalance(toMemberId, amount);

		const createdAt = new Date().toISOString();
		const transferNo = `TTR-${Date.now()}`;
		await addToken(
			createTokenRow({
				tokenNo: transferNo,
				memberId: toMemberId,
				amount,
				type: "TRANSFER",
				status: "Posted",
				createdAt,
			})
		);

		appendTransaction({
			id: nextId("TT"),
			tokenNo: transferNo,
			type: "TRANSFER",
			memberId: fromMemberId,
			toMemberId,
			amount,
			status: "Posted",
			referenceNo: optionalString(payload?.referenceNo),
			narration: optionalString(payload?.narration),
			createdAt,
			createdByRole: normalizeRole(role),
		});
	},

	async redeem(payload, role = "member") {
		const permissions = this.getPermissions(role);
		if (!permissions.canRedeem) {
			throw new Error("You do not have permission to redeem tokens.");
		}

		const memberId = requireString(payload?.memberId, "Member ID");
		const amount = requirePositiveNumber(payload?.amount, "Redemption amount");
		const master = ensureMaster();

		await adjustMemberTokenBalance(memberId, -amount);
		if (payload?.walletId) {
			await adjustWalletBalance(payload.walletId, amount * Number(master.unitValue || 1));
		}

		const createdAt = new Date().toISOString();
		const redeemNo = `TRD-${Date.now()}`;
		await addToken(
			createTokenRow({
				tokenNo: redeemNo,
				memberId,
				amount,
				type: "REDEMPTION",
				status: "Posted",
				createdAt,
			})
		);

		appendTransaction({
			id: nextId("TT"),
			tokenNo: redeemNo,
			type: "REDEMPTION",
			memberId,
			amount,
			status: "Posted",
			walletId: payload?.walletId || "",
			referenceNo: optionalString(payload?.referenceNo),
			narration: optionalString(payload?.narration),
			createdAt,
			createdByRole: normalizeRole(role),
		});

		writeStore(STORAGE_KEYS.master, [
			{ ...master, circulatingSupply: Math.max(0, Number(master.circulatingSupply || 0) - amount) },
		]);
	},

	async create(tokenData = {}) {
		return this.issue(tokenData, tokenData?.role || "admin");
	},

	async update(id, values) {
		await updateToken(id, values);
	},

	async remove(id) {
		await deleteToken(id);
	},

	buildExcelExport(rows) {
		const columns = [
			{ key: "createdAt", label: "Date" },
			{ key: "tokenNo", label: "Token No" },
			{ key: "type", label: "Type" },
			{ key: "memberId", label: "Member" },
			{ key: "toMemberId", label: "To Member" },
			{ key: "amount", label: "Amount" },
			{ key: "walletId", label: "Wallet" },
			{ key: "status", label: "Status" },
			{ key: "referenceNo", label: "Reference" },
			{ key: "narration", label: "Narration" },
		];

		return {
			fileName: `token-report-${new Date().toISOString().slice(0, 10)}.csv`,
			content: toCsv(rows, columns),
		};
	},

	buildPdfHtml(rows, title = "Token Report") {
		const tableRows = rows
			.map(
				(item) => `
					<tr>
						<td>${item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</td>
						<td>${item.tokenNo || "-"}</td>
						<td>${item.type || "-"}</td>
						<td>${item.memberId || "-"}</td>
						<td>${item.toMemberId || "-"}</td>
						<td>${Number(item.amount || 0).toLocaleString("en-IN")}</td>
						<td>${item.status || "-"}</td>
					</tr>
				`
			)
			.join("");

		return `
			<!doctype html>
			<html>
			<head>
				<meta charset="utf-8" />
				<title>${title}</title>
				<style>
					body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
					h2 { margin: 0 0 12px 0; }
					table { width: 100%; border-collapse: collapse; }
					th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
					th { background: #f4f4f4; }
				</style>
			</head>
			<body>
				<h2>${title}</h2>
				<table>
					<thead>
						<tr>
							<th>Date</th>
							<th>Token No</th>
							<th>Type</th>
							<th>Member</th>
							<th>To Member</th>
							<th>Amount</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>${tableRows}</tbody>
				</table>
			</body>
			</html>
		`;
	},
};

export default TokenService;
