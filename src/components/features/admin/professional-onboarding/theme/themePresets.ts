import type { ThemeColors } from "@/types/admin/visualTheme";

export type ThemePreset = {
  id: string;
  label: string;
  colors: ThemeColors;
};

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary_color: "#2563EB",
  secondary_color: "#1E40AF",
  accent_color: "#3B82F6",
  background_color: "#F8FAFC",
  text_color: "#0F172A",
  border_color: "#E2E8F0",
  icon_color: "#2563EB",
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: "blue", label: "Blue", colors: DEFAULT_THEME_COLORS },
  {
    id: "indigo",
    label: "Indigo",
    colors: {
      primary_color: "#4F46E5",
      secondary_color: "#3730A3",
      accent_color: "#6366F1",
      background_color: "#EEF2FF",
      text_color: "#1E1B4B",
      border_color: "#C7D2FE",
      icon_color: "#4F46E5",
    },
  },
  {
    id: "purple",
    label: "Purple",
    colors: {
      primary_color: "#7C3AED",
      secondary_color: "#5B21B6",
      accent_color: "#8B5CF6",
      background_color: "#FAF5FF",
      text_color: "#3B0764",
      border_color: "#DDD6FE",
      icon_color: "#7C3AED",
    },
  },
  {
    id: "green",
    label: "Green",
    colors: {
      primary_color: "#16A34A",
      secondary_color: "#166534",
      accent_color: "#22C55E",
      background_color: "#F0FDF4",
      text_color: "#14532D",
      border_color: "#BBF7D0",
      icon_color: "#16A34A",
    },
  },
  {
    id: "teal",
    label: "Teal",
    colors: {
      primary_color: "#0D9488",
      secondary_color: "#115E59",
      accent_color: "#14B8A6",
      background_color: "#F0FDFA",
      text_color: "#134E4A",
      border_color: "#99F6E4",
      icon_color: "#0D9488",
    },
  },
  {
    id: "orange",
    label: "Orange",
    colors: {
      primary_color: "#EA580C",
      secondary_color: "#9A3412",
      accent_color: "#F97316",
      background_color: "#FFF7ED",
      text_color: "#7C2D12",
      border_color: "#FED7AA",
      icon_color: "#EA580C",
    },
  },
  {
    id: "red",
    label: "Red",
    colors: {
      primary_color: "#DC2626",
      secondary_color: "#991B1B",
      accent_color: "#EF4444",
      background_color: "#FEF2F2",
      text_color: "#7F1D1D",
      border_color: "#FECACA",
      icon_color: "#DC2626",
    },
  },
  {
    id: "slate",
    label: "Slate",
    colors: {
      primary_color: "#475569",
      secondary_color: "#334155",
      accent_color: "#64748B",
      background_color: "#F8FAFC",
      text_color: "#0F172A",
      border_color: "#CBD5E1",
      icon_color: "#475569",
    },
  },
  {
    id: "dark",
    label: "Dark",
    colors: {
      primary_color: "#1E293B",
      secondary_color: "#0F172A",
      accent_color: "#334155",
      background_color: "#F1F5F9",
      text_color: "#020617",
      border_color: "#94A3B8",
      icon_color: "#1E293B",
    },
  },
];
