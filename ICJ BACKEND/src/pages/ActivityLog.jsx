import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ActivityService from "../services/activityService";
import ActivityTimeline from "../components/activity/ActivityTimeline";

export default function ActivityLog() {
	const [activities, setActivities] = useState([]);

	useEffect(() => {
		let active = true;

		ActivityService.getAll()
			.then((items) => {
				if (!active) return;
				setActivities(Array.isArray(items) ? items : []);
			})
			.catch((error) => {
				if (!active) return;
				console.error("Failed to load activity", error);
			});

		return () => {
			active = false;
		};
	}, []);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Activity Log
			</Typography>
			<ActivityTimeline activities={activities} />
		</Box>
	);
}

