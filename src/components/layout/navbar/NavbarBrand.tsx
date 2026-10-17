"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
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
          borderRadius: "50%",
          overflow: "hidden",
          bgcolor: "#ffffff",
          border: "1.5px solid #e2e8f0",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
          p: 0.3,
        }}
      >
        <Image
          src="/images/icj-logo.png"
          alt="ICJ Logo"
          width={40}
          height={40}
          priority
          style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
        />
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
