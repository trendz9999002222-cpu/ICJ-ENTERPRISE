import { Paper, Typography, Stack, Chip } from "@mui/material";

export default function ProfileHeader({ profile }) {
	if (!profile) return null;

	const displayName =
		profile.namePrefix && !profile.name.startsWith(profile.namePrefix)
			? `${profile.namePrefix} ${profile.name}`
			: profile.name;

	return (
		<Paper sx={{ p: 3 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<div>
					<Typography variant="h5" fontWeight="bold">
						{displayName}
					</Typography>
					<Typography color="text.secondary">{profile.email || "No email"}</Typography>
				</div>
				<Chip
					label={profile.verificationStatus || "Pending"}
					color={profile.verificationStatus === "Verified" ? "success" : "warning"}
					size="small"
				/>
			</Stack>
		</Paper>
	);
}
