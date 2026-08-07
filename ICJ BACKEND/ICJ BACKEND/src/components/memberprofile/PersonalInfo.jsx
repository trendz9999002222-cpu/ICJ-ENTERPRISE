import { Paper, Typography, Grid } from "@mui/material";

export default function PersonalInfo({ profile }) {
	if (!profile) return null;

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Personal Information
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Typography color="text.secondary">Mobile</Typography>
					<Typography>{profile.mobile || "-"}</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Typography color="text.secondary">City</Typography>
					<Typography>{profile.city || "-"}</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Typography color="text.secondary">Member Type</Typography>
					<Typography>{profile.memberType || "General"}</Typography>
				</Grid>
			</Grid>
		</Paper>
	);
}
