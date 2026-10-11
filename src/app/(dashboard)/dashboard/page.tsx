"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsIcon from "@mui/icons-material/Groups";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import SupportIcon from "@mui/icons-material/Support";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/ui/SectionCard";
import StatusProgressBar from "@/components/ui/StatusProgressBar";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { env } from "@/config/env";
import {
  PROFESSIONAL_ONBOARDING_STEPS,
  formatProfessionalStatusLabel,
  getPrimaryProfession,
  isProfessionalApproved,
  statusToActiveStep,
} from "@/lib/professionalDashboard";
import { normalizePlatformRole, userHasProfessionalAccess } from "@/lib/roles";
import type { UserRole, UserProfessionInfo } from "@/types/api";

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

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [primaryRole, setPrimaryRole] = useState<UserRole>("professional");
  const [roles, setRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [professions, setProfessions] = useState<UserProfessionInfo[]>([]);

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const payload = decodeJwt(token);
    if (!payload) return;

    if (payload.role === "admin" || payload.role === "super_admin") {
      router.replace("/admin/dashboard");
      return;
    }

    const r = normalizePlatformRole(String(payload.role)) ?? "professional";
    setPrimaryRole(r);

    if (Array.isArray(payload.roles)) {
      setRoles(payload.roles as string[]);
    } else if (payload.role) {
      setRoles([payload.role as string]);
    }

    if (payload.email) setEmail(payload.email as string);
    if (payload.first_name) {
      const full = `${payload.first_name} ${(payload.last_name as string) || ""}`.trim();
      setName(full || (payload.first_name as string));
    }
    if (payload.user_id) setUserId(String(payload.user_id));

    // Fetch profile for professions
    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (Array.isArray(data?.professions)) {
          setProfessions(data.professions);
        }
      })
      .catch(() => {});
  }, [router]);

  const hasProfessional = userHasProfessionalAccess(roles, primaryRole);
  const primary = getPrimaryProfession(professions);
  const status = primary?.status ?? "pending";
  const approved = isProfessionalApproved(professions);
  const activeStep = statusToActiveStep(status);
  const statusLabel = formatProfessionalStatusLabel(status);

  const quickActions = [
    {
      title: "My Profile & Edit",
      desc: "View and update your personal details and professional information.",
      href: "/dashboard/profile",
      icon: <PersonIcon color="primary" />,
    },
    {
      title: "My Groups & Registrations",
      desc: "View registered professional groups or register for new ones.",
      href: "/dashboard/professional/groups",
      icon: <GroupsIcon color="secondary" />,
    },
    {
      title: "Available Cases",
      desc: "Browse open cases available for your professional group.",
      href: "/dashboard/professional/cases",
      icon: <GavelIcon color="warning" />,
    },
    {
      title: "My Cases",
      desc: "Track your accepted cases and their progress.",
      href: "/dashboard/professional/my-cases",
      icon: <FolderOpenIcon color="info" />,
    },
    {
      title: "Change Password",
      desc: "Update your account password for security.",
      href: "/dashboard/change-password",
      icon: <LockIcon color="action" />,
    },
    {
      title: "Support Desk",
      desc: "Submit queries or technical support requests to ICJ team.",
      href: "/dashboard/advocate/support",
      icon: <SupportIcon color="error" />,
    },
  ];

  return (
    <PortalPageShell
      title="Dashboard"
      subtitle="Overview of your professional status, registrations, and case activity."
      actions={
        <Button
          component={Link}
          href="/dashboard/profile"
          variant="contained"
          size="small"
          startIcon={<PersonIcon sx={{ fontSize: "16px !important" }} />}
          sx={{
            bgcolor: "#2563eb",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          My Profile
        </Button>
      }
    >
      <Stack spacing={3}>
        {/* Profile Banner */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            p: { xs: 2.5, md: 3 },
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
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
                  bgcolor: "#1d4ed8",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 6px -1px rgba(37,99,235,0.25)",
                }}
              >
                {(name || email)[0]?.toUpperCase() ?? "U"}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.8 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                    {name || email || "Professional"}
                  </Typography>
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: "14px !important" }} />}
                    label="Verified ICJ Account"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                  {email} • ID: {userId ? `ICJ-${userId.padStart(5, "0")}` : "ICJ-MEMBER"}
                </Typography>
                <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: "wrap", gap: 0.6 }}>
                  {hasProfessional && (
                    <Chip
                      icon={<WorkspacePremiumIcon sx={{ fontSize: "14px !important" }} />}
                      label="Registered Professional"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/dashboard/change-password"
                variant="outlined"
                size="small"
                startIcon={<LockIcon />}
                sx={{ fontWeight: 700, borderColor: "#cbd5e1", textTransform: "none" }}
              >
                Change Password
              </Button>
              {approved && (
                <Button
                  component={Link}
                  href="/directory"
                  variant="contained"
                  size="small"
                  startIcon={<SearchIcon />}
                  sx={{ fontWeight: 700, textTransform: "none", bgcolor: "#1d4ed8" }}
                >
                  Browse Directory
                </Button>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Stats Row */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Professional Status"
              value={approved ? "Approved & Active" : statusLabel}
              icon={approved ? <CheckCircleIcon /> : <HourglassTopIcon />}
              color={approved ? "#16a34a" : "#d97706"}
              bgColor={approved ? "#f0fdf4" : "#fffbeb"}
              valueColor={approved ? "#16a34a" : "#d97706"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Registered Groups"
              value={professions.length}
              icon={<GroupsIcon />}
              color="#2563eb"
              bgColor="#eff6ff"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Profession"
              value={primary?.profession_name ?? "—"}
              icon={<WorkspacePremiumIcon />}
              color="#d97706"
              bgColor="#fffbeb"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Documents"
              value="Verified in Vault"
              icon={<DescriptionIcon />}
              color="#475569"
              bgColor="#f1f5f9"
            />
          </Grid>
        </Grid>

        {/* Status Progress */}
        <SectionCard
          title="Application & Verification Status"
          subtitle="Track your professional onboarding progress"
        >
          <StatusProgressBar
            steps={PROFESSIONAL_ONBOARDING_STEPS}
            activeStep={activeStep}
            approved={approved}
            status={status}
            message={
              approved
                ? "Your professional application has been approved. You have full access to your workspace and directory listing."
                : status === "rejected"
                  ? "Your application was not approved. Contact support or update your profile if you were asked to resubmit."
                  : `Your application is ${statusLabel.toLowerCase()}${primary?.reference_id ? ` (Ref: ${primary.reference_id})` : ""}. You can use this dashboard, edit your profile, and change your password until admin approval unlocks all services.`
            }
          />
        </SectionCard>

        {/* Quick Actions Grid */}
        <SectionCard title="Quick Actions" subtitle="Navigate to key areas of your workspace">
          <Grid container spacing={2}>
            {quickActions.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
                <Paper
                  component={Link}
                  href={item.href}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    display: "block",
                    textDecoration: "none",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      bgcolor: "#f8fafc",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: "8px" }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </Stack>
    </PortalPageShell>
  );
}
