import { Paper, Typography } from "@mui/material";

export default function TokenCard({ profile }) {
	const balance = Number(profile?.tokenBalance || 0);

	return (
		<Paper sx={{ p: 3 }}>
			<Typography color="text.secondary">Token Balance</Typography>
			<Typography variant="h5" fontWeight="bold">
				{balance.toLocaleString("en-IN")}
			</Typography>
		</Paper>
	);
}

