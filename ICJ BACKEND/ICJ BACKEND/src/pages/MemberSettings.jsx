import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Button,
} from "@mui/material";

export default function MemberSettings() {
  const [settings, setSettings] = useState({
    autoVerify: false,
    requireKyc: true,
    defaultMemberType: "General",
  });

  const onToggle = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const onTypeChange = (event) => {
    setSettings((prev) => ({ ...prev, defaultMemberType: event.target.value }));
  };

  const onSave = () => {
    alert("Member settings saved for this session.");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Settings
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={settings.autoVerify} name="autoVerify" onChange={onToggle} />}
              label="Auto-verify newly added members"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={settings.requireKyc} name="requireKyc" onChange={onToggle} />}
              label="Require KYC before certificate issuance"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Member Type"
              value={settings.defaultMemberType}
              onChange={onTypeChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={onSave}>
              Save Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}