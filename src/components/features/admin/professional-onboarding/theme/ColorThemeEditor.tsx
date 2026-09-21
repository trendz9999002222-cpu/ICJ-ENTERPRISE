"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import {
  isAccessibleTextOnBackground,
  isValidHexColor,
  normalizeHexInput,
} from "@/lib/color/contrast";
import type { ThemeEditorState, ThemeColors } from "@/types/admin/visualTheme";
import ThemePreviewCard from "./ThemePreviewCard";
import { DEFAULT_THEME_COLORS, THEME_PRESETS } from "./themePresets";
import { previewColorsFromEditor } from "./themeHelpers";

const COLOR_FIELDS: { key: keyof ThemeColors; label: string; optional?: boolean }[] = [
  { key: "primary_color", label: "Primary color" },
  { key: "secondary_color", label: "Secondary color" },
  { key: "accent_color", label: "Accent color" },
  { key: "background_color", label: "Background color" },
  { key: "text_color", label: "Text color" },
  { key: "border_color", label: "Border color", optional: true },
  { key: "icon_color", label: "Icon / badge color", optional: true },
];

type Props = {
  value: ThemeEditorState;
  onChange: (next: ThemeEditorState) => void;
  showUseParent?: boolean;
  parentThemeLabel?: string;
  resolvedParentColors?: ThemeColors;
  previewCategoryName: string;
  previewGroupName?: string;
  previewProfessionName?: string;
};

function ColorRow({
  label,
  colorKey,
  value,
  disabled,
  onChange,
}: {
  label: string;
  colorKey: keyof ThemeColors;
  value: string;
  disabled?: boolean;
  onChange: (key: keyof ThemeColors, hex: string) => void;
}) {
  const valid = isValidHexColor(value);
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
      <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: "#64748b" }}>
        {label}
      </Typography>
      <Box
        component="input"
        type="color"
        value={valid ? value : "#000000"}
        disabled={disabled}
        onChange={(e) => onChange(colorKey, e.target.value.toUpperCase())}
        sx={{ width: 44, height: 36, border: "1px solid #e2e8f0", borderRadius: 1, p: 0 }}
      />
      <TextField
        size="small"
        value={value}
        disabled={disabled}
        error={!valid}
        onChange={(e) => onChange(colorKey, normalizeHexInput(e.target.value))}
        placeholder="#2563EB"
        sx={{ flex: 1, maxWidth: 140 }}
      />
    </Stack>
  );
}

export default function ColorThemeEditor({
  value,
  onChange,
  showUseParent = false,
  parentThemeLabel = "Use parent theme",
  resolvedParentColors,
  previewCategoryName,
  previewGroupName,
  previewProfessionName,
}: Props) {
  const colorsDisabled = showUseParent && value.use_parent_theme;

  const previewColors = useMemo(
    () => previewColorsFromEditor(value, resolvedParentColors),
    [value, resolvedParentColors],
  );

  const contrastWarning = useMemo(() => {
    if (colorsDisabled) {
      if (
        resolvedParentColors &&
        !isAccessibleTextOnBackground(
          resolvedParentColors.text_color,
          resolvedParentColors.background_color,
        )
      ) {
        return "Parent theme text/background contrast is below WCAG AA (4.5:1). Consider adjusting colors for readability.";
      }
      return null;
    }
    if (!isAccessibleTextOnBackground(value.text_color, value.background_color)) {
      return "Text and background contrast is below WCAG AA (4.5:1). The combination may be hard to read.";
    }
    return null;
  }, [colorsDisabled, value, resolvedParentColors]);

  const setColor = (key: keyof ThemeColors, hex: string) => {
    onChange({ ...value, [key]: hex });
  };

  const applyPreset = (colors: ThemeColors) => {
    onChange({ ...value, ...colors, use_parent_theme: false });
  };

  const resetDefaults = () => {
    onChange({ ...value, ...DEFAULT_THEME_COLORS, use_parent_theme: false });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
        Visual theme
      </Typography>

      {showUseParent && (
        <FormControlLabel
          control={
            <Switch
              checked={value.use_parent_theme}
              onChange={(e) => onChange({ ...value, use_parent_theme: e.target.checked })}
            />
          }
          label={parentThemeLabel}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {THEME_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            size="small"
            variant="outlined"
            disabled={colorsDisabled}
            onClick={() => applyPreset(preset.colors)}
            sx={{
              borderColor: preset.colors.primary_color,
              color: preset.colors.primary_color,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>

      <Stack spacing={1.25}>
        {COLOR_FIELDS.map((field) => (
          <ColorRow
            key={field.key}
            label={field.label}
            colorKey={field.key}
            value={value[field.key]}
            disabled={colorsDisabled}
            onChange={setColor}
          />
        ))}
      </Stack>

      {contrastWarning && <Alert severity="warning">{contrastWarning}</Alert>}

      <Stack direction="row" spacing={1}>
        <Button size="small" variant="text" disabled={colorsDisabled} onClick={resetDefaults}>
          Reset to default
        </Button>
      </Stack>

      <Divider />

      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
        Live preview
      </Typography>
      <ThemePreviewCard
        colors={previewColors}
        categoryName={previewCategoryName}
        groupName={previewGroupName}
        professionName={previewProfessionName}
      />
    </Stack>
  );
}
