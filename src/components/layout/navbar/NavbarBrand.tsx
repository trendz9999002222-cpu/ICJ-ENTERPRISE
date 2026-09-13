"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GavelIcon from "@mui/icons-material/Gavel";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function NavbarBrand() {
  return (
    <Box
      component={Link}
      href="/"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 1.25 },
        textDecoration: "none",
        color: "inherit",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          bgcolor: "#2563eb",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
        }}
      >
        <GavelIcon sx={{ color: "#ffffff", fontSize: { xs: 20, sm: 22 } }} />
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
            color: "#0f172a",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          ICJ ENTERPRISE
        </Typography>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            display: { xs: "none", sm: "block" },
          }}
        >
          International Consortium of Jurists
        </Typography>
      </Box>
    </Box>
  );
}
