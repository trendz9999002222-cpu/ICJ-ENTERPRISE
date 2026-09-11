"use client";

import { Box, Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { FOOTER_LEGAL_LINKS } from "@/config/footer";

export default function FooterLegalLinks() {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>
        महत्वपूर्ण वैधानिक लिंक्स
      </Typography>
      <Stack spacing={1}>
        {FOOTER_LEGAL_LINKS.map((item) => (
          <Link
            key={item.id}
            component={NextLink}
            href={item.href}
            underline="hover"
            sx={{ color: "#38bdf8", fontSize: "0.88rem", fontWeight: 500 }}
          >
            • {item.label}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}
