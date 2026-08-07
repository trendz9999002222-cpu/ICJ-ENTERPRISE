import { Paper, Typography, Stack, Chip, Avatar } from "@mui/material";

export default function ProfileHeader({ profile }) {
	if (!profile) return null;

	return (
		<Paper sx={{ p: 3 }}>
			<Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center" }}>
				<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
					<Avatar src={profile.profilePhoto || ""} sx={{ width: 56, height: 56 }}>
						{String(profile.name || "M").charAt(0).toUpperCase()}
					</Avatar>
					<div>
						<Typography variant="h5" fontWeight="bold">
							{profile.name}
						</Typography>
						<Typography color="text.secondary">{profile.email || "No email"}</Typography>
						<Typography variant="caption" color="text.secondary">
							Member ID: {profile.memberId || "-"}
						</Typography>
					</div>
				</Stack>
				<Chip
					label={profile.verificationStatus || "Pending"}
					color={profile.verificationStatus === "Verified" ? "success" : "warning"}
					size="small"
				/>
			</Stack>
		</Paper>
	);
}

