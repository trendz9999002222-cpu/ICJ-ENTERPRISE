import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

import { memberStatus } from "../../data/MemberStatus";
import { memberLevels } from "../../data/memberLevels";

export default function VerificationSection({ formData, onChange, onSubmit, loading }) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>
        Verification
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="verificationStatus"
            label="Verification Status"
            value={formData.verificationStatus}
            onChange={onChange}
          >
            {memberStatus.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="memberLevel"
            label="Member Level"
            value={formData.memberLevel}
            onChange={onChange}
          >
            {memberLevels.map((level) => (
              <MenuItem key={level.code} value={level.code}>
                {level.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid xs={12}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Member"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

