import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
} from "@mui/material";

export default function DocumentUpload({ formData, onChange, onFileChange }) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>
        Documents
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Button variant="outlined" component="label" fullWidth>
            Upload Photo
            <input
              hidden
              type="file"
              onChange={(event) => onFileChange("photoFileName", event)}
            />
          </Button>
          {formData.photoFileName && (
            <Typography variant="caption" display="block" mt={1}>
              {formData.photoFileName}
            </Typography>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Button variant="outlined" component="label" fullWidth>
            Upload Aadhaar
            <input
              hidden
              type="file"
              onChange={(event) => onFileChange("aadhaarFileName", event)}
            />
          </Button>
          {formData.aadhaarFileName && (
            <Typography variant="caption" display="block" mt={1}>
              {formData.aadhaarFileName}
            </Typography>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Button variant="outlined" component="label" fullWidth>
            Upload PAN
            <input
              hidden
              type="file"
              onChange={(event) => onFileChange("panFileName", event)}
            />
          </Button>
          {formData.panFileName && (
            <Typography variant="caption" display="block" mt={1}>
              {formData.panFileName}
            </Typography>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Button variant="outlined" component="label" fullWidth>
            Upload Professional Certificate
            <input
              hidden
              type="file"
              onChange={(event) => onFileChange("certificateFileName", event)}
            />
          </Button>
          {formData.certificateFileName && (
            <Typography variant="caption" display="block" mt={1}>
              {formData.certificateFileName}
            </Typography>
          )}
        </Grid>

        <Grid xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            name="remarks"
            label="Remarks"
            value={formData.remarks}
            onChange={onChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

