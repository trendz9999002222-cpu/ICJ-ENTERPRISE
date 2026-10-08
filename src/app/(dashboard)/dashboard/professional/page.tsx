"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { professionalCasesService } from "@/services/professional/professionalCases.service";

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
  const [casesTab, setCasesTab] = useState(0);
  const [availableCases, setAvailableCases] = useState<any[]>([]);
  const [myCases, setMyCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

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

    // Load cases
    setCasesLoading(true);
    Promise.all([
      professionalCasesService.getAvailableCases({ page_size: 50 }),
      professionalCasesService.getMyCases({ page_size: 50 }),
    ])
      .then(([avail, mine]) => {
        setAvailableCases(avail.results || []);
        setMyCases(mine.results || []);
      })
      .catch(() => {})
      .finally(() => setCasesLoading(false));
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
            {PROFESSIONAL_ONBOARDING_STEPS.map((label, i) => (
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
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              bgcolor: approved ? "#f0fdf4" : status === "rejected" ? "#fef2f2" : "#fffbeb",
              border: approved ? "1px solid #bbf7d0" : status === "rejected" ? "1px solid #fecaca" : "1px solid #fde68a",
            }}
          >
            {approved ? (
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20, mt: 0.2 }} />
            ) : (
              <HourglassTopIcon sx={{ color: "#d97706", fontSize: 20, mt: 0.2 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: approved ? "#166534" : status === "rejected" ? "#991b1b" : "#92400e",
              }}
            >
              {approved
                ? "Your professional application has been approved. You have full access to your workspace and directory listing."
                : status === "rejected"
                  ? "Your application was not approved. Contact support or update your profile if you were asked to resubmit."
                  : `Your application is ${statusLabel.toLowerCase()}${primary?.reference_id ? ` (Ref: ${primary.reference_id})` : ""}. You can use this dashboard, edit your profile, and change your password until admin approval unlocks all services.`}
            </Typography>
          </Box>
        </Card>

        {Object.keys(sharedCommonFields).length > 0 && (
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", bgcolor: "#ffffff", p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Shared personal information
            </Typography>
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
          </Card>
        )}

        {professions.length > 0 && (
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", bgcolor: "#ffffff", p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Registered professions ({professions.length})
            </Typography>
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
          </Card>
        )}

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
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* ── Legal Cases ───────────────────────────────────────────── */}
      {approved && (
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", bgcolor: "#fff" }}>
          <CardContent sx={{ p: 0 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 3, pt: 2.5, pb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
                <GavelIcon sx={{ color: "#2563eb", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>Legal Cases</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>Cases from ICJ assigned to your professional group</Typography>
              </Box>
            </Stack>
            <Divider />
            <Box sx={{ px: 3, pt: 1 }}>
              <Tabs value={casesTab} onChange={(_, v) => setCasesTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Available (${availableCases.length})`} id="tab-available" />
                <Tab label={`My Cases (${myCases.length})`} id="tab-my" />
              </Tabs>

              {casesTab === 0 && (
                casesLoading ? (
                  <Typography color="text.secondary" sx={{ py: 2 }}>Loading available cases...</Typography>
                ) : availableCases.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <FolderOpenIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No new cases available for your group right now.</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Case ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Urgency</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Budget</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableCases.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell>
                              <Link href={`/dashboard/professional/cases/${c.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                                <strong style={{ color: "#2563eb", cursor: "pointer" }}>{c.case_id}</strong>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{c.assistance_request_details?.full_name}</Box>
                              <Box sx={{ fontSize: "0.72rem", color: "#64748b" }}>{c.assistance_request_details?.category}</Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.82rem" }}>{c.assistance_request_details?.category || "—"}</TableCell>
                            <TableCell sx={{ fontSize: "0.82rem" }}>{c.assistance_request_details?.urgency || "—"}</TableCell>
                            <TableCell sx={{ fontSize: "0.82rem" }}>₹{c.budget}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<AssignmentTurnedInIcon />}
                                onClick={async () => {
                                  try {
                                    await professionalCasesService.takeCase(c.id);
                                    setAvailableCases((prev) => prev.filter((x) => x.id !== c.id));
                                    const mine = await professionalCasesService.getMyCases({ page_size: 50 });
                                    setMyCases(mine.results || []);
                                    setCasesTab(1);
                                  } catch (e: any) {
                                    alert("Could not take case. It may have already been taken.");
                                  }
                                }}
                                sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.78rem", bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
                              >
                                Accept Case
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}

              {casesTab === 1 && (
                casesLoading ? (
                  <Typography color="text.secondary" sx={{ py: 2 }}>Loading...</Typography>
                ) : myCases.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">You haven't taken any cases yet.</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Case ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Problem</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Budget</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myCases.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell>
                              <Link href={`/dashboard/professional/cases/${c.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                                <strong style={{ color: "#2563eb", cursor: "pointer" }}>{c.case_id}</strong>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{c.assistance_request_details?.full_name}</Box>
                              <Box sx={{ fontSize: "0.72rem", color: "#64748b" }}>{c.assistance_request_details?.mobile}</Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.82rem", maxWidth: 200 }}>
                              <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.assistance_request_details?.problem_description?.substring(0, 60)}...
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.82rem" }}>₹{c.budget}</TableCell>
                            <TableCell>
                              <Chip
                                label={c.status.replace("_", " ").toUpperCase()}
                                size="small"
                                color={c.status === "assigned" ? "primary" : c.status === "in_progress" ? "warning" : c.status === "closed" ? "success" : "default"}
                                sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </Box>
            <Box sx={{ height: 16 }} />
          </CardContent>
        </Card>
      )}
    </PortalPageShell>
  );
}
