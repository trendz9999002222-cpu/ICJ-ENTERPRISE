"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import DocumentsUpload from "@/components/features/onboarding/onboarding-file/DocumentsUpload";
import DynamicFormRenderer from "@/components/features/onboarding/onboarding-file/DynamicFormRenderer";
import { RADIUS } from "@/components/features/onboarding/onboarding-file/iconMap";
import { ApiError } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import { emailVerificationService } from "@/services/emailVerification.service";
import { stepToFormSchema } from "@/lib/membership/mapMembershipStep";
// Razorpay loader (Commented out - switched to Easebuzz)
// import { loadRazorpayCheckout } from "@/lib/razorpay/loadRazorpay";
import { loadEasebuzzCheckout } from "@/lib/easebuzz/loadEasebuzz";
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

type FlowPhase = "personal" | "additional" | "payment" | "review";

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
  const [phase, setPhase] = useState<FlowPhase>("personal");
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingIdentity, setValidatingIdentity] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<MembershipPaymentSettings | null>(null);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);
  const [paymentSkipped, setPaymentSkipped] = useState(false);
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
        setPhase("personal");
      })
      .catch(() => setLoadError("Unable to load membership form. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const steps = useMemo(() => {
    return (config?.steps ?? []).filter((s) => s.step_fields && s.step_fields.length > 0);
  }, [config?.steps]);

  const personalStep: MembershipOnboardingStep | undefined = steps[0];
  const additionalStep: MembershipOnboardingStep | undefined = steps.length > 1 ? steps[1] : undefined;
  const hasAdditionalStep = Boolean(additionalStep && additionalStep.step_fields.length > 0);
  const hasPaymentStep = paymentSettings ? paymentSettings.is_payment_enabled !== false : true;

  const personalSchema = useMemo(() => (personalStep ? stepToFormSchema(personalStep) : null), [personalStep]);
  const additionalSchema = useMemo(() => (additionalStep ? stepToFormSchema(additionalStep) : null), [additionalStep]);
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
            setValues((prev) => ({
              ...prev,
              email: res.data.email,
              email_address: res.data.email,
              full_name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
              name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
              first_name: res.data.first_name || "",
              last_name: res.data.last_name || "",
              mobile: res.data.phone_number || "",
              mobile_number: res.data.phone_number || "",
              phone_number: res.data.phone_number || "",
              phone: res.data.phone_number || "",
            }));
          }
        } catch {
          // Ignore
        }
      }
    };
    fetchUser();
  }, []);

  const onChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name] && !prev.submit) return prev;
      const next = { ...prev };
      delete next[name];
      if (name === "mobile" || name === "mobile_number" || name === "phone" || name === "phone_number") {
        delete next.mobile;
        delete next.mobile_number;
        delete next.phone;
        delete next.phone_number;
      }
      if (name === "email" || name === "email_address") {
        delete next.email;
        delete next.email_address;
      }
      delete next.submit;
      return next;
    });
  }, []);

  // Stepper Items Definition
  const stepperTabs = useMemo(() => {
    const items: Array<{ id: FlowPhase; label: string }> = [
      { id: "personal", label: "Personal Information" },
    ];
    if (hasAdditionalStep) {
      items.push({ id: "additional", label: "Additional Fields" });
    }
    if (hasPaymentStep) {
      items.push({ id: "payment", label: "Payment" });
    }
    items.push({ id: "review", label: "Review & Submit" });
    return items;
  }, [hasAdditionalStep, hasPaymentStep]);

  const currentTabIndex = stepperTabs.findIndex((t) => t.id === phase);

  const validatePersonal = (): boolean => {
    if (!personalSchema) return true;
    let stepErrors: Record<string, string> = {};
    if (personalSchema.sections.length) {
      stepErrors = validateSections(personalSchema.sections, values);
    }
    if (personalSchema.documents.length) {
      stepErrors = { ...stepErrors, ...validateDocuments(personalSchema.documents, files) };
    }
    if (!hasAdditionalStep && formDocuments.length) {
      stepErrors = { ...stepErrors, ...validateDocuments(formDocuments, files) };
    }
    if (!currentUser) {
      const emailVal = ((values.email || values.email_address) as string) || "";
      if (emailVal && !emailVerificationService.isEmailVerified(emailVal)) {
        stepErrors.email = "Please verify your email address before continuing to the next step.";
      }
    }
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateAdditional = (): boolean => {
    if (!additionalSchema) return true;
    let stepErrors: Record<string, string> = {};
    if (additionalSchema.sections.length) {
      stepErrors = validateSections(additionalSchema.sections, values);
    }
    if (additionalSchema.documents.length) {
      stepErrors = { ...stepErrors, ...validateDocuments(additionalSchema.documents, files) };
    }
    if (formDocuments.length) {
      stepErrors = { ...stepErrors, ...validateDocuments(formDocuments, files) };
    }
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextFromPersonal = async () => {
    // 1. Client-side field validations
    if (!validatePersonal()) return;

    // 2. Server-side duplicate validation for email & phone
    const email = String(values.email ?? values.email_address ?? "").trim();
    const phone = String(
      values.mobile_number ?? values.phone ?? values.mobile ?? values.phone_number ?? ""
    ).trim();

    if (email || phone) {
      setValidatingIdentity(true);
      try {
        await membershipOnboardingPublicService.validateIdentity({ email, phone });
      } catch (err) {
        const fieldErrs: Record<string, string> = {};
        const messages: string[] = [];

        if (err instanceof ApiError && err.body && typeof err.body === "object") {
          const body = err.body as { message?: string; errors?: Record<string, string[] | string> };
          if (body.errors && typeof body.errors === "object") {
            for (const [k, v] of Object.entries(body.errors)) {
              const msg = Array.isArray(v) ? v[0] : String(v);
              fieldErrs[k] = msg;
              if (msg && !messages.includes(msg)) {
                messages.push(msg);
              }
            }
          }
          if (messages.length === 0 && body.message) {
            messages.push(body.message);
          }
        } else if (err instanceof Error) {
          messages.push(err.message);
        }

        const combinedMsg = messages.join(" — ") || "This email or mobile number is already registered.";
        const newErrors = {
          submit: combinedMsg,
          ...fieldErrs,
        };
        setErrors(newErrors);
        scrollToFirstError(newErrors);
        setValidatingIdentity(false);
        // CRITICAL: Stop here! Do not proceed to next step if identity is already registered
        return;
      } finally {
        setValidatingIdentity(false);
      }
    }

    // 3. Identity is valid - proceed to next step
    if (hasAdditionalStep) {
      setPhase("additional");
    } else if (hasPaymentStep) {
      setPhase("payment");
    } else {
      setPhase("review");
    }
  };

  const handleNextFromAdditional = () => {
    if (!validateAdditional()) return;
    if (hasPaymentStep) {
      setPhase("payment");
    } else {
      setPhase("review");
    }
  };

  const handleSkipPayment = () => {
    setPaymentSkipped(true);
    setPhase("review");
  };

  const handleBack = () => {
    if (phase === "additional") {
      setPhase("personal");
    } else if (phase === "payment") {
      if (hasAdditionalStep) {
        setPhase("additional");
      } else {
        setPhase("personal");
      }
    } else if (phase === "review") {
      if (hasPaymentStep) {
        setPhase("payment");
      } else if (hasAdditionalStep) {
        setPhase("additional");
      } else {
        setPhase("personal");
      }
    }
  };

  const handleProcessPayment = async () => {
    setPaymentProcessing(true);
    setErrors({});
    try {
      const email = String(values.email ?? values.email_address ?? "").trim();
      const name = String(values.full_name ?? values.name ?? "Applicant").trim();
      const phone = String(values.mobile_number ?? values.phone ?? values.mobile ?? "").trim();

      // 1. Create order on backend (calls Easebuzz initiateLink)
      const order = await membershipOnboardingPublicService.createPaymentOrder({
        name,
        email,
        phone,
      });

      // 2. Load Easebuzz Checkout SDK (for modal iframe experience)
      let easebuzzLoaded = false;
      try {
        await loadEasebuzzCheckout();
        easebuzzLoaded = typeof window !== "undefined" && Boolean(window.EasebuzzCheckout);
      } catch {
        easebuzzLoaded = false;
      }

      if (easebuzzLoaded && order.access_key) {
        // Open Easebuzz modal popup
        await new Promise<void>((resolve, reject) => {
          try {
            const easebuzz = new window.EasebuzzCheckout(order.key || "P2OTPKQ5X", order.env || "test");
            const options = {
              access_key: order.access_key,
              onResponse: async (response: any) => {
                try {
                  const statusStr = String(response?.status || "").toLowerCase();
                  if (statusStr === "success" || response?.status === 1) {
                    await membershipOnboardingPublicService.verifyPayment({
                      payment_id: order.payment_id,
                      txnid: response.txnid || order.txnid,
                      status: "success",
                      easepayid: response.easepayid || "",
                      hash: response.hash || "",
                    });
                    setVerifiedPaymentId(order.payment_id);
                    setPaymentSkipped(false);
                    resolve();
                  } else {
                    reject(new Error(response?.error_Message || response?.error_desc || "Payment was not successful."));
                  }
                } catch (e) {
                  reject(e);
                }
              },
            };
            easebuzz.initiatePayment(options);
          } catch (initErr) {
            // Fallback to hosted checkout redirect if modal trigger fails
            if (order.payment_url) {
              window.location.href = order.payment_url;
            } else {
              reject(initErr);
            }
          }
        });
      } else if (order.payment_url) {
        // Direct redirect fallback to Easebuzz hosted page
        window.location.href = order.payment_url;
      } else {
        throw new Error("Unable to initialize Easebuzz checkout. Please try again.");
      }

      // --- Razorpay implementation (Commented out) ---
      // await loadRazorpayCheckout();
      // const Razorpay = window.Razorpay;
      // ...
    } catch (err) {
      let message = "Payment was not completed.";
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string };
        if (body.message) message = body.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrors({ payment: message });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const applySessionAndGoToMemberArea = (access: string, refresh: string) => {
    document.cookie = `icj_access_token=${access}; path=/; max-age=1800; SameSite=Lax`;
    document.cookie = `icj_refresh_token=${refresh}; path=/; max-age=604800; SameSite=Lax`;
    try {
      localStorage.removeItem("icj_password_change_required");
    } catch {
      // ignore
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

  const submitApplication = async () => {
    if (!config) return;
    if (!declarationAccepted) {
      setErrors({ declaration: "Please accept the declaration to submit your application." });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const pid = verifiedPaymentId ?? undefined;
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
      const fieldErrs: Record<string, string> = {};
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[] | string> };
        if (body.errors && typeof body.errors === "object") {
          for (const [k, v] of Object.entries(body.errors)) {
            fieldErrs[k] = Array.isArray(v) ? v[0] : String(v);
          }
        }
        const parts = [body.message, ...(body.errors ? Object.values(body.errors).flat() : [])].filter(Boolean);
        const uniqueParts = Array.from(new Set(parts));
        if (uniqueParts.length) message = uniqueParts.join(" — ");
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrors({ submit: message, ...fieldErrs });
      if (fieldErrs.email || fieldErrs.email_address || fieldErrs.mobile || fieldErrs.mobile_number) {
        setPhase("personal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || redirecting) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 12, gap: 2 }}>
        <CircularProgress />
        <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
          {redirecting ? "Redirecting to your member dashboard…" : "Loading membership form…"}
        </Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">{loadError}</Alert>
      </Container>
    );
  }

  const formTitle = config?.form?.title ?? "Membership application";
  const feeAmountInr = paymentSettings?.amount_inr ?? 499;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Top Header & Dynamic Stepper */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
            Apply for Membership
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            {formTitle}
            {config?.form?.version ? ` · Version ${config?.form?.version}` : ""}
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto", pb: 2 }}>
            <Stepper
              activeStep={currentTabIndex >= 0 ? currentTabIndex : 0}
              alternativeLabel
              sx={{
                minWidth: 400,
                "& .MuiStepLabel-label": { fontWeight: 600, color: "#64748b" },
                "& .MuiStepLabel-label.Mui-active": { color: "#2563eb", fontWeight: 700 },
                "& .MuiStepLabel-label.Mui-completed": { color: "#10b981", fontWeight: 600 },
                "& .MuiStepIcon-root.Mui-active": { color: "#2563eb" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#10b981" },
              }}
            >
              {stepperTabs.map((tab, idx) => (
                <Step key={tab.id} completed={currentTabIndex > idx}>
                  <StepLabel>{tab.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="md">
          {errors.submit && <Alert severity="error" sx={{ mb: 3 }}>{errors.submit}</Alert>}
          {currentUser && (
            <Alert severity="success" sx={{ mb: 3 }}>
              You are logged in as <strong>{currentUser.first_name} {currentUser.last_name}</strong> ({currentUser.email}). Your basic details have been pre-filled.
            </Alert>
          )}

          {/* STEP 1: Personal Information (Common Fields) */}
          {phase === "personal" && (
            <Box>
              {!personalStep || !personalSchema ? (
                <Alert severity="info">No personal fields are configured for this form yet.</Alert>
              ) : (
                <>
                  <DynamicFormRenderer
                    schema={personalSchema}
                    values={values}
                    errors={errors}
                    theme={THEME}
                    onChange={onChange}
                    isEmailPreVerified={Boolean(currentUser)}
                  />

                  {/* If there are no additional steps, documents are uploaded here */}
                  {!hasAdditionalStep && formDocuments.length > 0 && (
                    <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0", mt: 3 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2, color: "#0f172a" }}>
                        Upload Documents
                      </Typography>
                      <DocumentsUpload
                        documents={formDocuments}
                        files={files}
                        errors={errors}
                        theme={THEME}
                        onChange={(name, file) => setFiles((prev) => ({ ...prev, [name]: file }))}
                      />
                    </Box>
                  )}
                </>
              )}

              <Stack direction="row" sx={{ mt: 4, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  disabled={validatingIdentity || submitting}
                  endIcon={
                    validatingIdentity ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArrowForwardIcon />
                    )
                  }
                  onClick={handleNextFromPersonal}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#2563eb",
                    borderRadius: RADIUS.sm,
                    px: 4,
                    py: 1.25,
                    fontSize: "0.95rem",
                  }}
                >
                  {validatingIdentity ? "Validating Details…" : "Continue"}
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP 2: Additional Fields (Visible ONLY if configured from admin side) */}
          {phase === "additional" && hasAdditionalStep && additionalSchema && (
            <Box>
              <DynamicFormRenderer
                schema={additionalSchema}
                values={values}
                errors={errors}
                theme={THEME}
                onChange={onChange}
              />

              {formDocuments.length > 0 && (
                <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0", mt: 3 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2, color: "#0f172a" }}>
                    Upload Documents
                  </Typography>
                  <DocumentsUpload
                    documents={formDocuments}
                    files={files}
                    errors={errors}
                    theme={THEME}
                    onChange={(name, file) => setFiles((prev) => ({ ...prev, [name]: file }))}
                  />
                </Box>
              )}

              <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNextFromAdditional}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#2563eb",
                    borderRadius: RADIUS.sm,
                    px: 4,
                    py: 1.25,
                    fontSize: "0.95rem",
                  }}
                >
                  Continue
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP 3: Payment for Membership (with Skip option) */}
          {phase === "payment" && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4.5 },
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCardIcon />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>
                          Membership Fee & Payment
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Pay the official ICJ membership fee now or skip to complete it later.
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label="ICJ Guild Membership"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, bgcolor: "#eff6ff", borderColor: "#bfdbfe" }}
                    />
                  </Box>

                  <Divider />

                  {errors.payment && (
                    <Alert severity="error" onClose={() => setErrors((prev) => ({ ...prev, payment: "" }))}>
                      {errors.payment}
                    </Alert>
                  )}

                  {/* Fee Amount Display Box */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2.5,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Application & Membership Fee
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                        <Typography sx={{ fontSize: "2.2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                          ₹{feeAmountInr}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          INR / one-time
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#059669", bgcolor: "#ecfdf5", px: 2, py: 1, borderRadius: 2 }}>
                      <ShieldOutlinedIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        256-bit Secure Easebuzz Payment
                      </Typography>
                    </Box>
                  </Box>

                  {/* Membership Inclusions */}
                  <Box sx={{ bgcolor: "#faf5ff", p: 2.5, borderRadius: 2, border: "1px solid #f3e8ff" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#6b21a8", mb: 1.5 }}>
                      What is included in your membership:
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: "#7e22ce" }} />
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            Official Jurists Guild Membership ID
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: "#7e22ce" }} />
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            Empaneled Registry Public Profile
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: "#7e22ce" }} />
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            Digital Membership Certificate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: "#7e22ce" }} />
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            Access to Legal Aid & Jurists Network
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Payment State Display */}
                  {verifiedPaymentId ? (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "#f0fdf4",
                        border: "1px solid #86efac",
                        textAlign: "center",
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 48, color: "#16a34a", mb: 1 }} />
                      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#166534" }}>
                        Payment Verified Successfully!
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#15803d", mt: 0.5 }}>
                        Transaction ID: <strong>{verifiedPaymentId}</strong>
                      </Typography>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => setPhase("review")}
                        sx={{
                          mt: 2.5,
                          bgcolor: "#16a34a",
                          "&:hover": { bgcolor: "#15803d" },
                          fontWeight: 700,
                          borderRadius: RADIUS.sm,
                          px: 4,
                        }}
                      >
                        Continue to Review & Submit
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={2} sx={{ pt: 1 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={paymentProcessing ? <CircularProgress size={20} color="inherit" /> : <LockOutlinedIcon />}
                        disabled={paymentProcessing}
                        onClick={handleProcessPayment}
                        sx={{
                          bgcolor: "#2563eb",
                          py: 1.5,
                          fontSize: "1rem",
                          fontWeight: 800,
                          borderRadius: RADIUS.sm,
                          "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                      >
                        {paymentProcessing ? "Processing Payment…" : `Pay Membership Fee (₹${feeAmountInr})`}
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<SkipNextIcon />}
                        onClick={handleSkipPayment}
                        sx={{
                          py: 1.25,
                          borderColor: "#cbd5e1",
                          color: "#475569",
                          fontWeight: 700,
                          borderRadius: RADIUS.sm,
                          "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
                        }}
                      >
                        Skip for Now (Pay Later)
                      </Button>

                      <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block" }}>
                        You can skip payment now. Your application will be submitted for initial review, and you can complete the fee payment anytime from your member dashboard.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                >
                  Back
                </Button>
                {verifiedPaymentId && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setPhase("review")}
                    sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb" }}
                  >
                    Continue
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {/* STEP 4: Review & Submit */}
          {phase === "review" && (
            <Box sx={{ bgcolor: "#fff", p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Stack spacing={3}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>
                  Review & Submit Application
                </Typography>

                {/* Personal Information Review */}
                {personalStep && personalStep.step_fields.length > 0 && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <PersonIcon fontSize="small" sx={{ color: "#2563eb" }} />
                      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem" }}>
                        Personal Information
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #f1f5f9" }}>
                      {personalStep.step_fields.map((f) => (
                        <Box
                          key={f.id}
                          sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: "1px solid #f1f5f9" }}
                        >
                          <Typography variant="body2" sx={{ color: "#64748b" }}>{f.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", color: "#0f172a" }}>
                            {String(
                              values[f.field_key] ||
                              (f.field_key === "mobile_number" ? values.mobile : undefined) ||
                              (f.field_key === "mobile" ? values.mobile_number : undefined) ||
                              (f.field_key === "full_name" ? values.name : undefined) ||
                              "—"
                            )}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Additional Fields Review (if configured) */}
                {hasAdditionalStep && additionalStep && additionalStep.step_fields.length > 0 && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem", mb: 1.5 }}>
                      Additional Information
                    </Typography>
                    <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #f1f5f9" }}>
                      {additionalStep.step_fields.map((f) => (
                        <Box
                          key={f.id}
                          sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: "1px solid #f1f5f9" }}
                        >
                          <Typography variant="body2" sx={{ color: "#64748b" }}>{f.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", color: "#0f172a" }}>
                            {String(values[f.field_key] || "—")}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Membership Fee & Payment Review */}
                <Box>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem", mb: 1.5 }}>
                    Membership Payment Status
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: verifiedPaymentId ? "#f0fdf4" : "#eff6ff",
                      border: `1px solid ${verifiedPaymentId ? "#86efac" : "#bfdbfe"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          Fee Amount: ₹{feeAmountInr}
                        </Typography>
                        {verifiedPaymentId ? (
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon />}
                            label="Paid & Verified"
                            color="success"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Skipped / Pay Later"
                            sx={{ fontWeight: 700, bgcolor: "#fef3c7", color: "#92400e" }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                        {verifiedPaymentId
                          ? `Payment Ref: ${verifiedPaymentId}`
                          : "Fee payment can be completed after review from your member dashboard."}
                      </Typography>
                    </Box>

                    {!verifiedPaymentId && hasPaymentStep && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPhase("payment")}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                      >
                        Pay Now
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Declaration acceptance */}
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        I declare that the information provided is true, accurate, and complete to the best of my knowledge.
                      </Typography>
                    }
                  />
                  {errors.declaration && (
                    <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                      {errors.declaration}
                    </Typography>
                  )}
                </Box>

                {errors.submit && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Alert>
                )}
              </Stack>

              <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  disabled={submitting}
                  onClick={submitApplication}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#2563eb",
                    borderRadius: RADIUS.sm,
                    px: 4,
                    py: 1.25,
                    fontSize: "0.95rem",
                  }}
                >
                  {submitting ? "Submitting Application…" : "Submit Application"}
                </Button>
              </Stack>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
