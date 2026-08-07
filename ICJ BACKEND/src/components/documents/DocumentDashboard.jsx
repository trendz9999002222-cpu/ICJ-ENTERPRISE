import { Grid, Paper, Typography, Chip, Box } from "@mui/material";

export default function DocumentDashboard({ data }) {
  const cards = [
    { title: "Total Documents", value: data?.totalDocuments || 0 },
    { title: "Active", value: data?.activeDocuments || 0 },
    { title: "Draft", value: data?.draftDocuments || 0 },
    { title: "Archived", value: data?.archivedDocuments || 0 },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {cards.map((card) => (
          <Grid xs={12} sm={6} md={3} key={card.title}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                {Number(card.value || 0).toLocaleString("en-IN")}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Category Snapshot
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {Object.entries(data?.byCategory || {}).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No category data available.
            </Typography>
          ) : (
            Object.entries(data.byCategory).map(([key, value]) => (
              <Chip key={key} size="small" label={`${key}: ${Number(value || 0).toLocaleString("en-IN")}`} />
            ))
          )}
        </Box>
      </Paper>
    </>
  );
}
