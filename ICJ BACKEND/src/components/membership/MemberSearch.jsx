import { Paper, Typography, TextField, Grid, MenuItem, Button, Box, useTheme } from "@mui/material";

export default function MemberSearch({
  search,
  setSearch,
  filters,
  setFilters,
}) {
  const theme = useTheme();

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setSearch("");
    setFilters({ status: "ALL", member_type: "ALL" });
  };

  const isFiltered = search.trim() !== "" || filters.status !== "ALL" || filters.member_type !== "ALL";

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
      role="search"
      aria-label="Member Search and Filter Controls"
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          Search & Filter Members
        </Typography>
        {isFiltered && (
          <Button size="small" variant="text" color="secondary" onClick={handleClear} aria-label="Clear Search Filters">
            Clear Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Search Keywords"
            placeholder="Search by Name, Email, Mobile, Member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{ "aria-label": "Search members by name, email, mobile, or member ID" }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Member Status"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            inputProps={{ "aria-label": "Filter by member status" }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="Approved">Approved / Active</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Member Type"
            name="member_type"
            value={filters.member_type}
            onChange={onFilterChange}
            inputProps={{ "aria-label": "Filter by member type" }}
          >
            <MenuItem value="ALL">All Member Types</MenuItem>
            <MenuItem value="Individual">Individual Member</MenuItem>
            <MenuItem value="Institutional">Institutional Member</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}

