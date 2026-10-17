"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ApiError, apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthTokens } from "@/types/api";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";

export default function AdminAccountSecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    const token = readAccessTokenFromCookie();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient<AuthTokens>(API_ENDPOINTS.auth.changePassword, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      });
      if (result.access && result.refresh) {
        document.cookie = `icj_access_token=${result.access}; path=/; max-age=1800; SameSite=Lax`;
        document.cookie = `icj_refresh_token=${result.refresh}; path=/; max-age=604800; SameSite=Lax`;
      }
      localStorage.removeItem("icj_password_change_required");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Your password has been updated.");
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[]> };
        const fieldMsg =
          body.errors?.current_password?.[0] ||
          body.errors?.new_password?.[0] ||
          body.errors?.confirm_password?.[0];
        setError(fieldMsg || body.message || "Could not update password.");
      } else {
        setError("Could not update password. Check your current password and policy (min. 12 characters).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2.5, sm: 3 },
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        maxWidth: 520,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#eff6ff",
            display: "grid",
            placeItems: "center",
          }}
        >
          <LockOutlinedIcon sx={{ color: "#2563eb" }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
            Change password
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Update the password you use to sign in to the admin portal.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <TextField
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          fullWidth
          autoComplete="current-password"
        />
        <PasswordStrengthIndicator
          password={newPassword}
          confirmPassword={confirmPassword}
          onSuggest={(suggested) => {
            setNewPassword(suggested);
            setConfirmPassword(suggested);
          }}
        />
        <TextField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          helperText="Must meet all policy requirements above"
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
        />

        {error && <Alert severity="error">{error}</Alert>}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ alignSelf: "flex-start", fontWeight: 700, textTransform: "none", px: 3 }}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </Stack>
    </Paper>
  );
}
