"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  TextField,
  Typography,
} from "@mui/material";

import { ApiError } from "@/lib/api/client";
import {
  extractProfessionFieldValues,
  iconForIndex,
  mergeConfigurationsToFormSchema,
} from "@/lib/onboarding/mapConfiguration";
import { getSidebar, getSteps, submitRegistration } from "@/lib/registrationClient";
import {
  fetchCategories,
  fetchGroupsForCategories,
  fetchProfessionConfiguration,
  fetchProfessionsForGroups,
} from "@/lib/registrationClient";
import { scrollToFirstError, validateDocuments, validateSections } from "@/lib/validation";
import type {
  ProfessionConfiguration,
  PublicGroupSelectable,
  PublicProfessionSelectable,
  PublicSelectable,
} from "@/types/public/professionalOnboardingPublic";
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
import ReviewSummary from "./ReviewSummary";
import SelectionGrid, { GroupedSelectionGrid, type SelectionItem } from "./SelectionGrid";
import { RADIUS } from "./iconMap";

const NEUTRAL_THEME: Theme = { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
const SIDEBAR_STEPS: StepId[] = ["details", "documents", "review"];
const STEPS = getSteps();

function toSelectionItems(items: PublicSelectable[], withCode = false): SelectionItem[] {
  return items.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    code: withCode ? String(item.display_order ?? index + 1).padStart(2, "0") : undefined,
    icon: iconForIndex(index),
    theme: item.theme,
  }));
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

function formatSelectionTitles(ids: string[], items: PublicSelectable[]) {
  const titles = ids
    .map((id) => items.find((item) => item.id === id)?.title)
    .filter((title): title is string => Boolean(title));
  return titles.length ? titles.join(", ") : undefined;
}

function uniqueJoined(names: string[]) {
  const unique = [...new Set(names.filter(Boolean))];
  return unique.length ? unique.join(", ") : undefined;
}

export default function RegistrationFlow() {
  const [state, setState] = useState<RegistrationState>(INITIAL_REGISTRATION_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `join-${Date.now()}`,
  );

  const [categories, setCategories] = useState<PublicSelectable[]>([]);
  const [groups, setGroups] = useState<PublicGroupSelectable[]>([]);
  const [professions, setProfessions] = useState<PublicProfessionSelectable[]>([]);
  const [configurations, setConfigurations] = useState<ProfessionConfiguration[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingProfessions, setLoadingProfessions] = useState(false);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [categoryPick, setCategoryPick] = useState<string[]>([]);
  const [groupPick, setGroupPick] = useState<string[]>([]);
  const [professionPick, setProfessionPick] = useState<string[]>([]);

  const selectedCategories = categories.filter((c) => state.categoryIds.includes(c.id));
  const selectedGroups = groups.filter((g) => state.groupIds.includes(g.id));
  const selectedProfessions = professions.filter((p) => state.professionIds.includes(p.id));

  const schema = useMemo(() => mergeConfigurationsToFormSchema(configurations), [configurations]);
  const primaryConfiguration = configurations[0] ?? null;
  const theme =
    primaryConfiguration?.theme ??
    selectedProfessions[0]?.theme ??
    selectedGroups[0]?.theme ??
    selectedCategories[0]?.theme ??
    NEUTRAL_THEME;
  const sidebar = getSidebar();
  const currentStep = STEPS[stepIndex];

  const selections: Partial<Record<StepId, string>> = {
    category: formatSelectionTitles(state.categoryIds, categories),
    group: formatSelectionTitles(state.groupIds, groups),
    profession: formatSelectionTitles(state.professionIds, professions),
  };

  const groupSections = useMemo(() => {
    const categoryOrder = state.categoryIds.length
      ? state.categoryIds
      : [...new Set(groups.map((g) => g.categoryId))];

    return categoryOrder
      .map((categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        const categoryGroups = groups.filter((g) => g.categoryId === categoryId);
        return {
          id: categoryId,
          title: category?.title ?? "Category",
          theme: category?.theme ?? NEUTRAL_THEME,
          items: toSelectionItems(categoryGroups),
        };
      })
      .filter((section) => section.items.length > 0);
  }, [state.categoryIds, categories, groups]);

  const professionSections = useMemo(() => {
    const groupOrder = state.groupIds.length
      ? state.groupIds
      : [...new Set(professions.map((p) => p.groupId))];

    return groupOrder
      .map((groupId) => {
        const group = groups.find((g) => g.id === groupId);
        const groupProfessions = professions.filter((p) => p.groupId === groupId);
        return {
          id: groupId,
          title: group?.title ?? "Group",
          theme: group?.theme ?? NEUTRAL_THEME,
          items: toSelectionItems(groupProfessions),
        };
      })
      .filter((section) => section.items.length > 0);
  }, [state.groupIds, groups, professions]);

  useEffect(() => {
    setLoadingCategories(true);
    setLoadError("");
    fetchCategories()
      .then(setCategories)
      .catch(() => setLoadError("Unable to load professional categories. Please try again later."))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!state.categoryIds.length) {
      setGroups([]);
      return;
    }
    setLoadingGroups(true);
    setLoadError("");
    fetchGroupsForCategories(state.categoryIds)
      .then(setGroups)
      .catch(() => setLoadError("Unable to load groups for the selected categories."))
      .finally(() => setLoadingGroups(false));
  }, [state.categoryIds]);

  useEffect(() => {
    if (!state.groupIds.length) {
      setProfessions([]);
      return;
    }
    setLoadingProfessions(true);
    setLoadError("");
    fetchProfessionsForGroups(state.groupIds)
      .then(setProfessions)
      .catch(() => setLoadError("Unable to load professions for the selected groups."))
      .finally(() => setLoadingProfessions(false));
  }, [state.groupIds]);

  useEffect(() => {
    if (!state.professionIds.length) {
      setConfigurations([]);
      return;
    }
    setLoadingConfiguration(true);
    setLoadError("");
    Promise.all(state.professionIds.map((id) => fetchProfessionConfiguration(id)))
      .then(setConfigurations)
      .catch(() => {
        setConfigurations([]);
        setLoadError("Unable to load onboarding configuration for the selected professions.");
      })
      .finally(() => setLoadingConfiguration(false));
  }, [state.professionIds]);

  useEffect(() => {
    setGroupPick((prev) => prev.filter((id) => groups.some((g) => g.id === id)));
  }, [groups]);

  useEffect(() => {
    setProfessionPick((prev) => prev.filter((id) => professions.some((p) => p.id === id)));
  }, [professions]);

  useEffect(() => {
    if (currentStep === "category") {
      setCategoryPick(state.categoryIds);
    }
    if (currentStep === "group") {
      setGroupPick(state.groupIds);
    }
    if (currentStep === "profession") {
      setProfessionPick(state.professionIds);
    }
  }, [currentStep, state.categoryIds, state.groupIds, state.professionIds]);

  const goTo = useCallback((index: number) => {
    setErrors({});
    setStepIndex(index);
    setMaxReached((m) => Math.max(m, index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const commitSelectionStep = (): boolean => {
    if (currentStep === "category") {
      if (!categoryPick.length) {
        setErrors({ selection: "Select at least one category to continue" });
        return false;
      }
      setState((prev) => {
        const same = arraysEqual(prev.categoryIds, categoryPick);
        return {
          ...prev,
          categoryIds: categoryPick,
          groupIds: same ? prev.groupIds : [],
          professionIds: same ? prev.professionIds : [],
          values: same ? prev.values : {},
          files: same ? prev.files : {},
        };
      });
      if (!arraysEqual(state.categoryIds, categoryPick)) {
        setGroupPick([]);
        setProfessionPick([]);
      }
      setMaxReached((m) => Math.max(m, 1));
      return true;
    }
    if (currentStep === "group") {
      if (!groupPick.length) {
        setErrors({ selection: "Select at least one group to continue" });
        return false;
      }
      setState((prev) => {
        const same = arraysEqual(prev.groupIds, groupPick);
        return {
          ...prev,
          groupIds: groupPick,
          professionIds: same ? prev.professionIds : [],
          values: same ? prev.values : {},
          files: same ? prev.files : {},
        };
      });
      if (!arraysEqual(state.groupIds, groupPick)) {
        setProfessionPick([]);
      }
      setMaxReached((m) => Math.max(m, 2));
      return true;
    }
    if (currentStep === "profession") {
      const missingGroups = state.groupIds.filter(
        (groupId) => !professions.some((p) => p.groupId === groupId && professionPick.includes(p.id)),
      );
      if (missingGroups.length > 0) {
        const groupNames = missingGroups
          .map((id) => groups.find((g) => g.id === id)?.title)
          .filter(Boolean)
          .join(", ");
        setErrors({
          profession: `Please select 1 profession for each of your selected groups (${groupNames}).`,
        });
        return false;
      }
      setState((prev) => {
        const same = arraysEqual(prev.professionIds, professionPick);
        return {
          ...prev,
          professionIds: professionPick,
          values: same ? prev.values : {},
          files: same ? prev.files : {},
        };
      });
      setMaxReached((m) => Math.max(m, 3));
      return true;
    }

    return true;
  };

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

    if (currentStep === "category" && categories.length && !categoryPick.length) {
      stepErrors.selection = "Select at least one category to continue";
    }
    if (currentStep === "group" && groups.length && !groupPick.length) {
      stepErrors.selection = "Select at least one group to continue";
    }
    if (currentStep === "profession" && professions.length) {
      const missingGroups = state.groupIds.filter(
        (groupId) => !professions.some((p) => p.groupId === groupId && professionPick.includes(p.id)),
      );
      if (missingGroups.length > 0) {
        const groupNames = missingGroups
          .map((id) => groups.find((g) => g.id === id)?.title)
          .filter(Boolean)
          .join(", ");
        stepErrors.profession = `Please select 1 profession for each of your selected groups (${groupNames}).`;
      }
    }

    if (currentStep === "details" && schema) {
      stepErrors = validateSections(schema.sections, state.values);
    }
    if (currentStep === "documents" && schema) {
      stepErrors = validateDocuments(schema.documents, state.files);
    }
    if (currentStep === "review") {
      if (!state.password.trim()) {
        stepErrors.password = "Password is required";
      } else if (state.password.length < 12) {
        stepErrors.password = "Use at least 12 characters";
      }
      if (!state.confirmPassword.trim()) {
        stepErrors.confirmPassword = "Please confirm your password";
      } else if (state.password !== state.confirmPassword) {
        stepErrors.confirmPassword = "Passwords do not match";
      }
      if (!state.declarationAgreed) {
        stepErrors.declaration = "Please accept the declaration to submit";
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

  const isSelectionStep = ["category", "group", "profession"].includes(currentStep);

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (isSelectionStep && !commitSelectionStep()) return;
    if (stepIndex < STEPS.length - 1) goTo(stepIndex + 1);
  };

  const handleSubmit = async () => {
    if (
      !validateCurrentStep() ||
      !state.categoryIds.length ||
      !state.groupIds.length ||
      !state.professionIds.length ||
      !configurations.length
    ) {
      return;
    }

    if (schema) {
      const detailErrors = validateSections(schema.sections, state.values);
      const docErrors = validateDocuments(schema.documents, state.files);
      const merged = { ...detailErrors, ...docErrors };
      if (Object.keys(merged).length) {
        setErrors(merged);
        scrollToFirstError(merged);
        return;
      }
    }

    setSubmitting(true);
    try {
      const multiProfession = configurations.length > 1;
      const commonKeys = new Set<string>();
      configurations.forEach((config) => {
        config.common_fields.forEach((f) => commonKeys.add(f.field_key));
      });
      const commonValues: Record<string, unknown> = {};
      Object.entries(state.values).forEach(([key, value]) => {
        if (commonKeys.has(key)) commonValues[key] = value;
      });

      const professionValuesByProfession: Record<string, Record<string, unknown>> = {};
      for (const config of configurations) {
        professionValuesByProfession[config.profession.id] = extractProfessionFieldValues(
          config.profession.id,
          state.values,
          config.profession_fields.map((f) => f.field_key),
          multiProfession,
        );
      }

      const { referenceId: ref } = await submitRegistration({
        categoryIds: state.categoryIds,
        groupIds: state.groupIds,
        professionIds: state.professionIds,
        commonValues,
        professionValuesByProfession,
        files: state.files,
        idempotencyKey: idempotencyKeyRef.current,
        password: state.password,
        confirmPassword: state.confirmPassword,
      });
      setReferenceId(ref);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      let message = "Submission failed. Please check your details and try again.";
      if (err instanceof ApiError && err.status === 0) {
        message =
          err.body && typeof err.body === "object" && (err.body as { message?: string }).message
            ? String((err.body as { message: string }).message)
            : err.message;
      } else if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as { message?: string; errors?: Record<string, string[]> };
        const parts: string[] = [];
        if (body.message && body.message !== "API request failed") parts.push(body.message);
        if (body.errors) {
          parts.push(...Object.values(body.errors).flat());
        }
        if (parts.length) message = parts.join(" ");
      }
      setErrors({ submit: message });
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
    setConfigurations([]);
    setCategoryPick([]);
    setGroupPick([]);
    setProfessionPick([]);
  };

  const jumpToStep = (id: StepId) => {
    const idx = STEPS.indexOf(id);
    if (idx >= 0) goTo(idx);
  };

  if (referenceId) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: "#15803d" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.5rem", mt: 2, color: "#0f172a" }}>
            Registration submitted
          </Typography>
          <Typography sx={{ color: "#475569", mt: 1 }}>
            Your application is now with the ICJ verification team.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip
              label={`Request ID: ${referenceId}`}
              sx={{ fontWeight: 700, bgcolor: "#eff6ff", color: "#1d4ed8", borderRadius: RADIUS.sm }}
            />
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => referenceId && navigator.clipboard.writeText(referenceId)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Copy ID
            </Button>
          </Stack>
          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={resetFlow} sx={{ textTransform: "none", fontWeight: 600 }}>
              Register another professional
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const heading: Record<StepId, { title: string; subtitle: string }> = {
    category: {
      title: `Step ${stepIndex + 1}: Select Professional Category`,
      subtitle: "Choose the category that best describes your professional domain",
    },
    group: {
      title: `Step ${stepIndex + 1}: Select Professional Group`,
      subtitle: "Choose one or more groups from your selected categories.",
    },
    profession: {
      title: `Step ${stepIndex + 1}: Select Profession`,
      subtitle: "Choose 1 profession for each of your selected groups.",
    },

    association: { title: "", subtitle: "" },
    specialisation: { title: "", subtitle: "" },
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

  const renderLoading = (label: string) => (
    <Stack spacing={2} sx={{ alignItems: "center", py: 6 }}>
      <CircularProgress size={32} sx={{ color: theme.color }} />
      <Typography sx={{ color: "#64748b" }}>{label}</Typography>
    </Stack>
  );

  const renderStepBody = () => {
    switch (currentStep) {
      case "category":
        if (loadingCategories) return renderLoading("Loading categories…");
        if (!categories.length) {
          return (
            <Alert severity="info">
              No professional categories are available yet. Please check back later.
            </Alert>
          );
        }
        return (
          <SelectionGrid
            items={toSelectionItems(categories, true)}
            selectedIds={categoryPick}
            columns={5}
            fallbackTheme={NEUTRAL_THEME}
            onSelectionChange={setCategoryPick}
          />
        );

      case "group":
        if (loadingGroups) return renderLoading("Loading groups…");
        if (!groups.length) {
          return (
            <Alert severity="info">No groups are configured for the selected categories yet.</Alert>
          );
        }
        return (
          <GroupedSelectionGrid
            sections={groupSections}
            selectedIds={groupPick}
            columns={3}
            fallbackTheme={theme}
            onSelectionChange={setGroupPick}
          />
        );

      case "profession":
        if (loadingProfessions) return renderLoading("Loading professions…");
        if (!professions.length) {
          return (
            <Alert severity="info">No professions are configured for the selected groups yet.</Alert>
          );
        }
        return (
          <GroupedSelectionGrid
            sections={professionSections}
            selectedIds={professionPick}
            singleSelectPerSection={true}
            columns={3}
            fallbackTheme={theme}
            onSelectionChange={setProfessionPick}
          />
        );


      case "details":
        if (loadingConfiguration) return renderLoading("Loading professional configuration…");
        if (!schema || (!schema.sections.length && !schema.documents.length)) {
          return (
            <Alert severity="warning">
              No onboarding fields have been configured for the selected profession(s) yet.
            </Alert>
          );
        }
        return schema.sections.length ? (
          <DynamicFormRenderer
            schema={schema}
            values={state.values}
            errors={errors}
            theme={theme}
            onChange={handleFieldChange}
          />
        ) : (
          <Alert severity="info">No additional details are required. Continue to documents.</Alert>
        );

      case "documents":
        if (!schema?.documents.length) {
          return <Alert severity="info">No documents are required for the selected profession(s).</Alert>;
        }
        return (
          <DocumentsUpload
            documents={schema.documents}
            files={state.files}
            errors={errors}
            theme={theme}
            onChange={handleFileChange}
          />
        );

      case "review":
        return schema ? (
          <>
            <ReviewSummary
              schema={schema}
              values={state.values}
              files={state.files}
              theme={theme}
              selectionSummary={[
                {
                  label: "Categories",
                  value:
                    formatSelectionTitles(state.categoryIds, categories) ||
                    uniqueJoined(configurations.map((c) => c.category.name)) ||
                    "—",
                },
                {
                  label: "Groups",
                  value:
                    formatSelectionTitles(state.groupIds, groups) ||
                    uniqueJoined(configurations.map((c) => c.group.name)) ||
                    "—",
                },
                {
                  label: "Professions",
                  value:
                    formatSelectionTitles(state.professionIds, professions) ||
                    uniqueJoined(configurations.map((c) => c.profession.name)) ||
                    "—",
                },
              ]}
              onEditSelection={() => jumpToStep("category")}
              onEditDetails={() => jumpToStep("details")}
              onEditDocuments={() => jumpToStep("documents")}
            />
            <Box
              data-field="password"
              sx={{
                mt: 2,
                p: 2,
                borderRadius: RADIUS.sm,
                border: "1px solid #e2e8f0",
                bgcolor: "#fff",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", mb: 1.5 }}>
                Account password
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mb: 2 }}>
                Create the password you will use to log in after your application is approved.
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Password"
                  type="password"
                  value={state.password}
                  onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password || "At least 12 characters"}
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) => setState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                />
              </Stack>
            </Box>
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#0f172a", pb: { xs: 4, md: 6 } }}>
      <FlowStepper
        steps={STEPS}
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

        {(errors.submit || loadError) && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.sm }}>
            {errors.submit ?? loadError}
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
                registeringAs={
                  formatSelectionTitles(state.professionIds, professions) ??
                  selectedProfessions[0]?.title ??
                  "Professional"
                }
                contextLine={[
                  formatSelectionTitles(state.categoryIds, categories),
                  formatSelectionTitles(state.groupIds, groups),
                ]
                  .filter(Boolean)
                  .join(" › ")}
                onChangeSelection={() => goTo(0)}
              />
            </Box>
          )}
        </Box>

        {(errors.selection || errors.profession) && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: RADIUS.sm }}>
            {errors.selection ?? errors.profession}
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
        </Stack>
      </Container>
    </Box>
  );
}
