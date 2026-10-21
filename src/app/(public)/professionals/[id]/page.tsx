"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GavelIcon from "@mui/icons-material/Gavel";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SchoolIcon from "@mui/icons-material/School";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import CategoryIcon from "@mui/icons-material/Category";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import { publicProfessionalInitials } from "@/lib/privacy/maskPublicIdentity";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { professionalService } from "@/services/public";
import type { PublicProfessional } from "@/types/public";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const id = String(params.id);

  const [professional, setProfessional] = useState<PublicProfessional | null>(null);
  const [loading, setLoading] = useState(true);

  // Appointment Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await professionalService.getProfessionalById(id);
      setProfessional(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setBookingSubmitted(true);
    }, 600);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!professional) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Practitioner Profile Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          The requested practitioner record does not exist or is no longer listed publicly.
        </Typography>
        <Button component={Link} href="/professionals" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Directory
        </Button>
      </Container>
    );
  }

  const initials = publicProfessionalInitials(professional.fullName);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge={`Verified ${professional.profession}`}
        title={professional.fullName}
        subtitle={`${professional.profession} · ${professional.city}, ${professional.state} · ${professional.experienceYears} Years Experience`}
        breadcrumbs={[{ label: "Professionals", href: "/professionals" }, { label: professional.fullName }]}
        primaryAction={{ label: "Request Appointment", href: "#appointment" }}
        secondaryAction={{ label: "Back to Directory", href: "/professionals" }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
        <Grid container spacing={4}>
          {/* Main Profile Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* Profile Card Header */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: { sm: "center" } }}>
                  <Avatar
                    src={resolveMediaUrl(professional.photoUrl) || undefined}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "#2563eb",
                      fontSize: "1.75rem",
                      fontWeight: 800,
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {professional.fullName}
                      </Typography>
                      {professional.isVerified ? (
                        <Chip
                          label="Verified"
                          size="small"
                          icon={<CheckCircleIcon fontSize="small" />}
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: 22,
                            "& .MuiChip-icon": { color: "#16a34a", fontSize: "0.85rem" },
                          }}
                        />
                      ) : (
                        <Chip
                          label="Unverified"
                          size="small"
                          icon={<WarningAmberIcon fontSize="small" />}
                          sx={{
                            bgcolor: "#fef9c3",
                            color: "#854d0e",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: 22,
                            "& .MuiChip-icon": { color: "#ca8a04", fontSize: "0.85rem" },
                          }}
                        />
                      )}
                    </Stack>

                    {/* All registered professions */}
                    {professional.registeredProfessions && professional.registeredProfessions.length > 0 ? (
                      <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
                        {professional.registeredProfessions.map((p) => (
                          <Chip
                            key={p}
                            label={p}
                            size="small"
                            sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem" }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="subtitle2" sx={{ color: "#2563eb", fontWeight: 700, mb: 1 }}>
                        {professional.profession}
                      </Typography>
                    )}

                    {/* All registered categories */}
                    {professional.registeredCategories && professional.registeredCategories.length > 0 && (
                      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                        <CategoryIcon sx={{ fontSize: 14, color: "#64748b" }} />
                        {professional.registeredCategories.map((c) => (
                          <Chip
                            key={c}
                            label={c}
                            size="small"
                            sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 600, fontSize: "0.7rem", height: 20 }}
                          />
                        ))}
                      </Stack>
                    )}

                    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                        label={[professional.city, professional.state].filter(Boolean).join(", ") || "India"}
                        size="small"
                        sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                      />
                      <Chip
                        icon={<WorkHistoryIcon sx={{ fontSize: 14 }} />}
                        label={`${professional.experienceYears} Years Exp.`}
                        size="small"
                        sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                      />
                      <Chip
                        icon={<EventAvailableIcon sx={{ fontSize: 14 }} />}
                        label={`Consultation: ${professional.availability}`}
                        size="small"
                        sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Bio & Background */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                  About & Professional Overview
                </Typography>
                <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.7, mb: 3 }}>
                  {professional.profileBio}
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                      Specialised Practice Areas
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                      {professional.specialisations.map((spec) => (
                        <Chip
                          key={spec}
                          label={spec}
                          size="small"
                          sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                      Jurisdictions & Courts
                    </Typography>
                    <Stack spacing={0.5}>
                      {professional.courtsOrJurisdiction.map((court, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: "#475569" }}>
                          • {court}
                        </Typography>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Qualifications & Languages */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                  Credentials & Languages
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                      <SchoolIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Academic Degrees
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {professional.qualifications.join(", ")}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                      <LanguageIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Languages Spoken
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {professional.languages.join(", ")}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Consultation Form Sidebar */}
          <Grid size={{ xs: 12, md: 4 }} id="appointment" sx={{ scrollMarginTop: 100 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                Request Consultation
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontSize: "0.85rem" }}>
                Send a structured consultation request to {professional.fullName}.
              </Typography>

              {bookingSubmitted ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Request Submitted!
                  </Typography>
                  <Typography variant="caption">
                    Reference ID: <strong>ICJ-REQ-{Math.floor(100000 + Math.random() * 900000)}</strong>. The
                    practitioner&apos;s office will reach out within 24 hours.
                  </Typography>
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleBookingSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Your Full Name *"
                      fullWidth
                      size="small"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                    <TextField
                      label="Your Email Address *"
                      fullWidth
                      size="small"
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                    <TextField
                      label="Your Mobile Number *"
                      fullWidth
                      size="small"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                    <TextField
                      label="Matter Summary / Query *"
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      required
                      placeholder="Briefly describe your legal or professional requirement..."
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={bookingLoading}
                      sx={{
                        bgcolor: "#2563eb",
                        fontWeight: 700,
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#1d4ed8" },
                      }}
                    >
                      {bookingLoading ? <CircularProgress size={20} color="inherit" /> : "Submit Consultation Request"}
                    </Button>

                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", textAlign: "center" }}>
                      Confidential & protected under ICJ institutional privacy guidelines.
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <LegalDisclaimer />
      </Container>
    </Box>
  );
}
