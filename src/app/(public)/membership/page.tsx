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
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SecurityIcon from "@mui/icons-material/Security";
import SendIcon from "@mui/icons-material/Send";
import PageHeader from "@/components/features/public/PageHeader";
import { membershipService } from "@/services/public";
import type { MembershipTierInfo } from "@/types/public";

export default function MembershipPage() {
  const [tiers, setTiers] = useState<MembershipTierInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [profession, setProfession] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceId: string;
    status: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    membershipService.listTiers().then((data) => {
      setTiers(data);
      setSelectedTier((current) =>
        data.some((t) => t.tier === current) ? current : data[0]?.tier ?? "",
      );
      setLoading(false);
    });
  }, []);

  const handleApplyClick = (tierName: string) => {
    setSelectedTier(tierName);
    const formElement = document.getElementById("membership-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile) return;
    setSubmitting(true);
    try {
      const res = await membershipService.submitMembershipApplication({
        fullName,
        email,
        mobile,
        tier: selectedTier,
        profession,
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
        title="Institutional & Professional Membership"
        subtitle="Uniting jurists, legal practitioners, scholars, and citizens in an institutional fraternity dedicated to upholding the rule of law, constitutional jurisprudence, and public justice."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Membership" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Value Proposition Highlights */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              icon: <CardMembershipIcon sx={{ color: "#2563eb", fontSize: 32 }} />,
              title: "Verified National Registry",
              desc: "Gain recognized institutional empanelment and public profile verification across national legal circles.",
            },
            {
              icon: <QrCode2Icon sx={{ color: "#059669", fontSize: 32 }} />,
              title: "Cryptographic Digital Credentials",
              desc: "Tamper-proof digital ID cards and verifiable credentials authenticated on institutional records.",
            },
            {
              icon: <SecurityIcon sx={{ color: "#7c3aed", fontSize: 32 }} />,
              title: "Pro Bono & Policy Working Groups",
              desc: "Direct appointment opportunities in public interest panels, law reform consultations, and symposiums.",
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

        {/* Membership Tiers */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 700, letterSpacing: 1.2 }}>
              MEMBERSHIP CATEGORIES
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
              Choose Your Institutional Fraternity Track
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 650, mx: "auto", mt: 1 }}>
              Each membership tier offers tailored access to knowledge repositories, credentials, pro bono initiatives, and institutional governance.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {tiers.map((tier) => (
                <Grid size={{ xs: 12, md: 6 }} key={tier.tier}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3.5 },
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {tier.tier}
                        </Typography>
                        <Chip
                          label={tier.targetAudience}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: "#475569", mb: 3, lineHeight: 1.6 }}>
                        {tier.description}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
                        Membership Privileges:
                      </Typography>
                      <List dense disablePadding sx={{ mb: 3 }}>
                        {tier.benefits.map((benefit, bIdx) => (
                          <ListItem key={bIdx} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 26, mt: 0.3 }}>
                              <CheckCircleIcon sx={{ fontSize: 18, color: "#059669" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit}
                              slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155" } } }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                        Eligibility Criteria:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}>
                        {tier.eligibility.map((el, eIdx) => (
                          <Chip
                            key={eIdx}
                            label={el}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: "#cbd5e1",
                              color: "#475569",
                              fontSize: "0.75rem",
                              my: 0.5,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleApplyClick(tier.tier)}
                      sx={{
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "#0f172a",
                        color: "#ffffff",
                        "&:hover": { bgcolor: "#1e293b" },
                      }}
                    >
                      Apply for {tier.tier}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Application Form Section */}
        <Box id="membership-form-section" sx={{ mb: 8 }}>
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
                  <VerifiedIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  Membership Application Logged
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
                    Reference Tracking ID
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
                      setRegNumber("");
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
                    Membership Enrolment Application
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                    Please furnish your official details to initiate membership verification and credential generation.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Select Membership Track"
                      value={tiers.some((t) => t.tier === selectedTier) ? selectedTier : ""}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      required
                      helperText="Choose the tier matching your credentials"
                    >
                      {tiers.map((t) => (
                        <MenuItem key={t.tier} value={t.tier}>
                          {t.tier} ({t.targetAudience})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Legal Name"
                      placeholder="e.g. Adv. Arvind K. Mishra"
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
                      placeholder="arvind.mishra@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Mobile Contact Number"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Profession / Current Designation"
                      placeholder="e.g. Advocate / Chartered Accountant / Law Scholar"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Statutory Bar / ICAI / Enrolment ID (Optional)"
                      placeholder="e.g. D/1423/2014"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Alert severity="info" sx={{ bgcolor: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe" }}>
                      By submitting this application, you agree to comply with the International Consortium of Jurists Code of Conduct and Charter of Ethics. All professional credentials will be verified against respective statutory rolls.
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
                      {submitting ? "Processing Application..." : "Submit Membership Application"}
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
