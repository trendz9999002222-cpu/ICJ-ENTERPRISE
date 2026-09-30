"use client";

import {
  AccountCircle,
  ArrowForward,
  CardMembership,
  CheckCircle,
  Description,
  Download,
  Gavel,
  HourglassTop,
  Layers,
  Lock,
  Person,
  QrCode,
  School,
  Search,
  Security,
  Support,
  VerifiedUser,
  WorkspacePremium,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { normalizePlatformRole, userHasProfessionalAccess } from "@/lib/roles";
import type { UserRole } from "@/types/api";


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
  const [activeTab, setActiveTab] = useState(0);

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
  }, [router]);

  const hasMember = roles.includes("member") || primaryRole === "member";
  const hasProfessional = userHasProfessionalAccess(roles, primaryRole);

  const memberIdDisplay = `ICJ-MEM-${userId.padStart(6, "0") || "001024"}`;

  return (
    <PortalPageShell
      title="Member & Professional Dashboard"
      subtitle="Overview of your verified registrations, practice privileges, documents, and membership perks."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/dashboard/profile"
            variant="contained"
            size="small"
            startIcon={<Person sx={{ fontSize: "16px !important" }} />}
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
      {/* Top Profile Banner */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          p: { xs: 2.5, md: 3 },
          mb: 3,
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
                width: 64,
                height: 64,
                bgcolor: "#1d4ed8",
                fontSize: "1.5rem",
                fontWeight: 800,
                boxShadow: "0 4px 6px -1px rgba(37,99,235,0.25)",
              }}
            >
              {(name || email)[0]?.toUpperCase() ?? "U"}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.8 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  {name || email || "ICJ Member"}
                </Typography>
                <Chip
                  icon={<VerifiedUser sx={{ fontSize: "14px !important" }} />}
                  label="Verified ICJ Account"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                {email} • ID: {userId ? `ICJ-${userId.padStart(5, "0")}` : "ICJ-MEMBER"}
              </Typography>

              {/* Multi-role badges */}
              <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: "wrap", gap: 0.6 }}>
                {hasProfessional && (
                  <Chip
                    icon={<WorkspacePremium sx={{ fontSize: "14px !important" }} />}
                    label="Registered Professional"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                  />
                )}
                {hasMember && (
                  <Chip
                    icon={<CardMembership sx={{ fontSize: "14px !important" }} />}
                    label="Active ICJ Member"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                  />
                )}
                {hasProfessional && (
                  <Chip
                    icon={<Gavel sx={{ fontSize: "14px !important" }} />}
                    label="Professional"
                    color="info"
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
              href="/login/change-password"
              variant="outlined"
              size="small"
              startIcon={<Lock />}
              sx={{ fontWeight: 700, borderColor: "#cbd5e1", textTransform: "none" }}
            >
              Change Password
            </Button>
            <Button
              component={Link}
              href="/directory"
              variant="contained"
              size="small"
              startIcon={<Search />}
              sx={{ fontWeight: 700, textTransform: "none", bgcolor: "#1d4ed8" }}
            >
              Browse Directory
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Tabs / Multi-role switcher */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.92rem",
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<Layers sx={{ fontSize: 18 }} />} iconPosition="start" label="Unified Overview" />
          {hasProfessional && (
            <Tab icon={<WorkspacePremium sx={{ fontSize: 18 }} />} iconPosition="start" label="Professional Practice" />
          )}
          {hasMember && (
            <Tab icon={<CardMembership sx={{ fontSize: 18 }} />} iconPosition="start" label="Digital Membership" />
          )}
          {hasProfessional && (
            <Tab icon={<Gavel sx={{ fontSize: 18 }} />} iconPosition="start" label="Professional Desk" />
          )}
        </Tabs>
      </Box>

      {/* TAB 0: UNIFIED OVERVIEW */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          {/* Quick Metrics */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#eff6ff", color: "#1d4ed8" }}>
                    <WorkspacePremium />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      PROFESSIONAL STATUS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#16a34a" }}>
                      Approved & Active
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#f0fdf4", color: "#16a34a" }}>
                    <CardMembership />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      MEMBERSHIP CARD
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                      {memberIdDisplay}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#fef3c7", color: "#d97706" }}>
                    <Security />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      VERIFICATION LEVEL
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                      Tier-1 Certified
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#f1f5f9", color: "#475569" }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      DOCUMENTS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                      Verified in Vault
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Core Modules Grid */}
          <Grid container spacing={3}>
            {/* Left: Professional Registrations & Practice Hierarchy */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <WorkspacePremium sx={{ color: "#d97706" }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Professional Registrations & Practice Areas
                      </Typography>
                    </Stack>
                    <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Stack>

                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2.5 }}>
                    Your official registrations across ICJ categories, groups, and professions.
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      mb: 2,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                          PRACTICE CATEGORY
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          Dispute Resolution & ADR, Corporate Law & Compliance
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                          PRACTICE GROUP
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          Arbitrators, Company Secretaries & Mediators
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                          REGISTERED PROFESSION
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                          <Chip
                            label="Company Secretary (Practice)"
                            color="secondary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip label="Certified Practitioner" color="primary" size="small" variant="outlined" />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      component={Link}
                      href="/dashboard/professional"
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForward />}
                      sx={{ fontWeight: 700, textTransform: "none" }}
                    >
                      Manage Professional Profile
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right: Digital Membership Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                elevation={0}
                sx={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                  borderRadius: 3,
                  color: "#fff",
                  p: 3,
                  boxShadow: "0 10px 15px -3px rgba(37,99,235,0.25)",
                }}
              >
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: "0.6rem" }}>
                      INTERNATIONAL CONSORTIUM OF JURISTS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Digital Membership Card
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 1.5 }}>
                    <QrCode sx={{ fontSize: 32, color: "#fff" }} />
                  </Box>
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />

                <Stack spacing={1.2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.65 }}>
                      Member Name
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {name || "ICJ Member"}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        Member ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {memberIdDisplay}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        Status
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#86efac" }}>
                        Active & Verified
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Download />}
                  sx={{
                    mt: 3,
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                  onClick={() => alert("Downloading digital membership card...")}
                >
                  Download Member ID Card
                </Button>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Legal Hub & Resources */}
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                Quick Platform Access & Tools
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    title: "Advocate & Professional Directory",
                    desc: "Search and connect with verified practitioners across 50+ specializations.",
                    href: "/directory",
                    icon: <Search color="primary" />,
                  },
                  {
                    title: "Legal Assistance & Case Vault",
                    desc: "Track case assistance requests and legal document repositories.",
                    href: "/assistance",
                    icon: <Gavel color="secondary" />,
                  },
                  {
                    title: "Grievance & Support Desk",
                    desc: "Submit petitions, queries, or technical support requests to ICJ team.",
                    href: "/grievance",
                    icon: <Support color="warning" />,
                  },
                ].map((item) => (
                  <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                    <Paper
                      component={Link}
                      href={item.href}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        display: "block",
                        textDecoration: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#3b82f6",
                          bgcolor: "#f8fafc",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                        <Box sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1.5 }}>{item.icon}</Box>
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
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* TAB 1: PROFESSIONAL PRACTICE */}
      {activeTab === 1 && hasProfessional && (
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Professional Practice Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Registered under Category, Group, and Profession hierarchy.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/professional"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Full Professional Page
            </Button>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>PRACTICE CATEGORY</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5 }}>
                  Dispute Resolution & ADR, Corporate Law
                </Typography>

                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, mt: 2, display: "block" }}>PRACTICE GROUP</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5 }}>
                  Arbitrators, Company Secretaries & Mediators
                </Typography>

                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, mt: 2, display: "block" }}>REGISTERED PROFESSION</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, color: "#1d4ed8" }}>
                  Company Secretary (Practice)
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Status & Credentials</Typography>
                <Stack spacing={1}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Application Status</Typography>
                    <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Account Role</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Professional</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Certificate Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#16a34a" }}>Active</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* TAB 2: DIGITAL MEMBERSHIP */}
      {activeTab === 2 && hasMember && (
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>ICJ Membership Management</Typography>
              <Typography variant="body2" color="text.secondary">
                View your active membership card, certificate, and benefits.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/member"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Full Member Portal
            </Button>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                  borderRadius: 3,
                  color: "#fff",
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.7 }}>INTERNATIONAL CONSORTIUM OF JURISTS</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Official Member Card</Typography>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 800 }}>{name || "ICJ Member"}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>ID: {memberIdDisplay}</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Download />}
                  sx={{ mt: 3, bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700 }}
                >
                  Download PDF Card
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* TAB 3: ADVOCATE DESK */}
      {activeTab === 3 && hasProfessional && (
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Advocate Legal Practice</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage court practice, client consultations, and cases.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/advocate"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Full Advocate Portal
            </Button>
          </Stack>
        </Card>
      )}
    </PortalPageShell>
  );
}

