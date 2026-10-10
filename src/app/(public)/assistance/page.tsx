"use client";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import { serviceService } from "@/services/public/publicServices";

const CATEGORIES = [
  "Property & Land Disputes",
  "Consumer Fraud & Grievances",
  "Family & Matrimonial Issues",
  "Cyber Crime & Digital Fraud",
  "Civil Recovery & Money Claims",
  "Labour & Employment Injustice",
  "Criminal Law Information & Bail",
  "RTI & Public Governance",
  "Government Scheme / Free Legal Aid",
  "Other Legal Queries",
];

export default function SeekAssistancePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [preferredContact, setPreferredContact] = useState("Phone");
  const [problemDescription, setProblemDescription] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      full_name: fullName,
      email: email,
      mobile: mobile,
      preferred_contact: preferredContact,
      state_name: stateName,
      city_name: cityName,
      category: category,
      urgency: urgency,
      problem_description: problemDescription,
    };
    const res = await serviceService.submitSeekAssistance(data);
    setSubmitting(false);
    if (res.success && res.data?.reference_id) {
      setSubmittedRefId(res.data.reference_id);
    } else {
      alert("Failed to submit request. Please try again.");
    }
  };

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
              <strong>{preferredContact}</strong>) within 24 to 48 business hours.
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

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Contact details */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                      1. Citizen / Applicant Details
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Full Name *"
                          fullWidth
                          size="small"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Email Address *"
                          fullWidth
                          size="small"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Mobile / WhatsApp Number *"
                          fullWidth
                          size="small"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Preferred Contact Method</InputLabel>
                          <Select
                            label="Preferred Contact Method"
                            value={preferredContact}
                            onChange={(e) => setPreferredContact(e.target.value)}
                          >
                            <MenuItem value="Phone">Phone Call</MenuItem>
                            <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                            <MenuItem value="Email">Email</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="State *"
                          fullWidth
                          size="small"
                          required
                          placeholder="e.g. Delhi, Maharashtra"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="District *"
                          fullWidth
                          size="small"
                          required
                          placeholder="e.g. Mumbai, Lucknow"
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Divider />

                    {/* Legal Matter Details */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                      2. Legal Matter Information
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Legal Subject Category *</InputLabel>
                          <Select
                            label="Legal Subject Category *"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {CATEGORIES.map((cat) => (
                              <MenuItem key={cat} value={cat}>
                                {cat}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Urgency Level</InputLabel>
                          <Select
                            label="Urgency Level"
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value)}
                          >
                            <MenuItem value="Low">Low (General Query)</MenuItem>
                            <MenuItem value="Medium">Medium (Notice Received)</MenuItem>
                            <MenuItem value="High">High (Court Hearing Pending)</MenuItem>
                            <MenuItem value="Emergency">Emergency (Immediate Arrest/Eviction)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Describe Your Legal Problem in Detail *"
                          fullWidth
                          multiline
                          rows={4}
                          required
                          placeholder="Provide dates, parties involved, previous actions taken, and the specific relief or guidance you are seeking..."
                          value={problemDescription}
                          onChange={(e) => setProblemDescription(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Divider />

                    {/* Document Attachments */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                      3. Supporting Documents (Optional)
                    </Typography>

                    <Box
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
                        Attach notices, agreements, FIRs, or relevant receipts
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
                        PDF, DOCX, JPG, PNG (Mock upload for demonstration)
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
                        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
                          {files.map((name, idx) => (
                            <Chip key={idx} label={name} size="small" sx={{ bgcolor: "#e2e8f0", fontSize: "0.75rem" }} />
                          ))}
                        </Stack>
                      )}
                    </Box>

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
