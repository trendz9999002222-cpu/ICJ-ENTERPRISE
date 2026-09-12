"use client";

import { Alert, Box, Container, Grid, Paper } from "@mui/material";
import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
import { STEP3_CONTACT_EXTRA_FIELDS } from "@/config/roleForms/commonFields.config";
import { getRoleStepConfig } from "@/config/roleForms";
import AdvocateKycFormHeader from "@/components/features/onboarding/AdvocateKycFormHeader";
import type {
  AddressContactData,
  AdvocateSpecificData,
  DocumentUploadItem,
  FormFieldBindTarget,
  FormFieldConfig,
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

function resolveBindTarget(
  role: OnboardingRole,
  step: number,
  field: FormFieldConfig
): FormFieldBindTarget {
  if (field.bindTo) return field.bindTo;
  if (step === 2) return "personal";
  if (step === 3 && role === "advocate") return "advocate";
  if (step === 4) return "advocate";
  return "personal";
}

function getBoundValue(
  formState: OnboardingFormState,
  role: OnboardingRole,
  bind: FormFieldBindTarget,
  fieldName: string
): unknown {
  if (bind === "personal") {
    return formState.personal[fieldName as keyof PersonalInfoData] ?? "";
  }
  if (bind === "address") {
    return formState.address[fieldName as keyof AddressContactData] ?? "";
  }
  if (bind === "advocate" && role === "advocate") {
    const raw = (formState.advocate as AdvocateSpecificData)[fieldName as keyof AdvocateSpecificData];
    if (fieldName === "practiceAreas" || fieldName === "languagesKnown") {
      return Array.isArray(raw) ? raw : [];
    }
    return raw ?? "";
  }
  if (role === "citizen") {
    return (formState.litigant as unknown as Record<string, unknown>)[fieldName] ?? "";
  }
  if (role === "franchise") {
    return (formState.franchise as unknown as Record<string, unknown>)[fieldName] ?? "";
  }
  return (formState.advocate as unknown as Record<string, unknown>)[fieldName] ?? "";
}

function renderConfiguredFields(
  fields: FormFieldConfig[],
  ctx: {
    role: OnboardingRole;
    step: number;
    formState: OnboardingFormState;
    errors: Record<string, string>;
    onUpdatePersonal: Props["onUpdatePersonal"];
    onUpdateAddress: Props["onUpdateAddress"];
    onUpdateRoleSpecific: Props["onUpdateRoleSpecific"];
    onClearError: Props["onClearError"];
    roleData: LitigantSpecificData | AdvocateSpecificData | FranchiseSpecificData;
  }
) {
  const { role, step, formState, errors, onUpdatePersonal, onUpdateAddress, onUpdateRoleSpecific, onClearError, roleData } =
    ctx;

  return fields.map((field) => {
    if (field.type === "section") {
      return <FormField key={field.name} config={field} value="" onChange={() => undefined} />;
    }

    if (field.dependsOn) {
      const dependentVal = (roleData as unknown as Record<string, unknown>)[field.dependsOn.field];
      if (Array.isArray(field.dependsOn.value)) {
        if (!field.dependsOn.value.includes(dependentVal as string)) return null;
      } else if (dependentVal !== field.dependsOn.value) {
        return null;
      }
    }

    const bind = resolveBindTarget(role, step, field);
    const value = getBoundValue(formState, role, bind, field.name);

    const handleChange = (val: unknown) => {
      if (bind === "personal") {
        onUpdatePersonal({ [field.name]: val } as Partial<PersonalInfoData>);
      } else if (bind === "address") {
        onUpdateAddress(field.name as keyof AddressContactData, String(val));
      } else {
        onUpdateRoleSpecific({ [field.name]: val } as Partial<AdvocateSpecificData>);
      }
      if (errors[field.name]) onClearError(field.name);
    };

    return (
      <FormField
        key={field.name}
        config={field}
        value={value}
        onChange={handleChange}
        error={errors[field.name]}
      />
    );
  });
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

  const getRoleData = () => {
    if (role === "citizen") return formState.litigant;
    if (role === "advocate") return formState.advocate;
    return formState.franchise;
  };

  const currentRoleData = getRoleData();
  const isAdvocateKyc = role === "advocate";

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
        {isAdvocateKyc && step === 2 && <AdvocateKycFormHeader />}

        <StepIndicator
          stepNumber={step}
          titleHi={stepConfig.titleHi}
          titleEn={stepConfig.titleEn}
          descriptionHi={isAdvocateKyc ? undefined : stepConfig.descriptionHi}
          descriptionEn={isAdvocateKyc ? undefined : stepConfig.descriptionEn}
          role={role}
          compact={isAdvocateKyc}
        />

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3.5, borderRadius: RADIUS.sm, fontWeight: 700 }}>
            कृपया नीचे चिह्नित त्रुटियों को सुधारें (Please resolve the highlighted fields to continue).
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {step === 2 && (
            <Grid container spacing={2.5}>
              {renderConfiguredFields(stepConfig.fields, {
                role,
                step,
                formState,
                errors,
                onUpdatePersonal,
                onUpdateAddress,
                onUpdateRoleSpecific,
                onClearError,
                roleData: currentRoleData,
              })}
            </Grid>
          )}

          {step === 3 && role === "advocate" && (
            <Grid container spacing={2.5}>
              {renderConfiguredFields(stepConfig.fields, {
                role,
                step,
                formState,
                errors,
                onUpdatePersonal,
                onUpdateAddress,
                onUpdateRoleSpecific,
                onClearError,
                roleData: currentRoleData,
              })}
            </Grid>
          )}

          {step === 3 && role !== "advocate" && (
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

          {step === 4 && (
            <Grid container spacing={2.5}>
              {renderConfiguredFields(stepConfig.fields, {
                role,
                step,
                formState,
                errors,
                onUpdatePersonal,
                onUpdateAddress,
                onUpdateRoleSpecific,
                onClearError,
                roleData: currentRoleData,
              })}
            </Grid>
          )}

          {step === 5 && (
            <Grid container spacing={3}>
              {stepConfig.fields.map((field) => {
                if (field.type === "section") {
                  return (
                    <FormField key={field.name} config={field} value="" onChange={() => undefined} />
                  );
                }
                return (
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
                );
              })}
            </Grid>
          )}

          <FormNavigation onBack={onBack} roleColor={roleConfig.color} nextLabel="आगे बढ़ें (Continue) →" />
        </Box>
      </Paper>
    </Container>
  );
}
