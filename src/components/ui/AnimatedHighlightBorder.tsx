"use client";

import { Box } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Outer radius (px) */
  borderRadius?: number;
  /** Inner fill behind children — should match parent surface */
  innerBg?: string;
  /** Border track thickness */
  padding?: number;
};

/**
 * Continuous rotating highlight line on all four sides (conic-gradient).
 * Wraps CTAs e.g. Join / Membership nav button.
 */
export default function AnimatedHighlightBorder({
  children,
  borderRadius = 8,
  innerBg = "#0f2942",
  padding = 2,
}: Props) {
  const innerRadius = Math.max(borderRadius - padding, 0);

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexShrink: 0,
        p: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        isolation: "isolate",
        boxShadow: "0 0 0 1px rgba(37, 99, 235, 0.25), 0 0 18px rgba(37, 99, 235, 0.2)",
        "@keyframes icjHighlightBorderSpin": {
          to: { transform: "rotate(360deg)" },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-150%",
          background: `conic-gradient(
            from 0deg,
            transparent 0deg 40deg,
            rgba(37, 99, 235, 0.35) 70deg,
            #2563eb 110deg,
            #b45309 160deg,
            #fbbf24 200deg,
            #7c3aed 250deg,
            #2563eb 300deg,
            transparent 340deg
          )`,
          animation: "icjHighlightBorderSpin 2.6s linear infinite",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          borderRadius: `${innerRadius}px`,
          bgcolor: innerBg,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
