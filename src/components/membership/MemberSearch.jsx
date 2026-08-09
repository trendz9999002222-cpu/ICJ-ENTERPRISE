import {
  Paper,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function MemberSearch({
  search,
  setSearch,
  filters,
  setFilters,
  onResetFilters,
}) {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Paper sx={{ p: 3, mt: 3, mb: 3, borderRadius: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Enterprise Search Input */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search Member ID, Name, Mobile, Email, Aadhaar, PAN, GST, Profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Filter: Role */}
        <Grid item xs={6} sm={4} md={2}>
          <TextField
            select
            fullWidth
            name="role"
            label="Role"
            value={filters?.role || "all"}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Super Admin / Admin</MenuItem>
            <MenuItem value="employee">Staff / Employee</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </TextField>
        </Grid>

        {/* Filter: Membership Plan */}
        <Grid item xs={6} sm={4} md={2}>
          <TextField
            select
            fullWidth
            name="plan"
            label="Membership Plan"
            value={filters?.plan || "all"}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Plans</MenuItem>
            <MenuItem value="Enterprise">Enterprise</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
            <MenuItem value="Basic">Basic</MenuItem>
          </TextField>
        </Grid>

        {/* Filter: Account Status */}
        <Grid item xs={6} sm={4} md={2}>
          <TextField
            select
            fullWidth
            name="status"
            label="Account Status"
            value={filters?.status || "all"}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Blocked">Blocked</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </TextField>
        </Grid>

        {/* Filter: Verification Status */}
        <Grid item xs={6} sm={4} md={2}>
          <TextField
            select
            fullWidth
            name="verification"
            label="Verification"
            value={filters?.verification || "all"}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Verification</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Pending Verification">Pending Verification</MenuItem>
            <MenuItem value="Under Review">Under Review</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}