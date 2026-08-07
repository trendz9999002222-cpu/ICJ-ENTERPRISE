import { Paper, Typography } from "@mui/material";

export default function WalletCard({ profile }) {
	const balance = Number(profile?.walletBalance || 0);

	return (
		<Paper sx={{ p: 3 }}>
			<Typography color="text.secondary">Wallet Balance</Typography>
			<Typography variant="h5" fontWeight="bold">
				{`₹${balance.toLocaleString("en-IN")}`}
			</Typography>
		</Paper>
	);
}

