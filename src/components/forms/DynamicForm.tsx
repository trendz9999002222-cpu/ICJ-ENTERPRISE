"use client";

import { Alert, Box, Container, Grid, Paper } from "@mui/material";
import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
import { STEP3_CONTACT_EXTRA_FIELDS } from "@/config/roleForms/commonFields.config";
import { getRoleStepConfig } from "@/config/roleForms";
import type {
  AddressContactData,
  AdvocateSpecificData,
  DocumentUploadItem,
  FranchiseSpecificData,
  LitigantSpecificData,
  OnboardingFormState,
  PersonalInfoData,
} from "@/types/onboarding-form";
import { RADIUS, SHADOW } from "@/theme/designTokens";
import AddressFields from "./AddressFields";
import FormField from "./FormField";
import FormNavigation from "./FormNavigation";
import StepIndicator from "./StepIndicator";

interface Props {
  step: number;
  role: OnboardingRole;
  formState: OnboardingFormState;
  errors: Record<string, string>;
  onUpdatePersonal: (updates: Partial<PersonalInfoData>) => void;
  onUpdateAddress: (field: keyof AddressContactData, value: string) => void;
  onUpdateRoleSpecific: (updates: Partial<LitigantSpecificData | AdvocateSpecificData | FranchiseSpecificData>) => void;
  onUpdateDocument: (docKey: string, file: DocumentUploadItem | null) => void;
  onClearError: (name: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export default function DynamicForm({
  step,
  role,
  formState,
  errors,
  onUpdatePersonal,
  onUpdateAddress,
  onUpdateRoleSpecific,
  onUpdateDocument,
  onClearError,
  onBack,
  onProceed,
}: Props) {
  const stepConfig = getRoleStepConfig(role, step);
  const roleConfig = ONBOARDING_ROLES.find((r) => r.id === role) || ONBOARDING_ROLES[0];

  if (!stepConfig) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed();
  };

  // Helper to determine role specific data object
  const getRoleData = () => {
    if (role === "citizen") return formState.litigant;
    if (role === "advocate") return formState.advocate;
    return formState.franchise;
  };

  const currentRoleData = getRoleData();

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
        {/* Step Header */}
        <StepIndicator
          stepNumber={step}
          titleHi={stepConfig.titleHi}
          titleEn={stepConfig.titleEn}
          descriptionHi={stepConfig.descriptionHi}
          descriptionEn={stepConfig.descriptionEn}
          role={role}
        />

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3.5, borderRadius: RADIUS.sm, fontWeight: 700 }}>
            कृपया नीचे चिह्नित त्रुटियों को सुधारें (Please resolve the highlighted fields to continue).
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* STEP 2: Basic Personal Information */}
          {step === 2 && (
            <Grid container spacing={2.5}>
              {stepConfig.fields.map((field) => (
                <FormField
                  key={field.name}
                  config={field}
                  value={formState.personal[field.name as keyof PersonalInfoData] || ""}
                  onChange={(val) => {
                    onUpdatePersonal({ [field.name]: val });
                    if (errors[field.name]) onClearError(field.name);
                  }}
                  error={errors[field.name]}
                />
              ))}
            </Grid>
          )}

          {/* STEP 3: Contact & Address Information */}
          {step === 3 && (
            <Box>
              <AddressFields
                values={formState.address}
                onChange={(f, val) => {
                  onUpdateAddress(f, val);
                  if (errors[f]) onClearError(f);
                }}
                errors={errors as Partial<Record<keyof AddressContactData, string>>}
              />

              <Grid container spacing={2.5} sx={{ mt: 1 }}>
                {STEP3_CONTACT_EXTRA_FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    config={field}
                    value={formState.address[field.name as keyof AddressContactData] || ""}
                    onChange={(val) => {
                      onUpdateAddress(field.name as keyof AddressContactData, val);
                      if (errors[field.name]) onClearError(field.name);
                    }}
                    error={errors[field.name]}
                  />
                ))}
              </Grid>
            </Box>
          )}

          {/* STEP 4: Role-Specific Details */}
          {step === 4 && (
            <Grid container spacing={2.5}>
              {stepConfig.fields.map((field) => {
                // Check conditional visibility (dependsOn)
                if (field.dependsOn) {
                  const dependentVal = (currentRoleData as any)[field.dependsOn.field];
                  if (Array.isArray(field.dependsOn.value)) {
                    if (!field.dependsOn.value.includes(dependentVal)) return null;
                  } else if (dependentVal !== field.dependsOn.value) {
                    return null;
                  }
                }

                return (
                  <FormField
                    key={field.name}
                    config={field}
                    value={(currentRoleData as any)[field.name] || ""}
                    onChange={(val) => {
                      onUpdateRoleSpecific({ [field.name]: val });
                      if (errors[field.name]) onClearError(field.name);
                    }}
                    error={errors[field.name]}
                  />
                );
              })}
            </Grid>
          )}

          {/* STEP 5: Documents & Verification */}
          {step === 5 && (
            <Grid container spacing={3}>
              {stepConfig.fields.map((field) => (
                <FormField
                  key={field.name}
                  config={field}
                  value={formState.documents[field.name] || null}
                  onChange={(val) => {
                    onUpdateDocument(field.name, val);
                    if (errors[field.name]) onClearError(field.name);
                  }}
                  error={errors[field.name]}
                />
              ))}
            </Grid>
          )}

          {/* Navigation Controls */}
          <FormNavigation
            onBack={onBack}
            roleColor={roleConfig.color}
            nextLabel="आगे बढ़ें (Continue) →"
          />
        </Box>
      </Paper>
    </Container>
  );
}
