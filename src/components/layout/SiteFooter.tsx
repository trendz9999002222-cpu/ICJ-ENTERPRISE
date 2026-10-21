"use client";

import GavelIcon from "@mui/icons-material/Gavel";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Box, Container, Divider, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/icj_intconsortiumofjurists?vrfl=b3dqcnJ6ajJwa3Bz",
    icon: <InstagramIcon sx={{ fontSize: 20 }} />,
    color: "#E1306C",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/icj.enterprise",
    icon: <FacebookIcon sx={{ fontSize: 20 }} />,
    color: "#1877F2",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/icj-enterprise",
    icon: <LinkedInIcon sx={{ fontSize: 20 }} />,
    color: "#0A66C2",
  },
  {
    label: "X (formerly Twitter)",
    href: "https://x.com/icj_enterprise",
    icon: <XIcon sx={{ fontSize: 18 }} />,
    color: "#ffffff",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@icj-enterprise",
    icon: <YouTubeIcon sx={{ fontSize: 20 }} />,
    color: "#FF0000",
  },
];

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0f2942",
        borderTop: "3px solid #b45309",
        color: "#f8fafc",
        pt: { xs: 5, md: 7 },
        pb: { xs: 12, sm: 13 },
        mt: "auto",
        width: "100%",
        position: "relative",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Main Footer Columns */}
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* Col 1: Brand & Identity */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              <Box
                sx={{
                  position: "relative",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#ffffff",
                  p: 0.3,
                  border: "1.5px solid rgba(251, 191, 36, 0.6)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/icj-logo.png"
                  alt="ICJ Official Seal"
                  width={48}
                  height={48}
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, color: "#ffffff", fontSize: "0.95rem", lineHeight: 1.2 }}>
                  INTERNATIONAL CONSORTIUM OF JURISTS
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Justice • Integrity • Humanity
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.825rem", lineHeight: 1.6, mb: 2 }}>
              A premier global institution of jurists, advocates, and dispute resolution specialists dedicated to
              democratizing access to justice, advancing legal scholarship, and upholding constitutional values.
            </Typography>

            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", mb: 2 }}>
              Justice • Knowledge • Service • Integrity
            </Typography>

            {/* Social Media Icons in Brand Column */}
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
              {SOCIAL_LINKS.map((s) => (
                <Tooltip key={s.label} title={s.label} arrow>
                  <IconButton
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: "rgba(255,255,255,0.55)",
                      transition: "color 0.2s, background-color 0.2s",
                      "&:hover": { color: s.color, bgcolor: "rgba(255,255,255,0.08)" },
                      p: 0.7,
                    }}
                    aria-label={s.label}
                  >
                    {s.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Grid>

          {/* Col 2: Justice Services */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 700, color: "#fbbf24", mb: 2, fontSize: "0.875rem", letterSpacing: "0.02em" }}>
              Justice Services
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "All Services", href: "/services" },
                { label: "Property Matters", href: "/services/property-matters" },
                { label: "Consumer Rights", href: "/services/consumer-assistance" },
                { label: "Mediation & ADR", href: "/services/mediation-arbitration" },
                { label: "Cyber Law & Fraud", href: "/services/cyber-law" },
                { label: "Family Guidance", href: "/services/family-matters" },
                { label: "Civil Disputes", href: "/services/civil-disputes" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 3: Professionals */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 700, color: "#fbbf24", mb: 2, fontSize: "0.875rem", letterSpacing: "0.02em" }}>
              Professionals
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "Find a Professional", href: "/professionals" },
                { label: "Advocates", href: "/professionals?profession=advocate" },
                { label: "Chartered Accountants", href: "/professionals?profession=chartered+accountant" },
                { label: "Company Secretaries", href: "/professionals?profession=company+secretary" },
                { label: "Mediators & Arbitrators", href: "/professionals?profession=mediator" },
                { label: "Public Directory", href: "/directory" },
                { label: "Join as Professional", href: "/membership" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 4: Research & Academy */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 700, color: "#fbbf24", mb: 2, fontSize: "0.875rem", letterSpacing: "0.02em" }}>
              Research & Academy
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "Legal Research Papers", href: "/research" },
                { label: "Policy Whitepapers", href: "/research?category=policy+paper" },
                { label: "ICJ Academy Courses", href: "/academy" },
                { label: "Training & Masterclasses", href: "/academy#events" },
                { label: "Knowledge Centre", href: "/knowledge-centre" },
                { label: "Acts & Judgment Digest", href: "/knowledge-centre#judgments" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 5: Social Impact */}
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 700, color: "#fbbf24", mb: 2, fontSize: "0.875rem", letterSpacing: "0.02em" }}>
              Social Impact
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "Social Justice", href: "/social-justice" },
                { label: "Seek Assistance", href: "/assistance" },
                { label: "Volunteer Hub", href: "/volunteer" },
                { label: "Nyaya Daan Mudra", href: "/nyaya-daan-mudra" },
                { label: "Support Justice", href: "/donate" },
                { label: "Global Network", href: "/global-network" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 6: Governance & Audit */}
          <Grid size={{ xs: 12, sm: 4, md: 1.5 }}>
            <Typography component="h2" variant="subtitle2" sx={{ fontWeight: 700, color: "#fbbf24", mb: 2, fontSize: "0.875rem", letterSpacing: "0.02em" }}>
              Verification & Help
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "Verify Certificate", href: "/verify-certificate" },
                { label: "Verify Donation", href: "/verify-donation" },
                { label: "Grievance Portal", href: "/grievance" },
                { label: "Service Centres", href: "/service-centres" },
                { label: "Contact Us", href: "/contact" },
                { label: "Directory", href: "/directory" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.12)" }} />

        {/* Regulatory & Institutional Caveat */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.725rem", lineHeight: 1.6, display: "block" }}>
            <strong>Institutional Disclaimer:</strong> The International Consortium of Jurists (ICJ) operates as an
            independent legal consortium promoting legal literacy, pro bono coordination, and institutional alternative
            dispute resolution. Information provided across this portal does not constitute direct legal advice or establish
            a formal advocate-client relationship. Nyaya Daan Mudra (NDM) represents an internal digital social-assistance
            credit mechanism and is not a currency, cryptocurrency, deposit, or financial investment.
          </Typography>
        </Box>



        {/* Copyright & Bottom Links */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            © {new Date().getFullYear()} International Consortium of Jurists (ICJ). All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
            {[
              { label: "Terms of Use", href: "/terms" },
              { label: "Privacy Policy", href: "/terms#privacy" },
              { label: "Pro Bono Policy", href: "/social-justice" },
              { label: "Accessibility", href: "/about#accessibility" },
              // { label: "Admin Login", href: "/login" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
