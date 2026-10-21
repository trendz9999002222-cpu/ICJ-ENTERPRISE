"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Avatar, Box, Button, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import Link from "next/link";

import {
  maskPublicProfessional,
  publicProfessionalInitials,
} from "@/lib/privacy/maskPublicIdentity";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { PublicProfessional } from "@/types/public";

export default function ProfessionalCard({ professional }: { professional: PublicProfessional }) {
  const display = maskPublicProfessional(professional);
  const initials = publicProfessionalInitials(display.fullName);

  // Show at most 2 professions cleanly in the subtitle
  const professions = professional.registeredProfessions && professional.registeredProfessions.length > 0
    ? professional.registeredProfessions
    : [professional.profession];
  const professionLabel = professions.slice(0, 2).join(" / ");
  const hasMoreProfessions = professions.length > 2;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
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
            src={resolveMediaUrl(professional.photoUrl) || undefined}
            sx={{
              width: 50,
              height: 50,
              bgcolor: "#2563eb",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.3,
                  fontSize: "1rem",
                }}
                noWrap
              >
                {display.fullName}
              </Typography>
              {professional.isVerified ? (
                <Chip
                  label="Verified"
                  size="small"
                  icon={<CheckCircleIcon fontSize="small" />}
                  sx={{
                    bgcolor: "#dcfce7",
                    color: "#166534",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    height: 20,
                    "& .MuiChip-icon": { color: "#16a34a", fontSize: "0.8rem" },
                  }}
                />
              ) : (
                <Chip
                  label="Unverified"
                  size="small"
                  icon={<WarningAmberIcon fontSize="small" />}
                  sx={{
                    bgcolor: "#fef9c3",
                    color: "#854d0e",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    height: 20,
                    "& .MuiChip-icon": { color: "#ca8a04", fontSize: "0.8rem" },
                  }}
                />
              )}
            </Stack>

            {/* Primary profession / first two professions */}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "#2563eb", fontWeight: 600, fontSize: "0.8rem" }}
                noWrap
              >
                {professionLabel}
              </Typography>
              {hasMoreProfessions && (
                <Tooltip title={professions.slice(2).join(", ")} arrow>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 600, cursor: "help", flexShrink: 0 }}
                  >
                    +{professions.length - 2}
                  </Typography>
                </Tooltip>
              )}
            </Stack>

            {display.barOrRegNumber && (
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                Reg: {display.barOrRegNumber}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Location & Experience strip */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
              {[professional.city, professional.state].filter(Boolean).join(", ") || "India"}
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
            {professional.specialisations.slice(0, 2).map((spec) => (
              <Chip
                key={spec}
                label={spec}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            ))}
            {professional.specialisations.length > 2 && (
              <Chip
                label={`+${professional.specialisations.length - 2}`}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
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
            fontSize: "0.8125rem",
            py: 0.75,
            borderRadius: 2,
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
            fontSize: "0.8125rem",
            py: 0.75,
            borderRadius: 2,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Request Consult
        </Button>
      </Stack>
    </Paper>
  );
}
