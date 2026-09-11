"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  type AdvocateIdentityFormData,
  INITIAL_ADVOCATE_IDENTITY_DATA,
  ONBOARDING_STEPS,
  type OnboardingRole,
} from "@/constants/onboarding";
import { RADIUS, actionButtonSx } from "@/theme/designTokens";

import AdvocateIdentityStep from "./AdvocateIdentityStep";
import OnboardingStepBar from "./OnboardingStepBar";
import RoleSelectionStep from "./RoleSelectionStep";

export default function OnboardingWizard() {
  const searchParams = useSearchParams();
  const urlStep = Number(searchParams.get("step"));
  const urlRole = searchParams.get("role") as OnboardingRole | null;

  const [step, setStep] = useState(urlStep && urlStep >= 1 && urlStep <= 6 ? urlStep : 1);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>(
    urlRole === "citizen" || urlRole === "advocate" || urlRole === "franchise" ? urlRole : "advocate"
  );
  const [advocateData, setAdvocateData] = useState<AdvocateIdentityFormData>(INITIAL_ADVOCATE_IDENTITY_DATA);

  const currentStep = ONBOARDING_STEPS[step - 1];

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const updateAdvocateData = (updates: Partial<AdvocateIdentityFormData>) => {
    setAdvocateData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <Box sx={{ flex: 1, bgcolor: "#f8fafc", color: "#0f172a", pb: { xs: 4, md: 6 } }}>
      <OnboardingStepBar step={currentStep} totalSteps={ONBOARDING_STEPS.length} />

      {step === 1 && (
        <>
          <RoleSelectionStep
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onProceed={handleNext}
          />
          <Container maxWidth="xl" sx={{ pb: { xs: 4, md: 6 } }}>
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                sx={{ ...actionButtonSx("#2563eb"), px: 4, py: 1.25 }}
              >
                आगे बढ़ें (Next)
              </Button>
            </Stack>
          </Container>
        </>
      )}

      {step === 2 && selectedRole === "advocate" && (
        <AdvocateIdentityStep
          data={advocateData}
          onChange={updateAdvocateData}
          onBack={handleBack}
          onProceed={handleNext}
        />
      )}

      {((step === 2 && selectedRole !== "advocate") || step > 2) && (
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 6 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: RADIUS.lg,
              bgcolor: "#fff",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              Step {step}: {currentStep.titleHi}
            </Typography>
            <Typography sx={{ color: "#64748b", mb: 3 }}>
              {currentStep.titleEn} — Django API integration coming soon.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ color: "#475569", borderColor: "#cbd5e1", fontWeight: 700, textTransform: "none" }}
            >
              Back
            </Button>
          </Paper>
        </Container>
      )}
    </Box>
  );
}
