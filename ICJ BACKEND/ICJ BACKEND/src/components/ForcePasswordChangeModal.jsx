import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  LinearProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PasswordPolicyService from "../services/passwordPolicyService";
import AuthService from "../services/authService";

export default function ForcePasswordChangeModal({ open = false, user = null, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const policyConfig = PasswordPolicyService.getConfig();

  const handlePasswordChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Current Password, New Password, and Confirm Password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    // Password Policy Engine Validation
    const valResult = PasswordPolicyService.validatePassword(newPassword);
    if (!valResult.valid) {
      setError(valResult.errors.join(" "));
      return;
    }

    setSubmitting(true);
    try {
      const result = await AuthService.changePassword({
        userId: user?.id || user?.username || user?.email,
        currentPassword,
        newPassword,
      });

      setSuccess(result.message || "Password changed successfully! Redirecting...");
      setTimeout(() => {
        if (onSuccess) onSuccess(result.user);
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "primary.main", color: "#fff", py: 2 }}>
        <LockResetIcon fontSize="large" />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            First Login Security — Force Password Change
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Password Policy Engine v3.0 Compliance Mandatory
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Security Directive: Account <strong>{user?.username || user?.email}</strong> requires a mandatory password update before accessing the ICJ Enterprise Dashboard.
        </Alert>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Current Initial Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText={`Min ${policyConfig.minLength} chars, min 1 letter, min 1 number, min 1 special char (!@#$%^&*)`}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {submitting && <LinearProgress sx={{ my: 2 }} />}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePasswordChange}
          disabled={submitting}
          sx={{ py: 1.5, fontWeight: "bold" }}
        >
          {submitting ? "Updating Password..." : "CONFIRM NEW PASSWORD & OPEN DASHBOARD"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
