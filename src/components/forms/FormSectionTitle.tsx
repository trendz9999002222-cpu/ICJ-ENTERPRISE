"use client";

import { Box, Typography } from "@mui/material";
import { RADIUS } from "@/theme/designTokens";

interface Props {
  title: string;
}

export default function FormSectionTitle({ title }: Props) {
  return (
    <Box sx={{ gridColumn: "1 / -1", mt: 1, mb: 0.5 }}>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: { xs: "0.95rem", sm: "1rem" },
          color: "#0f172a",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderBottom: "2px solid #1e3a8a",
          pb: 0.75,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
