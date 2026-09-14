"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PublicIcon from "@mui/icons-material/Public";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SendIcon from "@mui/icons-material/Send";
import PageHeader from "@/components/features/public/PageHeader";
import { volunteerService, membershipService } from "@/services/public";
import type { VolunteerProgram } from "@/types/public";

export default function VolunteerPage() {
  const [programs, setPrograms] = useState<VolunteerProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [hours, setHours] = useState("4 - 8 Hours");
  const [sop, setSop] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceId: string;
    status: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    membershipService.listVolunteers().then((data) => {
      setPrograms(data);
      setSelectedProgram((current) =>
        data.some((p) => p.id === current) ? current : data[0]?.id ?? "",
      );
      setLoading(false);
    });
  }, []);

  const handleSelectProgram = (programId: string) => {
    setSelectedProgram(programId);
    const formEl = document.getElementById("volunteer-application-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile) return;
    setSubmitting(true);
    try {
      const res = await volunteerService.submitApplication({
        fullName,
        email,
        mobile,
        city,
        state,
        programId: selectedProgram,
        statementOfPurpose: sop,
        hoursAvailablePerWeek: hours,
      });
      setSubmissionResult(res);
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Pro Bono & Civic Volunteer Network"
        subtitle="Contribute your legal acumen, research capabilities, translation skills, and civic passion to bridge the justice divide across India."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Volunteer" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Volunteer Benefits Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              icon: <WorkspacePremiumIcon sx={{ color: "#2563eb", fontSize: 32 }} />,
              title: "Institutional Pro Bono Certification",
              desc: "Receive formal, cryptographically verified pro bono hours recognition and appreciation certificates from the Consortium.",
            },
            {
              icon: <VolunteerActivismIcon sx={{ color: "#059669", fontSize: 32 }} />,
              title: "Grassroots Justice Impact",
              desc: "Directly empower vulnerable citizens, undertrials, and underrepresented communities with rights awareness.",
            },
            {
              icon: <PublicIcon sx={{ color: "#7c3aed", fontSize: 32 }} />,
              title: "National Practitioner Mentorship",
              desc: "Collaborate directly with empaneled Senior Advocates, retired judges, and academic fellows across our regional chapters.",
            },
          ].map((item, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "1.05rem" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Volunteer Program Cards */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 700, letterSpacing: 1.2 }}>
              OPEN ENGAGEMENT TRACKS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
              Choose Where You Wish to Make an Impact
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 650, mx: "auto", mt: 1 }}>
              Flexible remote and hybrid volunteer programs designed for advocates, law students, paralegals, and linguists.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {programs.map((prog) => (
                <Grid size={{ xs: 12, md: 6 }} key={prog.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      bgcolor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#2563eb",
                        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Chip
                          label={prog.category}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                          label={prog.commitmentHoursPerWeek}
                          size="small"
                          variant="outlined"
                          sx={{ color: "#64748b", fontSize: "0.75rem" }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, minHeight: 48 }}>
                        {prog.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#475569", mb: 2.5, lineHeight: 1.6 }}>
                        {prog.description}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Key Competencies / Skills:
                      </Typography>
                      <List dense disablePadding sx={{ mt: 1, mb: 3 }}>
                        {prog.skillsRequired.map((skill, sIdx) => (
                          <ListItem key={sIdx} disableGutters sx={{ py: 0.3 }}>
                            <ListItemIcon sx={{ minWidth: 22 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={skill}
                              slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155" } } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleSelectProgram(prog.id)}
                      sx={{
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "#0f172a",
                        "&:hover": { bgcolor: "#1e293b" },
                      }}
                    >
                      Enrol in this Track
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Volunteer Application Form */}
        <Box id="volunteer-application-form" sx={{ mb: 8 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              bgcolor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 3,
            }}
          >
            {submissionResult ? (
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
                  <WorkspacePremiumIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  Volunteer Application Registered
                </Typography>
                <Typography variant="body1" sx={{ color: "#475569", maxWidth: 540, mx: "auto", mb: 3 }}>
                  {submissionResult.message}
                </Typography>

                <Box
                  sx={{
                    display: "inline-block",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    p: 2.5,
                    borderRadius: 2,
                    mb: 4,
                    textAlign: "left",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Volunteer Application Reference
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#2563eb", letterSpacing: 0.5 }}>
                    {submissionResult.referenceId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#059669", fontWeight: 600, mt: 0.5 }}>
                    Status: {submissionResult.status}
                  </Typography>
                </Box>

                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSubmissionResult(null);
                      setFullName("");
                      setEmail("");
                      setMobile("");
                      setSop("");
                    }}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Submit Another Application
                  </Button>
                </div>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Volunteer Enrolment & Onboarding
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                    Join our national network of civic champions and jurists making justice accessible to all.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Select Volunteer Track"
                      value={programs.some((p) => p.id === selectedProgram) ? selectedProgram : ""}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      required
                    >
                      {programs.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.title} ({p.mode})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Available Hours / Week"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                    >
                      <MenuItem value="2 - 4 Hours">2 - 4 Hours per week</MenuItem>
                      <MenuItem value="4 - 8 Hours">4 - 8 Hours per week</MenuItem>
                      <MenuItem value="8 - 12 Hours">8 - 12 Hours per week</MenuItem>
                      <MenuItem value="12+ Hours (Intensive)">12+ Hours (Intensive Fellowship)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Legal Name"
                      placeholder="e.g. Radhika Deshmukh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      placeholder="radhika.d@example.com"
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
                      fullWidth
                      label="Current City"
                      placeholder="e.g. Pune"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="State / UT"
                      placeholder="e.g. Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Statement of Purpose / Why do you want to volunteer?"
                      placeholder="Share your background, educational qualification, specific areas of interest (e.g. consumer rights, women safety, legal aid clinics), and previous civic or pro bono experience..."
                      value={sop}
                      onChange={(e) => setSop(e.target.value)}
                      required
                    />
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
                      {submitting ? "Submitting Application..." : "Submit Volunteer Application"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
