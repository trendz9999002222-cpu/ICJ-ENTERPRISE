import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Divider,
  Alert,
  MenuItem,
  Box,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PasswordPolicyService, { DEFAULT_PASSWORD_POLICY } from "../../services/passwordPolicyService";

export default function PasswordPolicyAdminConfigurator() {
  const [config, setConfig] = useState(DEFAULT_PASSWORD_POLICY);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    setConfig(PasswordPolicyService.getConfig());
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const val = type === "checkbox" ? checked : (type === "number" ? parseInt(value, 10) : value);
    setConfig((prev) => ({ ...prev, [name]: val }));
  };

  const handleSave = () => {
    const saved = PasswordPolicyService.saveConfig(config);
    setConfig(saved);
    setSaveMsg("Super Admin Password Policy Engine v3.0 settings updated successfully!");
    setTimeout(() => setSaveMsg(""), 3500);
  };

  const handleResetDefault = () => {
    const saved = PasswordPolicyService.saveConfig(DEFAULT_PASSWORD_POLICY);
    setConfig(saved);
    setSaveMsg("Password policy reset to ICJ Default Standards!");
    setTimeout(() => setSaveMsg(""), 3500);
  };

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }} elevation={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SecurityIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Enterprise Password Policy Engine v3.0 Configurator
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Super Admin Security Controls for Passwords, Lockouts & First Login Rules
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" size="small" onClick={handleResetDefault}>
            Reset Defaults
          </Button>
          <Button variant="contained" size="small" startIcon={<VpnKeyIcon />} onClick={handleSave}>
            Save Policy Config
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {saveMsg ? <Alert severity="success" sx={{ mb: 3 }}>{saveMsg}</Alert> : null}

      <Grid container spacing={3}>
        {/* Length Rules */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            name="minLength"
            label="Minimum Password Length"
            value={config.minLength || 6}
            onChange={handleChange}
            inputProps={{ min: 4, max: 32 }}
            helperText="Default: 6 Characters"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            name="maxLength"
            label="Maximum Password Length"
            value={config.maxLength || 64}
            onChange={handleChange}
            inputProps={{ min: 16, max: 128 }}
            helperText="Default: 64 Characters"
          />
        </Grid>

        {/* Character Complexity Rules */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="requireAlphabet"
                  checked={Boolean(config.requireAlphabet)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Require Alphabet</Typography>
                  <Typography variant="caption" color="text.secondary">Min 1 Letter (Uppercase/Lowercase allowed)</Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="requireNumber"
                  checked={Boolean(config.requireNumber)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Require Numeric Digit</Typography>
                  <Typography variant="caption" color="text.secondary">Min 1 Number (0-9)</Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="requireSpecialChar"
                  checked={Boolean(config.requireSpecialChar)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Require Special Character</Typography>
                  <Typography variant="caption" color="text.secondary">Min 1 Symbol (!@#$%^&*)</Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        {/* First Login Security & Lockouts */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="forcePasswordChange"
                  checked={Boolean(config.forcePasswordChange)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Force First Login Change</Typography>
                  <Typography variant="caption" color="text.secondary">Mandatory password update</Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="failedLoginLockout"
                  checked={Boolean(config.failedLoginLockout)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Failed Login Lockout</Typography>
                  <Typography variant="caption" color="text.secondary">Lock account after max attempts</Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            name="maxLoginAttempts"
            label="Maximum Login Attempts"
            value={config.maxLoginAttempts || 5}
            onChange={handleChange}
            inputProps={{ min: 3, max: 10 }}
          />
        </Grid>

        {/* Expiry & History */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            name="passwordExpiryDays"
            label="Password Expiry Period"
            value={config.passwordExpiryDays || 90}
            onChange={handleChange}
          >
            <MenuItem value={30}>30 Days</MenuItem>
            <MenuItem value={60}>60 Days</MenuItem>
            <MenuItem value={90}>90 Days (Recommended)</MenuItem>
            <MenuItem value={180}>180 Days</MenuItem>
            <MenuItem value={0}>Never Expire</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            name="passwordHistoryCount"
            label="Password History Enforcement Count"
            value={config.passwordHistoryCount || 5}
            onChange={handleChange}
            inputProps={{ min: 1, max: 10 }}
            helperText="Prevents immediate reuse of previous N passwords"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
