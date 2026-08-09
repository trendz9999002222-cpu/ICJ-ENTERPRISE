import { Paper, Typography, Grid, Divider, Chip, Stack } from "@mui/material";

export default function ProfessionalCard({ profile }) {
	if (!profile) return null;

	const hasProfession = Boolean(profile.profession);
	const hasOrganisation = Boolean(profile.organisation);
	const hasExperience = Boolean(profile.experience);
	const hasEntityType = Boolean(profile.entityType || profile.source?.entityType);
	const hasEntityCategory = Boolean(profile.entityCategory || profile.source?.entityCategory);
	const hasJurisdiction = Boolean(profile.entityJurisdiction || profile.source?.entityJurisdiction);
	const hasNamePrefix = Boolean(profile.namePrefix || profile.source?.namePrefix);
	const hasLegalPersonality = Boolean(profile.legalPersonality || profile.source?.legalPersonality);
	const hasFunctionalClassification = Boolean(profile.functionalClassification || profile.source?.functionalClassification);

	const hasAnyData = hasProfession || hasOrganisation || hasExperience || hasEntityType || hasEntityCategory || hasLegalPersonality;

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Typography variant="h6" fontWeight="bold" color="primary">
					Professional & Entity Master Classification
				</Typography>
				{hasEntityType && (
					<Chip label={profile.entityType || profile.source?.entityType} color="secondary" size="small" />
				)}
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{!hasAnyData ? (
				<Typography color="text.secondary">No professional or entity information provided</Typography>
			) : (
				<Grid container spacing={2}>
					{hasNamePrefix && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Name Prefix / Salutation
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{profile.namePrefix || profile.source?.namePrefix}
							</Typography>
						</Grid>
					)}

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Profession / Occupation
						</Typography>
						<Typography variant="body1" fontWeight={500}>
							{hasProfession ? profile.profession : "No information provided"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Official / Registered Entity Name
						</Typography>
						<Typography variant="body1">
							{hasOrganisation ? profile.organisation : "No information provided"}
						</Typography>
					</Grid>

					{hasJurisdiction && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Legal Jurisdiction
							</Typography>
							<Typography variant="body1">
								{profile.entityJurisdiction || profile.source?.entityJurisdiction}
							</Typography>
						</Grid>
					)}

					{hasEntityCategory && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Entity Category
							</Typography>
							<Typography variant="body1">
								{profile.entityCategory || profile.source?.entityCategory}
							</Typography>
						</Grid>
					)}

					{hasEntityType && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Legal Entity Type
							</Typography>
							<Typography variant="body1" fontWeight={500} color="primary">
								{profile.entityType || profile.source?.entityType}
							</Typography>
						</Grid>
					)}

					{hasLegalPersonality && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Legal Personality
							</Typography>
							<Typography variant="body1" fontWeight={500} color="secondary">
								{profile.legalPersonality || profile.source?.legalPersonality}
							</Typography>
						</Grid>
					)}

					{hasFunctionalClassification && (
						<Grid item xs={12} sm={6}>
							<Typography color="text.secondary" variant="caption" display="block">
								Functional / Sector Classification
							</Typography>
							<Typography variant="body1">
								{profile.functionalClassification || profile.source?.functionalClassification}
							</Typography>
						</Grid>
					)}

					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Years of Experience
						</Typography>
						<Typography variant="body1">
							{hasExperience ? `${profile.experience} years` : "No information provided"}
						</Typography>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
