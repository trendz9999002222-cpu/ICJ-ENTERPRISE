"use client";

import { useCallback, useMemo, useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";

import {
  getCategories,
  getCategory,
  getFormSchema,
  getGroup,
  getGroups,
  getSidebar,
  getSteps,
  submitRegistration,
} from "@/lib/registrationClient";
import { scrollToFirstError, validateDocuments, validateSections } from "@/lib/validation";
import {
  INITIAL_REGISTRATION_STATE,
  type RegistrationState,
  type StepId,
  type Theme,
} from "@/types/registration";

import DocumentsUpload from "./DocumentsUpload";
import DynamicFormRenderer from "./DynamicFormRenderer";
import FlowStepper from "./FlowStepper";
import InfoSidebar from "./InfoSidebar";
// import RegistrationHero from "./RegistrationHero";
import ReviewSummary from "./ReviewSummary";
import SelectionGrid from "./SelectionGrid";
import { RADIUS } from "./iconMap";

const NEUTRAL_THEME: Theme = { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };

/** Steps that get the two-column layout with the info sidebar. */
const SIDEBAR_STEPS: StepId[] = ["details", "documents", "review"];

export default function RegistrationFlow() {
  const [state, setState] = useState<RegistrationState>(INITIAL_REGISTRATION_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const categories = getCategories();
  const category = getCategory(state.categoryId);
  const group = getGroup(state.categoryId, state.groupId);
  const groups = getGroups(state.categoryId);
  const schema = getFormSchema(group);
  const sidebar = getSidebar(group);

  const steps = useMemo(() => getSteps(group), [group]);
  const currentStep = steps[stepIndex];
  const theme = group?.theme ?? category?.theme ?? NEUTRAL_THEME;

  const profession = group?.professions.find((p) => p.id === state.professionId) ?? null;
  const specialisation = group?.specialisations.find((s) => s.id === state.specialisationId) ?? null;

  const selections: Partial<Record<StepId, string>> = {
    category: category?.title,
    group: group?.title,
    profession: profession?.title,
    specialisation: specialisation?.title,
  };

  const goTo = useCallback((index: number) => {
    setErrors({});
    setStepIndex(index);
    setMaxReached((m) => Math.max(m, index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ------------------------------ selections ------------------------------ */

  const selectCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categoryId: id,
      // a new category invalidates everything below it
      groupId: prev.categoryId === id ? prev.groupId : null,
      professionId: null,
      specialisationId: null,
    }));
    setMaxReached(1);
    goTo(1);
  };

  const selectGroup = (id: string) => {
    setState((prev) => ({
      ...prev,
      groupId: id,
      professionId: prev.groupId === id ? prev.professionId : null,
      specialisationId: prev.groupId === id ? prev.specialisationId : null,
      // the form schema can change with the group, so drop stale values
      values: prev.groupId === id ? prev.values : {},
      files: prev.groupId === id ? prev.files : {},
    }));
    setMaxReached(2);
    goTo(2);
  };

  const selectSimple = (key: "professionId" | "specialisationId", id: string) => {
    setState((prev) => ({ ...prev, [key]: id }));
    goTo(stepIndex + 1);
  };

  /* ------------------------------- handlers ------------------------------- */

  const handleFieldChange = (name: string, value: unknown) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, [name]: value } }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFileChange = (name: string, file: File | null) => {
    setState((prev) => ({ ...prev, files: { ...prev.files, [name]: file } }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateCurrentStep = (): boolean => {
    let stepErrors: Record<string, string> = {};

    if (currentStep === "profession" && group?.professions.length && !state.professionId) {
      stepErrors.profession = "Select a profession to continue";
    }
    if (currentStep === "specialisation" && group?.specialisations.length && !state.specialisationId) {
      stepErrors.specialisation = "Select a specialisation to continue";
    }
    if (currentStep === "details" && schema) {
      stepErrors = validateSections(schema.sections, state.values);
    }
    if (currentStep === "documents" && schema) {
      stepErrors = validateDocuments(schema.documents, state.files);
    }
    if (currentStep === "review" && !state.declarationAgreed) {
      stepErrors.declaration = "Please accept the declaration to submit";
    }

    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    try {
      const { referenceId: ref } = await submitRegistration({
        categoryId: state.categoryId,
        groupId: state.groupId,
        professionId: state.professionId,
        specialisationId: state.specialisationId,
        values: state.values,
        documents: Object.fromEntries(
          Object.entries(state.files).map(([k, f]) => [k, f ? { name: f.name, size: f.size } : null])
        ),
      });
      setReferenceId(ref);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ submit: "Submission failed. Please check your details and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setState(INITIAL_REGISTRATION_STATE);
    setStepIndex(0);
    setMaxReached(0);
    setErrors({});
    setReferenceId(null);
  };

  const jumpToStep = (id: StepId) => {
    const idx = steps.indexOf(id);
    if (idx >= 0) goTo(idx);
  };

  /* -------------------------------- success ------------------------------- */

  if (referenceId) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        {/* <RegistrationHero /> */}
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: "#15803d" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.5rem", mt: 2, color: "#0f172a" }}>
            Registration submitted
          </Typography>
          <Typography sx={{ color: "#475569", mt: 1 }}>
            Your application is now with the ICJ verification team.
          </Typography>
          <Chip
            label={`Reference ID: ${referenceId}`}
            sx={{ mt: 2, fontWeight: 700, bgcolor: "#eff6ff", color: "#1d4ed8", borderRadius: RADIUS.sm }}
          />
          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={resetFlow} sx={{ textTransform: "none", fontWeight: 600 }}>
              Register another professional
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  /* --------------------------------- body --------------------------------- */

  const heading: Record<StepId, { title: string; subtitle: string }> = {
    category: {
      title: `Step ${stepIndex + 1}: Select Professional Category`,
      subtitle: "Choose the category that best describes your professional domain",
    },
    group: {
      title: `Step ${stepIndex + 1}: Select Professional Group`,
      subtitle: `Choose the professional group under ${category?.title ?? ""} that best matches your area of work.`,
    },
    profession: {
      title: `Step ${stepIndex + 1}: Select Profession`,
      subtitle: `Professions available under ${group?.title ?? ""}`,
    },
    association: {
      title: `Step ${stepIndex + 1}: Select Association`,
      subtitle: "Choose how you want to associate with ICJ",
    },
    specialisation: {
      title: `Step ${stepIndex + 1}: Select Specialisation`,
      subtitle: "Pick your main area of expertise",
    },
    details: {
      title: `Step ${stepIndex + 1}: Professional Details`,
      subtitle: "Please fill in your details accurately. Fields marked * are mandatory.",
    },
    documents: {
      title: `Step ${stepIndex + 1}: Upload Documents`,
      subtitle: "Upload clear, readable copies. These are used only for verification.",
    },
    review: {
      title: `Step ${stepIndex + 1}: Review & Submit`,
      subtitle: "Check everything below before submitting your application.",
    },
  };

  const showSidebar = SIDEBAR_STEPS.includes(currentStep);

  const renderStepBody = () => {
    switch (currentStep) {
      case "category":
        return (
          <SelectionGrid
            items={categories}
            selectedId={state.categoryId}
            columns={5}
            fallbackTheme={NEUTRAL_THEME}
            onSelect={selectCategory}
          />
        );

      case "group":
        return (
          <SelectionGrid
            items={groups}
            selectedId={state.groupId}
            columns={3}
            fallbackTheme={theme}
            onSelect={selectGroup}
          />
        );

      case "profession":
        return (
          <SelectionGrid
            items={group?.professions ?? []}
            selectedId={state.professionId}
            columns={3}
            fallbackTheme={theme}
            onSelect={(id) => selectSimple("professionId", id)}
          />
        );

      case "specialisation":
        return (
          <SelectionGrid
            items={group?.specialisations ?? []}
            selectedId={state.specialisationId}
            columns={3}
            fallbackTheme={theme}
            onSelect={(id) => selectSimple("specialisationId", id)}
          />
        );

      case "details":
        return schema ? (
          <DynamicFormRenderer
            schema={schema}
            values={state.values}
            errors={errors}
            theme={theme}
            onChange={handleFieldChange}
          />
        ) : null;

      case "documents":
        return schema ? (
          <DocumentsUpload
            documents={schema.documents}
            files={state.files}
            errors={errors}
            theme={theme}
            onChange={handleFileChange}
          />
        ) : null;

      case "review":
        return schema ? (
          <>
            <ReviewSummary
              schema={schema}
              values={state.values}
              files={state.files}
              theme={theme}
              selectionSummary={[
                { label: "Category", value: category?.title ?? "—" },
                { label: "Group", value: group?.title ?? "—" },
                { label: "Profession", value: profession?.title ?? "—" },
                { label: "Specialisation", value: specialisation?.title ?? "—" },
              ]}
              onEditSelection={() => jumpToStep("category")}
              onEditDetails={() => jumpToStep("details")}
              onEditDocuments={() => jumpToStep("documents")}
            />

            <Box data-field="declaration" sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.declarationAgreed}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, declarationAgreed: e.target.checked }))
                    }
                    sx={{ "&.Mui-checked": { color: theme.color } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.85rem", color: "#334155" }}>
                    I declare that the information provided is true, correct and complete to the best of my
                    knowledge, and I agree to ICJ&apos;s Terms &amp; Conditions and Privacy Policy.
                  </Typography>
                }
              />
              {errors.declaration && (
                <Typography sx={{ color: "#ef4444", fontSize: "0.78rem", ml: 4 }}>{errors.declaration}</Typography>
              )}
            </Box>
          </>
        ) : null;

      default:
        return null;
    }
  };

  const isSelectionStep = ["category", "group", "profession", "specialisation"].includes(currentStep);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#0f172a", pb: { xs: 4, md: 6 } }}>
      {/* <RegistrationHero /> */}

      <FlowStepper
        steps={steps}
        currentIndex={stepIndex}
        maxReachedIndex={maxReached}
        selections={selections}
        accent={theme.color}
        onStepClick={goTo}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 3.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, mb: 3 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.15rem", md: "1.35rem" } }}>
              {heading[currentStep].title}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "0.88rem", mt: 0.5 }}>
              {heading[currentStep].subtitle}
            </Typography>
          </Box>

          {stepIndex > 0 && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => goTo(0)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: RADIUS.sm,
                border: "1px solid #cbd5e1",
                color: "#334155",
                px: 2,
                flexShrink: 0,
              }}
            >
              Change category
            </Button>
          )}
        </Stack>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.sm }}>
            {errors.submit}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: showSidebar ? { xs: "1fr", lg: "minmax(0, 1fr) 340px" } : "1fr",
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>{renderStepBody()}</Box>

          {showSidebar && (
            <Box sx={{ position: { lg: "sticky" }, top: { lg: 110 } }}>
              <InfoSidebar
                sidebar={sidebar}
                theme={theme}
                registeringAs={profession?.title ?? group?.title ?? "Professional"}
                contextLine={`Under ${category?.title ?? ""}${group ? ` › ${group.title}` : ""}`}
                onChangeSelection={() => goTo(0)}
              />
            </Box>
          )}
        </Box>

        {(errors.profession || errors.specialisation) && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: RADIUS.sm }}>
            {errors.profession ?? errors.specialisation}
          </Alert>
        )}

        {currentStep === "category" && (
          <Alert
            icon={<InfoOutlinedIcon fontSize="small" />}
            sx={{
              mt: 3,
              bgcolor: "#eff6ff",
              color: "#1e40af",
              border: "1px solid #bfdbfe",
              borderRadius: RADIUS.md,
              fontSize: "0.82rem",
            }}
          >
            If your profession is not listed in the available options, you can select &quot;Other&quot; in the next
            step and enter your profession.
          </Alert>
        )}

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", mt: 4 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            disabled={stepIndex === 0}
            onClick={() => goTo(stepIndex - 1)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADIUS.sm,
              borderColor: "#cbd5e1",
              color: "#334155",
              px: 3,
              py: 1,
            }}
          >
            Previous
          </Button>

          {!isSelectionStep || stepIndex === steps.length - 1 ? (
            <Button
              variant="contained"
              disabled={submitting}
              endIcon={
                submitting ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : currentStep === "review" ? undefined : (
                  <ArrowForwardIcon />
                )
              }
              onClick={currentStep === "review" ? handleSubmit : handleNext}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: RADIUS.sm,
                bgcolor: theme.color,
                px: 3,
                py: 1,
                "&:hover": { bgcolor: theme.color, filter: "brightness(1.08)" },
              }}
            >
              {currentStep === "review" ? "Submit application" : "Continue"}
            </Button>
          ) : (
            <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem", alignSelf: "center" }}>
              Select an option above to continue
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
