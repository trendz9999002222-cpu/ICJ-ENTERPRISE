"use client";

import { Box, Divider, Typography } from "@mui/material";

import { FOOTER_COPYRIGHT } from "@/config/footer";

export default function FooterCopyright() {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ borderColor: "#334155", mb: 2 }} />
      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", textAlign: { xs: "center", md: "left" } }}>
        {FOOTER_COPYRIGHT}
      </Typography>
    </Box>
  );
}
