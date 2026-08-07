import { Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function WalletDashboard({ wallets = [] }) {
	const total = wallets.reduce((sum, item) => sum + Number(item.balance || 0), 0);
	const activeWallets = wallets.filter((item) => String(item.status || "Active") === "Active").length;
	const average = wallets.length ? total / wallets.length : 0;

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Wallet Dashboard
			</Typography>

			<Grid container spacing={2} sx={{ mb: 2 }}>
				<Grid xs={12} sm={4}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Total Balance</Typography>
						<Typography variant="h6" fontWeight="bold">{`₹${total.toLocaleString("en-IN")}`}</Typography>
					</Paper>
				</Grid>
				<Grid xs={12} sm={4}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Active Wallets</Typography>
						<Typography variant="h6" fontWeight="bold">{activeWallets}</Typography>
					</Paper>
				</Grid>
				<Grid xs={12} sm={4}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Average Balance</Typography>
						<Typography variant="h6" fontWeight="bold">{`₹${average.toLocaleString("en-IN")}`}</Typography>
					</Paper>
				</Grid>
			</Grid>

			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Wallet ID</TableCell>
						<TableCell>Member ID</TableCell>
						<TableCell>Balance</TableCell>
						<TableCell>Currency</TableCell>
						<TableCell>Status</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{wallets.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} align="center">
								No wallets available.
							</TableCell>
						</TableRow>
					) : (
						wallets.map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.id}</TableCell>
								<TableCell>{item.memberId || item.member_id || "-"}</TableCell>
								<TableCell>{`₹${Number(item.balance || 0).toLocaleString("en-IN")}`}</TableCell>
								<TableCell>{item.currency || "INR"}</TableCell>
								<TableCell>{item.status || "Active"}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Paper>
	);
}

