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
  Typography,
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

function initialPhase(cfg: MembershipOnboardingConfiguration): FlowPhase {
  if (cfg.steps.length) return "steps";
  if (cfg.documents.length) return "documents";
  return "review";
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
        setConfig(cfg);
        setPaymentSettings(pay);
        setPhase(initialPhase(cfg));
      })
      .catch(() => setLoadError("Unable to load membership form. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const steps = config?.steps ?? [];
  const currentStep = steps[stepIndex];
  const stepSchema = useMemo(() => (currentStep ? stepToFormSchema(currentStep) : null), [currentStep]);
  const formDocuments = useMemo(() => documentsToFields(config?.documents ?? []), [config?.documents]);

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

  if (loadError || !config?.form) {
    return (
      <Alert severity="warning">
        {loadError ?? "Membership application form is not configured yet. Please check back soon."}
      </Alert>
    );
  }

  const formTitle = config.form?.title ?? "Membership application";

  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
        <Typography sx={{ fontWeight: 800 }}>Apply for Membership</Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {formTitle}
          {config.form?.version ? ` · Version ${config.form.version}` : ""}
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}

        {phase === "steps" && stepSchema && currentStep && (
          <>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{currentStep.title}</Typography>
            {currentStep.subtitle && (
              <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>{currentStep.subtitle}</Typography>
            )}
            <DynamicFormRenderer schema={stepSchema} values={values} errors={errors} theme={THEME} onChange={onChange} />
          </>
        )}

        {phase === "documents" && formDocuments.length > 0 && (
          <>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Upload Documents</Typography>
            <DocumentsUpload
              documents={formDocuments}
              files={files}
              errors={errors}
              theme={THEME}
              onChange={(name, file) => setFiles((prev) => ({ ...prev, [name]: file }))}
            />
          </>
        )}

        {phase === "payment" && paymentSettings && (
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Membership fee (Razorpay test)</Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Pay ₹{paymentSettings.amount_inr.toFixed(2)} to submit your application. Use Razorpay test cards in test mode.
            </Typography>
          </Stack>
        )}

        {phase === "review" && (
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Review & Submit</Typography>
            {steps.map((step) =>
              step.step_fields.map((f) => (
                <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>{f.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
                    {String(values[f.field_key] ?? "—")}
                  </Typography>
                </Box>
              )),
            )}
            <FormControlLabel
              control={<Checkbox checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} />}
              label="I declare that the information provided is true and complete."
            />
            {errors.declaration && (
              <Typography variant="caption" color="error">{errors.declaration}</Typography>
            )}
          </Stack>
        )}

        <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goBack}
            disabled={phase === "steps" && stepIndex === 0}
            sx={{ textTransform: "none" }}
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
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb", borderRadius: RADIUS.sm, px: 3 }}
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
  );
}
