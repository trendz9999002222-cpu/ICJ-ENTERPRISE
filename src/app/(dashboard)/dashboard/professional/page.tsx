"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
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

const STEPS = ["Application Submitted", "Documents Verified", "Admin Review", "Approved & Active"];

export default function ProfessionalDashboardPage() {
  const [name, setName] = useState("Professional");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [activeStep] = useState(3);

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) return;
    const p = decodeJwt(token);
    if (p?.first_name) {
      const full = `${p.first_name} ${(p.last_name as string) || ""}`.trim();
      setName(full || (p.first_name as string));
    }
    if (p?.email) setEmail(p.email as string);
    if (Array.isArray(p?.roles)) setRoles(p.roles as string[]);
  }, []);

  const proStats = [
    { label: "Account Status", value: "Approved & Active", icon: <CheckCircleIcon />, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Professional Profile", value: "Verified Listing", icon: <WorkspacePremiumIcon />, color: "#d97706", bg: "#fffbeb" },
    { label: "Credentials & Docs", value: "Verified by Admin", icon: <DescriptionIcon />, color: "#2563eb", bg: "#eff6ff" },
  ];

  const proActions = [
    { label: "View & Edit My Profile", href: "/dashboard/profile", icon: <PersonIcon fontSize="small" /> },
    { label: "Change Account Password", href: "/login/change-password", icon: <LockOutlinedIcon fontSize="small" /> },
    { label: "Search & Browse Directory", href: "/directory", icon: <SearchIcon fontSize="small" /> },
  ];


  return (
    <PortalPageShell
      title="Professional Practice Workspace"
      subtitle="Manage your practice areas, approved applications, professional credentials, and client engagements."
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
                {name[0]?.toUpperCase() ?? "P"}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Welcome back, {name}
                  </Typography>
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: "14px !important" }} />}
                    label="Approved Professional"
                    size="small"
                    color="warning"
                    sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                  {email} • Registered Professional Member
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
              Public Directory
            </Button>
          </Stack>
        </Card>

        {/* Application Status Stepper */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            bgcolor: "#ffffff",
            p: 3,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}>
            Professional Onboarding & Verification Status
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < activeStep}>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: i <= activeStep ? "#2563eb" : "#e2e8f0",
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                      }}
                    >
                      {i < activeStep ? (
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      ) : i === activeStep ? (
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                      )}
                    </Box>
                  }
                >
                  <Typography variant="caption" sx={{ fontWeight: i <= activeStep ? 700 : 500, color: "#0f172a" }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "#166534", fontWeight: 700 }}>
              Your professional application has been approved by the Admin. You have full access to your workspace and directory listing.
            </Typography>
          </Box>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={2.5}>
          {proStats.map((s) => (
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

        {/* Quick Actions & Workspace Info */}
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
                {proActions.map((a) => (
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
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Account & Role Overview
              </Typography>
              <Stack spacing={2}>
                {[
                  { label: "Account Holder", value: name },
                  { label: "Registered Email", value: email || "—" },
                  { label: "Primary Role", value: "Registered Professional" },
                  { label: "Platform Privileges", value: "Directory & Practice Area Access" },
                ].map((row) => (
                  <Stack
                    key={row.label}
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", pb: 1 }}
                  >
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
                      {row.value}
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
