import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Divider, Stack } from "@mui/material";

export default function ActivityTable({ profile }) {
	const rows = [];

	if (profile?.registrationDate || profile?.source?.created_at || profile?.source?.registration_date) {
		const regDate = profile.registrationDate || profile.source.registration_date || profile.source.created_at;
		rows.push({
			action: "Member Account Registered",
			date: regDate,
			status: "Completed",
			details: `Initial Registration (${profile.memberType || "General"})`,
		});
	}

	if (profile?.source?.updated_at) {
		rows.push({
			action: "Profile Information Synced",
			date: profile.source.updated_at,
			status: profile?.verificationStatus || "Active",
			details: "Database record sync",
		});
	}

	if (profile?.verificationStatus) {
		rows.push({
			action: `Verification Status (${profile.verificationStatus})`,
			date: profile?.source?.updated_at || profile?.registrationDate || new Date().toISOString(),
			status: profile.verificationStatus,
			details: `Verification level: ${profile.memberLevel || "BASIC"}`,
		});
	}

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Typography variant="h6" fontWeight="bold" color="primary">
					Activity & Account History
				</Typography>
				{rows.length > 0 && <Chip label={`${rows.length} Event${rows.length > 1 ? "s" : ""}`} size="small" color="primary" />}
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{rows.length === 0 ? (
				<Typography color="text.secondary">No activity records available</Typography>
			) : (
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Action / Event</TableCell>
							<TableCell>Date & Time</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={index}>
								<TableCell>
									<Typography variant="body2" fontWeight={500}>{row.action}</Typography>
									<Typography variant="caption" color="text.secondary">{row.details}</Typography>
								</TableCell>
								<TableCell>
									{row.date ? new Date(row.date).toLocaleString("en-IN") : "No date available"}
								</TableCell>
								<TableCell>
									<Chip label={row.status} size="small" variant="outlined" color="primary" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</Paper>
	);
}
