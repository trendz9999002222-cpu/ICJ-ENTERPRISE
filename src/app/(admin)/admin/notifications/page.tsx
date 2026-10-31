"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import LaunchIcon from "@mui/icons-material/Launch";
import CampaignIcon from "@mui/icons-material/Campaign";
import Link from "next/link";
import { env } from "@/config/env";

export interface NotificationItem {
  id: string;
  scope: "user" | "admin" | "global";
  notification_type: "info" | "success" | "warning" | "error" | "application" | "assistance" | "membership";
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  created_at_formatted?: string;
  recipient_email?: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Broadcast modal state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    scope: "global",
    notification_type: "info",
    link: "",
  });
  const [broadcastSending, setBroadcastSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie("icj_access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${env.apiUrl}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = json?.data?.notifications ?? json?.notifications ?? [];
        setNotifications(list);
        const unread = json?.data?.unread_count ?? json?.unread_count ?? 0;
        setUnreadCount(Number(unread) || 0);
      } else {
        setError("Failed to load notifications. Please check your credentials.");
      }
    } catch {
      setError("Network error while connecting to notifications service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      const token = getCookie("icj_access_token");
      if (!token) return;

      await fetch(`${env.apiUrl}/notifications/${id}/read/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      const token = getCookie("icj_access_token");
      if (!token) return;

      await fetch(`${env.apiUrl}/notifications/mark-all-read/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      const token = getCookie("icj_access_token");
      if (!token) return;

      await fetch(`${env.apiUrl}/notifications/${id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
      alert("Title and message are required.");
      return;
    }
    setBroadcastSending(true);
    try {
      const token = getCookie("icj_access_token");
      const res = await fetch(`${env.apiUrl}/notifications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(broadcastData),
      });

      if (res.ok) {
        setBroadcastOpen(false);
        setBroadcastData({
          title: "",
          message: "",
          scope: "global",
          notification_type: "info",
          link: "",
        });
        fetchNotifications();
      } else {
        alert("Failed to dispatch broadcast.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setBroadcastSending(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "assistance":
        return <GavelIcon sx={{ fontSize: 20, color: "#2563eb" }} />;
      case "application":
        return <HowToRegIcon sx={{ fontSize: 20, color: "#7c3aed" }} />;
      case "membership":
        return <CardMembershipIcon sx={{ fontSize: 20, color: "#059669" }} />;
      case "success":
        return <CheckCircleIcon sx={{ fontSize: 20, color: "#16a34a" }} />;
      case "warning":
        return <WarningAmberIcon sx={{ fontSize: 20, color: "#d97706" }} />;
      case "error":
        return <ErrorOutlineIcon sx={{ fontSize: 20, color: "#dc2626" }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20, color: "#0f2942" }} />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "admin") return n.scope === "admin";
    if (activeTab === "global") return n.scope === "global";
    if (activeTab === "user") return n.scope === "user";
    return true;
  });

  const adminScopeCount = notifications.filter((n) => n.scope === "admin").length;
  const globalScopeCount = notifications.filter((n) => n.scope === "global").length;

  return (
    <AdminPageShell
      title="Enterprise Notification Center"
      subtitle="Real-time multi-scope notifications across citizen applications, professional empanelment, and system broadcasts"
    >
      {/* ── KPI METRICS STRIP ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Total Notifications
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f2942", mt: 0.5 }}>
                {notifications.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: unreadCount > 0 ? "#fef2f2" : "#ffffff" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: unreadCount > 0 ? "#b91c1c" : "#64748b", textTransform: "uppercase" }}>
                Unread Actions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: unreadCount > 0 ? "#dc2626" : "#0f2942", mt: 0.5 }}>
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Admin Inward Alerts
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#b45309", mt: 0.5 }}>
                {adminScopeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Global Broadcasts
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#15803d", mt: 0.5 }}>
                {globalScopeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── TOOLBAR & ACTIONS ── */}
      <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "none",
                py: 0.5,
              },
            }}
          >
            <Tab label={`All (${notifications.length})`} value="all" />
            <Tab label={`Unread (${unreadCount})`} value="unread" />
            <Tab label={`Admin Alerts (${adminScopeCount})`} value="admin" />
            <Tab label={`Global (${globalScopeCount})`} value="global" />
            <Tab label="Direct User" value="user" />
          </Tabs>

          <Stack direction="row" spacing={1.5}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8rem" }}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchNotifications}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8rem" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CampaignIcon />}
              onClick={() => setBroadcastOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                bgcolor: "#0f2942",
                "&:hover": { bgcolor: "#1a3b5c" },
              }}
            >
              Create Broadcast
            </Button>
          </Stack>
        </Box>

        <Divider />

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ── NOTIFICATIONS TABLE ── */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>
                  Scope
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>
                  Title &amp; Message
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>
                  Recipient
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>
                  Timestamp
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress size={30} sx={{ color: "#0f2942" }} />
                  </TableCell>
                </TableRow>
              ) : filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                    <NotificationsActiveIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: "#334155" }}>
                      No notifications found for this view
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      New user actions, empanelment filings, and assistance requests will trigger real-time records here.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notif) => (
                  <TableRow
                    key={notif.id}
                    hover
                    sx={{
                      bgcolor: notif.is_read ? "#ffffff" : "#f0f9ff",
                      "&:hover": { bgcolor: notif.is_read ? "#f8fafc" : "#e0f2fe !important" },
                    }}
                  >
                    <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {renderIcon(notif.notification_type)}
                        {!notif.is_read && (
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563eb" }} />
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                      <Chip
                        label={notif.scope.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.68rem",
                          height: 22,
                          bgcolor:
                            notif.scope === "admin"
                              ? "#fef3c7"
                              : notif.scope === "global"
                              ? "#e0e7ff"
                              : "#f1f5f9",
                          color:
                            notif.scope === "admin"
                              ? "#92400e"
                              : notif.scope === "global"
                              ? "#3730a3"
                              : "#334155",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ verticalAlign: "top", pt: 2, maxWidth: 360 }}>
                      <Typography sx={{ fontWeight: notif.is_read ? 700 : 900, color: "#0f2942", fontSize: "0.88rem" }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.8rem", mt: 0.5, lineHeight: 1.4 }}>
                        {notif.message}
                      </Typography>
                      {notif.link && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            component={Link}
                            href={notif.link}
                            endIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                            sx={{ textTransform: "none", fontSize: "0.72rem", fontWeight: 700, p: 0 }}
                          >
                            Open Associated Record
                          </Button>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                      <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>
                        {notif.recipient_email || (notif.scope === "global" ? "All Platform Users" : "Administrators")}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                      <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {notif.created_at_formatted || new Date(notif.created_at).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ verticalAlign: "top", pt: 2, textAlign: "right" }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        {!notif.is_read && (
                          <Tooltip title="Mark Read">
                            <IconButton size="small" onClick={() => handleMarkAsRead(notif.id)} sx={{ color: "#2563eb" }}>
                              <CheckCircleIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Dismiss">
                          <IconButton size="small" onClick={() => handleDelete(notif.id)} sx={{ color: "#64748b", "&:hover": { color: "#dc2626" } }}>
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── CREATE BROADCAST DIALOG ── */}
      <Dialog open={broadcastOpen} onClose={() => setBroadcastOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#0f2942", color: "#ffffff", fontWeight: 800 }}>
          Broadcast Enterprise Notification
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Notification Title"
              fullWidth
              size="small"
              value={broadcastData.title}
              onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
              placeholder="e.g. Scheduled Maintenance / New Registry Notice"
              required
            />

            <TextField
              label="Notification Message"
              fullWidth
              multiline
              rows={3}
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              placeholder="Detailed notification announcement for users or staff..."
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="scope-select-label">Target Audience Scope</InputLabel>
                  <Select
                    labelId="scope-select-label"
                    value={broadcastData.scope}
                    label="Target Audience Scope"
                    onChange={(e) => setBroadcastData({ ...broadcastData, scope: e.target.value })}
                  >
                    <MenuItem value="global">Global Broadcast (All Users)</MenuItem>
                    <MenuItem value="admin">Administrator Staff Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-select-label">Alert Severity Type</InputLabel>
                  <Select
                    labelId="type-select-label"
                    value={broadcastData.notification_type}
                    label="Alert Severity Type"
                    onChange={(e) => setBroadcastData({ ...broadcastData, notification_type: e.target.value })}
                  >
                    <MenuItem value="info">Informational</MenuItem>
                    <MenuItem value="success">Success / Milestone</MenuItem>
                    <MenuItem value="warning">Important Warning</MenuItem>
                    <MenuItem value="error">Critical Alert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Associated Action Link (Optional)"
              fullWidth
              size="small"
              value={broadcastData.link}
              onChange={(e) => setBroadcastData({ ...broadcastData, link: e.target.value })}
              placeholder="e.g. /dashboard/member or /admin/assistance"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setBroadcastOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendBroadcast}
            disabled={broadcastSending}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0f2942" }}
          >
            {broadcastSending ? "Dispatching..." : "Publish Broadcast"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
