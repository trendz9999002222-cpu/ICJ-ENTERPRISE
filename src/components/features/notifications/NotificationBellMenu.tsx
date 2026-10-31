"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";
import { env } from "@/config/env";

export interface PlatformNotification {
  id: string;
  scope: "user" | "admin" | "global";
  notification_type: "info" | "success" | "warning" | "error" | "application" | "assistance" | "membership";
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  created_at_formatted?: string;
}

interface NotificationBellMenuProps {
  isAdmin?: boolean;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function NotificationBellMenu({ isAdmin = false }: NotificationBellMenuProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const open = Boolean(anchorEl);

  // Fetch unread count badge
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getCookie("icj_access_token");
      if (!token) return;

      const res = await fetch(`${env.apiUrl}/notifications/unread-count/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const count = json?.data?.unread_count ?? json?.unread_count ?? 0;
        setUnreadCount(Number(count) || 0);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  // Fetch list of notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = getCookie("icj_access_token");
      if (!token) return;

      const res = await fetch(`${env.apiUrl}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = json?.data?.notifications ?? json?.notifications ?? [];
        setNotifications(list);
        const count = json?.data?.unread_count ?? json?.unread_count ?? 0;
        setUnreadCount(Number(count) || 0);
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll count on interval (every 30 seconds)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic update
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
      fetchUnreadCount();
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
      fetchUnreadCount();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      fetchUnreadCount();
    }
  };

  const handleNotificationClick = (notif: PlatformNotification) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    handleCloseMenu();
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "assistance":
        return (
          <Box sx={{ bgcolor: "#eff6ff", p: 1, borderRadius: "50%", color: "#1d4ed8", display: "flex" }}>
            <GavelIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      case "application":
        return (
          <Box sx={{ bgcolor: "#f5f3ff", p: 1, borderRadius: "50%", color: "#6d28d9", display: "flex" }}>
            <HowToRegIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      case "membership":
        return (
          <Box sx={{ bgcolor: "#ecfdf5", p: 1, borderRadius: "50%", color: "#059669", display: "flex" }}>
            <CardMembershipIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      case "success":
        return (
          <Box sx={{ bgcolor: "#f0fdf4", p: 1, borderRadius: "50%", color: "#16a34a", display: "flex" }}>
            <CheckCircleIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      case "warning":
        return (
          <Box sx={{ bgcolor: "#fffbeb", p: 1, borderRadius: "50%", color: "#d97706", display: "flex" }}>
            <WarningAmberIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      case "error":
        return (
          <Box sx={{ bgcolor: "#fef2f2", p: 1, borderRadius: "50%", color: "#dc2626", display: "flex" }}>
            <ErrorOutlineIcon sx={{ fontSize: 18 }} />
          </Box>
        );
      default:
        return (
          <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: "50%", color: "#0f2942", display: "flex" }}>
            <InfoIcon sx={{ fontSize: 18 }} />
          </Box>
        );
    }
  };

  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="small"
          onClick={handleOpenMenu}
          sx={{
            color: unreadCount > 0 ? "#0f2942" : "#64748b",
            bgcolor: open ? "rgba(15, 41, 66, 0.08)" : "transparent",
            "&:hover": { bgcolor: "rgba(15, 41, 66, 0.08)" },
          }}
          aria-label="platform notifications"
        >
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="error"
            invisible={unreadCount === 0}
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 800,
                fontSize: "0.68rem",
                height: 18,
                minWidth: 18,
                bgcolor: "#dc2626",
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsActiveIcon fontSize="small" sx={{ color: "#0f2942" }} />
            ) : (
              <NotificationsOutlinedIcon fontSize="small" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 330, sm: 400 },
              maxHeight: 520,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 12px 36px rgba(15, 41, 66, 0.2)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#0f2942",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.02em" }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                sx={{
                  bgcolor: "#f59e0b",
                  color: "#0f2942",
                  fontWeight: 900,
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            )}
          </Stack>

          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
              sx={{
                color: "#93c5fd",
                textTransform: "none",
                fontSize: "0.72rem",
                fontWeight: 700,
                p: 0.5,
                "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 38,
              "& .MuiTab-root": {
                minHeight: 38,
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "none",
                py: 0.5,
              },
            }}
          >
            <Tab label={`All (${notifications.length})`} value="all" />
            <Tab label={`Unread (${unreadCount})`} value="unread" />
          </Tabs>
        </Box>

        {/* Notification List Body */}
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
              <CircularProgress size={24} sx={{ color: "#0f2942" }} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.9rem" }}>
                {activeTab === "unread" ? "No unread alerts" : "No notifications yet"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                {activeTab === "unread"
                  ? "You have acknowledged all active notifications."
                  : "Platform updates and case notifications will appear here."}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: notif.is_read ? "#ffffff" : "#f0f9ff",
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: notif.is_read ? "#f8fafc" : "#e0f2fe" },
                      py: 1.5,
                      px: 2,
                      alignItems: "flex-start",
                      position: "relative",
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 42, mt: 0.5 }}>
                      {renderNotificationIcon(notif.notification_type)}
                    </ListItemAvatar>

                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "0.84rem",
                              fontWeight: notif.is_read ? 700 : 900,
                              color: notif.is_read ? "#1e293b" : "#0f2942",
                              lineHeight: 1.25,
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                            {formatRelativeTime(notif.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.78rem",
                              color: "#475569",
                              lineHeight: 1.35,
                              mb: 0.75,
                            }}
                          >
                            {notif.message}
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            {notif.scope === "admin" && (
                              <Chip
                                label="ADMIN ALERT"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.6rem",
                                  fontWeight: 800,
                                  bgcolor: "#fef3c7",
                                  color: "#92400e",
                                }}
                              />
                            )}
                            {notif.scope === "global" && (
                              <Chip
                                label="GLOBAL"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.6rem",
                                  fontWeight: 800,
                                  bgcolor: "#e2e8f0",
                                  color: "#334155",
                                }}
                              />
                            )}

                            {!notif.is_read && (
                              <Box
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  bgcolor: "#2563eb",
                                  ml: "auto !important",
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      }
                    />

                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(notif.id, e)}
                      sx={{
                        opacity: 0.4,
                        "&:hover": { opacity: 1, color: "#dc2626" },
                        p: 0.4,
                        ml: 0.5,
                      }}
                      title="Dismiss"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 1.2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
            textAlign: "center",
          }}
        >
          <Button
            size="small"
            fullWidth
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              handleCloseMenu();
              router.push(isAdmin ? "/admin/notifications" : "/dashboard/member");
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 800,
              color: "#0f2942",
              py: 0.5,
            }}
          >
            {isAdmin ? "View All in Admin Notification Center" : "View Notification Activity"}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
