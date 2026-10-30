"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldCondition {
  field: string;
  operator: "equals" | "notEquals" | "in" | "notEmpty";
  value?: string | string[];
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  allowedTypes?: string[];
  maxSizeMb?: number;
  errorMessage?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "multiselect"
    | "radio"
    | "checkbox"
    | "file"
    | "password";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  gridWidth?: { xs?: number; sm?: number; md?: number };
  options?: FormFieldOption[];
  validation?: FieldValidation;
  conditions?: FieldCondition[];
  summaryLabel?: string;
}


export interface FormSection {
  sectionId?: string;
  title?: string;
  description?: string;
  fields?: FormField[];
  sections?: FormSection[];
}

export function getStepFields(step: FormStep | null | undefined): FormField[] {
  if (!step) return [];
  if (step.fields && Array.isArray(step.fields) && step.fields.length > 0) return step.fields;
  if ((step as any).sections && Array.isArray((step as any).sections)) {
    return (step as any).sections.flatMap((s: any) => s.fields || []);
  }
  return [];
}

export interface FormStep {
  stepId: string;
  stepTitle: string;
  stepDescription?: string;
  fields?: FormField[];
  sections?: FormSection[];
}

export interface FormSchema {
  formId: string;
  version: string;
  title: string;
  description?: string;
  steps: FormStep[];
}

// ─── Condition evaluator ──────────────────────────────────────────────────────

function evaluateConditions(
  conditions: FieldCondition[] | undefined,
  values: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => {
    const val = values[c.field];
    switch (c.operator) {
      case "equals":
        return val === c.value;
      case "notEquals":
        return val !== c.value;
      case "in":
        return Array.isArray(c.value) ? c.value.includes(val as string) : val === c.value;
      case "notEmpty":
        return !!val && (Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0);
      default:
        return true;
    }
  });
}

// ─── Field validator ──────────────────────────────────────────────────────────

function validateField(field: FormField, value: unknown): string | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) return `${field.label} is required`;
  if (isEmpty) return null;

  const v = field.validation;
  if (!v) return null;

  if (typeof value === "string") {
    if (v.min !== undefined && value.length < v.min)
      return v.errorMessage ?? `Minimum ${v.min} characters required`;
    if (v.max !== undefined && value.length > v.max)
      return v.errorMessage ?? `Maximum ${v.max} characters allowed`;
    if (v.pattern && !new RegExp(v.pattern).test(value))
      return v.errorMessage ?? "Invalid format";
  }

  if (typeof value === "number") {
    if (v.min !== undefined && value < v.min)
      return v.errorMessage ?? `Minimum value is ${v.min}`;
    if (v.max !== undefined && value > v.max)
      return v.errorMessage ?? `Maximum value is ${v.max}`;
  }

  if (value instanceof File) {
    if (v.maxSizeMb && value.size > v.maxSizeMb * 1024 * 1024)
      return v.errorMessage ?? `File must be smaller than ${v.maxSizeMb}MB`;
    if (v.allowedTypes && v.allowedTypes.length > 0) {
      const ext = value.name.split(".").pop()?.toLowerCase() ?? "";
      if (!v.allowedTypes.includes(ext))
        return v.errorMessage ?? `Allowed types: ${v.allowedTypes.join(", ")}`;
    }
  }

  return null;
}

// ─── Single field renderer ────────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  error,
  allValues,
  onChange,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  allValues: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  const isRequired = field.required ?? false;
  const label = isRequired ? `${field.label} *` : field.label;

  switch (field.type) {
    case "textarea":
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label={label}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.helpText}
        />
      );

    case "select":
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={label}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.helpText}
        >
          <MenuItem value=""><em>Select</em></MenuItem>
          {field.options?.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      );

    case "multiselect": {
      const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
      return (
        <FormControl error={!!error} fullWidth>
          <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {label}
          </FormLabel>
          <FormGroup row>
            {field.options?.map((o) => (
              <FormControlLabel
                key={o.value}
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(o.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, o.value]
                        : selected.filter((s) => s !== o.value);
                      onChange(next);
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.85rem" }}>{o.label}</Typography>}
              />
            ))}
          </FormGroup>
          {(error || field.helpText) && <FormHelperText>{error ?? field.helpText}</FormHelperText>}
        </FormControl>
      );
    }

    case "radio":
      return (
        <FormControl error={!!error} fullWidth>
          <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {label}
          </FormLabel>
          <RadioGroup
            row
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((o) => (
              <FormControlLabel
                key={o.value}
                value={o.value}
                control={<Radio size="small" />}
                label={<Typography sx={{ fontSize: "0.85rem" }}>{o.label}</Typography>}
              />
            ))}
          </RadioGroup>
          {(error || field.helpText) && <FormHelperText>{error ?? field.helpText}</FormHelperText>}
        </FormControl>
      );

    case "checkbox": {
      const checked = value === true || value === "true";
      return (
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: "0.85rem" }}>{label}</Typography>}
        />
      );
    }

    case "file": {
      const file = value instanceof File ? value : null;
      const fileName = file?.name ?? (typeof value === "string" && value ? "Existing file (click to replace)" : "Choose file...");
      return (
        <FormControl error={!!error} fullWidth>
          <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {label}
          </FormLabel>
          <Button
            variant="outlined"
            component="label"
            size="small"
            sx={{ alignSelf: "flex-start", textTransform: "none", borderColor: error ? "error.main" : undefined }}
          >
            {fileName}
            <input
              type="file"
              hidden
              accept={field.validation?.allowedTypes?.map((t) => `.${t}`).join(",") ?? undefined}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </Button>
          {(error || field.helpText) && <FormHelperText error={!!error}>{error ?? field.helpText}</FormHelperText>}
        </FormControl>
      );
    }

    case "date": {
      const isDob =
        field.name.toLowerCase().includes("dob") || field.name.toLowerCase().includes("birth");
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          label={label}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.helpText}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: isDob ? { max: `${new Date().getFullYear() - 18}-12-31`, min: "1940-01-01" } : undefined,
          }}
        />
      );
    }

    case "number":
      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          label={label}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          error={!!error}
          helperText={error ?? field.helpText}
          slotProps={{
            htmlInput: {
              min: field.validation?.min,
              max: field.validation?.max,
            },
          }}
        />
      );

    default:
      return (
        <TextField
          fullWidth
          size="small"
          type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
          label={label}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.helpText}
        />
      );
  }
}

// ─── Summary Step ─────────────────────────────────────────────────────────────

function SummaryStep({ schema, values }: { schema: FormSchema; values: Record<string, unknown> }) {
  return (
    <Stack spacing={3}>
      {schema.steps.map((step) => {
        const visibleFields = getStepFields(step).filter((f) =>
          evaluateConditions(f.conditions, values)
        );
        if (visibleFields.length === 0) return null;
        return (
          <Box key={step.stepId}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700 }}>
              {step.stepTitle}
            </Typography>
            <Grid container spacing={1.5}>
              {visibleFields.map((f) => {
                const v = values[f.name];
                let display = "—";
                if (v instanceof File) display = v.name;
                else if (Array.isArray(v)) display = v.join(", ");
                else if (v !== null && v !== undefined && v !== "") display = String(v);

                return (
                  <Grid key={f.id} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {f.summaryLabel ?? f.label}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.3, wordBreak: "break-word", fontWeight: 600 }}>
                        {display}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </Stack>
  );
}

// ─── Main DynamicJsonForm ─────────────────────────────────────────────────────

interface DynamicJsonFormProps {
  schema: FormSchema;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  showSummaryStep?: boolean;
}

export default function DynamicJsonForm({
  schema,
  onSubmit,
  submitLabel = "Submit",
  showSummaryStep = true,
}: DynamicJsonFormProps) {
  const totalDataSteps = schema.steps.length;
  const allStepLabels = [
    ...schema.steps.map((s) => s.stepTitle),
    ...(showSummaryStep ? ["Review & Submit"] : []),
  ];
  const totalSteps = allStepLabels.length;

  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSummaryStep = showSummaryStep && activeStep === totalDataSteps;

  const currentStep = !isSummaryStep ? schema.steps[activeStep] : null;

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  }, []);

  const validateCurrentStep = (): boolean => {
    if (!currentStep) return true;
    const newErrors: Record<string, string> = {};
    for (const field of getStepFields(currentStep)) {
      if (!evaluateConditions(field.conditions, values)) continue;
      const err = validateField(field, values[field.name]);
      if (err) newErrors[field.name] = err;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((s) => s + 1);
      setSubmitError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((s) => s - 1);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <Box>
      {/* Progress bar */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Step {activeStep + 1} of {totalSteps}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% complete
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ borderRadius: 4, height: 6, bgcolor: "#e2e8f0" }}
        />
      </Box>

      {/* Stepper — hidden on mobile for space */}
      <Box sx={{ display: { xs: "none", md: "block" }, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {allStepLabels.map((label, idx) => (
            <Step key={label} completed={idx < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step content */}
      <Box sx={{ mb: 3 }}>
        {isSummaryStep ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 800 }}>
              Review Your Application
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
              Please review all information before submitting. Use the Back button to make changes.
            </Typography>
            <SummaryStep schema={schema} values={values} />
          </Box>
        ) : (
          currentStep && (
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 800 }}>
                {currentStep.stepTitle}
              </Typography>
              {currentStep.stepDescription && (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
                  {currentStep.stepDescription}
                </Typography>
              )}
              <Grid container spacing={2.5}>
                {getStepFields(currentStep)
                  .filter((f) => evaluateConditions(f.conditions, values))
                  .map((field) => (
                    <Grid
                      key={field.id}
                      size={field.gridWidth ?? { xs: 12, sm: 6 }}
                    >
                      <FieldRenderer
                        field={field}
                        value={values[field.name]}
                        error={errors[field.name]}
                        allValues={values}
                        onChange={(v) => handleChange(field.name, v)}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )
        )}
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Navigation */}
      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBeforeIcon />}
          sx={{ textTransform: "none" }}
        >
          Back
        </Button>

        {isSummaryStep ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {submitting ? "Submitting..." : submitLabel}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<NavigateNextIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {activeStep === totalDataSteps - 1 && showSummaryStep ? "Review" : "Next"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
