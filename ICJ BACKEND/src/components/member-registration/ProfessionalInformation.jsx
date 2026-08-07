import {
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const verificationStatus = ["Pending", "Verified", "Rejected", "Expired"];

export default function ProfessionalInformation({
  formData,
  onChange,
  selectedProfession,
}) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>
        Professional Information
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            label="Registration Authority"
            value={selectedProfession?.authority || ""}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="registrationNumber"
            label={
              selectedProfession?.registrationLabel || "Registration Number"
            }
            value={formData.registrationNumber}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="registrationDate"
            type="date"
            label="Registration Date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.registrationDate}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="validTill"
            type="date"
            label="Valid Till"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.validTill}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="registrationStatus"
            label="Registration Status"
            value={formData.registrationStatus}
            onChange={onChange}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="experience"
            type="number"
            label="Experience (Years)"
            value={formData.experience}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="designation"
            label="Designation"
            value={formData.designation}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="issuingState"
            label="Issuing State"
            value={formData.issuingState}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="issuingOffice"
            label="Issuing Authority Office"
            value={formData.issuingOffice}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="verificationStatus"
            label="Verification Status"
            value={formData.verificationStatus}
            onChange={onChange}
          >
            {verificationStatus.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {selectedProfession?.verificationRequired && (
          <Grid xs={12}>
            <Typography color="primary" fontWeight="bold">
              ✓ Professional Verification Required
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}


