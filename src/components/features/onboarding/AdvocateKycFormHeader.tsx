"use client";

import { Box, Stack, Typography } from "@mui/material";
import { RADIUS } from "@/theme/designTokens";

export default function AdvocateKycFormHeader() {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          bgcolor: "#0f2744",
          color: "#fff",
          borderRadius: `${RADIUS.md} ${RADIUS.md} 0 0`,
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, gap: 1 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.2rem" }, lineHeight: 1.25 }}>
              LEGAL ASSOCIATE KYC & ONBOARDING FORM
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", opacity: 0.9, mt: 0.5 }}>
              Human Resources Department • Legal Talent Acquisition
            </Typography>
          </Box>
          <Stack spacing={0.25} sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#fbbf24", letterSpacing: 1 }}>
              FORM REF: HR-KYC-2026
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#fbbf24", letterSpacing: 1 }}>
              CONFIDENTIAL
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Box
        sx={{
          border: "1px solid #e2e8f0",
          borderTop: "none",
          borderLeft: "4px solid #f59e0b",
          bgcolor: "#f0f9ff",
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderRadius: `0 0 ${RADIUS.md} ${RADIUS.md}`,
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.55 }}>
          Please complete all sections in block letters where applicable. Attach clear scans of supporting
          documents. Fields marked with * are mandatory for panel empanelment review.
        </Typography>
      </Box>
    </Box>
  );
}
