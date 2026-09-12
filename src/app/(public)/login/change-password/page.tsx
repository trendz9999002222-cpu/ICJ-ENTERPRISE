"use client";

import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthTokens } from "@/types/api";

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )icj_access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
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
      router.push("/dashboard");
    } catch {
      setError("पासवर्ड अपडेट नहीं हुआ। वर्तमान पासवर्ड और नई पासवर्ड नीति जाँचें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6, px: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 480, width: "100%" }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" fontWeight={900}>
            Set a new password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            पहली बार लॉगिन के बाद आपको एक मजबूत पासवर्ड सेट करना होगा।
          </Typography>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
