import { Paper, Typography, Grid, Divider, Chip, Table, TableBody, TableCell, TableHead, TableRow, Stack } from "@mui/material";

export default function LegalCasesCard({ profile }) {
	if (!profile) return null;

	const cases = profile.linkedCases || [];

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Typography variant="h6" fontWeight="bold" color="primary">
					Legal Matters & Cases
				</Typography>
				{cases.length > 0 && (
					<Chip label={`${cases.length} Case${cases.length > 1 ? "s" : ""}`} size="small" color="primary" />
				)}
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{cases.length === 0 ? (
				<Typography color="text.secondary">No legal cases associated with this member</Typography>
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell>Case Number</TableCell>
									<TableCell>Title / Matter</TableCell>
									<TableCell>Court Name</TableCell>
									<TableCell>Advocate</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>Next Hearing</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{cases.map((c) => (
									<TableRow key={c.id || c.caseNumber}>
										<TableCell fontWeight="bold">{c.caseNumber || c.id}</TableCell>
										<TableCell>{c.title}</TableCell>
										<TableCell>{c.courtName || "Court"}</TableCell>
										<TableCell>{c.advocateName || "Unassigned"}</TableCell>
										<TableCell>
											<Chip
												label={c.status || "Active"}
												size="small"
												color={c.status === "Closed" ? "default" : "info"}
												variant="outlined"
											/>
										</TableCell>
										<TableCell>{c.nextHearing || "TBD"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
