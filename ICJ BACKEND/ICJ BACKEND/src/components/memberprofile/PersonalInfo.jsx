import { Paper, Typography, Grid, Divider } from "@mui/material";

export default function PersonalInfo({ profile }) {
	if (!profile) return null;

	const hasMobile = Boolean(profile.mobile);
	const hasWhatsapp = Boolean(profile.whatsapp);
	const hasEmail = Boolean(profile.email);
	const hasCity = Boolean(profile.city);
	const hasGender = Boolean(profile.gender);
	const hasDob = Boolean(profile.dob || profile.birthYear);
	const hasAge = Boolean(profile.age);

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
				Personal & Contact Information
			</Typography>
			<Divider sx={{ mb: 2 }} />

			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Full Name
					</Typography>
					<Typography variant="body1" fontWeight={500}>
						{profile.namePrefix ? `${profile.namePrefix} ${profile.name}` : profile.name || "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Mobile Number
					</Typography>
					<Typography variant="body1">
						{hasMobile ? profile.mobile : "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						WhatsApp Number
					</Typography>
					<Typography variant="body1">
						{hasWhatsapp ? profile.whatsapp : "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Email Address
					</Typography>
					<Typography variant="body1">
						{hasEmail ? profile.email : "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Gender
					</Typography>
					<Typography variant="body1">
						{hasGender ? profile.gender : "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Date of Birth / Birth Year
					</Typography>
					<Typography variant="body1">
						{hasDob ? profile.dob ? `${profile.dob}${profile.birthYear ? ` (Year: ${profile.birthYear})` : ""}` : `Year: ${profile.birthYear}` : "No information provided"}
					</Typography>
				</Grid>

				{hasAge && (
					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Age
						</Typography>
						<Typography variant="body1">{profile.age} years</Typography>
					</Grid>
				)}

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						City / Location
					</Typography>
					<Typography variant="body1">
						{hasCity ? profile.city : "No information provided"}
					</Typography>
				</Grid>

				{profile.purpose && (
					<Grid item xs={12}>
						<Divider sx={{ my: 1 }} />
						<Typography color="text.secondary" variant="caption" display="block">
							Purpose of Joining ICJ
						</Typography>
						<Typography variant="body1" fontWeight={600} color="primary">
							{profile.purpose}
						</Typography>
						{(profile.problemCategory || profile.serviceCategory || profile.franchiseCity) && (
							<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
								Category / Details: {profile.problemCategory || profile.serviceCategory || profile.franchiseCity}
								{profile.franchiseMessage ? ` — ${profile.franchiseMessage}` : ""}
							</Typography>
						)}
					</Grid>
				)}
			</Grid>
		</Paper>
	);
}
