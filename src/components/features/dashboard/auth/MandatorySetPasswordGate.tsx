"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { env } from "@/config/env";
import { ApiError, apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthTokens } from "@/types/api";

function readPasswordChangeRequiredFromToken(): boolean {
  const token = readAccessTokenFromCookie();
  if (!token) return false;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64)) as { password_change_required?: boolean };
    return Boolean(payload.password_change_required);
  } catch {
    return false;
  }
}

type Props = {
  children: React.ReactNode;
};

export default function MandatorySetPasswordGate({ children }: Props) {
  const [checking, setChecking] = useState(true);
  const [mustSetPassword, setMustSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshRequiredFlag = useCallback(async () => {
    const token = readAccessTokenFromCookie();
    if (!token) {
      setMustSetPassword(false);
      setChecking(false);
      return;
    }

    let required = readPasswordChangeRequiredFromToken() || localStorage.getItem("icj_password_change_required") === "1";
    try {
      const res = await fetch(`${env.apiUrl}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        const user = json?.data ?? json;
        if (typeof user?.password_change_required === "boolean") {
          required = user.password_change_required;
        }
      }
    } catch {
      /* keep JWT hint */
    }

    setMustSetPassword(required);
    setChecking(false);
  }, []);

  useEffect(() => {
    refreshRequiredFlag();
  }, [refreshRequiredFlag]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const token = readAccessTokenFromCookie();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient<AuthTokens>(API_ENDPOINTS.auth.setPassword, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      });
      if (result.access && result.refresh) {
        document.cookie = `icj_access_token=${result.access}; path=/; max-age=1800; SameSite=Lax`;
        document.cookie = `icj_refresh_token=${result.refresh}; path=/; max-age=604800; SameSite=Lax`;
      }
      localStorage.removeItem("icj_password_change_required");
      setNewPassword("");
      setConfirmPassword("");
      setMustSetPassword(false);

      // Send EmailJS notification
      try {
        const decoded = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: "service_rypannl",
            template_id: "template_pmntrjf", // Replace with actual Template ID from EmailJS
            user_id: "_afNcmKvmFJoVdlI9",      // Replace with actual Public Key from EmailJS Account
            template_params: {
              title: "Account Setup Successful",
              email: decoded?.email || "",
              name: decoded?.first_name || "Member",
              message: "Your password has been successfully set. Welcome to the ICJ Member Dashboard!"
            }
          })
        });
      } catch (emailErr) {
        console.error("Failed to send email notification", emailErr);
      }
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[]> };
        const fieldMsg =
          body.errors?.new_password?.[0] ||
          body.errors?.confirm_password?.[0] ||
          body.message;
        setError(fieldMsg || "Could not set password.");
      } else {
        setError("Could not set password. Use at least 12 characters and avoid common passwords.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          visibility: mustSetPassword ? "hidden" : "visible",
          pointerEvents: mustSetPassword ? "none" : "auto",
          minHeight: mustSetPassword ? 0 : undefined,
        }}
        aria-hidden={mustSetPassword}
      >
        {children}
      </Box>

      <Dialog
        open={mustSetPassword}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(15, 23, 42, 0.75)" } },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LockOutlinedIcon sx={{ color: "#2563eb", fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                Set your password
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 400 }}>
                For security, create your own password before using the portal. You will use this password for future
                logins.
              </Typography>
            </Stack>

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
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ fontWeight: 800 }}>
              {loading ? "Saving…" : "Save password & continue"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
