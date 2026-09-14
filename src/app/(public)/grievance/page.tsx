"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SendIcon from "@mui/icons-material/Send";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageHeader from "@/components/features/public/PageHeader";
import { grievanceService } from "@/services/public";

const GRIEVANCE_CATEGORIES = [
  "Professional Misconduct by Advocate",
  "Service Quality Complaint",
  "Unauthorized Practice of Law",
  "Fee Overcharging / Billing Dispute",
  "Violation of Client Confidentiality",
  "Discrimination / Harassment",
  "Administrative / Registry Complaint",
  "Other / General Grievance",
];

export default function GrievancePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState(GRIEVANCE_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [againstEntity, setAgainstEntity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ticketId: string;
    status: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile || !subject || !description) return;
    setSubmitting(true);
    try {
      const res = await grievanceService.submitGrievance({
        fullName,
        email,
        mobile,
        category,
        subject,
        description,
        againstEntity,
      });
      setResult(res);
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Grievance Submission & Ombudsman Portal"
        subtitle="Submit formal complaints against practitioners, institutions, or ICJ service conduct. Every grievance is handled confidentially by our Independent Ombudsman Cell."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Grievance" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Grid container spacing={4}>
          {/* Grievance Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 3,
              }}
            >
              {result ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "#ecfdf5",
                      color: "#059669",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                    Grievance Formally Registered
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#475569", maxWidth: 540, mx: "auto", mb: 3 }}>
                    {result.message}
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-block",
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      p: 3,
                      borderRadius: 2,
                      mb: 4,
                      textAlign: "left",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Grievance Ticket ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#2563eb", letterSpacing: 0.5, mt: 0.5 }}>
                      {result.ticketId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#059669", fontWeight: 600, mt: 0.5 }}>
                      {result.status}
                    </Typography>
                  </Box>

                  <div>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setResult(null);
                        setSubject("");
                        setDescription("");
                        setFullName("");
                        setEmail("");
                        setMobile("");
                        setAgainstEntity("");
                      }}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Submit Another Grievance
                    </Button>
                  </div>
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      Formal Grievance Submission
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                      Please provide complete and accurate information. Your submission is treated with full confidentiality.
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Your Full Legal Name"
                        placeholder="e.g. Anjali Singh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address (for acknowledgement)"
                        placeholder="anjali.singh@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Mobile Phone Number"
                        placeholder="+91 98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Grievance Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        {GRIEVANCE_CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Name of Person / Entity the Grievance is Against (if applicable)"
                        placeholder="e.g. Adv. Ramesh Kumar Gupta / ICJ Northern Chapter Registry"
                        value={againstEntity}
                        onChange={(e) => setAgainstEntity(e.target.value)}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Grievance Subject Line"
                        placeholder="Brief, specific subject identifying the complaint"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Detailed Description of Grievance"
                        placeholder="Provide a complete chronological account including dates, nature of incident, witnesses if any, previous correspondence, and desired resolution..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        slotProps={{ htmlInput: { minLength: 100 } }}
                        helperText="Minimum 100 characters. Include all relevant facts and timelines."
                      />
                    </Grid>

                    <Grid size={12}>
                      <Alert severity="warning" sx={{ bgcolor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
                        Filing a false, vexatious, or malicious grievance is a disciplinary offence under the ICJ Code of Conduct and may attract adverse action.
                      </Alert>
                    </Grid>

                    <Grid size={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        sx={{
                          py: 1.5,
                          px: 4,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "1rem",
                          bgcolor: "#2563eb",
                          "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                      >
                        {submitting ? "Submitting Grievance..." : "Submit Formal Grievance"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Card>
          </Grid>

          {/* Sidebar Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                  <ShieldIcon sx={{ color: "#2563eb", fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Ombudsman Cell
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, mb: 2 }}>
                  All grievances are reviewed by an independent three-member Ombudsman Committee with authority to summon, investigate, and recommend disciplinary action.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                  {["Anonymous reporting available", "15-day acknowledgement guarantee", "90-day resolution SLA", "Appeal mechanism available"].map((item, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.4 }}>
                      <ListItemIcon sx={{ minWidth: 22 }}>
                        <CheckCircleIcon sx={{ fontSize: 15, color: "#059669" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155" } } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                  <LockIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Data Confidentiality
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                  Complainant identity is not disclosed to the respondent without prior written consent unless mandated by disciplinary proceedings.
                </Typography>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                  <SupportAgentIcon sx={{ color: "#059669", fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Need Help Filing?
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, mb: 2 }}>
                  If you need assistance drafting or filing your grievance, contact our Citizen Assistance Helpdesk.
                </Typography>
                <Chip
                  label="ombudsman@icj-india.org"
                  size="small"
                  sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontWeight: 600 }}
                />
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
