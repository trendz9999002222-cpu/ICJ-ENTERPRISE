"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

import { NAVBAR_CONFIG } from "@/config/navbar";

export default function NavbarBrand() {
  const { brand } = NAVBAR_CONFIG;

  return (
    <Box
      component={Link}
      href={brand.homeHref}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 1.5, md: 2 },
        textDecoration: "none",
        color: "inherit",
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          bgcolor: "rgba(56,189,248,0.15)",
          p: { xs: 0.9, sm: 1, md: 1.2 },
          borderRadius: 2.5,
          border: "1px solid rgba(56,189,248,0.3)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <AccountBalanceIcon sx={{ color: "#38bdf8", fontSize: { xs: 22, sm: 26, md: 28, lg: 32 } }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "0.82rem", sm: "0.92rem", md: "1.05rem", lg: "1.2rem" },
            color: "#fff",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {brand.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            display: { xs: "none", lg: "block" },
            fontSize: "0.7rem",
          }}
        >
          {brand.subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
