import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function DocumentList({ profile }) {
	const items = [];

	if (profile?.source?.aadhar || profile?.source?.aadhaar) {
		items.push({ name: "Aadhaar", value: profile.source.aadhar || profile.source.aadhaar });
	}

	if (profile?.source?.pan) {
		items.push({ name: "PAN", value: profile.source.pan });
	}

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Documents
			</Typography>
			<List disablePadding>
				{items.length === 0 ? (
					<ListItem>
						<ListItemText primary="No documents available." />
					</ListItem>
				) : (
					items.map((item) => (
						<ListItem key={item.name}>
							<ListItemText primary={item.name} secondary={item.value} />
						</ListItem>
					))
				)}
			</List>
		</Paper>
	);
}
