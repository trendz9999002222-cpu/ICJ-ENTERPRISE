/**
 * /admin/professionals/[id] — Professional Application Detail View
 *
 * Clean, responsive admin detail view for reviewing professional onboarding applications.
 * Features:
 * - Clean hero profile header without messy chips
 * - Cascading Category > Group > Profession dropdown selector to view role-specific practice data
 * - Common personal and address details
 * - Verification document preview table with lightbox
 * - One-click approval and rejection with feedback
 */
"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { adminAdvocatesService } from "@/services/admin/adminAdvocates.service";
import type {
  AdminAdvocateDetail,
  AdvocateDocument,
  AdvocateVerificationStatus,
} from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<
  AdvocateVerificationStatus,
  "success" | "warning" | "error" | "default"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "default",
};

const DOC_KEY_LABELS: Record<string, string> = {
  barLicenseDoc: "Bar License / Registration Certificate",
  bar_certificate: "Bar Council Certificate",
  govtPhotoIdDoc: "Government Photo ID Proof",
  id_proof: "Identity Proof (Aadhaar / Passport / Voter ID)",
  resumeDoc: "Curriculum Vitae (CV) / Resume",
  resume: "Curriculum Vitae (CV) / Resume",
  coverLetterDoc: "Cover Letter / Statement of Purpose",
  address_proof: "Address Proof Document",
  degree_certificate: "Degree / Educational Certificate",
  law_degree: "LL.B / Law Degree Certificate",
  photo: "Passport Photograph",
  profile_photo: "Profile Photograph",
  passport_photo: "Passport Photograph",
  avatar: "Profile Photo",
};

const FIELD_LABEL_MAP: Record<string, string> = {
  fullName: "Full Name",
  full_name: "Full Name",
  name: "Full Name",
  fatherName: "Father's / Guardian's Name",
  father_name: "Father's / Guardian's Name",
  dob: "Date of Birth",
  date_of_birth: "Date of Birth",
  gender: "Gender",
  mobile: "Mobile Number",
  mobile_number: "Mobile Number",
  phone: "Phone Number",
  altMobile: "Alternate Mobile Number",
  alt_mobile: "Alternate Mobile Number",
  alternate_mobile: "Alternate Mobile Number",
  email: "Email Address",
  bloodGroup: "Blood Group",
  blood_group: "Blood Group",
  enrollmentNumber: "Enrollment / License Number",
  enrollment_number: "Enrollment / License Number",
  bar_number: "Bar Registration Number",
  enrollmentYear: "Enrollment / Registration Year",
  enrollment_year: "Enrollment / Registration Year",
  barCouncil: "State Bar Council / Regulatory Body",
  bar_council: "State Bar Council / Regulatory Body",
  state_bar_council: "State Bar Council / Regulatory Body",
  regulatory_body: "Regulatory Body / Institute",
  practiceCity: "Current Practice Location / City",
  practice_city: "Current Practice Location / City",
  city: "City",
  practice_state: "Practice State",
  state: "State",
  address: "Address",
  office_address: "Office Address",
  pincode: "PIN / Postal Code",
  experience: "Years of Experience",
  experience_years: "Years of Experience",
  years_of_experience: "Years of Experience",
  practiceType: "Type of Practice",
  practice_type: "Type of Practice",
  qualification: "Highest Educational Qualification",
  educational_qualification: "Highest Educational Qualification",
  passingYear: "Year of Passing",
  passing_year: "Year of Passing",
  firmName: "Firm / Organization Name",
  firm_name: "Firm / Organization Name",
  designation: "Designation / Role",
  bio: "Professional Bio / Overview",
  profile_bio: "Professional Bio / Overview",
  overview: "Professional Overview",
  about: "Professional Overview",
  courts: "Courts & Jurisdictions",
  practice_areas: "Practice Areas & Specialisations",
  specialisations: "Specialisations",
  languages: "Languages Spoken",
  university: "University / Institute",
  issuing_body: "Issuing Authority / Body",
  organisation: "Organisation / Practice Name",
};

function formatDocKey(key: string): string {
  if (DOC_KEY_LABELS[key]) return DOC_KEY_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatFieldKey(key: string): string {
  if (FIELD_LABEL_MAP[key]) return FIELD_LABEL_MAP[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageDocument(doc: { content_type?: string; original_name?: string; doc_key?: string }): boolean {
  const ct = (doc.content_type || "").toLowerCase();
  const name = (doc.original_name || "").toLowerCase();
  const key = (doc.doc_key || "").toLowerCase();

  if (ct.startsWith("image/")) return true;
  if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp") || name.endsWith(".gif")) return true;
  if (key in { photo: 1, profile_photo: 1, passport_photo: 1, avatar: 1 }) return true;
  return false;
}

function isPdfDocument(doc: { content_type?: string; original_name?: string }): boolean {
  const ct = (doc.content_type || "").toLowerCase();
  const name = (doc.original_name || "").toLowerCase();
  return ct === "application/pdf" || name.endsWith(".pdf");
}

// ---------------------------------------------------------------------------

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "0.725rem",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#0f172a", wordBreak: "break-word" }}>
        {value ?? "—"}
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {icon && <Box sx={{ color: "#2563eb", display: "flex" }}>{icon}</Box>}
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
            {title}
          </Typography>
        </Stack>
        {badge}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
    </Paper>
  );
}

// ---------------------------------------------------------------------------

export default function ProfessionalDetailPage() {
  const params = useParams();
  const professionalId = String(params.id);

  const [advocate, setAdvocate] = useState<AdminAdvocateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Role Dropdown Filters inside the Profile Details section
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");
  const [selectedProfessionFilter, setSelectedProfessionFilter] = useState<string>("all");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  // Lightbox preview for photos/documents
  const [previewMedia, setPreviewMedia] = useState<{ open: boolean; url: string; title: string } | null>(null);

  const loadProfessional = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminAdvocatesService.getAdvocateDetail(professionalId);
      if (!data) throw new Error("Professional application not found.");
      setAdvocate(data);
    } catch {
      setError("Failed to load professional details. Please check the ID or try again.");
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    loadProfessional();
  }, [loadProfessional]);

  const handleApprove = async () => {
    if (!advocate) return;
    setActionLoading(true);
    setError("");
    try {
      const updated = await adminAdvocatesService.approveAdvocate(advocate.id);
      setAdvocate(updated);
      setApproveDialogOpen(false);
      setToastMsg(`${updated.full_name} has been approved successfully!`);
    } catch {
      setError("Failed to approve application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!advocate) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    setRejectError("");
    try {
      const updated = await adminAdvocatesService.rejectAdvocate(advocate.id, rejectReason.trim());
      setAdvocate(updated);
      setRejectDialogOpen(false);
      setRejectReason("");
      setToastMsg("Application has been rejected.");
    } catch {
      setRejectError("Failed to reject application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to unroll and extract entries from a dictionary
  const extractEntries = (raw?: Record<string, unknown>): { key: string; label: string; value: unknown }[] => {
    if (!raw || typeof raw !== "object") return [];
    const entries: { key: string; label: string; value: unknown }[] = [];

    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    for (const [k, v] of Object.entries(raw)) {
      if (v === null || v === undefined || v === "") continue;

      if (isUUID(k) && typeof v === "object" && !Array.isArray(v)) {
        const obj = v as Record<string, unknown>;
        if ("field_name" in obj && "value" in obj) {
          const fieldKey = String(obj.field_name);
          entries.push({
            key: fieldKey,
            label: formatFieldKey(fieldKey),
            value: obj.value,
          });
          continue;
        }
        for (const [subK, subV] of Object.entries(obj)) {
          if (subV !== null && subV !== undefined && subV !== "") {
            entries.push({
              key: subK,
              label: formatFieldKey(subK),
              value: subV,
            });
          }
        }
        continue;
      }

      entries.push({
        key: k,
        label: formatFieldKey(k),
        value: v,
      });
    }

    return entries;
  };

  // Structure all registered professions with their category and group
  const structuredProfessions = useMemo(() => {
    if (!advocate) return [];

    const categories = advocate.categories || [];
    const groups = advocate.groups || [];
    const professions = advocate.professions || [];
    const profFieldValues = advocate.profession_field_values || {};
    const advocateData = advocate.advocate_data || {};

    if (professions.length === 0) {
      return [
        {
          id: "primary",
          name: advocate.profession_name || "Professional",
          categoryId: "cat_default",
          categoryName: advocate.category_name || "General",
          groupId: "grp_default",
          groupName: advocate.group_name || "General",
          fields: extractEntries(advocateData),
        },
      ];
    }

    return professions.map((p) => {
      const parentGroup = groups.find((g) => g.id === p.group_id);
      const parentCatId = p.category_id || parentGroup?.category_id;
      const parentCategory = categories.find((c) => c.id === parentCatId);

      // Profession-specific fields only (common/personal data is shown once separately)
      let rawFields = profFieldValues[p.id];
      if (!rawFields || (typeof rawFields === "object" && Object.keys(rawFields).length === 0)) {
        rawFields = professions.length === 1 ? advocateData : {};
      }

      return {
        id: p.id,
        name: p.name,
        categoryId: parentCategory?.id || parentCatId || "cat_default",
        categoryName: parentCategory?.name || advocate.category_name || "Category",
        groupId: parentGroup?.id || p.group_id || "grp_default",
        groupName: parentGroup?.name || advocate.group_name || "Group",
        fields: extractEntries(rawFields as Record<string, unknown>),
      };
    });
  }, [advocate]);

  // Unique Categories available for this applicant
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    structuredProfessions.forEach((p) => {
      map.set(p.categoryId, p.categoryName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [structuredProfessions]);

  // Unique Groups available (filtered by selected category if applicable)
  const availableGroups = useMemo(() => {
    const map = new Map<string, string>();
    structuredProfessions.forEach((p) => {
      if (selectedCategoryFilter === "all" || p.categoryId === selectedCategoryFilter) {
        map.set(p.groupId, p.groupName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [structuredProfessions, selectedCategoryFilter]);

  // Unique Professions available (filtered by category and group if applicable)
  const availableProfessions = useMemo(() => {
    const map = new Map<string, string>();
    structuredProfessions.forEach((p) => {
      const matchCat = selectedCategoryFilter === "all" || p.categoryId === selectedCategoryFilter;
      const matchGrp = selectedGroupFilter === "all" || p.groupId === selectedGroupFilter;
      if (matchCat && matchGrp) {
        map.set(p.id, p.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [structuredProfessions, selectedCategoryFilter, selectedGroupFilter]);

  // Filtered list of professions to display
  const filteredProfessions = useMemo(() => {
    return structuredProfessions.filter((p) => {
      if (selectedCategoryFilter !== "all" && p.categoryId !== selectedCategoryFilter) return false;
      if (selectedGroupFilter !== "all" && p.groupId !== selectedGroupFilter) return false;
      if (selectedProfessionFilter !== "all" && p.id !== selectedProfessionFilter) return false;
      return true;
    });
  }, [structuredProfessions, selectedCategoryFilter, selectedGroupFilter, selectedProfessionFilter]);

  // Reset dependent filters on category change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryFilter(catId);
    setSelectedGroupFilter("all");
    setSelectedProfessionFilter("all");
  };

  // Reset dependent filters on group change
  const handleGroupChange = (grpId: string) => {
    setSelectedGroupFilter(grpId);
    setSelectedProfessionFilter("all");
  };

  // Process personal fields cleanly
  const personalFields = useMemo(() => {
    if (!advocate?.personal_data && !advocate?.common_field_values) return [];
    const raw = advocate.personal_data || advocate.common_field_values || {};
    return extractEntries(raw);
  }, [advocate]);

  if (loading) {
    return (
      <AdminPageShell title="Professional Application">
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error || !advocate) {
    return (
      <AdminPageShell title="Professional Application">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Professional application not found."}
        </Alert>
        <Button
          component={Link}
          href="/admin/professionals"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Professionals List
        </Button>
      </AdminPageShell>
    );
  }

  const initials = (advocate.full_name || advocate.email || "P")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const address = advocate.address_data || {};
  const documents: AdvocateDocument[] = advocate.documents || [];

  const renderFieldValue = (val: unknown) => {
    if (val === null || val === undefined || val === "") {
      return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
      }
      return (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
          {val.map((item, idx) => (
            <Chip
              key={idx}
              size="small"
              label={String(item)}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: 1.5 }}
            />
          ))}
        </Stack>
      );
    }

    if (typeof val === "boolean") {
      return (
        <Chip
          size="small"
          label={val ? "Yes" : "No"}
          color={val ? "success" : "default"}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: "0.75rem", borderRadius: 1.5 }}
        />
      );
    }

    if (typeof val === "object") {
      return (
        <Typography sx={{ color: "#0f172a", fontSize: "0.85rem", wordBreak: "break-word" }}>
          {JSON.stringify(val)}
        </Typography>
      );
    }

    return (
      <Typography sx={{ color: "#0f172a", fontSize: "0.875rem", fontWeight: 500, wordBreak: "break-word" }}>
        {String(val)}
      </Typography>
    );
  };

  return (
    <AdminPageShell
      title="Professional Application Details"
      subtitle={`Application Reference: ${advocate.reference_id || advocate.id}`}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {advocate.status === "rejected" && advocate.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Rejection Reason / Feedback:
          </Typography>
          <Typography variant="body2">{advocate.rejection_reason}</Typography>
        </Alert>
      )}

      <Stack spacing={3} sx={{ width: "100%", pb: 4 }}>
        {/* ================================================================= */}
        {/* CLEAN HERO HEADER CARD (No cluttered chips)                       */}
        {/* ================================================================= */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            {/* Left: Avatar + Identity */}
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={advocate.photo_url || undefined}
                  alt={advocate.full_name}
                  sx={{
                    width: { xs: 64, sm: 76 },
                    height: { xs: 64, sm: 76 },
                    bgcolor: "#2563eb",
                    fontSize: { xs: "1.4rem", sm: "1.75rem" },
                    fontWeight: 800,
                    border: "3px solid #eff6ff",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                    cursor: advocate.photo_url ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (advocate.photo_url) {
                      setPreviewMedia({
                        open: true,
                        url: advocate.photo_url,
                        title: `${advocate.full_name}'s Profile Photo`,
                      });
                    }
                  }}
                >
                  {initials}
                </Avatar>
                {advocate.photo_url && (
                  <Tooltip title="Click to view photo">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setPreviewMedia({
                          open: true,
                          url: advocate.photo_url!,
                          title: `${advocate.full_name}'s Profile Photo`,
                        })
                      }
                      sx={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        bgcolor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        p: 0.5,
                        "&:hover": { bgcolor: "#f1f5f9" },
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 13, color: "#2563eb" }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
                    {advocate.full_name}
                  </Typography>
                  <Chip
                    label={advocate.status.replace("_", " ")}
                    color={STATUS_COLOR[advocate.status]}
                    size="small"
                    sx={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.725rem", borderRadius: 1.5 }}
                  />
                </Stack>

                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, wordBreak: "break-word" }}>
                  {advocate.email} · Reference:{" "}
                  <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>
                    {advocate.bar_number || advocate.reference_id || "—"}
                  </strong>
                </Typography>
              </Box>
            </Stack>

            {/* Right: Actions */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                component={Link}
                href="/admin/professionals"
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                sx={{ borderColor: "#cbd5e1", color: "#475569", textTransform: "none", fontWeight: 600 }}
              >
                Back
              </Button>

              {advocate.status !== "approved" && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <CheckCircleOutlinedIcon />
                    )
                  }
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Approve Application
                </Button>
              )}

              {advocate.status !== "rejected" && (
                <Button
                  variant={advocate.status === "approved" ? "outlined" : "contained"}
                  color="error"
                  size="small"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <BlockIcon />
                    )
                  }
                  onClick={() => {
                    setRejectReason("");
                    setRejectError("");
                    setRejectDialogOpen(true);
                  }}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Reject
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {/* Quick info strip */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <EmailIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", wordBreak: "break-all" }}>
                    {advocate.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <PhoneIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Mobile</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {advocate.mobile || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#eff6ff", p: 1, borderRadius: 2, display: "flex", color: "#2563eb" }}>
                  <GavelIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Enrollment / Ref #</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                    {advocate.bar_number || advocate.reference_id || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <HistoryIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Submitted Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {new Date(advocate.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* ================================================================= */}
        {/* ROLE & PRACTICE DETAILS WITH CASCADING DROPDOWN FILTERS          */}
        {/* ================================================================= */}
        <SectionCard
          title="Professional Practice & Role Details"
          icon={<WorkHistoryIcon sx={{ fontSize: 20 }} />}
          badge={
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
              Total Registered Roles: <strong>{structuredProfessions.length}</strong>
            </Typography>
          }
        >
          {/* Top Filter Bar for Category, Group, Profession */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2.5,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <TuneIcon sx={{ fontSize: 18, color: "#2563eb" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Filter Practice Details by Category, Group & Profession:
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {/* Category Dropdown */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.85rem" }}>Category</InputLabel>
                  <Select
                    label="Category"
                    value={selectedCategoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    sx={{ bgcolor: "#ffffff", borderRadius: 1.5, fontSize: "0.85rem" }}
                  >
                    <MenuItem value="all">All Categories ({availableCategories.length})</MenuItem>
                    {availableCategories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Group Dropdown */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.85rem" }}>Group</InputLabel>
                  <Select
                    label="Group"
                    value={selectedGroupFilter}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    sx={{ bgcolor: "#ffffff", borderRadius: 1.5, fontSize: "0.85rem" }}
                  >
                    <MenuItem value="all">All Groups ({availableGroups.length})</MenuItem>
                    {availableGroups.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Profession Dropdown */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.85rem" }}>Profession</InputLabel>
                  <Select
                    label="Profession"
                    value={selectedProfessionFilter}
                    onChange={(e) => setSelectedProfessionFilter(e.target.value)}
                    sx={{ bgcolor: "#ffffff", borderRadius: 1.5, fontSize: "0.85rem" }}
                  >
                    <MenuItem value="all">All Professions ({availableProfessions.length})</MenuItem>
                    {availableProfessions.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Render Profession Details based on selected filters */}
          {filteredProfessions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
              <WorkHistoryIcon sx={{ fontSize: 36, mb: 1, color: "#cbd5e1" }} />
              <Typography variant="body2">
                No registered role matches the selected Category, Group, or Profession filter.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {filteredProfessions.map((prof, idx) => (
                <Paper
                  key={prof.id || idx}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    border: "1px solid #e2e8f0",
                    borderRadius: 2.5,
                    bgcolor: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  {/* Clean Role Header */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1.5,
                      pb: 1.5,
                      mb: 2,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                      {prof.name}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Category: <strong style={{ color: "#15803d" }}>{prof.categoryName}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#cbd5e1" }}>•</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Group: <strong style={{ color: "#7e22ce" }}>{prof.groupName}</strong>
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Role Fields Grid */}
                  {prof.fields.length > 0 ? (
                    <Grid container spacing={2.5}>
                      {prof.fields.map((field) => (
                        <Grid
                          key={field.key}
                          size={{
                            xs: 12,
                            sm: Array.isArray(field.value) ? 12 : 6,
                            md: Array.isArray(field.value) ? 12 : 4,
                          }}
                        >
                          <DetailField label={field.label} value={renderFieldValue(field.value)} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      No specific practice fields recorded for this role.
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </SectionCard>

        {/* ================================================================= */}
        {/* PERSONAL INFORMATION                                             */}
        {/* ================================================================= */}
        {personalFields.length > 0 && (
          <SectionCard title="Common Personal Information" icon={<PersonIcon sx={{ fontSize: 20 }} />}>
            <Grid container spacing={2.5}>
              {personalFields.map((field) => (
                <Grid key={field.key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailField label={field.label} value={renderFieldValue(field.value)} />
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        )}

        {/* ================================================================= */}
        {/* ADDRESS DETAILS                                                  */}
        {/* ================================================================= */}
        {Object.keys(address).filter((k) => address[k as keyof typeof address]).length > 0 && (
          <SectionCard title="Address & Location Details" icon={<LocationOnIcon sx={{ fontSize: 20 }} />}>
            <Grid container spacing={2.5}>
              {address.address && (
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <DetailField label="Office / Residential Address" value={address.address} />
                </Grid>
              )}
              {address.city && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailField label="City / Location" value={address.city} />
                </Grid>
              )}
              {address.state && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailField label="State" value={address.state} />
                </Grid>
              )}
              {address.pincode && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailField label="Pincode" value={address.pincode} />
                </Grid>
              )}
            </Grid>
          </SectionCard>
        )}

        {/* ================================================================= */}
        {/* UPLOADED DOCUMENTS TABLE                                         */}
        {/* ================================================================= */}
        <SectionCard
          title={`Uploaded Verification Documents (${documents.length})`}
          icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
        >
          {documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
              <DescriptionIcon sx={{ fontSize: 40, mb: 1, color: "#cbd5e1" }} />
              <Typography variant="body2">No verification documents uploaded for this application.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, overflow: "hidden" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: "#64748b",
                        py: 1.5,
                        whiteSpace: "nowrap",
                        width: 72,
                        minWidth: 72,
                      }}
                    >
                      Preview
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      Document Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      File Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      MIME Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      Size
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      Uploaded
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => {
                    const isImg = isImageDocument(doc);
                    const isPdf = isPdfDocument(doc);

                    return (
                      <TableRow
                        key={doc.id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        {/* Thumbnail / Icon */}
                        <TableCell sx={{ width: 64, py: 1.5 }}>
                          {isImg && doc.file_url ? (
                            <Avatar
                              src={doc.file_url}
                              variant="rounded"
                              sx={{
                                width: 42,
                                height: 42,
                                border: "1px solid #e2e8f0",
                                cursor: "pointer",
                                bgcolor: "#f1f5f9",
                                transition: "transform 0.15s ease",
                                "&:hover": { transform: "scale(1.08)" },
                              }}
                              onClick={() =>
                                setPreviewMedia({
                                  open: true,
                                  url: doc.file_url!,
                                  title: formatDocKey(doc.doc_key),
                                })
                              }
                            >
                              📷
                            </Avatar>
                          ) : isPdf ? (
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor: "#fef2f2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                              }}
                            >
                              <PictureAsPdfIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                          ) : (
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor: "#f8fafc",
                                color: "#64748b",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <DescriptionIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                          )}
                        </TableCell>

                        {/* Document Type */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {formatDocKey(doc.doc_key)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                            key: {doc.doc_key}
                          </Typography>
                        </TableCell>

                        {/* File Name */}
                        <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#334155",
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                              wordBreak: "break-all",
                            }}
                          >
                            {doc.original_name || "—"}
                          </Typography>
                        </TableCell>

                        {/* Content Type */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            size="small"
                            label={doc.content_type || "file"}
                            color={isPdf ? "error" : isImg ? "primary" : "default"}
                            variant="outlined"
                            sx={{ fontSize: "0.68rem", fontWeight: 600, borderRadius: 1.5 }}
                          />
                        </TableCell>

                        {/* Size */}
                        <TableCell sx={{ py: 1.5, fontSize: "0.8125rem", color: "#64748b" }}>
                          {formatBytes(doc.size_bytes)}
                        </TableCell>

                        {/* Upload Date */}
                        <TableCell sx={{ py: 1.5, fontSize: "0.8125rem", color: "#64748b" }}>
                          {doc.uploaded_at
                            ? new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "flex-end", alignItems: "center", flexWrap: "nowrap" }}
                          >
                            {isImg && doc.file_url && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                onClick={() =>
                                  setPreviewMedia({
                                    open: true,
                                    url: doc.file_url!,
                                    title: formatDocKey(doc.doc_key),
                                  })
                                }
                                sx={{
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  borderColor: "#cbd5e1",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                Preview
                              </Button>
                            )}

                            {doc.file_url ? (
                              <Button
                                size="small"
                                variant="contained"
                                component="a"
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  bgcolor: "#2563eb",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  "&:hover": { bgcolor: "#1d4ed8" },
                                }}
                              >
                                Open File
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                Unavailable
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>

        {/* ================================================================= */}
        {/* REGISTRATION METADATA                                             */}
        {/* ================================================================= */}
        <SectionCard title="Registration Metadata & System Info" icon={<BusinessIcon sx={{ fontSize: 20 }} />}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Reference ID" value={advocate.reference_id || advocate.id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Status" value={advocate.status.replace("_", " ")} />
            </Grid>
            {advocate.reviewed_by_email && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Reviewed By" value={advocate.reviewed_by_email} />
              </Grid>
            )}
            {advocate.reviewed_at && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Reviewed At"
                  value={new Date(advocate.reviewed_at).toLocaleString("en-IN")}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Created At"
                value={new Date(advocate.created_at).toLocaleString("en-IN")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Last Updated"
                value={new Date(advocate.updated_at).toLocaleString("en-IN")}
              />
            </Grid>
          </Grid>
        </SectionCard>
      </Stack>

      {/* ================================================================= */}
      {/* IMAGE / DOCUMENT LIGHTBOX DIALOG                                 */}
      {/* ================================================================= */}
      <Dialog
        open={Boolean(previewMedia?.open)}
        onClose={() => setPreviewMedia(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#0f172a",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "#0f172a",
          }}
        >
          <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "0.95rem" }}>
            {previewMedia?.title || "Document Preview"}
          </Typography>
          <Stack direction="row" spacing={1}>
            {previewMedia?.url && (
              <Button
                component="a"
                href={previewMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  color: "#93c5fd",
                  borderColor: "rgba(147, 197, 253, 0.4)",
                  textTransform: "none",
                  fontSize: "0.75rem",
                }}
              >
                Open Full Size
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setPreviewMedia(null)}
              sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Box>
        <DialogContent
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
            maxHeight: "75vh",
            overflow: "auto",
            bgcolor: "#020617",
          }}
        >
          {previewMedia?.url && (
            <Box
              component="img"
              src={previewMedia.url}
              alt={previewMedia.title}
              sx={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 1.5,
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================= */}
      {/* APPROVE DIALOG                                                   */}
      {/* ================================================================= */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
          Confirm Application Approval
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569" }}>
            Are you sure you want to approve{" "}
            <strong style={{ color: "#0f172a" }}>{advocate.full_name}</strong>&apos;s professional registration application?
            This will mark them as verified and approved in the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#475569" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================================================= */}
      {/* REJECT DIALOG                                                    */}
      {/* ================================================================= */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
          Reject Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#475569" }}>
            Please provide a specific reason for rejecting{" "}
            <strong style={{ color: "#0f172a" }}>{advocate.full_name}</strong>&apos;s application.
            This feedback will help the applicant resolve issues or reapply.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder="e.g. Incomplete bar license document or invalid registration number."
            label="Rejection Reason / Feedback"
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError("");
            }}
            error={!!rejectError}
            helperText={rejectError}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#475569" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <BlockIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </AdminPageShell>
  );
}
