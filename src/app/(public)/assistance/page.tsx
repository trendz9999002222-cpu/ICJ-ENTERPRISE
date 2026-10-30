"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import DynamicJsonForm, { type FormSchema } from "@/components/form/DynamicJsonForm";
import seekAssistanceSchema from "@/config/forms/seek-assistance.json";
import { serviceService } from "@/services/public/publicServices";

export default function SeekAssistancePage() {
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setErrorMessage(null);

    // Calculate age if date_of_birth is present
    let calculatedAge = 25;
    if (values.date_of_birth && typeof values.date_of_birth === "string") {
      const birth = new Date(values.date_of_birth);
      if (!isNaN(birth.getTime())) {
        const diff = Date.now() - birth.getTime();
        calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }
    }

    const payload = {
      ...values,
      full_name: values.full_name || "",
      email: values.email || "",
      mobile: values.mobile || values.mobile_number || "",
      date_of_birth: values.date_of_birth || "1995-01-01",
      calculated_age: calculatedAge,
      preferred_contact: values.preferred_contact || "Email",
      state_name: values.state_name || values.state || "Delhi",
      city_name: values.city_name || values.district || "New Delhi",
      category: values.category || "Civil Matter",
      urgency: values.urgency || "Medium",
      problem_description: values.problem_description || "",
      declaration_accepted: Boolean(values.declaration_accepted ?? true),
      files: [],
    };

    const res = await serviceService.submitSeekAssistance(payload);
    if (res.success && (res.data?.reference_id || (res.data as any)?.case_reference || (res.data as any)?.id)) {
      const ref = res.data?.reference_id || (res.data as any)?.case_reference || (res.data as any)?.id;
      setSubmittedRefId(ref);
    } else {
      throw new Error(res.error || "Failed to submit request. Please check all fields and try again.");
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="Citizen Support Desk"
        title="Seek Legal Assistance"
        subtitle="Confidential legal intake portal connecting citizens with initial legal orientation, mediation options, and verified pro bono practitioners."
        breadcrumbs={[{ label: "Seek Assistance" }]}
        primaryAction={{ label: "Track Existing Case", href: "/track-case" }}
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
              Your matter has been registered under Case Reference ID:
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
              An ICJ legal associate will review your problem statement within 24 to 48 business hours.
              You can track your case progress at any time using your Reference ID.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
              <Button
                component={Link}
                href="/track-case"
                variant="contained"
                sx={{ bgcolor: "#2563eb", textTransform: "none", fontWeight: 700 }}
              >
                Track This Case
              </Button>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                sx={{ borderColor: "#cbd5e1", color: "#334155", textTransform: "none", fontWeight: 600 }}
              >
                Return to Home
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* Intake Form with DynamicJsonForm */
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
                  Please complete the steps below to submit your legal assistance request.
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                  </Alert>
                )}

                <DynamicJsonForm
                  schema={seekAssistanceSchema as unknown as FormSchema}
                  onSubmit={handleSubmit}
                  submitLabel="Submit Legal Assistance Request"
                  showSummaryStep={true}
                />
              </Paper>
            </Grid>

            {/* Sidebar Security & Information */}
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
                      Privacy &amp; Data Confidentiality
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
