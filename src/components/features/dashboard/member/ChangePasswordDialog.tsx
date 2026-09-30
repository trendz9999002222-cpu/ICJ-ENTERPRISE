"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { ApiError, apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthTokens } from "@/types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ChangePasswordDialog({ open, onClose, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

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
      setSuccessMsg("Password updated successfully.");
      resetForm();
      onSuccess?.();
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[]> };
        const fieldMsg =
          body.errors?.current_password?.[0] ||
          body.errors?.new_password?.[0] ||
          body.errors?.confirm_password?.[0];
        setError(fieldMsg || body.message || "Could not update password.");
      } else {
        setError("Could not update password. Check your current password and policy.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Change password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} component="form" id="member-change-password-form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
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
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          type="submit"
          form="member-change-password-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
