import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, MenuItem } from "@mui/material";
import FinanceService from "../services/financeService";
import useAuth from "../hooks/useAuth";
import FinanceTransactionTable from "../components/finance/FinanceTransactionTable";

export default function Transactions() {
	const { profile, user } = useAuth();
	const role = String(profile?.role || user?.role || "member").toLowerCase();
	const permissions = FinanceService.getPermissions(role);

	const [rows, setRows] = useState([]);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [modeFilter, setModeFilter] = useState("ALL");
	const [sourceFilter, setSourceFilter] = useState("ALL");

	useEffect(() => {
		Promise.resolve().then(async () => {
			const data = await FinanceService.getTransactionHistory();
			setRows(Array.isArray(data) ? data : []);
		});
	}, []);

	const filteredRows = useMemo(() => {
		const keyword = String(search || "").toLowerCase();
		return rows.filter((row) => {
			const matchesType = typeFilter === "ALL" || String(row.type || "").toUpperCase() === typeFilter;
			const matchesMode = modeFilter === "ALL" || String(row.mode || "").toLowerCase() === String(modeFilter).toLowerCase();
			const matchesSource = sourceFilter === "ALL" || String(row.source || "") === sourceFilter;
			const matchesSearch =
				!keyword ||
				String(row.reference || "").toLowerCase().includes(keyword) ||
				String(row.voucherNo || "").toLowerCase().includes(keyword) ||
				String(row.accountHeadName || "").toLowerCase().includes(keyword) ||
				String(row.narration || "").toLowerCase().includes(keyword);

			return matchesType && matchesMode && matchesSource && matchesSearch;
		});
	}, [rows, search, typeFilter, modeFilter, sourceFilter]);

	const exportRows = () => {
		if (!permissions.canExport) {
			alert("You do not have permission to export transactions.");
			return;
		}

		const { csv, fileName } = FinanceService.buildExport(filteredRows, "transactions");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Transaction History
			</Typography>

			<Paper sx={{ p: 2, mt: 2, mb: 3 }}>
				<Grid container spacing={2}>
					<Grid xs={12} md={3}>
						<TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
					</Grid>
					<Grid xs={12} md={3}>
						<TextField fullWidth select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
							<MenuItem value="ALL">All</MenuItem>
							<MenuItem value="INCOME">Income</MenuItem>
							<MenuItem value="EXPENSE">Expense</MenuItem>
							<MenuItem value="RECEIPT">Receipt</MenuItem>
							<MenuItem value="PAYMENT">Payment</MenuItem>
							<MenuItem value="CREDIT">Credit</MenuItem>
							<MenuItem value="DEBIT">Debit</MenuItem>
							<MenuItem value="TRANSFER">Transfer</MenuItem>
							<MenuItem value="TOKEN">Token</MenuItem>
							<MenuItem value="DONATION">Donation</MenuItem>
						</TextField>
					</Grid>
					<Grid xs={12} md={3}>
						<TextField fullWidth select label="Mode" value={modeFilter} onChange={(event) => setModeFilter(event.target.value)}>
							<MenuItem value="ALL">All</MenuItem>
							<MenuItem value="Cash">Cash</MenuItem>
							<MenuItem value="Bank">Bank</MenuItem>
							<MenuItem value="UPI">UPI</MenuItem>
							<MenuItem value="Wallet">Wallet</MenuItem>
							<MenuItem value="Token">Token</MenuItem>
						</TextField>
					</Grid>
					<Grid xs={12} md={3}>
						<TextField fullWidth select label="Source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
							<MenuItem value="ALL">All</MenuItem>
							<MenuItem value="Finance">Finance</MenuItem>
							<MenuItem value="Donation">Donation</MenuItem>
							<MenuItem value="Token">Token</MenuItem>
						</TextField>
					</Grid>
				</Grid>
			</Paper>

			<FinanceTransactionTable
				title="All Transactions"
				rows={filteredRows}
				showExport={permissions.canExport}
				onExport={exportRows}
				exportLabel="Export Transactions"
			/>
		</Box>
	);
}

