"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

const statCards = [
  { label: "Enrolment Status", value: "Verified & Active", icon: <VerifiedUserIcon />, color: "#16a34a", bg: "#f0fdf4" },
  { label: "Profile Completeness", value: "85%", icon: <TrendingUpIcon />, color: "#2563eb", bg: "#eff6ff" },
  { label: "Legal Documents", value: "Verified", icon: <FolderIcon />, color: "#d97706", bg: "#fffbeb" },
];

const quickActions = [
  { label: "View & Edit Advocate Profile", href: "/dashboard/profile", icon: <PersonIcon fontSize="small" /> },
  { label: "Manage Document Repository", href: "/dashboard/advocate/documents", icon: <FolderIcon fontSize="small" /> },
  { label: "Public Directory Listing", href: "/directory", icon: <GavelIcon fontSize="small" /> },
];


export default function AdvocateDashboardPage() {
  const [name, setName] = useState("Advocate");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) return;
    const p = decodeJwt(token);
    if (p?.first_name) {
      const full = `${p.first_name} ${(p.last_name as string) || ""}`.trim();
      setName(full || (p.first_name as string));
    }
    if (p?.email) setEmail(p.email as string);
  }, []);

  return (
    <PortalPageShell
      title="Advocate Practice Desk"
      subtitle="Bar Council enrolment credentials, legal practice management, and client representation workspace."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/dashboard/profile"
            variant="contained"
            size="small"
            startIcon={<PersonIcon />}

            sx={{
              bgcolor: "#2563eb",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              px: 2,
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            My Profile & Roles
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* Banner */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            bgcolor: "#ffffff",
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "#2563eb",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)",
                }}
              >
                {name[0]?.toUpperCase() ?? "A"}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Welcome, Adv. {name}
                  </Typography>
                  <Chip
                    icon={<GavelIcon sx={{ fontSize: "14px !important" }} />}
                    label="Enrolled Advocate"
                    size="small"
                    color="primary"
                    sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                  {email} • Legal Practitioner Desk
                </Typography>
              </Box>
            </Stack>

            <Button
              component={Link}
              href="/directory"
              variant="outlined"
              size="small"
              startIcon={<SearchIcon />}
              sx={{
                fontWeight: 700,
                borderColor: "#cbd5e1",
                color: "#0f172a",
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
              }}
            >
              Search Directory
            </Button>
          </Stack>
        </Card>

        {/* Stats */}
        <Grid container spacing={2.5}>
          {statCards.map((s) => (
            <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  p: 2.5,
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: "10px",
                      bgcolor: s.bg,
                      color: s.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      {s.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                      {s.value}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions & Profile Completeness */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                bgcolor: "#ffffff",
                p: 3,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1.5}>
                {quickActions.map((a) => (
                  <Button
                    key={a.label}
                    component={Link}
                    href={a.href}
                    variant="outlined"
                    startIcon={a.icon}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    fullWidth
                    sx={{
                      justifyContent: "space-between",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      fontWeight: 600,
                      borderRadius: "8px",
                      py: 1,
                      px: 2,
                      "&:hover": {
                        borderColor: "#2563eb",
                        color: "#2563eb",
                        bgcolor: "#eff6ff",
                      },
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                bgcolor: "#ffffff",
                p: 3,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                Profile Completeness
              </Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" } }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  85%
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { step: "Basic Information & Bar Council Details", done: true },
                  { step: "Verification by State Bar Authority", done: true },
                  { step: "Practice Areas & Specializations", done: true },
                  { step: "Upload Additional Certificates", done: false },
                ].map((s) => (
                  <Stack key={s.step} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: s.done ? "#16a34a" : "#cbd5e1" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: s.done ? "#0f172a" : "#64748b",
                        fontWeight: s.done ? 600 : 400,
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.step}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PortalPageShell>
  );
}
