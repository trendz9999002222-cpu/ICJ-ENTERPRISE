"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import CategoryGroupProfessionSelect, {
  type CascadeValue,
} from "@/components/features/admin/professional-onboarding/CategoryGroupProfessionSelect";
import ThemePreviewCard from "@/components/features/admin/professional-onboarding/theme/ThemePreviewCard";
import { DEFAULT_THEME_COLORS } from "@/components/features/admin/professional-onboarding/theme/themePresets";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type {
  CommonField,
  FieldOption,
  ProfessionDocument,
  ProfessionField,
} from "@/types/admin/professionalOnboarding";
import type { ThemeColors } from "@/types/admin/visualTheme";

function PreviewField({
  label,
  fieldType,
  required,
  placeholder,
  options,
}: {
  label: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  options?: FieldOption[];
}) {
  const commonProps = {
    fullWidth: true,
    size: "small" as const,
    label: `${label}${required ? " *" : ""}`,
    placeholder,
    disabled: true,
  };

  if (fieldType === "textarea") {
    return <TextField {...commonProps} multiline minRows={3} />;
  }
  if (fieldType === "select" && options?.length) {
    return (
      <TextField {...commonProps} select value="">
        <MenuItem value="">—</MenuItem>
        {options.map((o) => (
          <MenuItem key={o.id} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>
    );
  }
  if (fieldType === "file") {
    return (
      <Button variant="outlined" disabled fullWidth sx={{ justifyContent: "flex-start" }}>
        Upload file
      </Button>
    );
  }
  const inputType =
    fieldType === "email" || fieldType === "phone" || fieldType === "number" || fieldType === "date"
      ? fieldType === "phone"
        ? "tel"
        : fieldType
      : "text";
  return <TextField {...commonProps} type={inputType} />;
}

function PreviewPageContent() {
  const searchParams = useSearchParams();
  const initialProfession = searchParams.get("profession") ?? "";

  const [cascade, setCascade] = useState<CascadeValue>({
    categoryId: "",
    groupId: "",
    professionId: initialProfession,
  });
  const [commonFields, setCommonFields] = useState<CommonField[]>([]);
  const [professionFields, setProfessionFields] = useState<ProfessionField[]>([]);
  const [documents, setDocuments] = useState<ProfessionDocument[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<string, FieldOption[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedTheme, setResolvedTheme] = useState<ThemeColors>(DEFAULT_THEME_COLORS);
  const [professionLabel, setProfessionLabel] = useState("");

  useEffect(() => {
    professionalOnboardingService
      .listCommonFields({ is_active: true, page_size: 200, ordering: "display_order" })
      .then(async (res) => {
        setCommonFields(res.results);
        const map: Record<string, FieldOption[]> = {};
        for (const f of res.results) {
          if (["select", "radio", "checkbox"].includes(f.field_type)) {
            const opts = await professionalOnboardingService.listFieldOptions({
              common_field: f.id,
              is_active: true,
              page_size: 100,
            });
            map[f.id] = opts.results;
          }
        }
        setOptionsMap(map);
      })
      .catch((err) => {
        setError(getOnboardingApiErrorMessage(err, "Failed to load common fields."));
      });
  }, []);

  useEffect(() => {
    if (!cascade.professionId) {
      setProfessionFields([]);
      setDocuments([]);
      return;
    }
    setLoading(true);
    setError("");
    (async () => {
      try {
        const [fields, docs, themeRes, profession] = await Promise.all([
          professionalOnboardingService.listProfessionFields({
            profession: cascade.professionId,
            is_active: true,
            page_size: 200,
            ordering: "display_order",
          }),
          professionalOnboardingService.listProfessionDocuments({
            profession: cascade.professionId,
            is_active: true,
            page_size: 200,
            ordering: "display_order",
          }),
          professionalOnboardingService.getProfessionResolvedTheme(cascade.professionId),
          professionalOnboardingService.getProfession(cascade.professionId),
        ]);
        setResolvedTheme(themeRes.resolved);
        setProfessionLabel(profession.name);
        setProfessionFields(fields.results);
        setDocuments(docs.results);
        const map = { ...optionsMap };
        for (const f of fields.results) {
          if (["select", "radio", "checkbox"].includes(f.field_type)) {
            const opts = await professionalOnboardingService.listFieldOptions({
              profession_field: f.id,
              is_active: true,
              page_size: 100,
            });
            map[f.id] = opts.results;
          }
        }
        setOptionsMap(map);
      } catch (err) {
        setError(getOnboardingApiErrorMessage(err, "Failed to load profession preview."));
      } finally {
        setLoading(false);
      }
    })();
  }, [cascade.professionId]);

  return (
    <AdminPageShell
      title="Onboarding preview"
      subtitle="Verify how the professional onboarding form will appear"
      actions={
        <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
          Back
        </Button>
      }
    >
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <CategoryGroupProfessionSelect value={cascade} onChange={setCascade} />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cascade.professionId && (
        <Box sx={{ mb: 3 }}>
          <ThemePreviewCard
            colors={resolvedTheme}
            categoryName="Category"
            groupName="Group"
            professionName={professionLabel}
          />
        </Box>
      )}

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: `1px solid ${resolvedTheme.border_color}`,
            borderRadius: 3,
            borderTop: `4px solid ${resolvedTheme.accent_color}`,
            bgcolor: cascade.professionId ? resolvedTheme.background_color : "#fff",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: resolvedTheme.text_color }}>
            Common fields
          </Typography>
          <Stack spacing={2}>
            {commonFields.length === 0 ? (
              <Typography color="text.secondary">No active common fields.</Typography>
            ) : (
              commonFields.map((f) => (
                <PreviewField
                  key={f.id}
                  label={f.label}
                  fieldType={f.field_type}
                  required={f.is_required}
                  placeholder={f.placeholder}
                  options={optionsMap[f.id]}
                />
              ))
            )}
          </Stack>
        </Paper>

        {cascade.professionId && (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${resolvedTheme.border_color}`,
                borderRadius: 3,
                bgcolor: resolvedTheme.background_color,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: resolvedTheme.text_color }}>
                Profession fields
                {loading && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: "#94a3b8" }}>
                    Loading…
                  </Typography>
                )}
              </Typography>
              <Stack spacing={2}>
                {professionFields.length === 0 ? (
                  <Typography color="text.secondary">No active profession-specific fields.</Typography>
                ) : (
                  professionFields.map((f) => (
                    <PreviewField
                      key={f.id}
                      label={f.label}
                      fieldType={f.field_type}
                      required={f.is_required}
                      placeholder={f.placeholder}
                      options={optionsMap[f.id]}
                    />
                  ))
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${resolvedTheme.border_color}`,
                borderRadius: 3,
                bgcolor: resolvedTheme.background_color,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: resolvedTheme.text_color }}>
                Documents
              </Typography>
              {documents.length === 0 ? (
                <Typography color="text.secondary">No documents required for this profession.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {documents.map((d) => (
                    <Box
                      key={d.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px dashed #cbd5e1",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 700 }}>{d.document_name}</Typography>
                        {d.is_required && <Chip size="small" label="Required" color="primary" />}
                      </Stack>
                      {d.instructions && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {d.instructions}
                        </Typography>
                      )}
                      <Button variant="outlined" size="small" disabled sx={{ mt: 1 }}>
                        Upload {d.document_name}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Preview is read-only. Submit actions are not enabled in the admin configuration view.
      </Typography>
    </AdminPageShell>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Onboarding preview" subtitle="Loading…">
          <Typography color="text.secondary">Loading preview…</Typography>
        </AdminPageShell>
      }
    >
      <PreviewPageContent />
    </Suspense>
  );
}
