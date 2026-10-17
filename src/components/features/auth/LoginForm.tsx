"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import DeliveryChannelSelector from "@/components/features/auth/DeliveryChannelSelector";
import { ApiError } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import type { DeliveryChannel } from "@/types/auth";
import { normalizePlatformRole } from "@/lib/roles";
import { getDashboardRoute } from "@/types/api";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>("whatsapp");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await authService.login(identifier, password, deliveryChannel);
      if (!tokens.access || !tokens.refresh) {
        throw new Error("Missing tokens");
      }
      document.cookie = `icj_access_token=${tokens.access}; path=/; max-age=1800; SameSite=Lax`;
      document.cookie = `icj_refresh_token=${tokens.refresh}; path=/; max-age=604800; SameSite=Lax`;
      localStorage.setItem("icj_delivery_channel", deliveryChannel);
      localStorage.removeItem("icj_password_change_required");
      const role = normalizePlatformRole(tokens.user?.role) ?? "member";
      router.push(getDashboardRoute(role));
    } catch (err) {
      if (err instanceof ApiError) {
        const body =
          err.body && typeof err.body === "object"
            ? (err.body as {
                message?: string;
                detail?: string;
                errors?: Record<string, string[]>;
              })
            : null;
    
        const detail =
          body?.errors?.credentials?.[0] ||
          body?.message ||
          body?.detail ||
          (err.status === 401
            ? "Invalid email or password."
            : err.status === 403
              ? "You are not authorized to sign in."
              : err.status === 404
                ? "Login service was not found."
                : err.status === 422
                  ? "Please check the entered details."
                  : err.status === 0
                    ? err.message
                    : "Login failed. Please try again.");
    
        setError(detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "लॉगिन असफल। Mobile/Email और Password जाँचें या backend connection देखें।",
        );
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 480, md: 520 },
        p: { xs: 2.5, sm: 3, md: 4 },
        borderRadius: 3,
        border: "1px solid #e2e8f0",
      }}
    >
      <Stack spacing={1} sx={{ alignItems: "center", mb: 3 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
          <LockOutlinedIcon sx={{ color: "#2563eb", fontSize: 30 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Sign In</Typography>
        <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center" }}>
          International Consortium of Jurists (ICJ Enterprise Platform)
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
        <Box>
          <TextField
            label="Registered Mobile Number or Email Address"
            placeholder="Enter Mobile (+91) or Email (e.g. 9876543210 or user@icj.law)"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            fullWidth
          />
          <Typography variant="caption" sx={{ color: "#64748b", mt: 0.8, display: "block" }}>
            मोबाइल नंबर या Email दोनों में से कुछ भी डालकर लॉगिन करें
          </Typography>
        </Box>

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        <DeliveryChannelSelector value={deliveryChannel} onChange={setDeliveryChannel} />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            py: { xs: 1.2, md: 1.4 },
            fontWeight: 900,
            bgcolor: "#1d4ed8",
            letterSpacing: 0.4,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
          }}
        >
          {loading ? "Signing In..." : "SIGN IN TO ENTERPRISE WORKSPACE"}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, letterSpacing: 1, display: "block", mb: 1.5 }}>
        ONBOARDING & ACCOUNT SERVICES
      </Typography>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: "#cbd5e1", bgcolor: "#f8fafc" }}>
        <MuiLink component={Link} href="/join-professional" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800, color: "#2563eb" }}>
          <PersonAddIcon fontSize="small" />
          + CREATE NEW ACCOUNT / REGISTRATION
        </MuiLink>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
        <MuiLink component={Link} href="/recovery" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#2563eb", fontWeight: 700 }}>
          <VpnKeyIcon fontSize="small" />
          Account Recovery
        </MuiLink>
        <MuiLink component={Link} href="/verify-certificate" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#2563eb", fontWeight: 700 }}>
          <VerifiedUserIcon fontSize="small" />
          Verification Status
        </MuiLink>
      </Stack>
    </Paper>
  );
}
