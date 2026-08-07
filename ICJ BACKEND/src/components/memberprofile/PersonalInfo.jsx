import { Paper, Typography, Grid, LinearProgress, Chip, Stack } from "@mui/material";

export default function PersonalInfo({ profile }) {
	if (!profile) return null;

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Personal Information
			</Typography>
			<Stack spacing={1} sx={{ mb: 2 }}>
				<Typography variant="body2" color="text.secondary">
					Profile Completion: {profile.completion?.completionPercentage ?? 0}%
				</Typography>
				<LinearProgress variant="determinate" value={profile.completion?.completionPercentage ?? 0} />
				<Typography variant="caption" color="text.secondary">
					Required Fields: {profile.completion?.requiredFilledCount ?? 0}/{profile.completion?.requiredTotalCount ?? 0}
				</Typography>
				{Array.isArray(profile.completion?.missingRequiredFields) && profile.completion.missingRequiredFields.length > 0 ? (
					<Stack direction="row" spacing={1} flexWrap="wrap">
						{profile.completion.missingRequiredFields.map((field) => (
							<Chip key={`req-${field}`} size="small" color="error" label={`Missing Required: ${field}`} />
						))}
					</Stack>
				) : (
					<Chip size="small" color="success" label="All required fields complete" />
				)}
				{Array.isArray(profile.completion?.missingOptionalFields) && profile.completion.missingOptionalFields.length > 0 ? (
					<Stack direction="row" spacing={1} flexWrap="wrap">
						{profile.completion.missingOptionalFields.map((field) => (
							<Chip key={`opt-${field}`} size="small" color="default" label={`Optional: ${field}`} />
						))}
					</Stack>
				) : null}
			</Stack>
			<Grid container spacing={2}>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Member ID</Typography>
					<Typography>{profile.memberId || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Mobile</Typography>
					<Typography>{profile.mobile || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">WhatsApp</Typography>
					<Typography>{profile.whatsapp || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Date Of Birth</Typography>
					<Typography>{profile.dob || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Age</Typography>
					<Typography>{profile.age || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Gender</Typography>
					<Typography>{profile.gender || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Profession</Typography>
					<Typography>{profile.profession || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Organisation</Typography>
					<Typography>{profile.organisation || "-"}</Typography>
				</Grid>
				<Grid xs={12}>
					<Typography color="text.secondary">Address</Typography>
					<Typography>{profile.address || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">City</Typography>
					<Typography>{profile.city || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">District</Typography>
					<Typography>{profile.district || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">State</Typography>
					<Typography>{profile.state || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">PIN Code</Typography>
					<Typography>{profile.pincode || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Member Type</Typography>
					<Typography>{profile.memberType || "General"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Verification Status</Typography>
					<Typography>{profile.verificationStatus || "Pending"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Verified By</Typography>
					<Typography>{profile.verifiedBy || "-"}</Typography>
				</Grid>
				<Grid xs={12} md={6}>
					<Typography color="text.secondary">Verification Date</Typography>
					<Typography>{profile.verificationDate ? new Date(profile.verificationDate).toLocaleString("en-IN") : "-"}</Typography>
				</Grid>
				<Grid xs={12}>
					<Typography color="text.secondary">Remarks</Typography>
					<Typography>{profile.remarks || "-"}</Typography>
				</Grid>
			</Grid>
		</Paper>
	);
}

