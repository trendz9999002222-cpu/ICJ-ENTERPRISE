"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupsIcon from "@mui/icons-material/Groups";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import type { UserProfessionInfo } from "@/types/api";

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

export default function ProfessionalDashboardPage() {
  const [name, setName] = useState("Professional");
  const [email, setEmail] = useState("");
  const [professions, setProfessions] = useState<UserProfessionInfo[]>([]);

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) return;
    const p = decodeJwt(token);
    if (p?.first_name) {
      const full = `${p.first_name} ${(p.last_name as string) || ""}`.trim();
      setName(full || (p.first_name as string));
    }
    if (p?.email) setEmail(p.email as string);

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (Array.isArray(data?.professions)) {
          setProfessions(data.professions as UserProfessionInfo[]);
        }
      })
      .catch(() => {});
  }, []);

  const primary = getPrimaryProfession(professions);
  const status = primary?.status ?? "pending";
  const approved = isProfessionalApproved(professions);
  const activeStep = statusToActiveStep(status);
  const statusLabel = formatProfessionalStatusLabel(status);

  const sharedCommonFields = useMemo(() => {
    const withCommon = professions.find(
      (p) => p.common_field_values && Object.keys(p.common_field_values).length > 0,
    );
    return withCommon?.common_field_values ?? {};
  }, [professions]);

  const proStats = useMemo(() => {
    if (approved) {
      return [
        { label: "Account Status", value: "Approved & Active", icon: <CheckCircleIcon />, color: "#16a34a", bg: "#f0fdf4" },
        { label: "Professional Profile", value: "Verified Listing", icon: <WorkspacePremiumIcon />, color: "#d97706", bg: "#fffbeb" },
        { label: "Credentials & Docs", value: "Verified by Admin", icon: <DescriptionIcon />, color: "#2563eb", bg: "#eff6ff" },
      ];
    }
    return [
      { label: "Account Status", value: statusLabel, icon: <HourglassTopIcon />, color: "#d97706", bg: "#fffbeb" },
      { label: "Application Ref", value: primary?.reference_id ?? "—", icon: <DescriptionIcon />, color: "#2563eb", bg: "#eff6ff" },
      { label: "Profession", value: primary?.profession_name ?? "—", icon: <WorkspacePremiumIcon />, color: "#64748b", bg: "#f8fafc" },
    ];
  }, [approved, statusLabel, primary]);

  const proActions = useMemo(() => {
    const base = [
      { label: "View & Edit My Profile", href: "/dashboard/profile", icon: <PersonIcon fontSize="small" /> },
      { label: "My Groups & Registrations", href: "/dashboard/professional/groups", icon: <GroupsIcon fontSize="small" /> },
      { label: "Change Account Password", href: "/login/change-password", icon: <LockOutlinedIcon fontSize="small" /> },
    ];
    if (approved) {
      base.push({ label: "Search & Browse Directory", href: "/directory", icon: <SearchIcon fontSize="small" /> });
    }
    return base;
  }, [approved]);

  return (
    <PortalPageShell
      title="Professional Practice Workspace"
      subtitle="Manage your practice areas, approved applications, and professional credentials."
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
                    icon={
                      approved ? (
                        <VerifiedUserIcon sx={{ fontSize: "14px !important" }} />
                      ) : (
                        <HourglassTopIcon sx={{ fontSize: "14px !important" }} />
                      )
                    }
                    label={approved ? "Approved Professional" : statusLabel}
                    size="small"
                    color={approved ? "success" : status === "rejected" ? "error" : "warning"}
                    sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                  {email} • Registered Professional Member
                </Typography>
              </Box>
            </Stack>

            {approved && (
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
            )}
          </Stack>
        </Card>

        {/* Application Status Stepper */}
        <SectionCard
          title="Professional Onboarding & Verification Status"
          subtitle="Your application progress through the verification pipeline"
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

        {/* Shared Common Fields */}
        {Object.keys(sharedCommonFields).length > 0 && (
          <SectionCard title="Shared Personal Information">
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {Object.entries(sharedCommonFields).map(([k, v]) => (
                <Chip
                  key={k}
                  size="small"
                  variant="outlined"
                  label={`${k.replace(/_/g, " ")}: ${String(v)}`}
                  sx={{ maxWidth: 320 }}
                />
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Registered Professions */}
        {professions.length > 0 && (
          <SectionCard
            title={`Registered Professions (${professions.length})`}
            action={
              <Button
                component={Link}
                href="/dashboard/professional/groups"
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.78rem" }}
              >
                Manage Groups
              </Button>
            }
          >
            <Stack spacing={1.5}>
              {professions.map((p) => (
                <Box
                  key={`${p.registration_id}-${p.profession_id || p.profession_name}`}
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{p.profession_name}</Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                        {p.category_name}
                        {p.group_name ? ` • ${p.group_name}` : ""} • Ref {p.reference_id}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={formatProfessionalStatusLabel(p.status)}
                      color={p.status === "approved" ? "success" : p.status === "rejected" ? "error" : "warning"}
                      sx={{ fontWeight: 700, alignSelf: { xs: "flex-start", sm: "center" } }}
                    />
                  </Stack>
                  {p.profession_field_values && Object.keys(p.profession_field_values).length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                      {Object.entries(p.profession_field_values)
                        .slice(0, 6)
                        .map(([k, v]) => (
                          <Chip
                            key={k}
                            size="small"
                            variant="outlined"
                            label={`${k.replace(/_/g, " ")}: ${String(v)}`}
                            sx={{ fontSize: "0.68rem", maxWidth: 280 }}
                          />
                        ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Stats Grid */}
        <Grid container spacing={2.5}>
          {proStats.map((s) => (
            <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
              <StatCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                color={s.color}
                bgColor={s.bg}
              />
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions & Account Overview */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Quick Actions">
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
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Account & Role Overview">
              <Stack spacing={2}>
                {[
                  { label: "Account Holder", value: name },
                  { label: "Registered Email", value: email || "—" },
                  { label: "Primary Role", value: "Registered Professional" },
                  {
                    label: "Platform Privileges",
                    value: approved ? "Directory & Practice Area Access" : "Profile & password only (pending approval)",
                  },
                  { label: "Verification Status", value: statusLabel },
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
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    </PortalPageShell>
  );
}
