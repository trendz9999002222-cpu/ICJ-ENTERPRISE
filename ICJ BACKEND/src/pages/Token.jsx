import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	TextField,
	Button,
	MenuItem,
} from "@mui/material";
import TokenService from "../services/tokenService";
import TokenDashboard from "../components/token/TokenDashboard";
import TokenTransactionTable from "../components/token/TokenTransactionTable";
import { MemberService } from "../services/memberService";
import WalletService from "../services/walletService";
import useAuth from "../hooks/useAuth";

export default function Token() {
	const { profile, user } = useAuth();
	const role = String(profile?.role || user?.role || "member").toLowerCase();
	const permissions = TokenService.getPermissions(role);

	const [master, setMaster] = useState(null);
	const [tokens, setTokens] = useState([]);
	const [reports, setReports] = useState(null);
	const [members, setMembers] = useState([]);
	const [wallets, setWallets] = useState([]);
	const [transactions, setTransactions] = useState([]);

	const [masterForm, setMasterForm] = useState({
		name: "",
		symbol: "",
		unitValue: "",
		maxSupply: "",
		status: "Active",
	});

	const [issueForm, setIssueForm] = useState({
		memberId: "",
		amount: "",
		walletId: "",
		referenceNo: "",
		narration: "",
	});
	const [allocationForm, setAllocationForm] = useState({
		memberId: "",
		amount: "",
		batchNo: "",
		narration: "",
	});
	const [transferForm, setTransferForm] = useState({
		fromMemberId: "",
		toMemberId: "",
		amount: "",
		referenceNo: "",
		narration: "",
	});
	const [redeemForm, setRedeemForm] = useState({
		memberId: "",
		amount: "",
		walletId: "",
		referenceNo: "",
		narration: "",
	});

	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [memberFilter, setMemberFilter] = useState("ALL");

	const loadTokenModule = useCallback(async () => {
		const [masterRow, tokenRows, reportRows, memberRows, walletRows, historyRows] =
			await Promise.all([
				TokenService.getMaster(),
				TokenService.getAll(),
				TokenService.getReports(),
				MemberService.getAll(),
				WalletService.getAll(),
				TokenService.getTransactionHistory({}, role, profile),
			]);

		setMaster(masterRow || null);
		setTokens(Array.isArray(tokenRows) ? tokenRows : []);
		setReports(reportRows || null);
		setMembers(Array.isArray(memberRows) ? memberRows : []);
		setWallets(Array.isArray(walletRows) ? walletRows : []);
		setTransactions(Array.isArray(historyRows) ? historyRows : []);

		setMasterForm({
			name: masterRow?.name || "",
			symbol: masterRow?.symbol || "",
			unitValue: String(masterRow?.unitValue || 1),
			maxSupply: String(masterRow?.maxSupply || 0),
			status: masterRow?.status || "Active",
		});
	}, [profile, role]);

	useEffect(() => {
		Promise.resolve().then(loadTokenModule);
	}, [loadTokenModule]);

	const filteredTransactions = useMemo(() => {
		const keyword = String(search || "").toLowerCase();
		return transactions.filter((item) => {
			const matchesType = typeFilter === "ALL" || String(item.type || "") === typeFilter;
			const matchesStatus =
				statusFilter === "ALL" || String(item.status || "") === statusFilter;
			const matchesMember =
				memberFilter === "ALL" ||
				String(item.memberId || item.toMemberId || "") === String(memberFilter);
			const matchesSearch =
				!keyword ||
				String(item.tokenNo || "").toLowerCase().includes(keyword) ||
				String(item.referenceNo || "").toLowerCase().includes(keyword) ||
				String(item.narration || "").toLowerCase().includes(keyword);

			return matchesType && matchesStatus && matchesMember && matchesSearch;
		});
	}, [transactions, search, typeFilter, statusFilter, memberFilter]);

	const onMasterSave = async () => {
		await TokenService.updateMaster(
			{
				name: masterForm.name,
				symbol: masterForm.symbol,
				unitValue: Number(masterForm.unitValue),
				maxSupply: Number(masterForm.maxSupply),
				status: masterForm.status,
			},
			role
		);
		await loadTokenModule();
	};

	const onIssue = async () => {
		await TokenService.issue(
			{
				memberId: issueForm.memberId,
				amount: Number(issueForm.amount),
				walletId: issueForm.walletId || null,
				referenceNo: issueForm.referenceNo,
				narration: issueForm.narration,
			},
			role
		);
		setIssueForm({ memberId: "", amount: "", walletId: "", referenceNo: "", narration: "" });
		await loadTokenModule();
	};

	const onAllocate = async () => {
		await TokenService.allocate(
			{
				memberId: allocationForm.memberId,
				amount: Number(allocationForm.amount),
				batchNo: allocationForm.batchNo,
				narration: allocationForm.narration,
			},
			role
		);
		setAllocationForm({ memberId: "", amount: "", batchNo: "", narration: "" });
		await loadTokenModule();
	};

	const onTransfer = async () => {
		await TokenService.transfer(
			{
				fromMemberId: transferForm.fromMemberId,
				toMemberId: transferForm.toMemberId,
				amount: Number(transferForm.amount),
				referenceNo: transferForm.referenceNo,
				narration: transferForm.narration,
			},
			role
		);
		setTransferForm({ fromMemberId: "", toMemberId: "", amount: "", referenceNo: "", narration: "" });
		await loadTokenModule();
	};

	const onRedeem = async () => {
		await TokenService.redeem(
			{
				memberId: redeemForm.memberId,
				amount: Number(redeemForm.amount),
				walletId: redeemForm.walletId || null,
				referenceNo: redeemForm.referenceNo,
				narration: redeemForm.narration,
			},
			role
		);
		setRedeemForm({ memberId: "", amount: "", walletId: "", referenceNo: "", narration: "" });
		await loadTokenModule();
	};

	const exportExcel = () => {
		if (!permissions.canExport) return;
		const payload = TokenService.buildExcelExport(filteredTransactions);
		const blob = new Blob([payload.content], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = payload.fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const exportPdf = () => {
		if (!permissions.canExport) return;
		const html = TokenService.buildPdfHtml(filteredTransactions, "Token Transaction Report");
		const win = window.open("", "_blank", "noopener,noreferrer");
		if (!win) return;
		win.document.open();
		win.document.write(html);
		win.document.close();
		win.focus();
		win.print();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Token Management
			</Typography>
			<Typography color="text.secondary" sx={{ mb: 2 }}>
				Token Master, issue, allocation, transfer, redemption, wallet integration, reports, and export.
			</Typography>

			<Grid container spacing={3} sx={{ mt: 1 }}>
				<Grid xs={12} md={4}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Token Master
						</Typography>
						<TextField fullWidth label="Token Name" value={masterForm.name} onChange={(event) => setMasterForm((prev) => ({ ...prev, name: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth label="Symbol" value={masterForm.symbol} onChange={(event) => setMasterForm((prev) => ({ ...prev, symbol: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth type="number" label="Unit Value" value={masterForm.unitValue} onChange={(event) => setMasterForm((prev) => ({ ...prev, unitValue: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth type="number" label="Max Supply" value={masterForm.maxSupply} onChange={(event) => setMasterForm((prev) => ({ ...prev, maxSupply: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth select label="Status" value={masterForm.status} onChange={(event) => setMasterForm((prev) => ({ ...prev, status: event.target.value }))} sx={{ mb: 2 }}>
							<MenuItem value="Active">Active</MenuItem>
							<MenuItem value="Inactive">Inactive</MenuItem>
						</TextField>
						<Button variant="contained" onClick={onMasterSave} disabled={!permissions.canManageMaster}>
							Save Master
						</Button>
					</Paper>

					<Paper sx={{ p: 3, mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Token Issue
						</Typography>
						<TextField fullWidth select label="Member" value={issueForm.memberId} onChange={(event) => setIssueForm((prev) => ({ ...prev, memberId: event.target.value }))} sx={{ mb: 2 }}>
							{members.map((member) => (
								<MenuItem key={member.id || member.members} value={member.member_id || member.id || member.members}>
									{`${member.name || "Member"} (${member.member_id || member.id || member.members})`}
								</MenuItem>
							))}
						</TextField>
						<TextField fullWidth type="number" label="Amount" value={issueForm.amount} onChange={(event) => setIssueForm((prev) => ({ ...prev, amount: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth select label="Wallet (Optional)" value={issueForm.walletId} onChange={(event) => setIssueForm((prev) => ({ ...prev, walletId: event.target.value }))} sx={{ mb: 2 }}>
							<MenuItem value="">Not linked</MenuItem>
							{wallets.map((wallet) => (
								<MenuItem key={wallet.id} value={wallet.id}>{`${wallet.id} - ${wallet.memberId || wallet.member_id || "-"}`}</MenuItem>
							))}
						</TextField>
						<TextField fullWidth label="Reference" value={issueForm.referenceNo} onChange={(event) => setIssueForm((prev) => ({ ...prev, referenceNo: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth label="Narration" value={issueForm.narration} onChange={(event) => setIssueForm((prev) => ({ ...prev, narration: event.target.value }))} sx={{ mb: 2 }} />
						<Button variant="contained" onClick={onIssue} disabled={!permissions.canIssue}>
							Issue Tokens
						</Button>
					</Paper>

					<Paper sx={{ p: 3, mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Token Allocation
						</Typography>
						<TextField fullWidth select label="Member" value={allocationForm.memberId} onChange={(event) => setAllocationForm((prev) => ({ ...prev, memberId: event.target.value }))} sx={{ mb: 2 }}>
							{members.map((member) => (
								<MenuItem key={`alloc-${member.id || member.members}`} value={member.member_id || member.id || member.members}>
									{`${member.name || "Member"} (${member.member_id || member.id || member.members})`}
								</MenuItem>
							))}
						</TextField>
						<TextField fullWidth type="number" label="Amount" value={allocationForm.amount} onChange={(event) => setAllocationForm((prev) => ({ ...prev, amount: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth label="Batch No" value={allocationForm.batchNo} onChange={(event) => setAllocationForm((prev) => ({ ...prev, batchNo: event.target.value }))} sx={{ mb: 2 }} />
						<TextField fullWidth label="Narration" value={allocationForm.narration} onChange={(event) => setAllocationForm((prev) => ({ ...prev, narration: event.target.value }))} sx={{ mb: 2 }} />
						<Button variant="contained" onClick={onAllocate} disabled={!permissions.canAllocate}>
							Allocate Tokens
						</Button>
					</Paper>
				</Grid>

				<Grid xs={12} md={8}>
					<TokenDashboard tokens={tokens} reports={reports} master={master} />

					<Grid container spacing={3} sx={{ mt: 1 }}>
						<Grid xs={12} md={6}>
							<Paper sx={{ p: 3 }}>
								<Typography variant="h6" gutterBottom>
									Token Transfer
								</Typography>
								<TextField fullWidth select label="From Member" value={transferForm.fromMemberId} onChange={(event) => setTransferForm((prev) => ({ ...prev, fromMemberId: event.target.value }))} sx={{ mb: 2 }}>
									{members.map((member) => (
										<MenuItem key={`from-${member.id || member.members}`} value={member.member_id || member.id || member.members}>
											{`${member.name || "Member"} (${member.member_id || member.id || member.members})`}
										</MenuItem>
									))}
								</TextField>
								<TextField fullWidth select label="To Member" value={transferForm.toMemberId} onChange={(event) => setTransferForm((prev) => ({ ...prev, toMemberId: event.target.value }))} sx={{ mb: 2 }}>
									{members.map((member) => (
										<MenuItem key={`to-${member.id || member.members}`} value={member.member_id || member.id || member.members}>
											{`${member.name || "Member"} (${member.member_id || member.id || member.members})`}
										</MenuItem>
									))}
								</TextField>
								<TextField fullWidth type="number" label="Amount" value={transferForm.amount} onChange={(event) => setTransferForm((prev) => ({ ...prev, amount: event.target.value }))} sx={{ mb: 2 }} />
								<TextField fullWidth label="Reference" value={transferForm.referenceNo} onChange={(event) => setTransferForm((prev) => ({ ...prev, referenceNo: event.target.value }))} sx={{ mb: 2 }} />
								<TextField fullWidth label="Narration" value={transferForm.narration} onChange={(event) => setTransferForm((prev) => ({ ...prev, narration: event.target.value }))} sx={{ mb: 2 }} />
								<Button variant="contained" onClick={onTransfer} disabled={!permissions.canTransfer}>
									Transfer
								</Button>
							</Paper>
						</Grid>

						<Grid xs={12} md={6}>
							<Paper sx={{ p: 3 }}>
								<Typography variant="h6" gutterBottom>
									Token Redemption
								</Typography>
								<TextField fullWidth select label="Member" value={redeemForm.memberId} onChange={(event) => setRedeemForm((prev) => ({ ...prev, memberId: event.target.value }))} sx={{ mb: 2 }}>
									{members.map((member) => (
										<MenuItem key={`red-${member.id || member.members}`} value={member.member_id || member.id || member.members}>
											{`${member.name || "Member"} (${member.member_id || member.id || member.members})`}
										</MenuItem>
									))}
								</TextField>
								<TextField fullWidth type="number" label="Amount" value={redeemForm.amount} onChange={(event) => setRedeemForm((prev) => ({ ...prev, amount: event.target.value }))} sx={{ mb: 2 }} />
								<TextField fullWidth select label="Wallet (Optional)" value={redeemForm.walletId} onChange={(event) => setRedeemForm((prev) => ({ ...prev, walletId: event.target.value }))} sx={{ mb: 2 }}>
									<MenuItem value="">Not linked</MenuItem>
									{wallets.map((wallet) => (
										<MenuItem key={`wallet-${wallet.id}`} value={wallet.id}>{`${wallet.id} - ${wallet.memberId || wallet.member_id || "-"}`}</MenuItem>
									))}
								</TextField>
								<TextField fullWidth label="Reference" value={redeemForm.referenceNo} onChange={(event) => setRedeemForm((prev) => ({ ...prev, referenceNo: event.target.value }))} sx={{ mb: 2 }} />
								<TextField fullWidth label="Narration" value={redeemForm.narration} onChange={(event) => setRedeemForm((prev) => ({ ...prev, narration: event.target.value }))} sx={{ mb: 2 }} />
								<Button variant="contained" onClick={onRedeem} disabled={!permissions.canRedeem}>
									Redeem
								</Button>
							</Paper>
						</Grid>
					</Grid>

					<Paper sx={{ p: 2, mt: 3 }}>
						<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
							Token Search & Filters
						</Typography>
						<Grid container spacing={2}>
							<Grid xs={12} md={3}>
								<TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
							</Grid>
							<Grid xs={12} md={3}>
								<TextField fullWidth select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									<MenuItem value="ISSUE">Issue</MenuItem>
									<MenuItem value="ALLOCATION">Allocation</MenuItem>
									<MenuItem value="TRANSFER">Transfer</MenuItem>
									<MenuItem value="REDEMPTION">Redemption</MenuItem>
								</TextField>
							</Grid>
							<Grid xs={12} md={3}>
								<TextField fullWidth select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									<MenuItem value="Posted">Posted</MenuItem>
									<MenuItem value="Allocated">Allocated</MenuItem>
								</TextField>
							</Grid>
							<Grid xs={12} md={3}>
								<TextField fullWidth select label="Member" value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									{members.map((member) => (
										<MenuItem key={`filter-${member.id || member.members}`} value={member.member_id || member.id || member.members}>
											{member.name || member.member_id || member.id || member.members}
										</MenuItem>
									))}
								</TextField>
							</Grid>
						</Grid>
						<Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
							<Button variant="outlined" onClick={exportExcel} disabled={!permissions.canExport}>
								Export Excel
							</Button>
							<Button variant="outlined" onClick={exportPdf} disabled={!permissions.canExport}>
								Export PDF
							</Button>
						</Box>
					</Paper>

					<TokenTransactionTable title="Token Transaction History" rows={filteredTransactions} />

					<Paper sx={{ p: 3, mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Token Reports
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{`Total Transactions: ${Number(reports?.totalTransactions || 0).toLocaleString("en-IN")}`}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{`Issued: ${Number(reports?.issued || 0).toLocaleString("en-IN")} | Allocated: ${Number(reports?.allocated || 0).toLocaleString("en-IN")}`}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{`Transferred: ${Number(reports?.transferred || 0).toLocaleString("en-IN")} | Redeemed: ${Number(reports?.redeemed || 0).toLocaleString("en-IN")}`}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{`Net Supply: ${Number(reports?.netSupply || 0).toLocaleString("en-IN")}`}
						</Typography>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
}

