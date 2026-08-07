import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  TextField,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";

const MEMBER_SETTINGS_KEY = "icj_member_settings";

const defaultState = {
  autoAssignMemberId: true,
  requireKycForActivation: true,
  certificateRequiresVerification: true,
  defaultMemberType: "Individual",
};

export default function MemberSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = window.localStorage.getItem(MEMBER_SETTINGS_KEY);
      if (!raw) return defaultState;
      const saved = JSON.parse(raw);
      return { ...defaultState, ...(saved || {}) };
    } catch {
      return defaultState;
    }
  });

  const onToggle = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const onTextChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = () => {
    window.localStorage.setItem(MEMBER_SETTINGS_KEY, JSON.stringify(settings));
    alert("Member settings saved.");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Settings
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.autoAssignMemberId} name="autoAssignMemberId" onChange={onToggle} />}
                label="Auto-assign member IDs"
              />
            </Grid>
            <Grid xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.requireKycForActivation} name="requireKycForActivation" onChange={onToggle} />}
                label="Require KYC before activation"
              />
            </Grid>
            <Grid xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.certificateRequiresVerification} name="certificateRequiresVerification" onChange={onToggle} />}
                label="Require verification before certificate issuance"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Member Type"
                name="defaultMemberType"
                value={settings.defaultMemberType}
                onChange={onTextChange}
              />
            </Grid>
            <Grid xs={12}>
              <Button variant="contained" onClick={onSave}>Save Member Settings</Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
}
