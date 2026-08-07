import { Grid, Paper, Typography } from "@mui/material";

export default function LegalDashboard({ data }) {
  const cards = [
    { label: "Total Cases", value: data?.totalCases || 0 },
    { label: "Open Cases", value: data?.openCases || 0 },
    { label: "Closed Cases", value: data?.closedCases || 0 },
    { label: "Upcoming Hearings", value: data?.upcomingHearings || 0 },
    { label: "Notices", value: data?.totalNotices || 0 },
    { label: "Clients", value: data?.totalClients || 0 },
    { label: "Advocates", value: data?.totalAdvocates || 0 },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((item) => (
        <Grid xs={12} sm={6} md={3} key={item.label}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
              {Number(item.value || 0).toLocaleString("en-IN")}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
