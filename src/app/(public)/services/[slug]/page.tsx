"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import {
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
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import { serviceService } from "@/services/public";
import type { JusticeService } from "@/types/public";

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [service, setService] = useState<JusticeService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await serviceService.getServiceBySlug(slug);
      setService(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!service) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Service Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          The requested service page does not exist or has been relocated.
        </Typography>
        <Button component={Link} href="/services" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Services Catalog
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge={service.categoryLabel}
        title={service.title}
        subtitle={service.shortDescription}
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: service.title }]}
        primaryAction={{ label: "Seek Assistance for this Matter", href: "/assistance" }}
        secondaryAction={{ label: "Find Related Professionals", href: "/professionals" }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* Who It Is For */}
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
                  Who Is This Service For?
                </Typography>
                <Stack spacing={1.75}>
                  {service.whoItIsFor.map((item, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ color: "#2563eb", fontSize: 20, mt: 0.2 }} />
                      <Typography variant="body1" sx={{ color: "#334155", fontSize: "0.95rem" }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* How ICJ Helps */}
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
                  How the Consortium Assists
                </Typography>
                <Stack spacing={1.75}>
                  {service.howIcjHelps.map((item, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20, mt: 0.2 }} />
                      <Typography variant="body1" sx={{ color: "#334155", fontSize: "0.95rem" }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Next Steps & Workflow */}
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
                  Next Steps to Proceed
                </Typography>
                <Stack spacing={2}>
                  {service.nextSteps.map((step, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#eff6ff",
                          color: "#1d4ed8",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography variant="body1" sx={{ color: "#475569", fontSize: "0.95rem", pt: 0.2 }}>
                        {step}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Sidebar Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Assistance Action Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  bgcolor: "#0f172a",
                  color: "#ffffff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Need Guidance on this Matter?
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3, lineHeight: 1.6 }}>
                  Submit your matter details through our confidential citizen portal. An ICJ research associate will review
                  your documentation within 48 hours.
                </Typography>
                <Button
                  component={Link}
                  href="/assistance"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Seek Assistance Now
                </Button>
              </Paper>

              {/* Related Professionals */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
                  <PersonSearchIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Related Empaneled Experts
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2, fontSize: "0.825rem" }}>
                  Connect with practitioners verified in this practice area:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75, mb: 3 }}>
                  {service.relatedProfessionals.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      sx={{
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  ))}
                </Stack>
                <Button
                  component={Link}
                  href={`/professionals?profession=${encodeURIComponent(service.relatedProfessionals[0] || "")}`}
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 1.5,
                  }}
                >
                  Find Empaneled Practitioners
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <LegalDisclaimer />
      </Container>
    </Box>
  );
}
