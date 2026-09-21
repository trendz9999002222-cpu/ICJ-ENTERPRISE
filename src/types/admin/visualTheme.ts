export type ThemeColors = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  border_color: string;
  icon_color: string;
};

export type VisualThemeApiPayload = ThemeColors & {
  is_configured: boolean;
  use_parent_theme: boolean;
  resolved: ThemeColors;
  resolved_source: "default" | "category" | "group" | "profession" | "custom";
};

export type ThemeEditorState = ThemeColors & {
  use_parent_theme: boolean;
};

export type OnboardingEntityKind = "category" | "group" | "profession";
