import { Paper, Typography, Grid, Divider, Chip, Stack } from "@mui/material";

export default function KYCCard({ profile }) {
	if (!profile) return null;

	const hasAadhar = Boolean(profile.aadhar);
	const hasPan = Boolean(profile.pan);
	const hasGst = Boolean(profile.gst);

	const formatAadhaar = (val) => {
		if (!val) return "";
		const clean = String(val).replace(/\D/g, "");
		if (clean.length === 12) {
			return `XXXX-XXXX-${clean.slice(8)}`;
		}
		return val;
	};

	const formatPan = (val) => {
		if (!val) return "";
		const clean = String(val).trim().toUpperCase();
		if (clean.length === 10) {
			return `${clean.slice(0, 3)}XXXX${clean.slice(7)}`;
		}
		return clean;
	};

	const hasAnyKyc = hasAadhar || hasPan || hasGst;

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" gutterBottom>
				<Typography variant="h6" fontWeight="bold" color="primary">
					KYC & Identity Documents
				</Typography>
				<Chip
					label={profile.verificationStatus === "Verified" || profile.verificationStatus === "Approved" ? "Verified" : "Pending Verification"}
					size="small"
					color={profile.verificationStatus === "Verified" || profile.verificationStatus === "Approved" ? "success" : "warning"}
				/>
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{!hasAnyKyc ? (
				<Typography color="text.secondary">No KYC identity information provided</Typography>
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Aadhaar Number
						</Typography>
						<Typography variant="body1" fontWeight={500}>
							{hasAadhar ? formatAadhaar(profile.aadhar) : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							PAN Card Number
						</Typography>
						<Typography variant="body1" fontWeight={500}>
							{hasPan ? formatPan(profile.pan) : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							GST Number
						</Typography>
						<Typography variant="body1">
							{hasGst ? profile.gst : "No information provided"}
						</Typography>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
