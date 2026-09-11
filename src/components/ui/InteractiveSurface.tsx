"use client";

import { Box } from "@mui/material";
import { useRef, useState } from "react";

import { SHADOW, surfaceBaseSx, TRANSITION, type SurfaceVariant } from "@/theme/designTokens";

type Props = {
  children: React.ReactNode;
  accentColor?: string;
  variant?: SurfaceVariant;
  enableTilt?: boolean;
  sx?: object;
};

export default function InteractiveSurface({
  children,
  accentColor,
  variant = "light",
  enableTilt = true,
  sx,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt(`perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-8px) scale(1.01)`);
  };

  const handleLeave = () => {
    setTilt("");
    setIsHovered(false);
  };

  const isDark = variant === "dark";

  return (
    <Box
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      sx={{
        ...surfaceBaseSx(variant, accentColor),
        transform: tilt || (isHovered && !enableTilt ? "translateY(-8px)" : "none"),
        transition: TRANSITION.smooth,
        ...(isHovered && {
          boxShadow: isDark ? SHADOW.dark : SHADOW.cardHover,
          borderColor: accentColor ? `${accentColor}66` : isDark ? "rgba(255,255,255,0.14)" : "#cbd5e1",
        }),
        ...sx,
      }}
    >
      <Box sx={{ position: "relative", zIndex: 2, height: "100%" }}>{children}</Box>
    </Box>
  );
}
