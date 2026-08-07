import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function TokenDashboard({ tokens = [] }) {
	const total = tokens.reduce((sum, item) => sum + Number(item.amount || 0), 0);

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Token Dashboard
			</Typography>
			<Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
				{total.toLocaleString("en-IN")}
			</Typography>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Token No</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Amount</TableCell>
						<TableCell>Date</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tokens.length === 0 ? (
						<TableRow>
							<TableCell colSpan={4} align="center">
								No token records.
							</TableCell>
						</TableRow>
					) : (
						tokens.map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.tokenNo}</TableCell>
								<TableCell>{item.type}</TableCell>
								<TableCell>{item.amount}</TableCell>
								<TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Paper>
	);
}
