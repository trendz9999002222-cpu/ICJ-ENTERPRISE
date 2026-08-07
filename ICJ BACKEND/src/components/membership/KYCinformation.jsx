import {
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

export default function KYCInformation() {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>
        KYC & Identity Verification
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <TextField fullWidth label="Aadhaar Number" />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField fullWidth label="PAN Number" />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField fullWidth select label="Identity Proof">
            <MenuItem value="aadhaar">Aadhaar Card</MenuItem>
            <MenuItem value="passport">Passport</MenuItem>
            <MenuItem value="driving">Driving Licence</MenuItem>
            <MenuItem value="voter">Voter ID</MenuItem>
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <Button
            fullWidth
            variant="contained"
            component="label"
            sx={{ height: 56 }}
          >
            Upload Identity Proof
            <input hidden type="file" />
          </Button>
        </Grid>

        <Grid xs={12} md={6}>
          <Button
            fullWidth
            variant="contained"
            component="label"
            sx={{ height: 56 }}
          >
            Upload Address Proof
            <input hidden type="file" />
          </Button>
        </Grid>

        <Grid xs={12} md={6}>
          <Button
            fullWidth
            variant="contained"
            component="label"
            sx={{ height: 56 }}
          >
            Upload Passport Photo
            <input hidden type="file" accept="image/*" />
          </Button>
        </Grid>

        <Grid xs={12}>
          <Button
            fullWidth
            variant="contained"
            component="label"
            sx={{ height: 56 }}
          >
            Upload Digital Signature
            <input hidden type="file" accept="image/*" />
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
