"use client";

import { env } from "@/config/env";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelIcon from "@mui/icons-material/Gavel";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import PageSection from "@/components/layout/PageSection";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Pathway = "legal_professional" | "other_professional" | "volunteer";
type Step = "register" | "verify" | "dashboard" | "pathway" | "application" | "success";

interface RegistrationForm {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
}

interface PathwayCard {
  id: Pathway;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  categories: string[];
}

const PATHWAYS: PathwayCard[] = [
  {
    id: "legal_professional",
    title: "Legal Professional",
    subtitle: "Advocates, consultants, researchers, forensic experts and drafting specialists",
    icon: <GavelIcon sx={{ fontSize: 36 }} />,
    color: "#1e3a8a",
    categories: ["Advocate", "Legal Consultant", "Legal Researcher", "Forensic Expert", "Drafting Specialist"],
  },
  {
    id: "other_professional",
    title: "Other Professional",
    subtitle: "Chartered accountants and other approved professional categories",
    icon: <BusinessCenterIcon sx={{ fontSize: 36 }} />,
    color: "#065f46",
    categories: ["Chartered Accountant (CA)", "Other Approved Professionals"],
  },
  {
    id: "volunteer",
    title: "Volunteer",
    subtitle: "Support ICJ's mission through research, outreach and community service",
    icon: <VolunteerActivismIcon sx={{ fontSize: 36 }} />,
    color: "#7c2d12",
    categories: ["Legal Research", "Community Outreach", "Documentation", "Other"],
  },
];

// category → JSON form schema path mapping
const PATHWAY_CATEGORY_SCHEMAS: Record<string, string> = {
  advocate: "/config/forms/legal-professional/advocate.json",
  legal_consultant: "/config/forms/legal-professional/legal-consultant.json",
  legal_researcher: "/config/forms/legal-professional/legal-researcher.json",
  forensic_expert: "/config/forms/legal-professional/forensic-expert.json",
  drafting_specialist: "/config/forms/legal-professional/drafting-specialist.json",
  chartered_accountant: "/config/forms/other-professionals/ca.json",
  volunteer: "/config/forms/volunteers/default.json",
};

function getCategorySlug(pathway: Pathway, categoryLabel: string): string {
  const slug = categoryLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
  if (pathway === "volunteer") return "volunteer";
  if (slug.includes("ca") || slug.includes("chartered")) return "chartered_accountant";
  if (slug.includes("advocate")) return "advocate";
  if (slug.includes("consultant")) return "legal_consultant";
  if (slug.includes("researcher")) return "legal_researcher";
  if (slug.includes("forensic")) return "forensic_expert";
  if (slug.includes("drafting") || slug.includes("pleading")) return "drafting_specialist";
  return slug;
}

// ─── Step: Registration form ───────────────────────────────────────────────────

function RegisterStep({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<RegistrationForm>({
    first_name: "", last_name: "", email: "", mobile_number: "", password: "", confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof RegistrationForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${env.apiUrl}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          mobile_number: form.mobile_number,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.detail || data?.email?.[0] || data?.mobile_number?.[0] || "Registration failed.";
        setError(msg);
        return;
      }
      // Store token if returned
      if (data?.access) {
        document.cookie = `icj_access_token=${data.access}; path=/; SameSite=Lax`;
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 900 }}>
        Create Your ICJ Account
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        Step 1 of 4 — Basic registration
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label="First Name *" value={form.first_name} onChange={set("first_name")} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label="Last Name *" value={form.last_name} onChange={set("last_name")} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" type="email" label="Email Address *" value={form.email} onChange={set("email")} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" type="tel" label="Mobile Number *" value={form.mobile_number} onChange={set("mobile_number")} required placeholder="+91 9XXXXXXXXX" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" type="password" label="Password *" value={form.password} onChange={set("password")} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" type="password" label="Confirm Password *" value={form.confirm_password} onChange={set("confirm_password")} required />
        </Grid>
      </Grid>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, textTransform: "none", fontWeight: 800, py: 1.3 }}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {loading ? "Creating Account..." : "Create Account & Continue"}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
        Already have an account?{" "}
        <Box component="a" href="/login" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600 }}>
          Log in here
        </Box>
      </Typography>
    </Box>
  );
}

// ─── Step: Email verification placeholder ─────────────────────────────────────

function VerifyStep({ onSuccess }: { onSuccess: () => void }) {
  const [otp, setOtp] = useState("");
  const [loading] = useState(false);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 900 }}>
        Verify Your Contact
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        Step 2 of 4 — Enter the OTP sent to your email/mobile
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        A verification code has been sent to your registered email and mobile number.
      </Alert>
      <TextField
        fullWidth
        size="small"
        label="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 6 } }}
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={onSuccess}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Verify & Continue
        </Button>
        <Button
          variant="text"
          onClick={onSuccess}
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Skip for now
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Step: Choose Pathway ─────────────────────────────────────────────────────

function PathwayStep({
  onSelect,
}: {
  onSelect: (p: Pathway, category: string) => void;
}) {
  const [selected, setSelected] = useState<Pathway | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const pathway = selected ? PATHWAYS.find((p) => p.id === selected) : null;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 900 }}>
        Choose Your Registration Pathway
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        Step 3 of 4 — Select the pathway that best describes your role
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {PATHWAYS.map((p) => (
          <Grid key={p.id} size={{ xs: 12, sm: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: selected === p.id ? `2px solid ${p.color}` : "2px solid #e2e8f0",
                borderRadius: 3,
                transition: "all 0.15s",
                "&:hover": { borderColor: p.color },
              }}
            >
              <CardActionArea onClick={() => { setSelected(p.id); setCategory(null); }} sx={{ p: 2.5, height: "100%", alignItems: "flex-start" }}>
                <Box sx={{ color: p.color, mb: 1.5 }}>{p.icon}</Box>
                <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 800 }}>
                  {p.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.subtitle}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pathway && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
            Select Category under {pathway.title}:
          </Typography>
          <Stack direction="row" spacing={1} sx={{flexWrap: "wrap" }}>
            {pathway.categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategory(cat)}
                color={category === cat ? "primary" : "default"}
                variant={category === cat ? "filled" : "outlined"}
                sx={{ cursor: "pointer", fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Button
        variant="contained"
        disabled={!selected || !category}
        onClick={() => selected && category && onSelect(selected, category)}
        sx={{ textTransform: "none", fontWeight: 800, px: 4 }}
      >
        Continue to Application
      </Button>
    </Box>
  );
}

// ─── Step: Application form (redirect to join-professional for now) ────────────

function ApplicationStep({
  pathway,
  category,
  onSuccess,
}: {
  pathway: Pathway;
  category: string;
  onSuccess: (ref: string) => void;
}) {
  const categorySlug = getCategorySlug(pathway, category);
  const schemaPath = PATHWAY_CATEGORY_SCHEMAS[categorySlug];

  // Redirect to the existing professional registration wizard for now
  // In a future iteration this renders DynamicJsonForm with the JSON schema
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to the existing detailed onboarding wizard
    // which handles the full professional registration flow
    router.push(`/join-professional?pathway=${pathway}&category=${categorySlug}`);
  }, [router, pathway, categorySlug]);

  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Loading {category} registration form...
      </Typography>
      {schemaPath && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Schema: {schemaPath}
        </Typography>
      )}
    </Box>
  );
}

// ─── Step: Success ─────────────────────────────────────────────────────────────

function SuccessStep({ reference }: { reference: string }) {
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: "#f0fdf4",
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 40 }} />
      </Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 900 }}>
        Application Submitted!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Your application reference number is:
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
          fontSize: "1.2rem",
          letterSpacing: "0.05em",
          mb: 3,
        }}
      >
        {reference}
      </Box>
      <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 480, mx: "auto", mb: 4 }}>
        ICJ will review your application and contact you within 3–5 working days. You can track
        your application status from your Member Dashboard.
      </Typography>
      <Stack direction="row" spacing={2} sx={{justifyContent: "center" }}>
        <Button component="a" href="/dashboard/member" variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
          Go to Dashboard
        </Button>
        <Button component="a" href="/" variant="outlined" sx={{ textTransform: "none" }}>
          Return Home
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Sidebar info panel ────────────────────────────────────────────────────────

function JoinSidebar() {
  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: "center" }}>
          <AccountCircleIcon sx={{ color: "#2563eb" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Why Join ICJ?
          </Typography>
        </Stack>
        {[
          "Access to ICJ's national member directory",
          "Professional empanelment and lead allocation",
          "Pro bono case referrals and legal aid support",
          "Continuing legal education and training",
          "Institutional recognition and digital profile",
        ].map((benefit, i) => (
          <Stack key={i} direction="row" spacing={1} sx={{ mb: 1, alignItems: "flex-start" }}>
            <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 16, mt: 0.3, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              {benefit}
            </Typography>
          </Stack>
        ))}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Application Process
        </Typography>
        {[
          "Register & verify your contact",
          "Choose your registration pathway",
          "Complete category-specific form",
          "Upload supporting documents",
          "Wait for ICJ review & approval",
        ].map((step, i) => (
          <Stack key={i} direction="row" spacing={1.5} sx={{ mb: 1, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                bgcolor: "#eff6ff",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#2563eb" }}>
                {i + 1}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              {step}
            </Typography>
          </Stack>
        ))}
      </Paper>
    </Stack>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function JoinPageInner() {
  const searchParams = useSearchParams();
  const initialStep = (searchParams.get("step") as Step) || "register";

  const [step, setStep] = useState<Step>(initialStep);
  const [pathway, setPathway] = useState<Pathway>("legal_professional");
  const [category, setCategory] = useState("");
  const [appRef, setAppRef] = useState("");

  const handlePathwaySelect = (p: Pathway, cat: string) => {
    setPathway(p);
    setCategory(cat);
    setStep("application");
  };

  return (
    <PageSection>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip label="Join ICJ" color="primary" size="small" sx={{ mb: 2, fontWeight: 700 }} />
          <Typography variant="h3" color="#0f172a" sx={{ mb: 1, fontWeight: 900 }}>
            Become a Member of ICJ
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ maxWidth: 600, mx: "auto" }}>
            Join India&apos;s premier legal consortium. Register as a member and choose your
            professional pathway — Advocate, Consultant, Researcher, CA, or Volunteer.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{ p: { xs: 3, sm: 4.5 }, border: "1px solid #e2e8f0", borderRadius: 3 }}
            >
              {step === "register" && <RegisterStep onSuccess={() => setStep("verify")} />}
              {step === "verify" && <VerifyStep onSuccess={() => setStep("pathway")} />}
              {step === "pathway" && <PathwayStep onSelect={handlePathwaySelect} />}
              {step === "application" && (
                <ApplicationStep
                  pathway={pathway}
                  category={category}
                  onSuccess={(ref) => { setAppRef(ref); setStep("success"); }}
                />
              )}
              {step === "success" && <SuccessStep reference={appRef || "ICJ-APP-2025-000001"} />}

              {/* Step progress indicator at bottom */}
              {step !== "success" && (
                <>
                  <Divider sx={{ mt: 4, mb: 2 }} />
                  <Stack direction="row" spacing={1} sx={{justifyContent: "center" }}>
                    {(["register", "verify", "pathway", "application"] as Step[]).map((s, i) => (
                      <Box
                        key={s}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            s === step
                              ? "#2563eb"
                              : ["register", "verify", "pathway", "application"].indexOf(step) > i
                              ? "#16a34a"
                              : "#e2e8f0",
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <JoinSidebar />
          </Grid>
        </Grid>
      </Container>
    </PageSection>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>}>
      <JoinPageInner />
    </Suspense>
  );
}
