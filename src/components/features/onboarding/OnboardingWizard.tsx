// "use client";

// import { useState } from "react";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import { Box, Button, Container, Stack } from "@mui/material";
// import { useSearchParams } from "next/navigation";

// import DynamicForm from "@/components/forms/DynamicForm";
// import ReviewStep from "@/components/forms/ReviewStep";
// import SubmissionSuccess from "@/components/forms/SubmissionSuccess";
// import {
//   ONBOARDING_ROLES,
//   ONBOARDING_STEPS,
//   type OnboardingRole,
// } from "@/constants/onboarding";
// import { ApiError } from "@/lib/api/client";
// import { scrollToFirstFieldError } from "@/lib/form/scrollToFieldError";
// import { validateStep } from "@/schemas/roleForms";
// import { onboardingService } from "@/services/onboarding.service";
// import { actionButtonSx } from "@/theme/designTokens";
// import {
//   type AddressContactData,
//   type AdvocateSpecificData,
//   type DocumentUploadItem,
//   type FranchiseSpecificData,
//   INITIAL_ONBOARDING_FORM_STATE,
//   type LitigantSpecificData,
//   type OnboardingFormState,
//   type PersonalInfoData,
// } from "@/types/onboarding-form";

// import OnboardingStepBar from "./OnboardingStepBar";
// import RoleSelectionStep from "./RoleSelectionStep";

// export default function OnboardingWizard() {
//   const searchParams = useSearchParams();
//   const urlStep = Number(searchParams.get("step"));
//   const urlRole = searchParams.get("role") as OnboardingRole | null;

//   const initialRole: OnboardingRole =
//     urlRole === "citizen" || urlRole === "advocate" || urlRole === "franchise"
//       ? urlRole
//       : "advocate";

//   const [step, setStep] = useState(urlStep && urlStep >= 1 && urlStep <= 6 ? urlStep : 1);
//   const [selectedRole, setSelectedRole] = useState<OnboardingRole>(initialRole);
//   const [formState, setFormState] = useState<OnboardingFormState>({
//     ...INITIAL_ONBOARDING_FORM_STATE,
//     role: initialRole,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [referenceId, setReferenceId] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const currentStep = ONBOARDING_STEPS[step - 1];
//   const roleConfig = ONBOARDING_ROLES.find((r) => r.id === selectedRole) || ONBOARDING_ROLES[0];

//   const handleRoleSelect = (role: OnboardingRole) => {
//     setSelectedRole(role);
//     setFormState((prev) => ({
//       ...prev,
//       role,
//     }));
//   };

//   const handleNext = () => {
//     if (step === 1) {
//       setStep(2);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     // Central validation before continuing
//     const stepErrors = validateStep(step, formState);
//     if (Object.keys(stepErrors).length > 0) {
//       setErrors(stepErrors);
//       scrollToFirstFieldError(stepErrors);
//       return;
//     }

//     setErrors({});
//     if (step < ONBOARDING_STEPS.length) {
//       setStep((s) => s + 1);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleBack = () => {
//     setErrors({});
//     if (step > 1) {
//       setStep((s) => s - 1);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleJumpToStep = (targetStep: number) => {
//     setErrors({});
//     if (targetStep >= 1 && targetStep <= 6) {
//       setStep(targetStep);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleUpdatePersonal = (updates: Partial<PersonalInfoData>) => {
//     setFormState((prev) => ({
//       ...prev,
//       personal: { ...prev.personal, ...updates },
//     }));
//   };

//   const handleUpdateAddress = (field: keyof AddressContactData, value: string) => {
//     setFormState((prev) => ({
//       ...prev,
//       address: { ...prev.address, [field]: value },
//     }));
//   };

//   const handleUpdateRoleSpecific = (
//     updates: Partial<LitigantSpecificData | AdvocateSpecificData | FranchiseSpecificData>
//   ) => {
//     setFormState((prev) => {
//       if (prev.role === "citizen") {
//         return {
//           ...prev,
//           litigant: { ...prev.litigant, ...(updates as Partial<LitigantSpecificData>) },
//         };
//       }
//       if (prev.role === "advocate") {
//         return {
//           ...prev,
//           advocate: { ...prev.advocate, ...(updates as Partial<AdvocateSpecificData>) },
//         };
//       }
//       return {
//         ...prev,
//         franchise: { ...prev.franchise, ...(updates as Partial<FranchiseSpecificData>) },
//       };
//     });
//   };

//   const handleUpdateDocument = (docKey: string, fileItem: DocumentUploadItem | null) => {
//     setFormState((prev) => ({
//       ...prev,
//       documents: {
//         ...prev.documents,
//         [docKey]: fileItem,
//       },
//     }));
//   };

//   const handleToggleDeclaration = (agreed: boolean) => {
//     setFormState((prev) => ({ ...prev, declarationAgreed: agreed }));
//     if (errors.declarationAgreed && agreed) {
//       setErrors((prev) => {
//         const next = { ...prev };
//         delete next.declarationAgreed;
//         return next;
//       });
//     }
//   };

//   const handleFinalSubmit = async () => {
//     const stepErrors = validateStep(6, formState);
//     if (Object.keys(stepErrors).length > 0) {
//       setErrors(stepErrors);
//       scrollToFirstFieldError(stepErrors);
//       return;
//     }

//     setIsSubmitting(true);
//     setErrors({});

//     if (formState.role === "advocate") {
//       try {
//         const response = await onboardingService.submitAdvocateApplication(formState);
//         setReferenceId(response.data.reference_id);
//         setIsSubmitted(true);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       } catch (err) {
//         let message =
//           "Submission failed. Please check your documents and try again, or contact support.";
//         if (err instanceof ApiError) {
//           const body =
//             err.body && typeof err.body === "object"
//               ? (err.body as { message?: string; errors?: Record<string, unknown> })
//               : null;
//           message = body?.message || message;
//         } else if (err instanceof Error) {
//           message = err.message;
//         }
//         setErrors({ submit: message });
//         scrollToFirstFieldError({ submit: message });
//       } finally {
//         setIsSubmitting(false);
//       }
//       return;
//     }

//     setTimeout(() => {
//       const generatedRef = `ICJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
//       setReferenceId(generatedRef);
//       setIsSubmitting(false);
//       setIsSubmitted(true);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }, 750);
//   };

//   const handleResetForm = () => {
//     setFormState({
//       ...INITIAL_ONBOARDING_FORM_STATE,
//       role: selectedRole,
//     });
//     setErrors({});
//     setIsSubmitted(false);
//     setReferenceId("");
//     setStep(1);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleClearError = (name: string) => {
//     setErrors((prev) => {
//       if (!prev[name]) return prev;
//       const next = { ...prev };
//       delete next[name];
//       return next;
//     });
//   };

//   return (
//     <Box sx={{ flex: 1, bgcolor: "#f8fafc", color: "#0f172a", pb: { xs: 4, md: 6 } }}>
//       {!isSubmitted && (
//         <OnboardingStepBar step={currentStep} totalSteps={ONBOARDING_STEPS.length} />
//       )}

//       {/* Success View */}
//       {isSubmitted && (
//         <SubmissionSuccess
//           role={selectedRole}
//           applicantName={formState.personal.fullName || "Applicant"}
//           referenceId={referenceId}
//           onReset={handleResetForm}
//         />
//       )}

//       {/* Step 1: Role Selection (Untouched UI) */}
//       {!isSubmitted && step === 1 && (
//         <>
//           <RoleSelectionStep
//             selectedRole={selectedRole}
//             onSelectRole={handleRoleSelect}
//             onProceed={handleNext}
//           />
//           <Container maxWidth="xl" sx={{ pb: { xs: 4, md: 6 } }}>
//             <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
//               <Button
//                 variant="contained"
//                 size="large"
//                 endIcon={<ArrowForwardIcon />}
//                 onClick={handleNext}
//                 sx={{
//                   ...actionButtonSx(roleConfig.color),
//                   px: 4,
//                   py: 1.25,
//                 }}
//               >
//                 आगे बढ़ें (Next)
//               </Button>
//             </Stack>
//           </Container>
//         </>
//       )}

//       {/* Steps 2 through 5: Dynamic Form Engine */}
//       {!isSubmitted && step >= 2 && step <= 5 && (
//         <DynamicForm
//           step={step}
//           role={selectedRole}
//           formState={formState}
//           errors={errors}
//           onUpdatePersonal={handleUpdatePersonal}
//           onUpdateAddress={handleUpdateAddress}
//           onUpdateRoleSpecific={handleUpdateRoleSpecific}
//           onUpdateDocument={handleUpdateDocument}
//           onClearError={handleClearError}
//           onBack={handleBack}
//           onProceed={handleNext}
//         />
//       )}

//       {/* Step 6: Review & Final Submission */}
//       {!isSubmitted && step === 6 && (
//         <ReviewStep
//           role={selectedRole}
//           formState={formState}
//           errors={errors}
//           onToggleDeclaration={handleToggleDeclaration}
//           onJumpToStep={handleJumpToStep}
//           onBack={handleBack}
//           onSubmit={handleFinalSubmit}
//           isSubmitting={isSubmitting}
//         />
//       )}
//     </Box>
//   );
// }
