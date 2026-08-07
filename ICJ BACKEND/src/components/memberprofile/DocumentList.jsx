import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function DocumentList({ profile }) {
	const items = [];
	const uploadedDocuments = Array.isArray(profile?.documents) ? profile.documents : [];

	if (profile?.source?.aadhar || profile?.source?.aadhaar) {
		items.push({ name: "Aadhaar", value: profile.source.aadhar || profile.source.aadhaar });
	}

	if (profile?.source?.pan) {
		items.push({ name: "PAN", value: profile.source.pan });
	}

	uploadedDocuments.forEach((item) => {
		items.push({
			name: item.title || item.fileName || "Document",
			value: [
				item.documentType || item.fileType || "General",
				item.status || "Active",
				item.verification_status || "Pending",
			].join(" | "),
		});
	});

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

