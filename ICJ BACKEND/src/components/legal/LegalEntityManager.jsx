import { Paper, Typography, TextField, Button, Grid } from "@mui/material";

export default function LegalEntityManager({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid xs={12} md={field.md || 6} key={field.name}>
            <TextField
              fullWidth
              label={field.label}
              value={values[field.name] || ""}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
          </Grid>
        ))}
      </Grid>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={onSubmit} disabled={disabled}>
        {submitLabel || "Save"}
      </Button>
    </Paper>
  );
}
