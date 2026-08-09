import { Paper, Typography, Grid, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import EventBusyIcon from "@mui/icons-material/EventBusy";

export default function MemberStats({
  totalMembers = 0,
  activeMembers = 0,
  pendingMembers = 0,
  blockedMembers = 0,
  expiredMembers = 0,
  onStatClick,
}) {
  const stats = [
    { title: "Total Members", value: totalMembers, color: "primary.main", icon: <PeopleIcon />, filterKey: "all" },
    { title: "Active Members", value: activeMembers, color: "success.main", icon: <CheckCircleIcon />, filterKey: "active" },
    { title: "Pending Members", value: pendingMembers, color: "warning.main", icon: <HourglassEmptyIcon />, filterKey: "pending" },
    { title: "Blocked Members", value: blockedMembers, color: "error.main", icon: <BlockIcon />, filterKey: "blocked" },
    { title: "Expired Members", value: expiredMembers, color: "secondary.main", icon: <EventBusyIcon />, filterKey: "expired" },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((item) => (
        <Grid item xs={12} sm={6} md={2.4} key={item.title}>
          <Paper
            variant="outlined"
            onClick={() => onStatClick && onStatClick(item.filterKey)}
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderLeft: "4px solid",
              borderLeftColor: item.color,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 2, borderColor: item.color },
            }}
          >
            <Box sx={{ color: item.color }}>{item.icon}</Box>
            <Box>
              <Typography color="text.secondary" variant="caption" fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {item.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}