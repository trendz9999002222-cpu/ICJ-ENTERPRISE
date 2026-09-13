"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

import type { PublicProfessional } from "@/types/public";

export default function ProfessionalCard({ professional }: { professional: PublicProfessional }) {
  const initials = professional.fullName
    .replace(/^Adv\.\s*|^CA\s*|^CS\s*|^Dr\.\s*|^Prof\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#bfdbfe",
          boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
          transform: "translateY(-3px)",
        },
      }}
    >
      <Box>
        {/* Header: Avatar + Identity + Verified Badge */}
        <Stack direction="row" spacing={1.75} sx={{ alignItems: "flex-start", mb: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: "#2563eb",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.3,
                  fontSize: "1rem",
                }}
                noWrap
              >
                {professional.fullName}
              </Typography>
              {professional.isVerified && (
                <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a", flexShrink: 0 }} />
              )}
            </Stack>

            <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: 600, fontSize: "0.8rem" }}>
              {professional.profession}
            </Typography>

            {professional.barOrRegNumber && (
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                Reg: {professional.barOrRegNumber}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Location & Experience strip */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
              {professional.city}, {professional.state}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <WorkHistoryOutlinedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
              {professional.experienceYears} Years Exp.
            </Typography>
          </Stack>
        </Stack>

        {/* Specialisation tags */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {professional.specialisations.slice(0, 3).map((spec) => (
              <Chip
                key={spec}
                label={spec}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.725rem",
                  height: 22,
                }}
              />
            ))}
            {professional.specialisations.length > 3 && (
              <Chip
                label={`+${professional.specialisations.length - 3}`}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: "0.725rem",
                  height: 22,
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* Action buttons */}
      <Stack direction="row" spacing={1} sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
        <Button
          component={Link}
          href={`/professionals/${professional.id}`}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            borderColor: "#cbd5e1",
            color: "#334155",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.775rem",
            py: 0.75,
            borderRadius: 1.5,
            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
          }}
        >
          View Profile
        </Button>

        <Button
          component={Link}
          href={`/professionals/${professional.id}#appointment`}
          variant="contained"
          fullWidth
          size="small"
          sx={{
            bgcolor: "#2563eb",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.775rem",
            py: 0.75,
            borderRadius: 1.5,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Request Consult
        </Button>
      </Stack>
    </Paper>
  );
}
