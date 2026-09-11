"use client";

import { Box, Typography } from "@mui/material";

import { FOOTER_BRAND } from "@/config/footer";

export default function FooterBrand() {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff", mb: 1.5, fontSize: { xs: "1rem", md: "1.15rem" } }}>
        {FOOTER_BRAND.title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.7, mb: 1.5, maxWidth: 720 }}>
        {FOOTER_BRAND.description}
      </Typography>
      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
        {FOOTER_BRAND.compliance}
      </Typography>
    </Box>
  );
}
