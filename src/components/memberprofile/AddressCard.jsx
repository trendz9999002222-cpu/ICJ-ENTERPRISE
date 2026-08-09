import { Paper, Typography, Grid, Divider } from "@mui/material";

export default function AddressCard({ profile }) {
	if (!profile) return null;

	const hasAddress = Boolean(profile.address);
	const hasCity = Boolean(profile.city);
	const hasDistrict = Boolean(profile.district);
	const hasState = Boolean(profile.state);
	const hasPincode = Boolean(profile.pincode);

	const hasAnyData = hasAddress || hasCity || hasDistrict || hasState || hasPincode;

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
				Address Information
			</Typography>
			<Divider sx={{ mb: 2 }} />

			{!hasAnyData ? (
				<Typography color="text.secondary">No address information provided</Typography>
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Typography color="text.secondary" variant="caption" display="block">
							Street / Residential Address
						</Typography>
						<Typography variant="body1">
							{hasAddress ? profile.address : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							City
						</Typography>
						<Typography variant="body1">
							{hasCity ? profile.city : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							District
						</Typography>
						<Typography variant="body1">
							{hasDistrict ? profile.district : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							State
						</Typography>
						<Typography variant="body1">
							{hasState ? profile.state : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							PIN Code
						</Typography>
						<Typography variant="body1">
							{hasPincode ? profile.pincode : "No information provided"}
						</Typography>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
