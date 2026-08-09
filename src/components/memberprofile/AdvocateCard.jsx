import { Paper, Typography, Grid, Divider, Chip, Stack } from "@mui/material";

export default function AdvocateCard({ profile }) {
	if (!profile) return null;

	const advocate = profile.linkedAdvocate;

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Typography variant="h6" fontWeight="bold" color="primary">
					Advocate & Legal Counsel Information
				</Typography>
				{advocate && (
					<Chip label={advocate.status || "Active"} size="small" color="success" />
				)}
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{!advocate ? (
				<Typography color="text.secondary">No advocate assignment recorded for this member</Typography>
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Advocate Name
						</Typography>
						<Typography variant="body1" fontWeight={600}>
							{advocate.name}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Bar Council Reg. ID
						</Typography>
						<Typography variant="body1" fontWeight={500}>
							{advocate.barId || "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Specialization
						</Typography>
						<Typography variant="body1">
							{advocate.specialization || "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Contact Phone
						</Typography>
						<Typography variant="body1">
							{advocate.phone || "No information provided"}
						</Typography>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
