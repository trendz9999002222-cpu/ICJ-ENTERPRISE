import type { SxProps, Theme } from "@mui/material";

/** Pixel strings for sx borderRadius — avoids MUI multiplier (number × theme.shape.borderRadius). */
export const RADIUS = {
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
} as const;

/** Numeric base for theme.shape.borderRadius only. */
export const SHAPE_RADIUS = 12;

export const SHADOW = {
  card: "0 1px 2px rgba(15,23,42,0.05), 0 10px 28px rgba(15,23,42,0.08)",
  cardHover: "0 6px 14px rgba(15,23,42,0.08), 0 22px 48px rgba(15,23,42,0.16), 0 0 0 1px rgba(37,99,235,0.1)",
  panel: "0 2px 6px rgba(15,23,42,0.05), 0 18px 52px rgba(15,23,42,0.11)",
  dark: "0 10px 36px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.06)",
  navbar: "0 8px 32px rgba(15,23,42,0.22)",
  insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.75)",
} as const;

export const TRANSITION = {
  smooth: "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.42s ease, border-color 0.3s ease",
  fast: "transform 0.22s ease, box-shadow 0.22s ease",
} as const;

export type SurfaceVariant = "light" | "dark" | "panel";

export function surfaceBaseSx(variant: SurfaceVariant = "light", accentColor?: string): SxProps<Theme> {
  const isDark = variant === "dark";
  const isPanel = variant === "panel";

  return {
    position: "relative",
    borderRadius: isPanel ? RADIUS.xl : RADIUS.lg,
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
    bgcolor: isDark ? "rgba(15,23,42,0.92)" : "#fff",
    boxShadow: isDark ? SHADOW.dark : isPanel ? SHADOW.panel : `${SHADOW.card}, ${SHADOW.insetHighlight}`,
    transition: TRANSITION.smooth,
    overflow: "hidden",
    height: "100%",
    ...(accentColor && {
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: 4,
        height: "100%",
        bgcolor: accentColor,
        zIndex: 1,
      },
    }),
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      background: isDark
        ? "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 42%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, transparent 48%)",
      pointerEvents: "none",
    },
  };
}

export function accentIconBoxSx(color: string, bg: string): SxProps<Theme> {
  return {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    bgcolor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 6px 16px ${color}33, inset 0 1px 0 rgba(255,255,255,0.5)`,
    border: `1px solid ${color}33`,
    transition: TRANSITION.fast,
    transform: "translateZ(0)",
  };
}

export function actionButtonSx(bg: string): SxProps<Theme> {
  return {
    bgcolor: bg,
    fontWeight: 800,
    textTransform: "none",
    borderRadius: RADIUS.sm,
    boxShadow: `0 4px 14px ${bg}55`,
    transition: TRANSITION.fast,
    "&:hover": {
      bgcolor: bg,
      filter: "brightness(1.08)",
      transform: "translateY(-2px)",
      boxShadow: `0 8px 22px ${bg}66`,
    },
    "&:active": {
      transform: "translateY(0)",
    },
  };
}
