import { Grid, Paper, Typography, Box, useTheme, alpha } from "@mui/material";

export default function MemberStats({
  totalMembers = 0,
  pendingMembers = 0,
  approvedMembers = 0,
  rejectedMembers = 0,
  suspendedMembers = 0,
  expiredMembers = 0,
}) {
  const theme = useTheme();

  const cards = [
    {
      title: "Total Members",
      value: totalMembers,
      color: theme.palette.primary.main,
      bg: alpha(theme.palette.primary.main, 0.08),
      border: theme.palette.primary.main,
    },
    {
      title: "Active / Approved",
      value: approvedMembers,
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.08),
      border: theme.palette.success.main,
    },
    {
      title: "Pending",
      value: pendingMembers,
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.08),
      border: theme.palette.warning.main,
    },
    {
      title: "Suspended",
      value: suspendedMembers,
      color: theme.palette.info.main,
      bg: alpha(theme.palette.info.main, 0.08),
      border: theme.palette.info.main,
    },
    {
      title: "Expired",
      value: expiredMembers,
      color: theme.palette.error.dark || theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.08),
      border: theme.palette.error.dark || theme.palette.error.main,
    },
    {
      title: "Rejected",
      value: rejectedMembers,
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.08),
      border: theme.palette.error.main,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }} role="region" aria-label="Membership Statistics Overview">
      {cards.map((card, idx) => (
        <Grid key={idx} item xs={12} sm={6} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderTop: `4px solid ${card.border}`,
              backgroundColor: theme.palette.background.paper,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography
              variant="caption"
              fontWeight="600"
              sx={{ color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {card.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="h4" fontWeight="700" sx={{ color: card.color }}>
                {Number(card.value).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

