import {
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";

export default function ProfessionalInformation() {
  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Professional Information
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Current Occupation"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Designation"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Company / Organisation"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Years of Experience"
            type="number"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Employment Type"
          >
            <MenuItem value="government">Government</MenuItem>
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="self-employed">Self Employed</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="retired">Retired</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Annual Income"
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Professional Skills / Expertise"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
