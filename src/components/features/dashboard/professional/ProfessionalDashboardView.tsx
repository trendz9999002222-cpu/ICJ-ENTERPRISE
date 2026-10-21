"use client";

import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import StatusProgressBar from "@/components/ui/StatusProgressBar";
import { env } from "@/config/env";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  PROFESSIONAL_ONBOARDING_STEPS,
  formatProfessionalStatusLabel,
  getPrimaryProfession,
  isProfessionalApproved,
  statusToActiveStep,
} from "@/lib/professionalDashboard";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { UserProfessionInfo } from "@/types/api";

import ProfessionalAccountOverview from "./ProfessionalAccountOverview";
import ProfessionalCategoriesSection from "./ProfessionalCategoriesSection";
import ProfessionalCommercialHub from "./ProfessionalCommercialHub";
import ProfessionalQuickActions from "./ProfessionalQuickActions";
import ProfessionalStatsGrid from "./ProfessionalStatsGrid";

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

export default function ProfessionalDashboardView() {
  const [name, setName] = useState("Professional");
  const [email, setEmail] = useState("");
  const [professions, setProfessions] = useState<UserProfessionInfo[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [leadCredits, setLeadCredits] = useState<number>(0);

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
        if (data?.first_name || data?.last_name) {
          const full = `${data.first_name || ""} ${data.last_name || ""}`.trim();
          if (full) setName(full);
        }
        if (data?.profile_picture_url) {
          setProfilePictureUrl(data.profile_picture_url);
        }
        if (Array.isArray(data?.professions)) {
          setProfessions(data.professions as UserProfessionInfo[]);
        }
      })
      .catch(() => {});

    // Attempt to load wallet stats
    leadMarketplaceService
      .getWallet()
      .then((res) => {
        if (res && typeof res.available_inr === "number") {
          setWalletBalance(res.available_inr);
          setLeadCredits(res.available_lead_credits ?? 0);
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

  return (
    <PortalPageShell
      title="Professional Practice Workspace"
      subtitle="Manage your practice areas, approved applications, lead marketplace, and digital wallet."
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
        {/* Welcome Banner */}
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
                src={resolveMediaUrl(profilePictureUrl) || undefined}
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

        {/* Verification Pipeline Stepper */}
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
                ? "Your professional application has been approved. You have full access to your workspace, directory listing, and lead marketplace."
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

        {/* Registered Professions & Categories */}
        <ProfessionalCategoriesSection professions={professions} />

        {/* Key Stats Grid */}
        <ProfessionalStatsGrid
          approved={approved}
          statusLabel={statusLabel}
          primary={primary}
          professionsCount={professions.length}
          walletBalanceInr={walletBalance}
          leadCredits={leadCredits}
        />

        {/* Commercial & Easebuzz Monetization Suite (when approved) */}
        {approved && (
          <ProfessionalCommercialHub
            walletBalanceInr={walletBalance}
            leadCredits={leadCredits}
          />
        )}

        {/* Quick Actions & Account Overview */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ProfessionalQuickActions approved={approved} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ProfessionalAccountOverview
              name={name}
              email={email}
              approved={approved}
              statusLabel={statusLabel}
              professionsCount={professions.length}
            />
          </Grid>
        </Grid>
      </Stack>
    </PortalPageShell>
  );
}
