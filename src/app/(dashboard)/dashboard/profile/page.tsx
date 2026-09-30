"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";

import { MEMBER_CHANGE_PASSWORD_QUERY } from "@/lib/memberDashboard";
import { normalizePlatformRoles } from "@/lib/roles";
import { useEffect, useMemo, useState } from "react";
import ProfilePictureUpload from "@/components/features/dashboard/profile/ProfilePictureUpload";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { env } from "@/config/env";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function formatKeyLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = readCookie("icj_access_token");
      const res = await fetch(`${env.apiUrl}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhoneNumber(data.phone_number || data.mobile || "");
        setProfilePictureUrl(data.profile_picture_url ?? null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = readCookie("icj_access_token");
      const res = await fetch(`${env.apiUrl}/auth/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data || json);
        setFeedback({ open: true, message: "Profile updated successfully!", severity: "success" });
      } else {
        setFeedback({ open: true, message: "Failed to update profile.", severity: "error" });
      }
    } catch (err) {
      setFeedback({ open: true, message: "Network error while saving profile.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"
    : "U";

  const professions: any[] = profile?.professions || [];
  const professionalSubmissions = useMemo(() => {
    const byReg = new Map<
      string,
      {
        registration_id: string;
        reference_id: string;
        status: string;
        common: Record<string, unknown>;
        files: any[];
        professions: any[];
      }
    >();
    for (const p of professions) {
      const id = String(p.registration_id || p.reference_id || "unknown");
      if (!byReg.has(id)) {
        byReg.set(id, {
          registration_id: id,
          reference_id: p.reference_id,
          status: p.status,
          common: {},
          files: [],
          professions: [],
        });
      }
      const row = byReg.get(id)!;
      if (p.common_field_values && Object.keys(p.common_field_values).length > 0) {
        row.common = p.common_field_values;
      }
      if (Array.isArray(p.files) && p.files.length > 0) {
        row.files = p.files;
      }
      row.professions.push(p);
    }
    return [...byReg.values()];
  }, [professions]);
  const membership = profile?.membership;
  const allRoles: string[] = profile?.roles || (profile?.role ? [profile.role] : ["professional"]);
  const changePasswordHref = normalizePlatformRoles(allRoles).includes("member")
    ? MEMBER_CHANGE_PASSWORD_QUERY
    : "/login/change-password";
  const isMember = normalizePlatformRoles(allRoles).includes("member");

  // Gather all uploaded files across submissions
  const allFiles: any[] = [];
  professionalSubmissions.forEach((sub) => {
    sub.files.forEach((f: any) => {
      allFiles.push({ ...f, profession_name: sub.reference_id });
    });
  });

  return (
    <PortalPageShell
      title="My Profile & Registration Details"
      subtitle="Complete view and management of your personal information, verified practice credentials, submitted forms, and active roles."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href={changePasswordHref}
            variant="outlined"
            size="small"
            startIcon={<LockOutlinedIcon />}
            sx={{
              fontWeight: 700,
              borderColor: "#cbd5e1",
              color: "#0f172a",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
            }}
          >
            Change Password
          </Button>
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
      }
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Stack spacing={3.5}>
          {/* SECTION 1: Personal & Contact Information */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              overflow: "hidden",
            }}
          >
            {/* Top Identity Header */}
            <Box sx={{ p: 3, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              {isMember && (
                <Box sx={{ mb: 2.5 }}>
                  <ProfilePictureUpload
                    profilePictureUrl={profilePictureUrl}
                    initials={initials}
                    onUploaded={(url) => {
                      setProfilePictureUrl(url);
                      setProfile((prev: typeof profile) =>
                        prev ? { ...prev, profile_picture_url: url } : prev,
                      );
                      setFeedback({
                        open: true,
                        message: "Profile picture updated.",
                        severity: "success",
                      });
                    }}
                    onError={(message) =>
                      setFeedback({ open: true, message, severity: "error" })
                    }
                  />
                </Box>
              )}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" } }}>
                {!isMember && (
                  <Avatar
                    sx={{
                      width: 68,
                      height: 68,
                      bgcolor: "#2563eb",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      boxShadow: "0 4px 6px -1px rgba(37,99,235,0.25)",
                    }}
                  >
                    {initials}
                  </Avatar>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.8 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      {profile?.first_name || profile?.last_name
                        ? `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
                        : profile?.email}
                    </Typography>
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: "14px !important" }} />}
                      label="Verified Account"
                      size="small"
                      color="success"
                      sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                    {profile?.email} • Account ID: {profile?.id ? `ICJ-${String(profile.id).padStart(5, "0")}` : "ICJ-USER"}
                  </Typography>

                  {/* Badges of all roles */}
                  <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: "wrap", gap: 0.6 }}>
                    {allRoles.map((r) => (
                      <Chip
                        key={r}
                        label={r === "member" ? "Member" : r === "admin" ? "Admin" : "Professional"}
                        size="small"
                        color={r === "member" ? "success" : r === "admin" ? "primary" : "warning"}
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Editable Form */}
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Edit Personal & Contact Details
              </Typography>

              <Box component="form" onSubmit={handleSave}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="First Name"
                      fullWidth
                      size="small"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      slotProps={{
                        input: { sx: { borderRadius: "8px", fontSize: "0.875rem" } },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Last Name"
                      fullWidth
                      size="small"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      slotProps={{
                        input: { sx: { borderRadius: "8px", fontSize: "0.875rem" } },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email Address"
                      fullWidth
                      size="small"
                      value={profile?.email || ""}
                      disabled
                      helperText="Registered login email (read-only)"
                      slotProps={{
                        input: {
                          startAdornment: <EmailIcon sx={{ color: "#94a3b8", fontSize: 18, mr: 1 }} />,
                          sx: { borderRadius: "8px", fontSize: "0.875rem", bgcolor: "#f8fafc" },
                        },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Mobile / Contact Number"
                      fullWidth
                      size="small"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <PhoneIcon sx={{ color: "#94a3b8", fontSize: 18, mr: 1 }} />,
                          sx: { borderRadius: "8px", fontSize: "0.875rem" },
                        },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{
                      bgcolor: "#2563eb",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                  >
                    {saving ? "Saving Changes..." : "Save Profile Changes"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* SECTION 2: All Professional Registrations & Form Details Filled During Onboarding */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              p: 3,
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Registered Practice Areas & Submitted Form Details ({professions.length})
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Full record of categories, groups, specializations, and credentials submitted during onboarding.
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/join"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                + Register Another Profession
              </Button>
            </Stack>

            {professions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <WorkspacePremiumIcon sx={{ fontSize: 44, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No professional registration submissions found.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {professionalSubmissions.map((sub) => (
                  <Box
                    key={sub.registration_id}
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#ffffff",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                        <Chip label={`Ref: ${sub.reference_id}`} size="small" sx={{ fontWeight: 700 }} />
                        <Chip
                          label={(sub.status || "pending").replace("_", " ").toUpperCase()}
                          size="small"
                          color={sub.status === "approved" ? "success" : "warning"}
                          sx={{ fontWeight: 800 }}
                        />
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {sub.professions.length} profession(s) in this application
                        </Typography>
                      </Stack>
                    </Box>

                    {Object.keys(sub.common).length > 0 && (
                      <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9" }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}
                        >
                          General onboarding data (shared)
                        </Typography>
                        <Grid container spacing={1.5}>
                          {Object.entries(sub.common).map(([k, v]) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={k}>
                              <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                                  {formatKeyLabel(k)}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mt: 0.2 }}>
                                  {String(v) || "—"}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    <Stack spacing={2} sx={{ p: 2.5 }}>
                      {sub.professions.map((p) => {
                        const profFields = p.profession_field_values || {};
                        const isAdv =
                          p.is_advocate ||
                          p.profession_name?.toLowerCase().includes("advocate") ||
                          p.profession_name?.toLowerCase().includes("lawyer");
                        return (
                          <Box
                            key={`${sub.registration_id}-${p.profession_id || p.profession_name}`}
                            sx={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}
                          >
                            <Box sx={{ p: 2, bgcolor: isAdv ? "#eff6ff" : "#fffbeb", borderBottom: "1px solid #e2e8f0" }}>
                              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{p.profession_name}</Typography>
                              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                                {p.category_name} • {p.group_name}
                              </Typography>
                            </Box>
                            {Object.keys(profFields).length > 0 && (
                              <Box sx={{ p: 2 }}>
                                <Grid container spacing={1.5}>
                                  {Object.entries(profFields).map(([k, v]) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={k}>
                                      <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                                          {formatKeyLabel(k)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mt: 0.2 }}>
                                          {String(v) || "—"}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>

                    {sub.files.length > 0 && (
                      <Box sx={{ px: 2.5, pb: 2.5, borderTop: "1px solid #f1f5f9", pt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Submitted verification documents
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                          {sub.files.map((file: any) => (
                            <Chip
                              key={file.id}
                              icon={<DescriptionIcon sx={{ fontSize: "14px !important" }} />}
                              label={file.original_name || file.document_key}
                              component="a"
                              href={file.url || "#"}
                              target="_blank"
                              clickable
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Card>

          {/* SECTION 3: Verified Uploaded Documents Repository */}
          {allFiles.length > 0 && (
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                bgcolor: "#ffffff",
                p: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                Documents & Vault Files ({allFiles.length})
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                Access all submitted certificates, licenses, and identity files.
              </Typography>

              <Grid container spacing={2}>
                {allFiles.map((file, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id || idx}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <DescriptionIcon sx={{ color: "#2563eb", fontSize: 24 }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {file.original_name || file.document_key}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {file.profession_name}
                          </Typography>
                        </Box>
                      </Stack>
                      {file.url && (
                        <Button
                          component="a"
                          href={file.url}
                          target="_blank"
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          sx={{
                            textTransform: "none",
                            borderColor: "#cbd5e1",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#2563eb",
                            "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                          }}
                        >
                          View / Download
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}

          {/* SECTION 4: Digital Membership Card (if active) */}
          {membership && (
            <Card
              elevation={0}
              sx={{
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                bgcolor: "#f0fdf4",
                p: 3,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <CardMembershipIcon sx={{ fontSize: 36, color: "#16a34a" }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#166534" }}>
                      {membership.membership_type} Membership Card
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#15803d" }}>
                      {membership.membership_id ? (
                        <>
                          Membership ID: <strong>{membership.membership_id}</strong>
                        </>
                      ) : (
                        <>
                          Application ID: <strong>{membership.reference_id}</strong>
                        </>
                      )}{" "}
                      • Status: <strong>Approved & Active</strong>
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={Link}
                  href="/dashboard/member"
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#16a34a",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "#15803d" },
                  }}
                >
                  View Digital Card
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      )}

      {/* Snackbar Notification */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ width: "100%", borderRadius: "8px", fontWeight: 600 }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </PortalPageShell>
  );
}
