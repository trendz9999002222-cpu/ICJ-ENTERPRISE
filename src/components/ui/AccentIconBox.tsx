"use client";

import { Box } from "@mui/material";

import { accentIconBoxSx } from "@/theme/designTokens";

type Props = {
  color: string;
  bg: string;
  children: React.ReactNode;
};

export default function AccentIconBox({ color, bg, children }: Props) {
  return (
    <Box className="icj-icon-box" sx={accentIconBoxSx(color, bg)}>
      {children}
    </Box>
  );
}
