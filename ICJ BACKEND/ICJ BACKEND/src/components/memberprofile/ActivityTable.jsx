import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function ActivityTable({ profile }) {
	const rows = [
		{
			action: "Member Record Synced",
			date: profile?.source?.updated_at || profile?.source?.created_at || profile?.source?.registration_date,
			status: profile?.verificationStatus || "Pending",
		},
	];

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Activity
			</Typography>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Action</TableCell>
						<TableCell>Date</TableCell>
						<TableCell>Status</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row, index) => (
						<TableRow key={index}>
							<TableCell>{row.action}</TableCell>
							<TableCell>{row.date ? new Date(row.date).toLocaleString("en-IN") : "-"}</TableCell>
							<TableCell>{row.status}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Paper>
	);
}
