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
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";

import useAuth from "../hooks/useAuth.js";
import AuthService from "../services/authService.js";

export default function MemberSettings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    autoVerify: false,
    requireKyc: true,
    defaultMemberType: "General",
  });
  const [saveMsg, setSaveMsg] = useState("");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const onToggle = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const onTypeChange = (event) => {
    setSettings((prev) => ({ ...prev, defaultMemberType: event.target.value }));
  };

  const onSave = () => {
    setSaveMsg("Member preferences saved successfully.");
    setTimeout(() => setSaveMsg(""), 3500);
  };

  const handlePasswordChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!currentPassword) {
      setPwdError("कृपया अपना पुराना पासवर्ड दर्ज करें।");
      return;
    }

    if (!newPassword) {
      setPwdError("कृपया नया पासवर्ड दर्ज करें।");
      return;
    }

    if (newPassword.length < 8) {
      setPwdError("नया पासवर्ड कम से कम 8 अक्षर का होना चाहिए।");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("नया पासवर्ड और कन्फर्म पासवर्ड एक जैसे नहीं हैं।");
      return;
    }

    const targetUserId = user?.id || user?.member_id || user?.username || user?.email;
    if (!targetUserId) {
      setPwdError("उपयोगकर्ता खाता नहीं मिला। कृपया पुनः लॉगिन करें।");
      return;
    }

    setPwdSubmitting(true);
    try {
      await AuthService.changePassword({
        userId: targetUserId,
        currentPassword,
        newPassword,
      });

      setPwdSuccess("🎉 आपका पासवर्ड सफलतापूर्वक बदल दिया गया है!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(""), 4000);
    } catch (err) {
      setPwdError(err.message || "पासवर्ड बदलने में समस्या आई।");
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <SettingsIcon color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Member & Account Settings
          </Typography>
          <Typography color="text.secondary">
            सदस्य प्रोफ़ाइल प्राथमिकताएं एवं पासवर्ड सुरक्षा प्रबंधन
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* SECTION 1: PASSWORD CHANGE CARD */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
              <SecurityIcon color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  🔒 Change Password (पासवर्ड बदलें)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  पुराना पासवर्ड दर्ज कर अपनी पसंद का कोई भी 8-अक्षर का नया पासवर्ड सेट करें
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
            {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}

            <Box component="form" onSubmit={handlePasswordChange}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  type={showCurrent ? "text" : "password"}
                  label="Old / Current Password (पुराना पासवर्ड)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={pwdSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrent((v) => !v)} edge="end">
                          {showCurrent ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type={showNew ? "text" : "password"}
                  label="New Password (नया पासवर्ड)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={pwdSubmitting}
                  helperText="न्यूनतम 8 अक्षर (नंबर, अक्षर या अल्फ़ान्यूमेरिक)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                          {showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type={showConfirm ? "text" : "password"}
                  label="Confirm New Password (नया पासवर्ड दोबारा दर्ज करें)"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={pwdSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePasswordChange}
                  disabled={pwdSubmitting}
                  startIcon={pwdSubmitting ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
                  sx={{ py: 1.2, fontWeight: "bold", mt: 1 }}
                >
                  {pwdSubmitting ? "Updating..." : "Confirm & Change Password"}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* SECTION 2: MEMBER PREFERENCES */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚙️ Membership Preferences
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
              सदस्यता सत्यापन एवं डिफ़ॉल्ट प्रोफाइल सेटिंग्स
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            {saveMsg && <Alert severity="success" sx={{ mb: 2 }}>{saveMsg}</Alert>}

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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Default Member Type"
                  value={settings.defaultMemberType}
                  onChange={onTypeChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="outlined" onClick={onSave} sx={{ fontWeight: "bold", mt: 1 }}>
                  Save Preferences
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
