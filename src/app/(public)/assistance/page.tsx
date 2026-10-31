"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ShieldIcon from "@mui/icons-material/Shield";
import GavelIcon from "@mui/icons-material/Gavel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedIcon from "@mui/icons-material/Verified";
import PrintIcon from "@mui/icons-material/Print";
import HeadsetIcon from "@mui/icons-material/Headset";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import PhoneInputWithCountry from "@/components/ui/PhoneInputWithCountry";
import { serviceService } from "@/services/public/publicServices";
import { env } from "@/config/env";

const LEGAL_CATEGORIES_DEFAULT = [
  "Civil Litigation & Property Disputes",
  "Criminal Defense, FIR & Bail Matters",
  "Corporate, Commercial & Contracts",
  "Family, Divorce & Matrimonial Issues",
  "Consumer Protection & Defective Services",
  "Labour, Employment & Service Matters",
  "Constitutional & Fundamental Rights",
  "Cyber Crime & Online Financial Fraud",
  "Taxation, GST & Financial Inquiries",
  "General Legal Advice & Mediation",
];

const HELP_TYPES_DEFAULT = [
  "Legal Advice / Initial Consultation",
  "Court Representation & Litigation",
  "Legal Drafting & Notice Preparation",
  "Mediation & Amicable Dispute Settlement",
  "Pro Bono Legal Aid Assistance",
];

const PREFERRED_CONTACTS = [
  "Phone Call",
  "Email",
  "WhatsApp",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to disclose",
];

const URGENCY_LEVELS_DEFAULT = [
  { value: "Low", label: "Low", desc: "General informational inquiry, no deadline" },
  { value: "Medium", label: "Medium", desc: "Requires legal review within 1 to 2 weeks" },
  { value: "High", label: "High", desc: "Hearing or statutory limitation within 3 days" },
  { value: "Critical", label: "Critical", desc: "Arrest imminent, custodial matter, urgent stay" },
];

const INDIAN_STATES = [
  "Delhi",
  "Maharashtra",
  "Uttar Pradesh",
  "Haryana",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Bihar",
  "Madhya Pradesh",
  "Kerala",
  "Telangana",
  "Andhra Pradesh",
  "Other State / Union Territory",
];

const ASSISTANCE_DOCUMENT_SX = {
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

export default function SeekAssistancePage() {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "1995-01-01",
    state_name: "Delhi",
    city_name: "New Delhi",
    pincode: "",
    address: "",
    category: "Civil Litigation & Property Disputes",
    help_type: "Legal Advice / Initial Consultation",
    preferred_contact: "Phone Call",
    urgency: "Medium",
    problem_description: "",
  });

  // Profile Picture / Passport Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Dynamic configuration loaded from Admin Backend
  const [categoriesList, setCategoriesList] = useState<string[]>(LEGAL_CATEGORIES_DEFAULT);
  const [helpTypesList, setHelpTypesList] = useState<string[]>(HELP_TYPES_DEFAULT);
  const [urgencyLevelsList, setUrgencyLevelsList] = useState(URGENCY_LEVELS_DEFAULT);
  const [dynamicDocsList, setDynamicDocsList] = useState<any[]>([]);

  // Evidence Documents
  const [docFile1, setDocFile1] = useState<File | null>(null);
  const [docFile2, setDocFile2] = useState<File | null>(null);

  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [isMobileValid, setIsMobileValid] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  // Load Admin Configured Form Fields on mount
  useEffect(() => {
    async function fetchDynamicFormConfig() {
      try {
        const res = await fetch(`${env.apiUrl}/services/form-config/`);
        if (res.ok) {
          const json = await res.json();
          const { legal_matter_fields, documents } = json?.data || {};

          if (Array.isArray(legal_matter_fields) && legal_matter_fields.length > 0) {
            // Find category field options if configured by admin
            const catField = legal_matter_fields.find((f: any) => f.field_key === "category");
            if (catField?.options && Array.isArray(catField.options) && catField.options.length > 0) {
              const opts = catField.options.map((o: any) => (typeof o === "string" ? o : o.label || o.value));
              setCategoriesList(opts);
            }

            // Find urgency field options if configured by admin
            const urgField = legal_matter_fields.find((f: any) => f.field_key === "urgency");
            if (urgField?.options && Array.isArray(urgField.options) && urgField.options.length > 0) {
              const urgOpts = urgField.options.map((o: any) => {
                if (typeof o === "string") return { value: o, label: o, desc: "" };
                return { value: o.value || o.label, label: o.label || o.value, desc: o.desc || "" };
              });
              setUrgencyLevelsList(urgOpts);
            }
          }

          if (Array.isArray(documents) && documents.length > 0) {
            setDynamicDocsList(documents);
          }
        }
      } catch (err) {
        console.warn("Using resilient static form configuration fallback", err);
      }
    }
    fetchDynamicFormConfig();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photograph must be under 5MB in size.");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (errorMessage) setErrorMessage(null);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleFieldChange = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!formData.full_name.trim()) {
      setErrorMessage("Please enter your full legal name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please provide a valid email address for case communications.");
      return;
    }
    if (!formData.mobile.trim()) {
      setErrorMessage("Please enter your mobile contact number with country code.");
      return;
    }
    if (!isMobileValid) {
      setErrorMessage("Please enter a valid mobile number with correct starting digits for your country.");
      return;
    }
    if (!formData.city_name.trim()) {
      setErrorMessage("Please enter your City / District.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage("Please provide your residential / correspondence address.");
      return;
    }
    if (!formData.problem_description.trim() || formData.problem_description.trim().length < 20) {
      setErrorMessage("Please provide at least 20 characters describing your legal concern or dispute.");
      return;
    }
    if (!declarationAccepted) {
      setErrorMessage("Please affirm and accept the statutory declaration undertaking.");
      return;
    }

    setSubmitting(true);

    try {
      // Calculate age from DOB
      let calculatedAge = 28;
      if (formData.date_of_birth) {
        const birth = new Date(formData.date_of_birth);
        if (!isNaN(birth.getTime())) {
          const diff = Date.now() - birth.getTime();
          calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
      }

      // Prepare Multipart FormData
      const fd = new FormData();
      fd.append("full_name", formData.full_name.trim());
      fd.append("email", formData.email.trim());
      fd.append("mobile", formData.mobile.trim());
      fd.append("gender", formData.gender);
      fd.append("date_of_birth", formData.date_of_birth);
      fd.append("calculated_age", String(calculatedAge));
      fd.append("state_name", formData.state_name);
      fd.append("city_name", formData.city_name.trim());
      fd.append("pincode", formData.pincode.trim());
      fd.append("address", formData.address.trim());
      fd.append("category", formData.category);
      fd.append("matter_type", formData.category);
      fd.append("help_type", formData.help_type);
      fd.append("preferred_contact", formData.preferred_contact);
      fd.append("urgency", formData.urgency);
      fd.append("problem_description", formData.problem_description.trim());
      fd.append("declaration_accepted", "true");

      // Passport Photograph / Profile Picture
      if (photoFile) {
        fd.append("profile_picture", photoFile);
        fd.append("photo", photoFile);
        fd.append("document_passport_photograph", photoFile);
      }

      if (docFile1) {
        fd.append("document_relevant_papers", docFile1);
      }
      if (docFile2) {
        fd.append("document_additional_evidence", docFile2);
      }

      const res = await fetch(`${env.apiUrl}/services/seek-assistance/`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (res.ok && (json?.data?.reference_id || json?.reference_id)) {
        setSubmittedRefId(json?.data?.reference_id || json?.reference_id);
      } else {
        // Fallback with serviceService JSON
        const plainPayload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          calculated_age: calculatedAge,
          preferred_contact: formData.preferred_contact,
          address: formData.address.trim(),
          state_name: formData.state_name,
          city_name: formData.city_name.trim(),
          pincode: formData.pincode.trim(),
          category: formData.category,
          matter_type: formData.category,
          help_type: formData.help_type,
          urgency: formData.urgency,
          problem_description: formData.problem_description.trim(),
          declaration_accepted: true,
        };
        const fallbackRes = await serviceService.submitSeekAssistance(plainPayload);
        if (fallbackRes.success && (fallbackRes.data?.reference_id || (fallbackRes.data as any)?.id)) {
          setSubmittedRefId(fallbackRes.data?.reference_id || (fallbackRes.data as any)?.id);
        } else {
          setErrorMessage(
            json?.message ||
              json?.detail ||
              fallbackRes.error ||
              "Submission could not be completed. Please review all fields and try again."
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit legal request. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f1f5f9", pb: 10 }}>
      <PageHeader
        badge="Citizen Legal Aid Desk"
        title="Seek Legal Assistance"
        subtitle="Confidential institutional legal intake portal connecting citizens with preliminary legal orientation, dispute mediation, and verified pro bono practitioners."
        breadcrumbs={[{ label: "Seek Assistance" }]}
        primaryAction={{ label: "Track Existing Case", href: "/track-case" }}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        {submittedRefId ? (
          /* Official Acknowledgment Receipt */
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 2,
              border: "3px double #0f2942",
              bgcolor: "#ffffff",
              textAlign: "center",
              maxWidth: 760,
              mx: "auto",
              boxShadow: "0 12px 36px rgba(15,41,66,0.14)",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#f0fdf4",
                border: "2px solid #86efac",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 36, color: "#16a34a" }} />
            </Box>

            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: { xs: "1.3rem", sm: "1.6rem" },
                fontWeight: 900,
                color: "#0f2942",
                mb: 0.5,
              }}
            >
              Application Formally Registered
            </Typography>

            <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
              Your citizen legal intake has been assigned an official Registry Reference ID:
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                px: 3.5,
                py: 1.2,
                bgcolor: "#eff6ff",
                border: "2px dashed #1e40af",
                borderRadius: 2,
                color: "#1e3a8a",
                fontWeight: 900,
                fontSize: "1.35rem",
                letterSpacing: "0.06em",
                mb: 3,
              }}
            >
              {submittedRefId}
            </Box>

            <Grid container spacing={2} sx={{ maxWidth: 540, mx: "auto", mb: 3, textAlign: "left" }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                  LEGAL CATEGORY
                </Typography>
                <Typography sx={{ fontWeight: 700, color: "#1e3a8a", fontSize: "0.85rem" }}>
                  {formData.category}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                  FILING STATUS
                </Typography>
                <Chip label="UNDER REVIEW" color="warning" size="small" sx={{ fontWeight: 800, fontSize: "0.7rem", height: 22 }} />
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 540, mx: "auto", mb: 4, lineHeight: 1.6 }}>
              An empaneled legal research associate will review your problem statement within 24 to 48 business hours.
              You can track your case progress at any time using your Case Reference ID.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ textTransform: "none", fontWeight: 700, color: "#0f2942", borderColor: "#0f2942" }}
              >
                Print Official Slip
              </Button>
              <Button
                component={Link}
                href="/track-case"
                variant="contained"
                sx={{ bgcolor: "#0f2942", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#1e3a5f" } }}
              >
                Track Case Progress
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* SINGLE-STEP OFFICIAL PRINTABLE INTAKE DOCUMENT */
          <Box sx={{ maxWidth: 960, mx: "auto" }}>
            {/* Top Navy Ribbon */}
            <Box
              sx={{
                bgcolor: "#0f2942",
                color: "#ffffff",
                py: 1.2,
                px: { xs: 2, sm: 3 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottom: "2px solid #b45309",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ShieldIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  OFFICIAL INSTITUTIONAL REGISTRY INTAKE • ICJ CITIZEN ASSISTANCE DESK 2026
                </Typography>
              </Stack>
              <Chip
                size="small"
                label="CONFIDENTIAL INTAKE"
                sx={{
                  bgcolor: "#1e3a5f",
                  color: "#93c5fd",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            </Box>

            {/* Main Affidavit Form Paper */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#fdfdfc",
                border: "3px double #0f2942",
                borderTop: "none",
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                p: { xs: 2.5, sm: 4.5 },
                boxShadow: "0 12px 40px rgba(15, 41, 66, 0.12)",
                position: "relative",
              }}
            >
              {/* Formal Corner Marks */}
              <Box sx={{ position: "absolute", top: 12, left: 14, fontSize: "1.4rem", color: "#0f2942", lineHeight: 1 }}>⌜</Box>
              <Box sx={{ position: "absolute", top: 12, right: 14, fontSize: "1.4rem", color: "#0f2942", lineHeight: 1 }}>⌝</Box>

              {/* Form Header */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 900,
                    color: "#0f2942",
                    fontSize: { xs: "1.15rem", sm: "1.4rem" },
                    letterSpacing: "0.05em",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  INTERNATIONAL CONSORTIUM OF JURISTS
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#b45309",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    mb: 1.5,
                  }}
                >
                  Statutory Non-Profit Legal Guild • Citizen Legal Aid Directorate
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 800,
                    fontSize: { xs: "0.72rem", sm: "0.85rem", md: "0.95rem" },
                    color: "#1e3a8a",
                    mt: 1.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    borderTop: "1px dashed #cbd5e1",
                    borderBottom: "1px dashed #cbd5e1",
                    py: 0.75,
                    px: 1.5,
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  APPLICATION FOR CONFIDENTIAL CITIZEN LEGAL AID &amp; DISPUTE RESOLUTION
                </Typography>

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
                  <span><strong>Filing Type:</strong> Citizen Legal Assistance</span>
                  <span>•</span>
                  <span><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
                  <span>•</span>
                  <span><strong>Registry Desk:</strong> Direct Intake Portal</span>
                </Stack>
              </Box>

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              )}

              {/* SINGLE CONTINUOUS FORM */}
              <Box component="form" onSubmit={handleSubmit} sx={ASSISTANCE_DOCUMENT_SX}>
                {/* ─── SECTION 1: APPLICANT IDENTITY & CONTACT INFORMATION ─── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    bgcolor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#0f2942",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 2.5,
                      pb: 0.8,
                      borderBottom: "1.5px solid #0f2942",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                    <span>SECTION I: APPLICANT IDENTITY &amp; CONTACT INFORMATION</span>
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Left Block: Applicant Details */}
                    <Grid size={{ xs: 12, md: 9 }}>
                      <Grid container spacing={3}>
                        {/* Row 1: Full Name & Email */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            label="Full Name of Applicant"
                            placeholder="e.g. Ramesh Kumar"
                            value={formData.full_name}
                            onChange={handleFieldChange("full_name")}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            type="email"
                            label="Registered Email Address"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleFieldChange("email")}
                            required
                          />
                        </Grid>

                        {/* Row 2: Mobile Number & Date of Birth */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <PhoneInputWithCountry
                            variant="standard"
                            label="Mobile Number"
                            value={formData.mobile}
                            required
                            onChange={(fullVal, _nationalVal, _code, isValid) => {
                              setFormData((prev) => ({ ...prev, mobile: fullVal }));
                              setIsMobileValid(isValid);
                              if (errorMessage) setErrorMessage(null);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            type="date"
                            label="Date of Birth"
                            value={formData.date_of_birth}
                            onChange={handleFieldChange("date_of_birth")}
                            required
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Right Block: Official Passport Photograph Box */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 145,
                          border: photoPreview ? "2px solid #0f2942" : "1.5px dashed #0f2942",
                          borderRadius: 1,
                          bgcolor: "#f8fafc",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#b45309",
                            bgcolor: "#f1f5f9",
                          },
                        }}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {photoPreview ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photoPreview}
                              alt="Applicant Passport Photo"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto();
                              }}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.6)",
                                color: "#ffffff",
                                p: 0.4,
                                "&:hover": { bgcolor: "#dc2626" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </>
                        ) : (
                          <Box sx={{ textAlign: "center", p: 1 }}>
                            <AddAPhotoIcon sx={{ color: "#64748b", fontSize: 28, mb: 0.5 }} />
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                fontWeight: 800,
                                color: "#0f2942",
                                textTransform: "uppercase",
                                lineHeight: 1.2,
                                display: "block",
                              }}
                            >
                              Affix Passport Photograph
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "#64748b", display: "block", mt: 0.5 }}>
                              JPG/PNG Max 5MB
                            </Typography>
                          </Box>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                        />
                      </Box>
                      <Button
                        size="small"
                        onClick={() => photoInputRef.current?.click()}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#0f2942",
                          mt: 0.8,
                          py: 0.2,
                        }}
                      >
                        {photoPreview ? "Change Photo" : "+ Upload Photo"}
                      </Button>
                    </Grid>

                    {/* Row 3: Gender, State, City, PIN Code */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="gender-select-label">Gender</InputLabel>
                        <Select
                          variant="standard"
                          labelId="gender-select-label"
                          value={formData.gender}
                          label="Gender"
                          onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                        >
                          {GENDER_OPTIONS.map((g) => (
                            <MenuItem key={g} value={g}>
                              {g}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="state-select-label">State / Union Territory</InputLabel>
                        <Select
                          variant="standard"
                          labelId="state-select-label"
                          value={formData.state_name}
                          label="State / Union Territory"
                          onChange={(e) => setFormData((prev) => ({ ...prev, state_name: e.target.value }))}
                        >
                          {INDIAN_STATES.map((st) => (
                            <MenuItem key={st} value={st}>
                              {st}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="City / District"
                        placeholder="e.g. New Delhi"
                        value={formData.city_name}
                        onChange={handleFieldChange("city_name")}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="Postal Code (PIN)"
                        placeholder="e.g. 110001"
                        value={formData.pincode}
                        onChange={handleFieldChange("pincode")}
                        slotProps={{ htmlInput: { maxLength: 6 } }}
                      />
                    </Grid>

                    {/* Row 4: 100% full width Address */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="Residential / Correspondence Address"
                        placeholder="House/Flat No., Street, Locality or Landmark"
                        value={formData.address}
                        onChange={handleFieldChange("address")}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ─── SECTION 2: LEGAL MATTER CLASSIFICATION & STATEMENT OF GRIEVANCE ─── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    bgcolor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#0f2942",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 2.5,
                      pb: 0.8,
                      borderBottom: "1.5px solid #0f2942",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <GavelIcon sx={{ fontSize: 16, color: "#1e3a8a" }} />
                    <span>SECTION II: LEGAL MATTER CLASSIFICATION &amp; STATEMENT OF GRIEVANCE</span>
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Row 1: Category & Relief */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="category-select-label">Empanelment Wing / Legal Category</InputLabel>
                        <Select
                          variant="standard"
                          labelId="category-select-label"
                          value={formData.category}
                          label="Empanelment Wing / Legal Category"
                          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        >
                          {categoriesList.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="help-type-label">Specific Relief / Assistance Required</InputLabel>
                        <Select
                          variant="standard"
                          labelId="help-type-label"
                          value={formData.help_type}
                          label="Specific Relief / Assistance Required"
                          onChange={(e) => setFormData((prev) => ({ ...prev, help_type: e.target.value }))}
                        >
                          {helpTypesList.map((ht) => (
                            <MenuItem key={ht} value={ht}>
                              {ht}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Row 2: Communication Mode & Urgency Level */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="contact-pref-label">Preferred Communication Mode</InputLabel>
                        <Select
                          variant="standard"
                          labelId="contact-pref-label"
                          value={formData.preferred_contact}
                          label="Preferred Communication Mode"
                          onChange={(e) => setFormData((prev) => ({ ...prev, preferred_contact: e.target.value }))}
                        >
                          {PREFERRED_CONTACTS.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="urgency-label">Matter Urgency Level</InputLabel>
                        <Select
                          variant="standard"
                          labelId="urgency-label"
                          value={formData.urgency}
                          label="Matter Urgency Level"
                          onChange={(e) => setFormData((prev) => ({ ...prev, urgency: e.target.value }))}
                        >
                          {urgencyLevelsList.map((u) => (
                            <MenuItem key={u.value} value={u.value}>
                              {u.label} {u.desc ? `— ${u.desc}` : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Row 3: 100% full width multiline grievance */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        label="Detailed Statement of Facts / Grievance"
                        placeholder="Please outline the factual background, opposing parties (if known), dates, FIR/police reference (if any), and specific legal remedy or aid sought..."
                        value={formData.problem_description}
                        onChange={handleFieldChange("problem_description")}
                        required
                        helperText="Minimum 20 characters explaining the legal dispute or relief required."
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ─── SECTION 3: SUPPORTING DOCUMENTARY EVIDENCE ATTACHMENT (OPTIONAL) ─── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    bgcolor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#0f2942",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 2.5,
                      pb: 0.8,
                      borderBottom: "1.5px solid #0f2942",
                    }}
                  >
                    SECTION III: SUPPORTING DOCUMENTARY EVIDENCE ATTACHMENT (OPTIONAL)
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, border: "1.5px dashed #94a3b8", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5 }}>
                          {dynamicDocsList[0]?.name || "Primary Document (Notice / Complaint / Agreement)"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                          PDF, JPG, PNG or DOCX (Max 10MB)
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                          sx={{ textTransform: "none", fontWeight: 700, color: "#0f2942", borderColor: "#94a3b8" }}
                        >
                          {docFile1 ? docFile1.name : "Attach Primary File"}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setDocFile1(e.target.files[0]);
                            }}
                          />
                        </Button>
                        {docFile1 && (
                          <Chip label="Attached" color="success" size="small" sx={{ mt: 1, display: "block", mx: "auto", height: 20 }} />
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, border: "1.5px dashed #94a3b8", borderRadius: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5 }}>
                          {dynamicDocsList[1]?.name || "Additional Document / Evidence"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                          Any supporting proof or correspondence
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                          sx={{ textTransform: "none", fontWeight: 700, color: "#0f2942", borderColor: "#94a3b8" }}
                        >
                          {docFile2 ? docFile2.name : "Attach Additional File"}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setDocFile2(e.target.files[0]);
                            }}
                          />
                        </Button>
                        {docFile2 && (
                          <Chip label="Attached" color="success" size="small" sx={{ mt: 1, display: "block", mx: "auto", height: 20 }} />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* ─── SECTION 4: STATUTORY CITIZEN DECLARATION & FORMAL AFFIRMATION ─── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    border: "2px solid #b45309",
                    bgcolor: "#fffbeb",
                    borderRadius: "14px",
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
                    <span>SECTION IV: STATUTORY CITIZEN DECLARATION &amp; FORMAL AFFIRMATION</span>
                  </Typography>
                  <Divider sx={{ mb: 1.5, borderColor: "#fed7aa" }} />

                  <Typography
                    sx={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.825rem",
                      color: "#451a03",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                      mb: 2,
                    }}
                  >
                    &ldquo;I, {formData.full_name || "[Applicant]"}, solemnly affirm that the facts and statement of grievance
                    furnished hereinabove are true and accurate to the best of my knowledge and belief.
                    I authorize the International Consortium of Jurists to review my matter, conduct preliminary screening,
                    and facilitate contact with empaneled legal professionals or mediation officers.&rdquo;
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
                        I formally affirm and authorize this citizen legal assistance request under electronic execution.
                      </Typography>
                    }
                  />

                  <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed #d97706", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#92400e" }}>
                    <span>Citizen Digital Affirmation: <strong>{formData.full_name || "Applicant"}</strong></span>
                    <span>Execution Timestamp: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
                  </Box>
                </Paper>

                {/* ─── SUBMIT BUTTON ─── */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ShieldIcon />}
                    sx={{
                      bgcolor: "#0f2942",
                      color: "#ffffff",
                      px: 5,
                      py: 1.4,
                      borderRadius: 1.5,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      textTransform: "none",
                      borderBottom: "3px solid #b45309",
                      boxShadow: "0 4px 14px rgba(15, 41, 66, 0.35)",
                      "&:hover": { bgcolor: "#1e3a5f" },
                    }}
                  >
                    {submitting ? "Registering Legal Assistance Request..." : "Submit Citizen Legal Assistance Request"}
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Institutional Information & Process Highlights Below Document */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1.5px solid #0f2942",
                      bgcolor: "#ffffff",
                      height: "100%",
                      boxShadow: "0 4px 14px rgba(15,41,66,0.06)",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                      <SecurityOutlinedIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f2942" }}>
                        Institutional Confidentiality
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.6, display: "block" }}>
                      All communications, statements of grievance, and proofs are protected under legal aid confidentiality.
                      Details are accessible solely to assigned panel advocates.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid #cbd5e1",
                      bgcolor: "#ffffff",
                      height: "100%",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f2942", mb: 1 }}>
                      Intake Processing Protocol
                    </Typography>
                    <Stack spacing={0.6}>
                      {[
                        "1. Case Reference ID Issued Instantly",
                        "2. Scrutiny by Legal Cell (24-48 hrs)",
                        "3. Orientation & Action Plan Formulated",
                        "4. Panel Advocate Empanelment Linkage",
                      ].map((item, idx) => (
                        <Typography key={idx} variant="caption" sx={{ color: "#1e3a8a", fontWeight: 700, display: "block" }}>
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: "1px solid #fed7aa",
                      borderRadius: 2,
                      bgcolor: "#fffbeb",
                      height: "100%",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                      <HeadsetIcon sx={{ color: "#b45309", fontSize: 24 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#78350f" }}>
                        Citizen Legal Aid Desk
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#92400e", display: "block", fontWeight: 700 }}>
                      Toll-Free Helpline: +91-9999002222
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#92400e", display: "block" }}>
                      Direct Email: assistance@icj.org.in
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 5 }}>
          <LegalDisclaimer />
        </Box>
      </Container>
    </Box>
  );
}
