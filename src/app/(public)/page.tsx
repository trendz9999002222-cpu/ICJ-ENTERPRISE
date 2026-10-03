"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BalanceIcon from "@mui/icons-material/Balance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import HandshakeIcon from "@mui/icons-material/Handshake";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PublicIcon from "@mui/icons-material/Public";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfessionalCard from "@/components/features/public/ProfessionalCard";
import ResearchCard from "@/components/features/public/ResearchCard";
import ServiceCard from "@/components/features/public/ServiceCard";
import { mockServices } from "@/data/public/services";
import { professionalService } from "@/services/public";
import type { PublicProfessional } from "@/types/public";
import { mockAcademyCourses, mockResearchPapers } from "@/data/public/research";
import { mockMembershipTiers, mockSocialImpactPrograms } from "@/data/public/knowledge";

export default function HomePage() {
  const router = useRouter();
  const [certQuery, setCertQuery] = useState("");

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certQuery.trim()) {
      router.push(`/verify-certificate?number=${encodeURIComponent(certQuery.trim())}`);
    }
  };

  const [featuredProfessionals, setFeaturedProfessionals] = useState<PublicProfessional[]>([]);

  useEffect(() => {
    professionalService.listProfessionals({ pageSize: 4 }).then((res) => {
      setFeaturedProfessionals(res.results || []);
    }).catch(console.error);
  }, []);

  const featuredServices = mockServices.slice(0, 6);
  const featuredPapers = mockResearchPapers.slice(0, 3);
  const featuredCourses = mockAcademyCourses.slice(0, 2);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", color: "#0f172a", overflow: "hidden" }}>
      {/* =================================================================== */}
      {/* 1. HERO SECTION — Government Style                                   */}
      {/* =================================================================== */}

      {/* Tricolor accent bar */}
      <Box sx={{ height: 5, background: "linear-gradient(90deg, #ff9933 33.33%, #ffffff 33.33% 66.67%, #138808 66.67%)" }} />

      <Box
        sx={{
          bgcolor: "#0f2942",
          position: "relative",
          overflow: "hidden",
          pb: { xs: 0, md: 0 },
        }}
      >
        {/* Hero imagery — full right column height (content + stats), left-edge fade only */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: { md: "48%", lg: "46%" },
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <Image
              src="/images/icjhero3.webp"
              alt=""
              fill
              priority
              quality={95}
              sizes="(min-width: 2048px) 1200px, (min-width: 1536px) 960px, (min-width: 900px) 50vw, 0px"
              style={{
                objectFit: "cover",
                objectPosition: "right center",
                transform: "scale(1.14)",
                transformOrigin: "right center",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, #0f2942 0%, rgba(15, 41, 66, 0.9) 10%, rgba(15, 41, 66, 0.4) 28%, transparent 48%)",
              }}
            />
          </Box>
        </Box>

        {/* Subtle radial glow */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            bgcolor: "rgba(180,83,9,0.08)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 5, sm: 6, md: 7 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "flex-end" }}>
            {/* Left — Text Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              {/* Institutional badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.75,
                  py: 0.5,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#93c5fd",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 2.5,
                }}
              >
                <GavelIcon sx={{ fontSize: 14 }} />
                Global Consortium of Legal Practitioners &amp; Jurists
              </Box>

              {/* Main headline */}
              <Typography
                component="h1"
                sx={{
                  fontWeight: 900,
                  color: "#f8fafc",
                  fontSize: { xs: "2rem", sm: "2.6rem", md: "3rem", lg: "3.4rem" },
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                  mb: 1.5,
                }}
              >
                International Consortium
                <Box component="span" sx={{ display: "block", color: "#fbbf24" }}>
                  of Jurists
                </Box>
              </Typography>

              {/* Tagline */}
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  mb: 2.5,
                }}
              >
                Justice • Knowledge • Service • Integrity
              </Typography>

              {/* Subtext */}
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.65,
                  maxWidth: 580,
                  mb: 3.5,
                }}
              >
                Democratizing citizen access to justice through structured legal literacy, verified
                professional empanelment, non-adversarial dispute resolution, and dedicated pro bono
                social assistance.
              </Typography>

              {/* Primary CTAs */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                <Button
                  component={Link}
                  href="/assistance"
                  variant="contained"
                  size="large"
                  startIcon={<GavelIcon />}
                  sx={{
                    bgcolor: "#b45309",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 3.5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 16px rgba(180,83,9,0.4)",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": { bgcolor: "#92400e" },
                  }}
                >
                  Seek Legal Assistance
                </Button>

                <Button
                  component={Link}
                  href="/professionals"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.6)" },
                  }}
                >
                  Find a Professional
                </Button>
              </Stack>

              {/* Quick links */}
              <Stack direction="row" spacing={0} sx={{ flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                {[
                  { label: "Join Membership →", href: "/membership" },
                  { label: "Volunteer →", href: "/volunteer" },
                  { label: "Donate →", href: "/donate" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    style={{ color: "#93c5fd", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                  >
                    {l.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* Stats strip — inside the navy hero */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.25)",
            mt: { xs: 4, md: 3 },
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container>
              {[
                { value: "1,200+", label: "Empaneled Advocates" },
                { value: "18+", label: "Legal Service Categories" },
                { value: "28", label: "States Covered" },
                { value: "50,000+", label: "Citizens Assisted" },
              ].map((stat, idx) => (
                <Grid key={idx} size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 2.5,
                      borderRight: idx < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", sm: "2rem" }, color: "#fbbf24", lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", mt: 0.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* =================================================================== */}
      {/* 2. TRUST & INSTITUTIONAL PILLARS                                    */}
      {/* =================================================================== */}
      <Box sx={{ bgcolor: "#f8fafc", py: { xs: 5, md: 6 }, borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {[
              {
                icon: <ShieldOutlinedIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
                title: "Institutional Empanelment",
                desc: "Verified practitioners adhering strictly to the ICJ Code of Professional Conduct.",
              },
              {
                icon: <BalanceIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
                title: "Alternative Dispute Resolution",
                desc: "Pioneering confidential pre-litigation mediation and institutional commercial arbitration.",
              },
              {
                icon: <SchoolOutlinedIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
                title: "Legal Literacy & Academy",
                desc: "Equipping citizens, students, and practitioners with continuing legal education.",
              },
              {
                icon: <VolunteerActivismOutlinedIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
                title: "Pro Bono Social Justice",
                desc: "Structured legal aid, women & senior citizen welfare support clinics.",
              },
            ].map((pillar, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <Box sx={{ mb: 1.5 }}>{pillar.icon}</Box>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.5 }}>
                    {pillar.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 3. JUSTICE SERVICES SECTION                                         */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" }, mb: 5 }}
          >
            <Box>
              <Chip
                label="Public Services Catalog"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1 }}
              />
              <Typography component="h2" variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Justice & Legal Guidance Services
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
                Comprehensive legal information, dispute orientation, and verified professional facilitation.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/services"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
            >
              Explore All 18+ Services
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {featuredServices.map((service) => (
              <Grid key={service.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ServiceCard service={service} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 4. SEEK ASSISTANCE INTAKE WORKFLOW                                  */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: "center", maxWidth: 700, mx: "auto", mb: 6 }}>
            <Chip
              label="Citizen Intake Protocol"
              size="small"
              sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1 }}
            />
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              How to Seek Legal Assistance
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", mt: 0.75 }}>
              A transparent, dignified 4-step pathway connecting citizens to appropriate legal guidance.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                step: "01",
                title: "Submit Matter Details",
                desc: "Describe your legal issue confidentially through our structured online intake form.",
              },
              {
                step: "02",
                title: "Initial Legal Screening",
                desc: "An ICJ legal research associate analyzes jurisdiction, limitation periods, and core documents.",
              },
              {
                step: "03",
                title: "Action Plan & Facilitation",
                desc: "Receive actionable orientation on mediation, legal aid entitlements, or statutory remedies.",
              },
              {
                step: "04",
                title: "Professional Referral",
                desc: "Direct connection with an empaneled advocate, mediator, or authorized service clinic.",
              },
            ].map((st, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.75rem",
                      fontWeight: 900,
                      color: "#2563eb",
                      opacity: 0.8,
                      mb: 1,
                    }}
                  >
                    {st.step}
                  </Typography>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}>
                    {st.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.5 }}>
                    {st.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Button
              component={Link}
              href="/assistance"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 800,
                textTransform: "none",
                px: 4,
                py: 1.25,
                borderRadius: 2,
              }}
            >
              Start Your Assistance Request
            </Button>
          </Box>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 5. FIND A PROFESSIONAL HIGHLIGHTS                                   */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" }, mb: 5 }}
          >
            <Box>
              <Chip
                label="Empaneled Practitioners"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1 }}
              />
              <Typography component="h2" variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Find a Verified Professional
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
                Connect with verified advocates, chartered accountants, company secretaries, and certified mediators.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/professionals"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
            >
              View Full Directory
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {featuredProfessionals.map((prof) => (
              <Grid key={prof.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProfessionalCard professional={prof} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 6. NYAYA DAAN MUDRA & SUPPORT JUSTICE                               */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="Social Assistance Innovation"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1.5 }}
              />
              <Typography component="h2" variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, letterSpacing: "-0.02em" }}>
                Nyaya Daan Mudra (NDM)
              </Typography>
              <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.65, mb: 3 }}>
                An internal digital social-assistance and sponsorship credit mechanism designed to fund legal literacy
                clinics, pro bono documentation, and emergency legal aid for indigent beneficiaries.
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {[
                  "100% transparent tracking of funded legal aid matters",
                  "Direct beneficiary sponsorship without administrative leakages",
                  "Verifiable digital social impact certificates for institutional sponsors",
                ].map((point, idx) => (
                  <Stack key={idx} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: "#334155", fontWeight: 500 }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  href="/nyaya-daan-mudra"
                  variant="contained"
                  sx={{ bgcolor: "#2563eb", fontWeight: 700, textTransform: "none", px: 3, py: 1, borderRadius: 2 }}
                >
                  Learn About NDM
                </Button>
                <Button
                  component={Link}
                  href="/donate"
                  variant="outlined"
                  sx={{ borderColor: "#cbd5e1", color: "#0f172a", fontWeight: 600, textTransform: "none", px: 3, py: 1, borderRadius: 2 }}
                >
                  Sponsor a Beneficiary
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 2,
                  border: "1px solid #bfdbfe",
                  bgcolor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.06)",
                }}
              >
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                  Social Impact Focus Areas
                </Typography>
                <Stack spacing={2.5}>
                  {mockSocialImpactPrograms.map((prog) => (
                    <Box key={prog.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <Typography component="h4" sx={{ fontWeight: 700, color: "#2563eb", fontSize: "0.925rem", mb: 0.5 }}>
                        {prog.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.825rem", lineHeight: 1.5 }}>
                        {prog.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 7. RESEARCH & ICJ ACADEMY                                           */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" }, mb: 5 }}
          >
            <Box>
              <Chip
                label="Legal Scholarship & Academy"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1 }}
              />
              <Typography component="h2" variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Research & Continuing Legal Education
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
                Peer-reviewed policy papers, empirical justice research, and professional masterclasses.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button component={Link} href="/research" sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}>
                Research Library
              </Button>
              <Button component={Link} href="/academy" sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}>
                Academy Courses
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {featuredPapers.map((paper) => (
              <Grid key={paper.id} size={{ xs: 12, md: 4 }}>
                <ResearchCard paper={paper} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 8. CERTIFICATE VERIFICATION QUICK WIDGET                            */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: "#eff6ff",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <VerifiedIcon sx={{ fontSize: 28, color: "#2563eb" }} />
            </Box>

            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              Verify Digital Certificate or Empanelment
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 520, mx: "auto", mb: 3 }}>
              Instantly validate digital certificates issued by ICJ Academy, professional empanelment credentials, or
              official membership records.
            </Typography>

            <Box component="form" onSubmit={handleVerifySubmit} sx={{ maxWidth: 500, mx: "auto" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. ICJ-CERT-2026-001"
                  value={certQuery}
                  onChange={(e) => setCertQuery(e.target.value)}
                  slotProps={{
                    input: { sx: { borderRadius: 2, fontSize: "0.875rem" } },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 3,
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Verify Now
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* =================================================================== */}
      {/* 9. FINAL INSTITUTIONAL CALL TO ACTION                               */}
      {/* =================================================================== */}
      <Box sx={{ py: { xs: 7, md: 9 }, bgcolor: "#ffffff" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 2,
              bgcolor: "#0f172a",
              color: "#ffffff",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography
              component="h2"
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.85rem", sm: "2.5rem" },
                letterSpacing: "-0.02em",
                mb: 2,
              }}
            >
              Stand for Justice. Empower Citizens.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#94a3b8",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                maxWidth: 640,
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Whether you need legal assistance, wish to empanel as a verified professional, or want to contribute to pro
              bono legal aid, the International Consortium of Jurists welcomes you.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <Button
                component={Link}
                href="/assistance"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Seek Assistance
              </Button>

              <Button
                component={Link}
                href="/membership"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                Join Consortium
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
