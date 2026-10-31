"use client";

import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GavelIcon from "@mui/icons-material/Gavel";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { env } from "@/config/env";

export type EmpanelmentPathway = "legal_professional" | "other_professional" | "volunteer";

interface ProfessionalEmpanelmentModalProps {
  open: boolean;
  onClose: () => void;
  initialPathway?: EmpanelmentPathway;
  memberProfile: {
    name: string;
    email: string;
    userId?: string;
  };
  onApplicationSubmitted?: () => void;
}

const LEGAL_CATEGORIES = [
  { value: "advocate", label: "Advocate / Bar Practitioner" },
  { value: "legal_consultant", label: "Legal Consultant & Corporate Counsel" },
  { value: "legal_researcher", label: "Judicial & Legal Researcher" },
  { value: "forensic_expert", label: "Forensic & Medico-Legal Expert" },
  { value: "drafting_specialist", label: "Legal Drafting & Conveyancing Specialist" },
];

const OTHER_CATEGORIES = [
  { value: "chartered_accountant", label: "Chartered Accountant (CA)" },
  { value: "company_secretary", label: "Company Secretary (CS)" },
  { value: "arbitrator", label: "Certified Arbitrator / Mediator" },
];

const VOLUNTEER_CATEGORIES = [
  { value: "legal_aid_fellow", label: "Legal Aid Fellow / Clinic Volunteer" },
  { value: "research_intern", label: "Research Fellow & Documentation" },
  { value: "paralegal_volunteer", label: "Para-Legal Community Worker" },
];

const STATE_BAR_COUNCILS = [
  "Bar Council of Delhi",
  "Bar Council of Maharashtra & Goa",
  "Bar Council of Uttar Pradesh",
  "Bar Council of Punjab & Haryana",
  "Bar Council of Karnataka",
  "Bar Council of Tamil Nadu & Puducherry",
  "Bar Council of West Bengal",
  "Bar Council of Gujarat",
  "Bar Council of Rajasthan",
  "Bar Council of Madhya Pradesh",
  "Bar Council of Bihar",
  "Bar Council of Kerala",
  "Bar Council of Andhra Pradesh & Telangana",
  "Other Statutory State Bar / Regulatory Body",
];

const COURTS_OPTIONS = [
  "Supreme Court of India",
  "High Courts (State Jurisdictions)",
  "District & Sessions Courts",
  "NCLT / NCLAT (Company Law)",
  "ITAT / CEGAT (Taxation Tribunals)",
  "DRT / DRAT (Debt Recovery)",
  "National / State Consumer Commissions",
  "Labor Courts & Industrial Tribunals",
];

const PRACTICE_AREAS = [
  "Constitutional Law & Writ Jurisdiction",
  "Civil, Real Estate & Property Disputes",
  "Criminal Defense & Bail Matters",
  "Corporate, Commercial & Insolvency (IBC)",
  "Direct & Indirect Taxation (GST / Income Tax)",
  "Matrimonial, Custody & Family Law",
  "Arbitration, Mediation & Conciliation (ADR)",
  "Cyber Law, Data Protection & White Collar Crimes",
  "Intellectual Property (IPR & Trademarks)",
  "Banking, Finance & SARFAESI Matters",
];

const PROFESSIONAL_INPUT_SX = {
  // Completely eliminate 4-sided rounded boxes so inputs look like authentic paper forms
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "0px !important",
    borderBottom: "1.5px solid #cbd5e1 !important",
    bgcolor: "transparent !important",
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
    "&:hover": {
      borderBottom: "1.5px solid #0f2942 !important",
    },
    "&.Mui-focused": {
      borderBottom: "2px solid #0f2942 !important",
    },
  },
  // Underline standard input variant
  "& .MuiInput-underline:before": {
    borderBottom: "1.5px solid #cbd5e1 !important",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "1.5px solid #0f2942 !important",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "2px solid #0f2942 !important",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.85rem !important",
    fontWeight: "700 !important",
    color: "#475569 !important",
    "&.Mui-focused": {
      color: "#0f2942 !important",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.925rem !important",
    fontWeight: "600 !important",
    color: "#0f172a !important",
    padding: "6px 0 7px !important",
  },
  "& .MuiSelect-standard": {
    display: "flex !important",
    alignItems: "center !important",
  },
};

export default function ProfessionalEmpanelmentModal({
  open,
  onClose,
  initialPathway = "legal_professional",
  memberProfile,
  onApplicationSubmitted,
}: ProfessionalEmpanelmentModalProps) {
  const [pathway, setPathway] = useState<EmpanelmentPathway>(initialPathway);
  const [category, setCategory] = useState<string>("advocate");

  // Form State
  const [formData, setFormData] = useState({
    // Personal details
    full_name: memberProfile.name || "",
    email: memberProfile.email || "",
    mobile: "",
    gender: "Male",
    dob: "1990-01-01",
    office_address: "",
    state: "Delhi",
    city: "New Delhi",
    pincode: "",

    // Professional credentials
    enrollment_number: "",
    state_council: "Bar Council of Delhi",
    enrollment_year: "2018",
    experience_years: "5",
    primary_courts: ["High Courts (State Jurisdictions)", "District & Sessions Courts"],
    practice_areas: ["Civil, Real Estate & Property Disputes", "Criminal Defense & Bail Matters"],
    profile_summary: "",
    chamber_firm_name: "",
  });

  const [idFile, setIdFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    submittedAt: string;
    categoryLabel: string;
  } | null>(null);

  // Sync pathway when initialPathway changes
  useEffect(() => {
    setPathway(initialPathway);
    if (initialPathway === "legal_professional") {
      setCategory("advocate");
    } else if (initialPathway === "other_professional") {
      setCategory("chartered_accountant");
    } else {
      setCategory("legal_aid_fellow");
    }
  }, [initialPathway]);

  // Sync pre-filled member info
  useEffect(() => {
    if (memberProfile.name) {
      setFormData((prev) => ({ ...prev, full_name: memberProfile.name }));
    }
    if (memberProfile.email) {
      setFormData((prev) => ({ ...prev, email: memberProfile.email }));
    }

    // Comprehensive sync: Ensure complete first + last name from profile
    if (open) {
      const token =
        typeof document !== "undefined"
          ? document.cookie.match(/(?:^|;\s*)icj_access_token=([^;]+)/)?.[1]
          : null;
      if (token) {
        fetch(`${env.apiUrl}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            const data = json?.data ?? json;
            if (data?.first_name || data?.last_name) {
              const full = `${data.first_name || ""} ${data.last_name || ""}`.trim();
              if (full) {
                setFormData((prev) => ({ ...prev, full_name: full }));
              }
            }
            if (data?.email) {
              setFormData((prev) => ({ ...prev, email: data.email }));
            }
          })
          .catch(() => {});
      }
    }
  }, [memberProfile, open]);

  const handleTextChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError(null);
  };

  const toggleCourt = (court: string) => {
    setFormData((prev) => {
      const exists = prev.primary_courts.includes(court);
      const next = exists ? prev.primary_courts.filter((c) => c !== court) : [...prev.primary_courts, court];
      return { ...prev, primary_courts: next };
    });
  };

  const toggleArea = (area: string) => {
    setFormData((prev) => {
      const exists = prev.practice_areas.includes(area);
      const next = exists ? prev.practice_areas.filter((a) => a !== area) : [...prev.practice_areas, area];
      return { ...prev, practice_areas: next };
    });
  };

  const getCategoryList = () => {
    if (pathway === "legal_professional") return LEGAL_CATEGORIES;
    if (pathway === "other_professional") return OTHER_CATEGORIES;
    return VOLUNTEER_CATEGORIES;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const applicantName = formData.full_name || memberProfile.name || "Active Member";
    const applicantEmail = formData.email || memberProfile.email || "";

    if (pathway !== "volunteer" && !formData.enrollment_number.trim()) {
      setError(
        pathway === "legal_professional"
          ? "Bar Council Enrollment Number is required."
          : "Professional / Statutory Membership Number is required."
      );
      return;
    }

    if (!declarationAccepted) {
      setError("Please affirm and accept the statutory declaration undertaking.");
      return;
    }

    setSubmitting(true);
    try {
      const token =
        typeof document !== "undefined"
          ? document.cookie.match(/(?:^|;\s*)icj_access_token=([^;]+)/)?.[1]
          : null;

      const fd = new FormData();
      fd.append("pathway", pathway);
      fd.append("category", category);

      const personalData = {
        full_name: applicantName,
        email: applicantEmail,
        mobile: formData.mobile || "",
        gender: formData.gender || "Not specified",
        dob: formData.dob || "",
        office_address: formData.office_address || "",
        state: formData.state || "",
        city: formData.city || "",
        pincode: formData.pincode || "",
      };

      const professionalData = {
        enrollment_number: formData.enrollment_number,
        state_council: formData.state_council,
        enrollment_year: formData.enrollment_year,
        experience_years: formData.experience_years,
        primary_courts: formData.primary_courts,
        practice_areas: formData.practice_areas,
        chamber_firm_name: formData.chamber_firm_name,
        profile_summary: formData.profile_summary,
      };

      fd.append("personal_data", JSON.stringify(personalData));
      fd.append("professional_data", JSON.stringify(professionalData));
      fd.append("category_data", JSON.stringify({ category_slug: category }));
      fd.append("declaration_accepted", "true");

      if (idFile) {
        fd.append("document_bar_council_id", idFile);
      }
      if (cvFile) {
        fd.append("document_resume", cvFile);
      }

      const res = await fetch(`${env.apiUrl}/applications/submit/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message || json?.detail || "Empanelment submission failed. Please verify your data.";
        setError(msg);
        return;
      }

      const ref = json?.data?.application_reference || `ICJ-EMP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const activeCat = getCategoryList().find((c) => c.value === category)?.label || category;

      setSuccessReceipt({
        reference: ref,
        submittedAt: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        categoryLabel: activeCat,
      });

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit application. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleModalClose = () => {
    if (!submitting) {
      setSuccessReceipt(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#fdfdfc",
            borderRadius: 2,
            boxShadow: "0 20px 60px rgba(15, 41, 66, 0.4)",
            // Legal affidavit document border styling
            border: "3px double #0f2942",
            position: "relative",
            maxHeight: "92vh",
          },
        },
      }}
    >
      {/* ─── FORM HEADER (PRINTED PDF AESTHETIC) ─── */}
      <DialogTitle
        sx={{
          p: 0,
          borderBottom: "2px solid #0f2942",
          bgcolor: "#ffffff",
        }}
      >
        {/* Top Gold / Navy Accent Header Strip */}
        <Box
          sx={{
            bgcolor: "#0f2942",
            color: "#ffffff",
            py: 0.8,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #b45309",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ShieldIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Official Institutional Registry Intake • ICJ Form EMP/2026
            </Typography>
          </Stack>

          <IconButton size="small" onClick={handleModalClose} sx={{ color: "#ffffff", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Official Letterhead Header */}
        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: "center", position: "relative" }}>
          {/* Corner Ornamental Marks */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 16,
              height: 16,
              borderTop: "2px solid #0f2942",
              borderLeft: "2px solid #0f2942",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 16,
              height: 16,
              borderTop: "2px solid #0f2942",
              borderRight: "2px solid #0f2942",
            }}
          />

          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: { xs: "1.1rem", sm: "1.35rem" },
                fontWeight: 900,
                color: "#0f2942",
                letterSpacing: "0.03em",
                lineHeight: 1.2,
              }}
            >
              INTERNATIONAL CONSORTIUM OF JURISTS
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#b45309",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                mt: 0.4,
              }}
            >
              Statutory Non-Profit Legal Guild • Empanelment Directorate
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "Georgia, serif",
              fontWeight: 800,
              fontSize: { xs: "0.68rem", sm: "0.82rem", md: "0.9rem" },
              color: "#1e3a8a",
              mt: 1.5,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              borderTop: "1px dashed #cbd5e1",
              borderBottom: "1px dashed #cbd5e1",
              py: 0.75,
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            APPLICATION FOR PROFESSIONAL EMPANELMENT &amp; ADVOCATE ROSTER ENROLLMENT
          </Typography>

          {/* Form Reference Bar */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 1.5,
              justifyContent: "center",
              fontSize: "0.75rem",
              color: "#475569",
              flexWrap: "wrap",
            }}
          >
            <span><strong>Filing Type:</strong> Statutory Empanelment</span>
            <span>•</span>
            <span><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
            <span>•</span>
            <span><strong>Member Account:</strong> {memberProfile.email || "Active Member"}</span>
          </Stack>
        </Box>
      </DialogTitle>

      {/* ─── FORM CONTENT ─── */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "#fafafa" }}>
        {successReceipt ? (
          /* SUCCESS OFFICIAL ACKNOWLEDGMENT SLIP */
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: "2px solid #16a34a",
                borderRadius: 2,
                bgcolor: "#f0fdf4",
                maxWidth: 620,
                mx: "auto",
                position: "relative",
              }}
            >
              {/* Corner Watermarks */}
              <Box sx={{ position: "absolute", top: 8, left: 8, width: 14, height: 14, borderTop: "2px solid #16a34a", borderLeft: "2px solid #16a34a" }} />
              <Box sx={{ position: "absolute", top: 8, right: 8, width: 14, height: 14, borderTop: "2px solid #16a34a", borderRight: "2px solid #16a34a" }} />
              <Box sx={{ position: "absolute", bottom: 8, left: 8, width: 14, height: 14, borderBottom: "2px solid #16a34a", borderLeft: "2px solid #16a34a" }} />
              <Box sx={{ position: "absolute", bottom: 8, right: 8, width: 14, height: 14, borderBottom: "2px solid #16a34a", borderRight: "2px solid #16a34a" }} />

              <CheckCircleIcon sx={{ fontSize: 56, color: "#16a34a", mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#14532d", fontFamily: "Georgia, serif" }}>
                APPLICATION DULY RECEIVED &amp; LOGGED
              </Typography>
              <Typography variant="body2" sx={{ color: "#166534", mt: 0.5, mb: 3 }}>
                Official Empanelment Intake Receipt issued under seal of the International Consortium of Jurists.
              </Typography>

              <Box
                sx={{
                  bgcolor: "#ffffff",
                  p: 2.5,
                  border: "1.5px dashed #16a34a",
                  borderRadius: 2,
                  mb: 3,
                  textAlign: "left",
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                      APPLICATION REFERENCE NUMBER
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f2942", fontSize: "1.1rem" }}>
                      {successReceipt.reference}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                      DATE &amp; TIMESTAMP
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.85rem" }}>
                      {successReceipt.submittedAt}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                      EMPANELMENT DESIGNATION
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#1e3a8a", fontSize: "0.85rem" }}>
                      {successReceipt.categoryLabel}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                      APPLICATION STATUS
                    </Typography>
                    <Chip label="UNDER REVIEW" color="warning" size="small" sx={{ fontWeight: 800, fontSize: "0.7rem", height: 22 }} />
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 3, lineHeight: 1.5 }}>
                Your credentials and Bar/Statutory certificates are placed before the <strong>ICJ Empanelment Scrutiny Board</strong>.
                Verification turnaround is typically <strong>3 to 5 business days</strong>. You may track this application in real-time from your Member Dashboard.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Print Official Acknowledgment
                </Button>
                <Button
                  variant="contained"
                  onClick={handleModalClose}
                  sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#15803d", "&:hover": { bgcolor: "#166534" } }}
                >
                  Return to Member Dashboard
                </Button>
              </Stack>
            </Paper>
          </Box>
        ) : (
          /* ACTUAL OFFICIAL FORM */
          <Box component="form" onSubmit={handleSubmit} sx={PROFESSIONAL_INPUT_SX}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* ─── SECTION 1: EMPANELMENT CADRE SELECTION ─── */}
            <Box sx={{ p: 2.5, mb: 3, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography
                sx={{
                  fontSize: "0.825rem",
                  fontWeight: 900,
                  color: "#0f2942",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1.5,
                  pb: 0.8,
                  borderBottom: "1.5px solid #0f2942",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span>SECTION I: EMPANELMENT CADRE &amp; PROFESSIONAL DISCIPLINE</span>
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" variant="standard">
                    <InputLabel id="pathway-select-label">Empanelment Wing</InputLabel>
                    <Select
                      variant="standard"
                      labelId="pathway-select-label"
                      value={pathway}
                      label="Empanelment Wing"
                      onChange={(e) => {
                        const newPathway = e.target.value as EmpanelmentPathway;
                        setPathway(newPathway);
                        if (newPathway === "legal_professional") setCategory("advocate");
                        else if (newPathway === "other_professional") setCategory("chartered_accountant");
                        else setCategory("legal_aid_fellow");
                      }}
                    >
                      <MenuItem value="legal_professional">
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <GavelIcon sx={{ fontSize: 18, color: "#1e3a8a" }} />
                          <span>Legal Professional Wing</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="other_professional">
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <BusinessCenterIcon sx={{ fontSize: 18, color: "#065f46" }} />
                          <span>Other Professional (CA / CS / Finance)</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="volunteer">
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <VolunteerActivismIcon sx={{ fontSize: 18, color: "#7c2d12" }} />
                          <span>Volunteer / Para-Legal Fellow</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" variant="standard">
                    <InputLabel id="category-select-label">Specific Designation / Category</InputLabel>
                    <Select
                      variant="standard"
                      labelId="category-select-label"
                      value={category}
                      label="Specific Designation / Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {getCategoryList().map((c) => (
                        <MenuItem key={c.value} value={c.value}>
                          {c.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* ─── SECTION 2: VERIFIED APPLICANT PROFILE (LINKED FROM MEMBERSHIP) ─── */}
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                bgcolor: "#f8fafc",
                borderRadius: 1.5,
                border: "1.5px solid #e2e8f0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                  pb: 0.8,
                  borderBottom: "1.5px solid #0f2942",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.825rem",
                    fontWeight: 900,
                    color: "#0f2942",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  SECTION II: APPLICANT IDENTITY &amp; REGISTRATION PROFILE
                </Typography>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: "14px !important", color: "#16a34a !important" }} />}
                  label="Verified Member Details Linked"
                  size="small"
                  sx={{
                    bgcolor: "#f0fdf4",
                    color: "#166534",
                    fontWeight: 700,
                    border: "1px solid #bbf7d0",
                    height: 22,
                    fontSize: "0.68rem",
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                    REGISTERED PRACTITIONER / CANDIDATE NAME
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0f2942", fontSize: "0.95rem" }}>
                    {formData.full_name || memberProfile.name || "Active ICJ Member"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                    OFFICIAL REGISTERED EMAIL
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0f2942", fontSize: "0.95rem" }}>
                    {memberProfile.email || formData.email || "Registered Account"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" variant="outlined" sx={{ py: 0.5, bgcolor: "#f0f9ff", borderColor: "#bae6fd", fontSize: "0.78rem" }}>
                    Personal particulars (contact numbers, date of birth, residential address, and identity photographs) were validated during membership onboarding and are automatically associated with this empanelment filing.
                  </Alert>
                </Grid>
              </Grid>
            </Box>

            {/* ─── SECTION 3: STATUTORY BAR / PROFESSIONAL CREDENTIALS ─── */}
            <Box sx={{ p: 2.5, mb: 3, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography
                sx={{
                  fontSize: "0.825rem",
                  fontWeight: 900,
                  color: "#0f2942",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1.5,
                  pb: 0.8,
                  borderBottom: "1.5px solid #0f2942",
                }}
              >
                SECTION III: STATUTORY ENROLLMENT &amp; STANDING CREDENTIALS
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    label={
                      pathway === "legal_professional"
                        ? "Bar Council Enrollment Number (e.g. D/1234/2018)"
                        : pathway === "other_professional"
                        ? "ICAI / ICSI Membership Number"
                        : "Fellow / Student Identity Number"
                    }
                    value={formData.enrollment_number}
                    onChange={handleTextChange("enrollment_number")}
                    placeholder={pathway === "legal_professional" ? "D/1234/2018" : "ICAI-M-123456"}
                    required={pathway !== "volunteer"}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" variant="standard">
                    <InputLabel id="state-council-label">
                      {pathway === "legal_professional" ? "State Bar Council" : "Regional / Statutory Body"}
                    </InputLabel>
                    <Select
                      variant="standard"
                      labelId="state-council-label"
                      value={formData.state_council}
                      label={pathway === "legal_professional" ? "State Bar Council" : "Regional / Statutory Body"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state_council: e.target.value }))}
                    >
                      {STATE_BAR_COUNCILS.map((council) => (
                        <MenuItem key={council} value={council}>
                          {council}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    type="number"
                    label="Year of Admission / Enrollment"
                    value={formData.enrollment_year}
                    onChange={handleTextChange("enrollment_year")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    type="number"
                    label="Years of Active Practice / Experience"
                    value={formData.experience_years}
                    onChange={handleTextChange("experience_years")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    label="Chamber / Law Firm / Consultancy Name"
                    placeholder="e.g. Lex Juris Chambers / Independent Practice"
                    value={formData.chamber_firm_name}
                    onChange={handleTextChange("chamber_firm_name")}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ─── SECTION 4: PRACTICE JURISDICTIONS & SPECIALIZATIONS ─── */}
            <Box sx={{ p: 2.5, mb: 3, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography
                sx={{
                  fontSize: "0.825rem",
                  fontWeight: 900,
                  color: "#0f2942",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1.5,
                  pb: 0.8,
                  borderBottom: "1.5px solid #0f2942",
                }}
              >
                SECTION IV: JURISDICTION OF PRACTICE &amp; PRACTICE SPECIALIZATIONS
              </Typography>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 1 }}>
                  Designated Courts / Tribunals of Practice (Select all applicable):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {COURTS_OPTIONS.map((court) => {
                    const selected = formData.primary_courts.includes(court);
                    return (
                      <Chip
                        key={court}
                        label={court}
                        size="small"
                        onClick={() => toggleCourt(court)}
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderWidth: selected ? 2 : 1,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 1 }}>
                  Primary Legal / Professional Specialization Domains:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {PRACTICE_AREAS.map((area) => {
                    const selected = formData.practice_areas.includes(area);
                    return (
                      <Chip
                        key={area}
                        label={area}
                        size="small"
                        onClick={() => toggleArea(area)}
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderWidth: selected ? 2 : 1,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <TextField
                variant="standard"
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Brief Professional Bio &amp; Notable Mandates"
                placeholder="Summarize notable appearances, reported judgments, advisory transactions, or academic appointments..."
                value={formData.profile_summary}
                onChange={handleTextChange("profile_summary")}
              />
            </Box>

            {/* ─── SECTION 5: DOCUMENTARY EVIDENCE ─── */}
            <Box sx={{ p: 2.5, mb: 3, bgcolor: "#ffffff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography
                sx={{
                  fontSize: "0.825rem",
                  fontWeight: 900,
                  color: "#0f2942",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1.5,
                  pb: 0.8,
                  borderBottom: "1.5px solid #0f2942",
                }}
              >
                SECTION V: DOCUMENTARY CREDENTIALS ATTACHMENT
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: "1.5px dashed #94a3b8", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5 }}>
                      Bar Council ID / Certificate of Practice *
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                      PDF, JPG or PNG (Max 5MB)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {idFile ? idFile.name : "Attach Bar Council ID"}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setIdFile(e.target.files[0]);
                        }}
                      />
                    </Button>
                    {idFile && (
                      <Chip label="Attached" color="success" size="small" sx={{ mt: 1, display: "block", mx: "auto", height: 20 }} />
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: "1.5px dashed #94a3b8", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5 }}>
                      Curriculum Vitae / Professional CV
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                      Comprehensive profile in PDF format
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {cvFile ? cvFile.name : "Attach Professional CV"}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setCvFile(e.target.files[0]);
                        }}
                      />
                    </Button>
                    {cvFile && (
                      <Chip label="Attached" color="success" size="small" sx={{ mt: 1, display: "block", mx: "auto", height: 20 }} />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* ─── SECTION 6: STATUTORY AFFIDAVIT & SIGNATURE ─── */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 2,
                border: "2px solid #b45309",
                bgcolor: "#fffbeb",
                borderRadius: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.825rem",
                  fontWeight: 900,
                  color: "#78350f",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 18, color: "#b45309" }} />
                <span>SECTION VI: STATUTORY AFFIDAVIT &amp; PROFESSIONAL UNDERTAKING</span>
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: "#fed7aa" }} />

              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.8rem",
                  color: "#451a03",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  mb: 2,
                }}
              >
                &ldquo;I, {formData.full_name || "[Applicant]"}, solemnly declare and state on oath that the educational credentials,
                enrollment details, bar standing, and residential statements furnished hereinabove are true and accurate to the best of my knowledge and belief.
                I have neither been disbarred, suspended, nor convicted for moral turpitude by any Bar Council, High Court, or disciplinary tribunal.
                I undertake to uphold the statutory ethics, professional dignity, and pro bono legal aid charter of the International Consortium of Jurists.&rdquo;
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    color="primary"
                    required
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#78350f", fontSize: "0.85rem" }}>
                    I formally confirm, sign, and affirm this statutory declaration under electronic execution.
                  </Typography>
                }
              />

              <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed #d97706", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#92400e" }}>
                <span>Applicant Digital Affirmation: <strong>{formData.full_name || memberProfile.name}</strong></span>
                <span>Timestamp: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
              </Box>
            </Paper>

            {/* ─── SUBMIT BUTTONS ─── */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleModalClose}
                disabled={submitting}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Cancel / Return
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ShieldIcon />}
                sx={{
                  bgcolor: "#0f2942",
                  color: "#ffffff",
                  px: 4,
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  borderBottom: "3px solid #b45309",
                  boxShadow: "0 4px 14px rgba(15, 41, 66, 0.35)",
                  "&:hover": { bgcolor: "#1e3a5f" },
                }}
              >
                {submitting ? "Submitting Application..." : "Submit Official Empanelment Application"}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
