import { Paper, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";

export default function ActivityTimeline({ activities = [] }) {
	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Activity Timeline
			</Typography>

			<List disablePadding>
				{activities.length === 0 ? (
					<ListItem>
						<ListItemText primary="No activity found." />
					</ListItem>
				) : (
					activities.map((item, index) => (
						<div key={item.id || index}>
							<ListItem>
								<ListItemText
									primary={item.title || "Activity"}
									secondary={`${item.type || "system"} | ${item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "-"}`}
								/>
							</ListItem>
							{index < activities.length - 1 ? <Divider /> : null}
						</div>
					))
				)}
			</List>
		</Paper>
	);
}

