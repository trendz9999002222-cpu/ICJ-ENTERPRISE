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
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelIcon from "@mui/icons-material/Gavel";
import PageHeader from "@/components/features/public/PageHeader";
import Link from "next/link";

import { CONTACT_DATA, type ContactIconKey } from "@/data/public/contact";

// Resolve icon key → MUI icon
const ICON_MAP: Record<ContactIconKey, React.ReactNode> = {
  phone: <PhoneIcon fontSize="small" />,
  email: <EmailIcon fontSize="small" />,
  location: <LocationOnIcon fontSize="small" />,
  time: <AccessTimeIcon fontSize="small" />,
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 8 }}>
      <PageHeader
        title={CONTACT_DATA.pageTitle}
        subtitle={CONTACT_DATA.pageSubtitle}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Container maxWidth="md" sx={{ mt: 5 }}>

        {/* ── Office Info Strip ── */}
        <Card
          elevation={0}
          sx={{
            bgcolor: "#0f2942",
            color: "#ffffff",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            mb: 5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: "#f0f9ff" }}>
            {CONTACT_DATA.officeName}
          </Typography>

          <Grid container spacing={3}>
            {CONTACT_DATA.officeDetails.map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                  <Box sx={{ color: "#93c5fd", flexShrink: 0, mt: 0.2 }}>{ICON_MAP[item.iconKey]}</Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* ── Contact Form ── */}
        <Card
          elevation={0}
          sx={{ p: { xs: 3, sm: 4 }, bgcolor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 3 }}
        >
          {submitted ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CheckCircleIcon sx={{ fontSize: 52, color: "#059669", mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                {CONTACT_DATA.successTitle}
              </Typography>
              <Typography variant="body1" sx={{ color: "#475569", maxWidth: 460, mx: "auto", mb: 3 }}>
                {CONTACT_DATA.successMessage}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                sx={{ textTransform: "none", fontWeight: 600, borderColor: "#0f2942", color: "#0f2942" }}
              >
                Send Another Message
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                {CONTACT_DATA.formTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
                {CONTACT_DATA.formSubtitle}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="email" label="Email Address" name="email" value={form.email} onChange={handleChange} required size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleChange} size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Subject / Department" name="subject" value={form.subject} onChange={handleChange} size="small" placeholder="e.g. Membership, Academy, Grievance..." />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="Please describe your query in detail..."
                  />
                </Grid>
                <Grid size={12}>
                  <Alert
                    severity="info"
                    sx={{ bgcolor: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", fontSize: "0.82rem" }}
                  >
                    For urgent matters (court deadlines, emergencies) call{" "}
                    <strong>+91-11-4001-7000</strong> or visit the{" "}
                    <Link href="/assistance" style={{ color: "#1d4ed8", fontWeight: 700 }}>
                      Citizen Assistance Portal
                    </Link>
                    .
                  </Alert>
                </Grid>
                <Grid size={12}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                      sx={{
                        py: 1.25,
                        px: 3.5,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "#0f2942",
                        borderBottom: "3px solid #b45309",
                        "&:hover": { bgcolor: "#1e3a5f" },
                      }}
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                    <Button
                      component={Link}
                      href="/assistance"
                      variant="outlined"
                      size="large"
                      startIcon={<GavelIcon />}
                      sx={{
                        py: 1.25,
                        px: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#0f2942",
                        color: "#0f2942",
                        "&:hover": { bgcolor: "#f0f4f8" },
                      }}
                    >
                      Seek Legal Assistance
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          )}
        </Card>
      </Container>
    </Box>
  );
}
