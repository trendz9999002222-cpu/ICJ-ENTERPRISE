"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

import DocumentsUpload from "@/components/features/onboarding/onboarding-file/DocumentsUpload";
import DynamicFormRenderer from "@/components/features/onboarding/onboarding-file/DynamicFormRenderer";
import { RADIUS } from "@/components/features/onboarding/onboarding-file/iconMap";
import { ApiError } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import { stepToFormSchema } from "@/lib/membership/mapMembershipStep";
import { loadRazorpayCheckout } from "@/lib/razorpay/loadRazorpay";
import {
  membershipOnboardingPublicService,
  type MembershipPaymentSettings,
} from "@/services/public/membershipOnboardingPublic.service";
import type {
  MembershipOnboardingConfiguration,
  MembershipOnboardingDocument,
  MembershipOnboardingStep,
} from "@/types/public/membershipOnboarding";
import type { DocumentField, Theme } from "@/types/registration";
import { scrollToFirstError, validateDocuments, validateSections } from "@/lib/validation";

const THEME: Theme = { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
const MEMBER_DASHBOARD = "/dashboard/member";

type FlowPhase = "steps" | "documents" | "review" | "payment" | "done";

function documentsToFields(docs: MembershipOnboardingDocument[]): DocumentField[] {
  return docs.map((d) => ({
    name: d.document_key,
    label: d.name,
    required: d.is_required,
    hint: d.instructions,
    maxSizeMb: d.max_file_size_mb,
    accept: (d.allowed_extensions || []).map((e) => `.${e.replace(/^\./, "")}`).join(",") || ".pdf,.jpg,.png",
  }));
}



export default function JoinMembershipApplicationFlow() {
  const [config, setConfig] = useState<MembershipOnboardingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<FlowPhase>("steps");
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<MembershipPaymentSettings | null>(null);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  );

  useEffect(() => {
    Promise.all([
      membershipOnboardingPublicService.fetchConfiguration(),
      membershipOnboardingPublicService.fetchPaymentSettings().catch(() => null),
    ])
      .then(([cfg, pay]) => {
        const filteredSteps = (cfg?.steps ?? []).filter(s => s.step_fields.length > 0);
        setConfig(cfg);
        setPaymentSettings(pay);
        
        let initPhase: FlowPhase = "review";
        if (filteredSteps.length > 0) initPhase = "steps";
        else if (cfg?.documents?.length > 0) initPhase = "documents";
        
        setPhase(initPhase);
      })
      .catch(() => setLoadError("Unable to load membership form. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const steps = (config?.steps ?? [])
    .filter((s) => s.step_fields.length > 0)
    .map((s) => (s.title === "Professional Details" ? { ...s, title: "Personal Details" } : s));
  const currentStep = steps[stepIndex];
  const stepSchema = useMemo(() => (currentStep ? stepToFormSchema(currentStep) : null), [currentStep]);
  const formDocuments = useMemo(() => documentsToFields(config?.documents ?? []), [config?.documents]);

  const [currentUser, setCurrentUser] = useState<{ email: string; first_name?: string; last_name?: string; phone_number?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { readAccessTokenFromCookie } = await import("@/lib/api/client");
      const token = readAccessTokenFromCookie();
      if (token) {
        try {
          const res = await authService.me(token);
          if (res.success && res.data) {
            setCurrentUser(res.data);
            setValues(prev => ({
              ...prev,
              email: res.data.email,
              email_address: res.data.email,
              full_name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
              name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
              first_name: res.data.first_name || "",
              last_name: res.data.last_name || "",
              mobile: res.data.phone_number || "",
              phone_number: res.data.phone_number || "",
              phone: res.data.phone_number || "",
            }));
          }
        } catch (e) {
          // Ignore
        }
      }
    };
    fetchUser();
  }, []);

  const onChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateCurrent = (): boolean => {
    let stepErrors: Record<string, string> = {};
    if (phase === "steps" && stepSchema) {
      if (stepSchema.sections.length) stepErrors = validateSections(stepSchema.sections, values);
      if (stepSchema.documents.length) {
        stepErrors = { ...stepErrors, ...validateDocuments(stepSchema.documents, files) };
      }
    }
    if (phase === "documents" && formDocuments.length) {
      stepErrors = validateDocuments(formDocuments, files);
    }
    if (phase === "review" && !declarationAccepted) {
      stepErrors.declaration = "Please accept the declaration to submit.";
    }
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    if (phase === "steps") {
      if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
      else if (formDocuments.length) setPhase("documents");
      else setPhase("review");
      return;
    }
    if (phase === "documents") setPhase("review");
  };

  const paymentRequired = paymentSettings?.payment_required ?? false;

  const goBack = () => {
    if (phase === "payment") {
      setPhase("review");
      return;
    }
    if (phase === "review") {
      setPhase(formDocuments.length ? "documents" : "steps");
      return;
    }
    if (phase === "documents") {
      setPhase("steps");
      setStepIndex(steps.length - 1);
      return;
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleReviewContinue = () => {
    if (!validateCurrent()) return;
    if (paymentRequired) setPhase("payment");
    else handleSubmit();
  };

  const applySessionAndGoToMemberArea = (access: string, refresh: string) => {
    document.cookie = `icj_access_token=${access}; path=/; max-age=1800; SameSite=Lax`;
    document.cookie = `icj_refresh_token=${refresh}; path=/; max-age=604800; SameSite=Lax`;
    try {
      const b64 = access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(b64)) as { password_change_required?: boolean };
      if (payload.password_change_required) {
        localStorage.setItem("icj_password_change_required", "1");
      } else {
        localStorage.removeItem("icj_password_change_required");
      }
    } catch {
      localStorage.setItem("icj_password_change_required", "1");
    }
    window.location.assign(MEMBER_DASHBOARD);
  };

  const signInAndRedirectToMemberDashboard = async (
    result: Awaited<ReturnType<typeof membershipOnboardingPublicService.submitApplication>>,
  ) => {
    setRedirecting(true);

    if (result.access && result.refresh) {
      applySessionAndGoToMemberArea(result.access, result.refresh);
      return;
    }

    const email = String(result.user?.email ?? values.email ?? values.email_address ?? "")
      .trim()
      .toLowerCase();
    const tempPassword = result.user?.temp_password;

    if (email && tempPassword) {
      try {
        const tokens = await authService.login(email, tempPassword, "whatsapp");
        if (tokens.access && tokens.refresh) {
          applySessionAndGoToMemberArea(tokens.access, tokens.refresh);
          return;
        }
      } catch {
        /* fall through */
      }
    }

    setRedirecting(false);
    setErrors({
      submit:
        "Application submitted. Please log in with your email to open the member dashboard.",
    });
  };

  const submitApplication = async (paymentId?: string) => {
    if (!config) return;
    setSubmitting(true);
    try {
      const pid = paymentId ?? verifiedPaymentId ?? undefined;
      const result = await membershipOnboardingPublicService.submitApplication({
        fieldValues: values,
        files,
        declarationAccepted,
        idempotencyKey: idempotencyKeyRef.current,
        paymentId: pid,
      });
      await signInAndRedirectToMemberDashboard(result);
    } catch (err) {
      let message = "Submission failed.";
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[]> };
        const parts = [body.message, ...(body.errors ? Object.values(body.errors).flat() : [])].filter(Boolean);
        if (parts.length) message = parts.join(" ");
      }
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrent()) return;
    await submitApplication(verifiedPaymentId ?? undefined);
  };

  const handlePayAndSubmit = async () => {
    if (!paymentSettings?.payment_required) {
      await handleSubmit();
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await loadRazorpayCheckout();
      const order = await membershipOnboardingPublicService.createPaymentOrder();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay failed to load.");

      const email = String(values.email ?? values.email_address ?? "").trim();
      const name = String(values.full_name ?? values.name ?? "Applicant").trim();

      await new Promise<void>((resolve, reject) => {
        const rzp = new Razorpay({
          key: order.razorpay_key_id,
          amount: order.amount_paise,
          currency: order.currency,
          name: "ICJ Membership",
          description: "Membership application fee",
          order_id: order.razorpay_order_id,
          prefill: { email, name },
          theme: { color: "#2563eb" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await membershipOnboardingPublicService.verifyPayment({
                payment_id: order.payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setVerifiedPaymentId(order.payment_id);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
        });
        rzp.open();
      });

      await submitApplication(order.payment_id);
    } catch (err) {
      let message = "Payment failed.";
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string };
        if (body.message) message = body.message;
      } else if (err instanceof Error) message = err.message;
      setErrors({ submit: message });
      setSubmitting(false);
    }
  };

  if (loading || redirecting) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress />
        <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
          {redirecting ? "Payment received — opening your member dashboard…" : "Loading…"}
        </Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Alert severity="warning">
        {loadError}
      </Alert>
    );
  }

  const formTitle = config?.form?.title ?? "Membership application";

  const availableTabs = steps.map((s, i) => ({
    label: s.title,
    phase: "steps",
    stepIndex: i,
  }));
  
  if (formDocuments.length > 0) availableTabs.push({ label: "Documents", phase: "documents", stepIndex: -1 });
  availableTabs.push({ label: "Review & Submit", phase: "review", stepIndex: -1 });
  if (paymentRequired) availableTabs.push({ label: "Payment", phase: "payment", stepIndex: -1 });

  const currentTabIndex = availableTabs.findIndex(
    (t) => t.phase === phase && (t.phase !== "steps" || t.stepIndex === stepIndex)
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>Apply for Membership</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            {formTitle}
            {config?.form?.version ? ` · Version ${config?.form?.version}` : ""}
          </Typography>
          
          <Box sx={{ width: "100%", overflowX: "auto", pb: 2 }}>
            <Stepper
              activeStep={currentTabIndex >= 0 ? currentTabIndex : 0}
              alternativeLabel
              sx={{
                minWidth: 600,
                "& .MuiStepLabel-label": { fontWeight: 600, color: "#64748b" },
                "& .MuiStepLabel-label.Mui-active": { color: "#2563eb" },
                "& .MuiStepLabel-label.Mui-completed": { color: "#10b981" },
                "& .MuiStepIcon-root.Mui-active": { color: "#2563eb" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#10b981" },
              }}
            >
              {availableTabs.map((tab, idx) => (
                <Step key={idx} completed={currentTabIndex > idx}>
                  <StepLabel>{tab.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Container>
      </Box>

      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="md">
          {errors.submit && <Alert severity="error" sx={{ mb: 3 }}>{errors.submit}</Alert>}
          {currentUser && (
            <Alert severity="success" sx={{ mb: 3 }}>
              You are logged in as <strong>{currentUser.first_name} {currentUser.last_name}</strong> ({currentUser.email}). Your basic details have been pre-filled.
            </Alert>
          )}

          {phase === "steps" && (
            <Box sx={{ bgcolor: "#transparent", p: { xs: 0 }, borderRadius: 0, border: "none" }}>
              {!currentStep || !stepSchema ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No fields have been configured for this form yet.
                </Alert>
              ) : (
                <>
                  {currentStep.step_fields.length === 0 ? (
                    <Alert severity="info">No fields are configured for this step.</Alert>
                  ) : (
                    <DynamicFormRenderer schema={stepSchema} values={values} errors={errors} theme={THEME} onChange={onChange} />
                  )}
                </>
              )}
            </Box>
          )}

          {phase === "documents" && formDocuments.length > 0 && (
            <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", mb: 3, color: "#0f172a" }}>Upload Documents</Typography>
              <DocumentsUpload
                documents={formDocuments}
                files={files}
                errors={errors}
                theme={THEME}
                onChange={(name, file) => setFiles((prev) => ({ ...prev, [name]: file }))}
              />
            </Box>
          )}

          {phase === "payment" && paymentSettings && (
            <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0f172a" }}>Membership fee (Razorpay test)</Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Pay ₹{paymentSettings.amount_inr.toFixed(2)} to submit your application. Use Razorpay test cards in test mode.
                </Typography>
              </Stack>
            </Box>
          )}

          {phase === "review" && (
            <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Stack spacing={2.5}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0f172a", mb: 1 }}>Review & Submit</Typography>
                {steps.map((step) =>
                  step.step_fields.length > 0 && (
                    <Box key={step.id}>
                      <Typography sx={{ fontWeight: 700, color: "#334155", mb: 1.5, fontSize: "0.95rem" }}>{step.title}</Typography>
                      {step.step_fields.map((f) => (
                        <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>{f.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", color: "#0f172a" }}>
                            {String(values[f.field_key] ?? "—")}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )
                )}
                
                <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e2e8f0" }}>
                  <FormControlLabel
                    control={<Checkbox checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} />}
                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I declare that the information provided is true and complete.</Typography>}
                  />
                  {errors.declaration && (
                    <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>{errors.declaration}</Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          )}

          <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              disabled={phase === "steps" && stepIndex === 0}
              sx={{ textTransform: "none", color: "#64748b" }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              endIcon={phase === "review" || phase === "payment" ? undefined : <ArrowForwardIcon />}
              disabled={submitting}
              onClick={
                phase === "payment"
                  ? handlePayAndSubmit
                  : phase === "review"
                    ? handleReviewContinue
                    : goNext
              }
              sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb", borderRadius: RADIUS.sm, px: 4, py: 1 }}
            >
              {submitting
                ? "Please wait…"
                : phase === "payment"
                  ? "Pay & submit application"
                  : phase === "review"
                    ? paymentRequired
                      ? "Continue to payment"
                      : "Submit application"
                    : "Continue"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
