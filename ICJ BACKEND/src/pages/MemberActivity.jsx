import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, Chip } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import ActivityService from "../services/activityService";

export default function MemberActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    ActivityService.getAll().then((rows) => {
      setActivities(Array.isArray(rows) ? rows : []);
    });
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Activity
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            {activities.length === 0 ? (
              <Typography color="text.secondary">No activity data available.</Typography>
            ) : (
              activities.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Typography fontWeight="bold">{item.title || "Activity"}</Typography>
                    <Chip size="small" label={item.type || "system"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "Unknown timestamp"}
                  </Typography>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
}
