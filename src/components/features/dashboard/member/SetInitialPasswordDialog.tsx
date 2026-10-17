"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React, { useState } from "react";

import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";
import { authenticatedFetch } from "@/lib/api/authFetch";
import { env } from "@/config/env";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function SetInitialPasswordDialog({ open, onClose, onSuccess }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    if (loading) return;
    try {
      sessionStorage.removeItem("icj_just_onboarded_membership");
    } catch {
      // ignore
    }
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticatedFetch(`${env.apiUrl}/auth/set-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok) {
        if (json?.data?.access && json?.data?.refresh) {
          document.cookie = `icj_access_token=${json.data.access}; path=/; max-age=1800; SameSite=Lax`;
          document.cookie = `icj_refresh_token=${json.data.refresh}; path=/; max-age=604800; SameSite=Lax`;
        } else if (json?.access && json?.refresh) {
          document.cookie = `icj_access_token=${json.access}; path=/; max-age=1800; SameSite=Lax`;
          document.cookie = `icj_refresh_token=${json.refresh}; path=/; max-age=604800; SameSite=Lax`;
        }

        try {
          sessionStorage.removeItem("icj_just_onboarded_membership");
        } catch {
          // ignore
        }

        setSuccessMsg("Password set successfully! Your account is now secured.");
        onSuccess?.();
        setTimeout(() => {
          handleClose();
        }, 1400);
      } else {
        const errorMsg =
          json?.errors?.new_password?.[0] ||
          json?.errors?.confirm_password?.[0] ||
          json?.errors?.password?.[0] ||
          json?.message ||
          json?.detail ||
          "Could not set password. Please ensure it meets security requirements.";
        setError(errorMsg);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Mandatory password creation: only allow programmatic close on success
        if (successMsg) handleClose();
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 1, sm: 2 },
            boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.2)",
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ pb: 1, pt: 2, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.2rem", lineHeight: 1.2 }}>
              Set Your Password
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
              First-time setup for your new membership account
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Box
          sx={{
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 1.75,
            mb: 2.5,
          }}
        >
          <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Welcome to Indian Conference of Jurists! Since this is your first login after completing registration, please create a password so you can easily log in to your dashboard anytime.
          </Typography>
        </Box>

        <Box
          component="form"
          id="member-set-initial-password-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
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
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="new-password"
            placeholder="Re-type your password"
            error={Boolean(confirmPassword && newPassword !== confirmPassword)}
            helperText={
              confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error && (
            <Alert severity="error" sx={{ fontSize: "0.8125rem", py: 0.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ fontSize: "0.8125rem", py: 0.5, borderRadius: 2, fontWeight: 600 }}
            >
              {successMsg}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pt: 1, pb: 2.5 }}>
        <Button
          type="submit"
          form="member-set-initial-password-form"
          variant="contained"
          fullWidth
          disabled={loading || Boolean(successMsg)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            py: 1.1,
            fontSize: "0.95rem",
            borderRadius: 2,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {loading ? "Securing account…" : "Set Password & Continue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
