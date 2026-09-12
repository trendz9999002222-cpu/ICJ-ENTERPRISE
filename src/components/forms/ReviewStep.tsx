"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
import type { OnboardingFormState } from "@/types/onboarding-form";
import { RADIUS, SHADOW } from "@/theme/designTokens";
import FormNavigation from "./FormNavigation";
import StepIndicator from "./StepIndicator";

interface Props {
  role: OnboardingRole;
  formState: OnboardingFormState;
  errors: Record<string, string>;
  onToggleDeclaration: (agreed: boolean) => void;
  onJumpToStep: (stepNumber: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function ReviewStep({
  role,
  formState,
  errors,
  onToggleDeclaration,
  onJumpToStep,
  onBack,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const roleConfig = ONBOARDING_ROLES.find((r) => r.id === role) || ONBOARDING_ROLES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const getRoleData = () => {
    if (role === "citizen") return formState.litigant;
    if (role === "advocate") return formState.advocate;
    return formState.franchise;
  };

  const roleData = getRoleData();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4, md: 5 },
          borderRadius: RADIUS.xl,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: SHADOW.card,
        }}
      >
        <StepIndicator
          stepNumber={6}
          titleHi="आवेदन की समीक्षा एवं अंतिम सत्यापन"
          titleEn="Final Review & Application Submission"
          descriptionHi="कृपया सभी प्रविष्टियों की सावधानीपूर्वक जांच करें। जमा करने के उपरांत विधिक सत्यापन प्रक्रिया प्रारंभ होगी।"
          descriptionEn="Please review all information and uploaded documents before final submission to the ICJ Network."
          role={role}
        />

        {(errors.declarationAgreed || errors.submit) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: RADIUS.sm, fontWeight: 700 }}>
            {errors.submit || errors.declarationAgreed}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3.5}>
            {/* Section 1: Role Overview */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: RADIUS.md,
                bgcolor: roleConfig.bg,
                border: `1.5px solid ${roleConfig.border}`,
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <GavelIcon sx={{ color: roleConfig.color, fontSize: 26 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: roleConfig.chipBg, fontSize: "1rem" }}>
                      चयनित भूमिका: {roleConfig.titleHi} ({roleConfig.titleEn})
                    </Typography>
                    <Typography sx={{ color: "#475569", fontSize: "0.82rem" }}>
                      {roleConfig.descriptionHi}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onJumpToStep(1)}
                  sx={{
                    color: roleConfig.color,
                    borderColor: roleConfig.border,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: RADIUS.sm,
                  }}
                >
                  बदलें (Change)
                </Button>
              </Stack>
            </Paper>

            {/* Section 2: Personal Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: RADIUS.md,
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                  1. व्यक्तिगत पहचान विवरण (Personal Details)
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onJumpToStep(2)}
                  sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
                >
                  संशोधन करें (Edit)
                </Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>पूरा नाम (Full Name)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.personal.fullName || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>अभिभावक का नाम (Guardian Name)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.personal.guardianName || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>लिंग (Gender)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.personal.gender || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>जन्म तिथि (DOB)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.personal.dateOfBirth || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>मोबाइल (Mobile)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    +91 {formState.personal.mobile || "—"}
                  </Typography>
                </Grid>
                {formState.personal.email && (
                  <Grid size={{ xs: 12 }}>
                    <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>ईमेल (Email)</Typography>
                    <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                      {formState.personal.email}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Section 3: Address & Contact */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: RADIUS.md,
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                  2. संपर्क व स्थायी पता (Contact & Address)
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onJumpToStep(3)}
                  sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
                >
                  संशोधन करें (Edit)
                </Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>पूरा पता (Address Line)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.address.addressLine || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>राज्य (State)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.address.state || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>ज़िला (District)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.address.district || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>पिनकोड (Pincode)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.address.pincode || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>पसंदीदा संपर्क माध्यम (Preferred Contact)</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                    {formState.address.preferredContact || "—"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Section 4: Role-Specific Details */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: RADIUS.md,
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                  3. भूमिका विशिष्ट विवरण ({roleConfig.titleHi})
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onJumpToStep(4)}
                  sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
                >
                  संशोधन करें (Edit)
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {role === "citizen" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>मामले की श्रेणी (Matter Type)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.litigant.matterType}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>वर्तमान स्थिति (Status)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.litigant.currentStatus}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>विवाद का विषय (Subject)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.litigant.disputeNature || "—"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>संक्षिप्त विवरण (Description)</Typography>
                      <Typography sx={{ color: "#334155", fontSize: "0.9rem", lineHeight: 1.6 }}>
                        {formState.litigant.description || "—"}
                      </Typography>
                    </Grid>
                  </>
                )}

                {role === "advocate" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>Law School</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.advocate.lawSchool || "—"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>Bar Number</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.advocate.barNumber || "—"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>Experience</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.advocate.yearsOfExperience}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>Practice Areas</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.advocate.practiceAreas?.length
                          ? formState.advocate.practiceAreas.join(", ")
                          : "—"}
                      </Typography>
                    </Grid>
                  </>
                )}

                {role === "franchise" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>संस्था / केंद्र का नाम (Organization)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.franchise.orgName}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>अधिकृत प्रतिनिधि (Authorized Person)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.franchise.authorizedPerson}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>संचालन ज़िला (District)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.franchise.operatingDistrict}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>ई-फाइलिंग डेस्क (E-Filing Desk)</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                        {formState.franchise.hasEfilingDesk === "yes" ? "उपलब्ध (Ready)" : "प्रस्तावित (Planned)"}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            {/* Section 5: Documents Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: RADIUS.md,
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                  4. संलग्न दस्तावेज़ (Uploaded Documents)
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onJumpToStep(5)}
                  sx={{ color: "#2563eb", fontWeight: 700, textTransform: "none" }}
                >
                  संशोधन करें (Edit)
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {Object.entries(formState.documents).map(([key, doc]) => {
                  if (!doc) return null;
                  return (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        bgcolor: "#fff",
                        borderRadius: RADIUS.sm,
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                          {doc.fileName}
                        </Typography>
                      </Stack>
                      <Chip
                        label="सत्यापन हेतु संलग्न (Attached)"
                        size="small"
                        sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.75rem" }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            {/* Declaration Checkbox */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: RADIUS.md,
                border: `2px solid ${errors.declarationAgreed ? "#ef4444" : "#cbd5e1"}`,
                bgcolor: errors.declarationAgreed ? "#fef2f2" : "#f1f5f9",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formState.declarationAgreed}
                    onChange={(e) => onToggleDeclaration(e.target.checked)}
                    sx={{ color: roleConfig.color, "&.Mui-checked": { color: roleConfig.color } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.5 }}>
                    मैं प्रमाणित एवं घोषित करता/करती हूँ कि मेरे द्वारा इस आवेदन में प्रदान की गई समस्त जानकारी एवं संलग्न
                    दस्तावेज़ पूर्णतः सत्य व प्रामाणिक हैं। किसी भी असत्य अथवा भ्रामक विवरण की स्थिति में मेरी सदस्यता अथवा
                    आवेदन निरस्त किया जा सकता है।
                  </Typography>
                }
              />
            </Paper>

            {/* Final Navigation */}
            <FormNavigation
              onBack={onBack}
              isFinalStep={true}
              roleColor={roleConfig.color}
              nextLabel="आवेदन जमा करें (Submit Application) ✓"
              isSubmitting={isSubmitting}
            />
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
