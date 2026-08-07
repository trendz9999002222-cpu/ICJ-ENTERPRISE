import { Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";

export default function TokenDashboard({ tokens = [], reports = null, master = null }) {
	const total = tokens.reduce((sum, item) => sum + Number(item.amount || 0), 0);
	const issueCount = tokens.filter((item) => String(item.type || "").toUpperCase() === "ISSUE").length;
	const redeemCount = tokens.filter((item) => String(item.type || "").toUpperCase() === "REDEMPTION").length;
	const transferCount = tokens.filter((item) => String(item.type || "").toUpperCase() === "TRANSFER").length;

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Token Dashboard
			</Typography>

			<Grid container spacing={2} sx={{ mb: 2 }}>
				<Grid xs={12} sm={3}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Token Volume</Typography>
						<Typography variant="h6" fontWeight="bold">{total.toLocaleString("en-IN")}</Typography>
					</Paper>
				</Grid>
				<Grid xs={12} sm={3}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Issued</Typography>
						<Typography variant="h6" fontWeight="bold">{issueCount}</Typography>
					</Paper>
				</Grid>
				<Grid xs={12} sm={3}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Transferred</Typography>
						<Typography variant="h6" fontWeight="bold">{transferCount}</Typography>
					</Paper>
				</Grid>
				<Grid xs={12} sm={3}>
					<Paper variant="outlined" sx={{ p: 2 }}>
						<Typography color="text.secondary" variant="body2">Redeemed</Typography>
						<Typography variant="h6" fontWeight="bold">{redeemCount}</Typography>
					</Paper>
				</Grid>
			</Grid>

			{master ? (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{`${master.name} (${master.symbol}) | Max Supply: ${Number(master.maxSupply || 0).toLocaleString("en-IN")} | Circulating: ${Number(master.circulatingSupply || 0).toLocaleString("en-IN")}`}
				</Typography>
			) : null}

			{reports?.byType ? (
				<Grid container spacing={1} sx={{ mb: 2 }}>
					{Object.keys(reports.byType).map((key) => (
						<Grid key={key}>
							<Chip label={`${key}: ${Number(reports.byType[key] || 0).toLocaleString("en-IN")}`} size="small" />
						</Grid>
					))}
				</Grid>
			) : null}

			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Token No</TableCell>
						<TableCell>Member ID</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Amount</TableCell>
						<TableCell>Status</TableCell>
						<TableCell>Date</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tokens.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} align="center">
								No token records.
							</TableCell>
						</TableRow>
					) : (
						tokens.slice(0, 20).map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.tokenNo || item.token_no || "-"}</TableCell>
								<TableCell>{item.memberId || item.member_id || "-"}</TableCell>
								<TableCell>{item.type || "-"}</TableCell>
								<TableCell>{Number(item.amount || 0).toLocaleString("en-IN")}</TableCell>
								<TableCell>{item.status || "Posted"}</TableCell>
								<TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Paper>
	);
}

