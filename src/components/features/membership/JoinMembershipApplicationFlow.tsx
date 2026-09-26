"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DocumentsUpload from "@/components/features/onboarding/onboarding-file/DocumentsUpload";
import DynamicFormRenderer from "@/components/features/onboarding/onboarding-file/DynamicFormRenderer";
import { RADIUS } from "@/components/features/onboarding/onboarding-file/iconMap";
import { ApiError } from "@/lib/api/client";
import { stepToFormSchema } from "@/lib/membership/mapMembershipStep";
import { membershipOnboardingPublicService } from "@/services/public/membershipOnboardingPublic.service";
import type {
  MembershipOnboardingConfiguration,
  MembershipOnboardingDocument,
  MembershipTypePublic,
} from "@/types/public/membershipOnboarding";
import type { DocumentField, Theme } from "@/types/registration";
import { scrollToFirstError, validateDocuments, validateSections } from "@/lib/validation";

const THEME: Theme = { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };

type FlowPhase = "select-type" | "steps" | "documents" | "review" | "done";

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
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type") || "";

  const [types, setTypes] = useState<MembershipTypePublic[]>([]);
  const [membershipTypeId, setMembershipTypeId] = useState("");
  const [config, setConfig] = useState<MembershipOnboardingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<FlowPhase>("select-type");
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  );

  useEffect(() => {
    membershipOnboardingPublicService
      .fetchTypes()
      .then((list) => {
        setTypes(list);
        const initial = preselected && list.find((t) => t.slug === preselected || t.id === preselected);
        if (initial) setMembershipTypeId(initial.id);
        else if (list[0]) setMembershipTypeId(list[0].id);
      })
      .catch(() => setLoadError("Unable to load membership types."))
      .finally(() => setLoading(false));
  }, [preselected]);

  const loadConfiguration = async (typeId: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const cfg = await membershipOnboardingPublicService.fetchConfiguration(typeId);
      setConfig(cfg);
      setStepIndex(0);
      setPhase(cfg.steps.length ? "steps" : cfg.documents.length ? "documents" : "review");
    } catch {
      setLoadError("Unable to load membership form configuration.");
    } finally {
      setLoading(false);
    }
  };

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

  const goBack = () => {
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
    else setPhase("select-type");
  };

  const handleSubmit = async () => {
    if (!validateCurrent() || !config || !membershipTypeId) return;
    setSubmitting(true);
    try {
      const { referenceId: ref } = await membershipOnboardingPublicService.submitApplication({
        membershipTypeId,
        fieldValues: values,
        files,
        declarationAccepted,
        idempotencyKey: idempotencyKeyRef.current,
      });
      setReferenceId(ref);
      setPhase("done");
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

  if (loading && !config) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError && !config) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (phase === "done" && referenceId) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 56, color: "#059669", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Membership Application Submitted</Typography>
        <Typography sx={{ color: "#64748b", mb: 2 }}>Reference ID: {referenceId}</Typography>
        <Typography sx={{ fontWeight: 600, color: "#2563eb" }}>Status: Pending Review</Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "#64748b" }}>
          Payment is not required at this stage.
        </Typography>
        <Button component={Link} href="/membership" sx={{ mt: 3, textTransform: "none" }}>
          Back to Membership
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
        <Typography sx={{ fontWeight: 800 }}>Apply for Membership</Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {config?.membership_type.name ?? "Select membership type"}
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}

        {phase === "select-type" && (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Membership Type"
              value={membershipTypeId}
              onChange={(e) => setMembershipTypeId(e.target.value)}
            >
              {types.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={() => membershipTypeId && loadConfiguration(membershipTypeId)}
              disabled={!membershipTypeId}
              sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700 }}
            >
              Continue to application
            </Button>
          </Stack>
        )}

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

        {phase !== "select-type" && (
          <Stack direction="row" sx={{ mt: 4, justifyContent: "space-between" }}>
            <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ textTransform: "none" }}>Back</Button>
            <Button
              variant="contained"
              endIcon={phase === "review" ? undefined : <ArrowForwardIcon />}
              disabled={submitting}
              onClick={phase === "review" ? handleSubmit : goNext}
              sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb", borderRadius: RADIUS.sm, px: 3 }}
            >
              {submitting ? "Submitting…" : phase === "review" ? "Submit application" : "Continue"}
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
