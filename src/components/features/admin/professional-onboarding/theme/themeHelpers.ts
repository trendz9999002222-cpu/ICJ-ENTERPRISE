import { DEFAULT_THEME_COLORS } from "./themePresets";
import type { ThemeEditorState, VisualThemeApiPayload } from "@/types/admin/visualTheme";

export function emptyThemeEditorState(useParent = false): ThemeEditorState {
  return {
    ...DEFAULT_THEME_COLORS,
    use_parent_theme: useParent,
  };
}

export function apiPayloadToEditorState(payload: VisualThemeApiPayload): ThemeEditorState {
  return {
    use_parent_theme: payload.use_parent_theme,
    primary_color: payload.primary_color,
    secondary_color: payload.secondary_color,
    accent_color: payload.accent_color,
    background_color: payload.background_color,
    text_color: payload.text_color,
    border_color: payload.border_color || DEFAULT_THEME_COLORS.border_color,
    icon_color: payload.icon_color || payload.primary_color,
  };
}

export function editorStateToApiPayload(state: ThemeEditorState): Partial<ThemeEditorState> {
  return {
    use_parent_theme: state.use_parent_theme,
    primary_color: state.primary_color,
    secondary_color: state.secondary_color,
    accent_color: state.accent_color,
    background_color: state.background_color,
    text_color: state.text_color,
    border_color: state.border_color,
    icon_color: state.icon_color,
  };
}

export function previewColorsFromEditor(
  state: ThemeEditorState,
  resolved?: VisualThemeApiPayload["resolved"],
): typeof DEFAULT_THEME_COLORS {
  if (state.use_parent_theme && resolved) {
    return resolved;
  }
  return {
    primary_color: state.primary_color,
    secondary_color: state.secondary_color,
    accent_color: state.accent_color,
    background_color: state.background_color,
    text_color: state.text_color,
    border_color: state.border_color,
    icon_color: state.icon_color,
  };
}
