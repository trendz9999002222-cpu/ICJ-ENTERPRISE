"use client";

import { Box } from "@mui/material";

import LoginForm from "@/components/features/auth/LoginForm";
import { NAVBAR_HEIGHT } from "@/constants/layout";

export default function LoginPage() {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4, md: 5 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: {
          xs: `calc(100dvh - ${NAVBAR_HEIGHT.xs}px)`,
          md: `calc(100dvh - ${NAVBAR_HEIGHT.md}px)`,
        },
        bgcolor: "#1e40af",
        background: "linear-gradient(180deg, #1e3a8a 0%, #2563eb 55%, #1d4ed8 100%)",
      }}
    >
      <LoginForm />
    </Box>
  );
}
