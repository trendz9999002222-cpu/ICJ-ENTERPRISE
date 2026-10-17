"use client";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import ConfiguredFormField from "@/components/form/ConfiguredFormField";
import { serviceService } from "@/services/public/publicServices";

type DynamicConfig = {
  citizen_fields: Array<{
    field_key: string;
    label: string;
    field_type: string;
    placeholder?: string;
    help_text?: string;
    is_required: boolean;
    display_order: number;
    options?: Array<{ label: string; value: string }>;
  }>;
  legal_matter_fields: Array<{
    id: string;
    field_key: string;
    label: string;
    field_type: string;
    required: boolean;
    options?: Array<{ label: string; value: string }>;
    display_order: number;
  }>;
  documents: Array<{
    id: string;
    name: string;
    document_key: string;
    description?: string;
    allowed_file_types: string[];
    max_file_size_mb: number;
    is_required: boolean;
    display_order: number;
  }>;
};

export default function SeekAssistancePage() {
  const [config, setConfig] = useState<DynamicConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    country: "India",
    preferred_contact: "Phone",
    urgency: "Medium",
  });
  const [files, setFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    serviceService
      .getSeekAssistanceConfig()
      .then((data) => {
        if (data) {
          setConfig(data);
        }
      })
      .finally(() => {
        setLoadingConfig(false);
      });
  }, []);

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setFormValues((prev) => {
      const next = { ...prev, [fieldKey]: value };

      // Cascading reset when Country changes
      if (fieldKey.toLowerCase().includes("country")) {
        Object.keys(prev).forEach((k) => {
          if (
            k.toLowerCase().includes("state") ||
            k.toLowerCase().includes("district") ||
            k.toLowerCase().includes("city")
          ) {
            next[k] = "";
          }
        });
      }
      // Cascading reset when State changes
      else if (fieldKey.toLowerCase().includes("state")) {
        Object.keys(prev).forEach((k) => {
          if (
            k.toLowerCase().includes("district") ||
            k.toLowerCase().includes("city")
          ) {
            next[k] = "";
          }
        });
      }
      return next;
    });
  };

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      ...formValues,
      full_name: formValues.full_name || "",
      email: formValues.email || "",
      mobile: formValues.mobile || formValues.mobile_number || "",
      preferred_contact: formValues.preferred_contact || "Phone",
      state_name: formValues.state_name || formValues.state || "",
      city_name: formValues.city_name || formValues.district || "",
      category: formValues.category || "",
      urgency: formValues.urgency || "Medium",
      problem_description: formValues.problem_description || "",
      files,
    };

    const res = await serviceService.submitSeekAssistance(payload);
    setSubmitting(false);
    if (res.success && res.data?.reference_id) {
      setSubmittedRefId(res.data.reference_id);
    } else {
      setErrorMessage("Failed to submit request. Please check all required fields and try again.");
    }
  };

  const citizenFields = config?.citizen_fields || [];
  const legalMatterFields = config?.legal_matter_fields || [];
  const documents = config?.documents || [];

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="Citizen Support Desk"
        title="Seek Legal Assistance"
        subtitle="Confidential legal intake portal connecting citizens with initial legal orientation, mediation options, and verified pro bono practitioners."
        breadcrumbs={[{ label: "Seek Assistance" }]}
        primaryAction={{ label: "Find a Professional Instead", href: "/professionals" }}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
        {submittedRefId ? (
          /* Success Screen */
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              border: "1px solid #bbf7d0",
              bgcolor: "#ffffff",
              textAlign: "center",
              maxWidth: 680,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#f0fdf4",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 36, color: "#16a34a" }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              Assistance Request Received
            </Typography>

            <Typography variant="body1" sx={{ color: "#475569", mb: 3 }}>
              Your matter has been registered under reference ID:
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                px: 3,
                py: 1.5,
                bgcolor: "#f8fafc",
                border: "2px dashed #2563eb",
                borderRadius: 2,
                color: "#2563eb",
                fontWeight: 900,
                fontSize: "1.25rem",
                letterSpacing: "0.05em",
                mb: 3,
              }}
            >
              {submittedRefId}
            </Box>

            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 480, mx: "auto", mb: 4, lineHeight: 1.6 }}>
              An ICJ legal associate will review your problem statement and contact you via your preferred channel (
              <strong>{formValues.preferred_contact || "Phone"}</strong>) within 24 to 48 business hours.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                sx={{ borderColor: "#cbd5e1", color: "#334155", textTransform: "none", fontWeight: 600 }}
              >
                Return to Home
              </Button>
              <Button
                component={Link}
                href="/services"
                variant="contained"
                sx={{ bgcolor: "#2563eb", textTransform: "none", fontWeight: 700 }}
              >
                Explore Legal Guides
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* Intake Form */
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4.5 },
                  borderRadius: 3.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                  Confidential Matter Intake Form
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 3.5 }}>
                  Please provide accurate information to help our legal panel assess your case.
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                  </Alert>
                )}

                {loadingConfig ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={36} sx={{ color: "#2563eb" }} />
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      {/* 1. CITIZEN / APPLICANT DETAILS (DYNAMIC FROM ADMIN TAB 1) */}
                      {citizenFields.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}
                          >
                            1. Citizen / Applicant Details
                          </Typography>

                          <Grid container spacing={2}>
                            {citizenFields.map((field) => (
                              <Grid key={field.field_key} size={{ xs: 12, sm: 6 }}>
                                <ConfiguredFormField
                                  field={field}
                                  value={formValues[field.field_key] ?? ""}
                                  values={formValues}
                                  onChange={(val) => handleFieldChange(field.field_key, val)}
                                />
                              </Grid>
                            ))}
                          </Grid>

                          <Divider />
                        </>
                      )}

                      {/* 2. LEGAL MATTER INFORMATION (DYNAMIC FROM ADMIN TAB 2) */}
                      {legalMatterFields.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}
                          >
                            2. Legal Matter Information
                          </Typography>

                          <Grid container spacing={2}>
                            {legalMatterFields.map((field) => {
                              const isTextarea = field.field_type === "textarea";
                              const isCategory = field.field_key === "category";
                              const isUrgency = field.field_key === "urgency";

                              const colSize = isTextarea
                                ? { xs: 12 }
                                : isCategory
                                ? { xs: 12, sm: 8 }
                                : isUrgency
                                ? { xs: 12, sm: 4 }
                                : { xs: 12, sm: 6 };

                              return (
                                <Grid key={field.field_key} size={colSize}>
                                  <ConfiguredFormField
                                    field={field}
                                    value={formValues[field.field_key] ?? ""}
                                    values={formValues}
                                    onChange={(val) => handleFieldChange(field.field_key, val)}
                                  />
                                </Grid>
                              );
                            })}
                          </Grid>

                          <Divider />
                        </>
                      )}

                      {/* 3. SUPPORTING DOCUMENTS (DYNAMIC FROM ADMIN TAB 3) */}
                      {documents.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}
                          >
                            3. Supporting Documents (Optional)
                          </Typography>

                          {documents.map((doc) => {
                            const allowedTypes = Array.isArray(doc.allowed_file_types)
                              ? doc.allowed_file_types.map((e) => e.toUpperCase()).join(", ")
                              : "PDF, DOCX, JPG, PNG";

                            return (
                              <Box
                                key={doc.id || doc.document_key}
                                sx={{
                                  p: 3,
                                  border: "2px dashed #cbd5e1",
                                  borderRadius: 2.5,
                                  textAlign: "center",
                                  bgcolor: "#f8fafc",
                                }}
                              >
                                <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: "#94a3b8", mb: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
                                  {allowedTypes} (Max {doc.max_file_size_mb || 5}MB)
                                </Typography>

                                <Button
                                  component="label"
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AttachFileIcon />}
                                  sx={{ borderColor: "#cbd5e1", color: "#2563eb", textTransform: "none", fontWeight: 600 }}
                                >
                                  Select Files
                                  <input type="file" hidden multiple onChange={handleMockFileUpload} />
                                </Button>

                                {files.length > 0 && (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 2, flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}
                                  >
                                    {files.map((name, idx) => (
                                      <Chip
                                        key={idx}
                                        label={name}
                                        size="small"
                                        sx={{ bgcolor: "#e2e8f0", fontSize: "0.75rem" }}
                                      />
                                    ))}
                                  </Stack>
                                )}
                              </Box>
                            );
                          })}
                        </>
                      )}

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{
                          bgcolor: "#2563eb",
                          color: "#ffffff",
                          fontWeight: 800,
                          py: 1.4,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "1rem",
                          boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                          "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                      >
                        {submitting ? <CircularProgress size={22} color="inherit" /> : "Submit Assistance Request"}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Sidebar Security & Guarantee info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                    <SecurityOutlinedIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Privacy & Data Confidentiality
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.85rem" }}>
                    All communications and uploaded documents are treated with institutional confidentiality. Your details
                    are shared only with authorized legal associates and assigned practitioners.
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    What Happens Next?
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      "1. Instant reference ID generation",
                      "2. Screening by legal research cell",
                      "3. Case classification & action plan",
                      "4. Empaneled expert coordination",
                    ].map((step, idx) => (
                      <Typography key={idx} variant="caption" sx={{ color: "#475569", fontWeight: 500 }}>
                        {step}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        <LegalDisclaimer />
      </Container>
    </Box>
  );
}
