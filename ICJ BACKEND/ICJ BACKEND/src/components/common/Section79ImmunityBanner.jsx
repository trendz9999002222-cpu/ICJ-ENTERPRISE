import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Paper, Typography, Stack, Chip, Button } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";

export default function Section79ImmunityBanner() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: "14px",
        bgcolor: "#f8fafc",
        border: "1.5px solid #cbd5e1",
        mb: 2.5,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "#0f172a",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GavelIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" fontWeight={900} color="#0f172a">
                धारा 79 IT अधिनियम 2000 एवं DPDPA 2023 वैधानिक मध्यस्थ सुरक्षा (Statutory Safe Harbor Immunity)
              </Typography>
              <Chip
                label="Zero-Server Storage"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  bgcolor: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #10b981",
                  display: { xs: "none", md: "inline-flex" },
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.72rem" }}>
              आपकी फाइलें 100% आपके डिवाइस में सुरक्षित हैं। ICJ केवल टेक्नोलॉजी फैसिलिटेटर (Intermediary) है।
            </Typography>
          </Box>
        </Stack>

        <Button
          component={RouterLink}
          to="/statutory-intermediary-terms"
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.72rem",
            textTransform: "none",
            color: "#0284c7",
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "8px",
            px: 1.5,
            py: 0.4,
            "&:hover": { bgcolor: "#e0f2fe" },
          }}
        >
          📜 वैधानिक नियमावली (Legal Immunity Terms) ➔
        </Button>
      </Stack>
    </Paper>
  );
}
