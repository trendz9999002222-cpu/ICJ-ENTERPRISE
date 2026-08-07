import { Paper, Typography, Stack, Chip } from "@mui/material";

export default function ProfileTabs() {
	return (
		<Paper sx={{ p: 2 }}>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
				Profile Sections
			</Typography>
			<Stack direction="row" spacing={1} flexWrap="wrap">
				<Chip size="small" label="Overview" />
				<Chip size="small" label="Wallet" />
				<Chip size="small" label="Tokens" />
				<Chip size="small" label="Documents" />
				<Chip size="small" label="Activity" />
			</Stack>
		</Paper>
	);
}

