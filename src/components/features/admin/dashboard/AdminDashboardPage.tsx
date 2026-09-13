"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

import { clearTrackedActivities } from "@/lib/adminActivity";
import { adminDashboardService } from "@/services/admin/adminDashboard.service";
import type { DashboardStats, RecentActivity } from "@/types/admin";
import StatCard from "./StatCard";

// ---------------------------------------------------------------------------
// Activity type → chip colour
// ---------------------------------------------------------------------------
function activityChipColor(
  type: string
): "success" | "error" | "warning" | "info" | "default" {
  if (type === "kyc_approved" || type === "case_closed" || type === "approved") return "success";
  if (type === "kyc_rejected" || type === "rejected") return "error";
  if (type === "advocate_view") return "info";
  if (type === "user_view") return "warning";
  if (type === "case_view") return "primary" as any;
  return "default";
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, a] = await Promise.all([
        adminDashboardService.getStats(),
        adminDashboardService.getRecentActivity(10),
      ]);
      setStats(s);
      setActivity(a);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClearActivity = () => {
    clearTrackedActivities();
    setActivity([]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", pb: 4 }}>
      {/* Page title row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
            Live platform metrics and recent admin navigation activity
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={load}
            disabled={loading}
            sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Error banner */}
      {error && (
        <Paper
          variant="outlined"
          sx={{ p: 2, borderColor: "#fca5a5", bgcolor: "#fef2f2", borderRadius: 2 }}
        >
          <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
      )}

      {/* KPI Stat Cards (Real Live DB Values) */}
      {loading && !stats ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Grid container spacing={2}>
          {Object.values(stats).map((stat) => (
            <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StatCard stat={stat} />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Full Width Recent Activity Feed */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                borderBottom: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Recent Activity & Navigation History (Last 10)
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Real-time log of recently accessed pages and application views
                </Typography>
              </Box>

              {activity.length > 0 && (
                <Tooltip title="Clear activity history">
                  <Button
                    size="small"
                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                    onClick={handleClearActivity}
                    sx={{ color: "#94a3b8", textTransform: "none", fontSize: "0.75rem", "&:hover": { color: "#dc2626" } }}
                  >
                    Clear History
                  </Button>
                </Tooltip>
              )}
            </Box>

            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
              {loading ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : activity.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No recent activity logged yet. Navigate to any section (e.g. Advocates, Users, Cases) to see activity appear here.
                  </Typography>
                </Box>
              ) : (
                activity.map((item, idx) => {
                  const targetUrl = (item.metadata?.url as string) || "";
                  return (
                    <Box
                      component="li"
                      key={item.id}
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        borderBottom:
                          idx < activity.length - 1 ? "1px solid #f1f5f9" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        "&:hover": { bgcolor: "#f8fafc" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
                        <Chip
                          label={item.type.replace(/_/g, " ")}
                          size="small"
                          color={activityChipColor(item.type)}
                          sx={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            flexShrink: 0,
                            height: 24,
                            px: 0.5,
                          }}
                        />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}
                            noWrap
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", display: "block" }}
                            noWrap
                          >
                            {item.description} &middot; {item.actor_name}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexShrink: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8", whiteSpace: "nowrap", fontSize: "0.75rem" }}
                        >
                          {formatRelativeTime(item.timestamp)}
                        </Typography>

                        {targetUrl && targetUrl !== "/admin/dashboard" && (
                          <Button
                            component={Link}
                            href={targetUrl}
                            variant="outlined"
                            size="small"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                            sx={{
                              fontSize: "0.725rem",
                              py: 0.25,
                              px: 1,
                              borderColor: "#e2e8f0",
                              color: "#2563eb",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 1.5,
                            }}
                          >
                            Open
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
