"use client";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import CredentialsDialog, {
  type CredentialsData,
} from "@/components/features/admin/shared/CredentialsDialog";
import { adminUsersService } from "@/services/admin/adminUsers.service";
import type { AdminUser } from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<AdminUser["status"], "success" | "warning" | "error" | "default"> = {
  active: "success",
  pending: "warning",
  suspended: "error",
  inactive: "default",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", gap: 2, py: 1.25, borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
      <Typography
        sx={{ width: 160, flexShrink: 0, fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.8rem", color: "#0f172a", flex: 1, wordBreak: "break-all" }}>
        {value}
      </Box>
    </Box>
  );
}


// ---------------------------------------------------------------------------

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [generatingPwd, setGeneratingPwd] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean;
    data: CredentialsData | null;
  }>({ open: false, data: null });

  const loadUser = async () => {
    setLoading(true);
    setError("");
    try {
      const u = await adminUsersService.getUser(userId);
      if (!u) throw new Error("User not found");
      setUser(u);
    } catch {
      setError("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, [userId]);

  const handleResetPassword = async () => {
    if (!user) return;
    setGeneratingPwd(true);
    try {
      const res = await adminUsersService.resetUserPassword(user.id);
      setCredentialsModal({
        open: true,
        data: {
          user_id: user.id,
          email: res.email || user.email,
          name: res.name || user.full_name,
          role: res.role || user.role,
          temp_password: res.temp_password,
          profession_name: user.profession_name || undefined,
          category_name: user.category_name || undefined,
          is_new_user: false,
        },
      });
      setToastMsg(`Temporary password generated for ${user.email}`);
      await loadUser();
    } catch {
      setError("Failed to generate temporary password.");
    } finally {
      setGeneratingPwd(false);
    }
  };

  const handleToggle = async () => {
    if (!user) return;
    setToggling(true);
    setError("");
    try {
      const updated = await adminUsersService.toggleUserStatus(user.id, user.status);
      setUser(updated);
      const label = updated.status === "active" ? "activated" : "deactivated";
      setToastMsg(`User ${updated.full_name} has been ${label}.`);
    } catch {
      setError("Failed to update user status. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="User Detail">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error || !user) {
    return (
      <AdminPageShell title="User Detail">
        <Alert severity="error">{error || "User not found."}</Alert>
        <Button component={Link} href="/admin/users" sx={{ mt: 2 }}>
          ← Back to Users
        </Button>
      </AdminPageShell>
    );
  }

  const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AdminPageShell
      title={user.full_name}
      subtitle={`User ID: ${user.id} · ${user.role.replace("_", " ")}`}
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/admin/users"
            variant="outlined"
            size="small"
            sx={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            ← Back
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={generatingPwd ? <CircularProgress size={14} color="inherit" /> : <VpnKeyIcon />}
            onClick={handleResetPassword}
            disabled={generatingPwd}
            sx={{ fontWeight: 700 }}
          >
            {user.temp_password ? "View / Reset Password" : "Generate Temp Password"}
          </Button>
          <Button
            variant={user.status === "active" ? "contained" : "outlined"}
            color={user.status === "active" ? "error" : "success"}
            size="small"
            startIcon={
              toggling ? (
                <CircularProgress size={14} color="inherit" />
              ) : user.status === "active" ? (
                <BlockIcon />
              ) : (
                <CheckCircleOutlinedIcon />
              )
            }
            onClick={handleToggle}
            disabled={toggling}
            sx={{ fontWeight: 700 }}
          >
            {user.status === "active" ? "Deactivate User" : "Activate User"}
          </Button>
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e2e8f0", borderRadius: 3, p: 3, textAlign: "center" }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: user.role === "admin" || user.role === "super_admin" ? "#2563eb" : "#64748b",
                fontSize: "1.5rem",
                fontWeight: 800,
                mx: "auto",
                mb: 2,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {user.full_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              @{user.username}
            </Typography>

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={user.role.replace("_", " ")}
                color="primary"
                size="small"
                sx={{ fontWeight: 700, textTransform: "capitalize" }}
              />
              <Chip
                label={user.status}
                color={STATUS_COLOR[user.status]}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700, textTransform: "capitalize" }}
              />
              <Chip
                label={user.is_verified ? "Email Verified" : "Email Not Verified"}
                color={user.is_verified ? "success" : "warning"}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Quick contact */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
                <EmailIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                <Typography variant="caption" sx={{ color: "#64748b", wordBreak: "break-all" }}>
                  {user.email}
                </Typography>
              </Stack>
              {user.mobile && (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
                  <PhoneIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {user.mobile}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Account details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}
          >
            <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Account Information
              </Typography>
            </Box>
            <Box sx={{ px: 3, py: 1 }}>
              <InfoRow label="Full Name" value={user.full_name} />
              <InfoRow label="Username" value={`@${user.username}`} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Mobile" value={user.mobile || "—"} />
              <InfoRow label="Role" value={user.role.replace("_", " ")} />
              <InfoRow
                label="Status"
                value={
                  <Chip
                    size="small"
                    label={user.status}
                    color={STATUS_COLOR[user.status]}
                    sx={{ fontWeight: 700, textTransform: "capitalize" }}
                  />
                }
              />
              <InfoRow
                label="Email Verified"
                value={user.is_verified ? "Yes ✓" : "No"}
              />
              <InfoRow
                label="Date Joined"
                value={new Date(user.date_joined).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              />
              {user.last_login && (
                <InfoRow
                  label="Last Login"
                  value={new Date(user.last_login).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
              )}
            </Box>
          </Paper>

          {/* Activate/Deactivate card */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              border: `1px solid ${user.status === "active" ? "#fca5a5" : "#bbf7d0"}`,
              borderRadius: 3,
              p: 3,
              bgcolor: user.status === "active" ? "#fef2f2" : "#f0fdf4",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: user.status === "active" ? "#dc2626" : "#16a34a",
                mb: 0.5,
              }}
            >
              {user.status === "active" ? "Deactivate Account" : "Activate Account"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              {user.status === "active"
                ? "Deactivating this user will prevent them from logging in and accessing the platform. You can reactivate at any time."
                : "Activating this user will restore their access to the platform."}
            </Typography>
            <Button
              variant="contained"
              color={user.status === "active" ? "error" : "success"}
              size="small"
              startIcon={
                toggling ? (
                  <CircularProgress size={14} color="inherit" />
                ) : user.status === "active" ? (
                  <BlockIcon />
                ) : (
                  <CheckCircleOutlinedIcon />
                )
              }
              onClick={handleToggle}
              disabled={toggling}
              sx={{ fontWeight: 700 }}
            >
              {user.status === "active" ? "Deactivate User" : "Activate User"}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Credentials Dialog */}
      <CredentialsDialog
        open={credentialsModal.open}
        onClose={() => setCredentialsModal({ open: false, data: null })}
        credentials={credentialsModal.data}
        title="User Login Credentials"
      />

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3500}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AdminPageShell>
  );
}
