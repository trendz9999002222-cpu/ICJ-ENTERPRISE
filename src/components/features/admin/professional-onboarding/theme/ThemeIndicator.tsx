"use client";

import { Box, Tooltip } from "@mui/material";

type Props = {
  primaryColor: string;
  isCustom?: boolean;
  useParentTheme?: boolean;
};

export default function ThemeIndicator({
  primaryColor,
  isCustom,
  useParentTheme,
}: Props) {
  const title = useParentTheme
    ? "Using parent theme"
    : isCustom
      ? "Custom theme"
      : "Default theme";

  return (
    <Tooltip title={title}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: primaryColor,
          border: "1px solid rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}
