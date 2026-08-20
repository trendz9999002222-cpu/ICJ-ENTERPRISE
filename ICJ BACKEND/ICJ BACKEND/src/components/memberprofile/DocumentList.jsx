import { Paper, Typography, List, ListItem, ListItemText, Chip, Divider, Stack } from "@mui/material";

export default function DocumentList({ profile }) {
	const items = [];

	if (profile?.aadhar || profile?.source?.aadhar || profile?.source?.aadhaar) {
		const val = profile.aadhar || profile.source.aadhar || profile.source.aadhaar;
		items.push({ name: "Aadhaar Card", category: "Identity", value: `Verified (${val.slice(-4)})` });
	}

	if (profile?.pan || profile?.source?.pan) {
		const val = profile.pan || profile.source.pan;
		items.push({ name: "PAN Card", category: "Tax ID", value: `Verified (${val})` });
	}

	if (profile?.gst || profile?.source?.gst) {
		const val = profile.gst || profile.source.gst;
		items.push({ name: "GST Registration", category: "Business Tax", value: val });
	}

	// Add linked documents from documents repository if any
	const linkedDocs = profile?.linkedDocuments || [];
	linkedDocs.forEach((doc) => {
		items.push({
			name: doc.title || doc.file_name || doc.fileName || `Doc #${doc.id}`,
			category: doc.category || "Document",
			value: doc.status || "Uploaded",
		});
	});

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Typography variant="h6" fontWeight="bold" color="primary">
					Submitted & Linked Documents
				</Typography>
				{items.length > 0 && (
					<Chip label={`${items.length} Item${items.length > 1 ? "s" : ""}`} size="small" color="primary" />
				)}
			</Stack>
			<Divider sx={{ mb: 2 }} />

			<List disablePadding>
				{items.length === 0 ? (
					<ListItem>
						<ListItemText primary="No documents available" secondary="No identity or attached documents submitted" />
					</ListItem>
				) : (
					items.map((item, idx) => (
						<ListItem key={idx} divider={idx < items.length - 1}>
							<ListItemText
								primary={item.name}
								secondary={`Category: ${item.category}`}
							/>
							<Chip label={item.value} size="small" variant="outlined" color="primary" />
						</ListItem>
					))
				)}
			</List>
		</Paper>
	);
}
