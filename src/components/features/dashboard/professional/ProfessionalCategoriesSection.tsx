"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import SectionCard from "@/components/ui/SectionCard";
import { formatProfessionalStatusLabel } from "@/lib/professionalDashboard";
import type { UserProfessionInfo } from "@/types/api";

interface ProfessionalCategoriesSectionProps {
  professions: UserProfessionInfo[];
}

export default function ProfessionalCategoriesSection({
  professions,
}: ProfessionalCategoriesSectionProps) {
  if (!professions || professions.length === 0) return null;

  return (
    <SectionCard
      title={`Registered Categories & Practice Areas (${professions.length})`}
      subtitle="Your empaneled legal professions, regulatory bar details, and verification status"
      action={
        <Button
          component={Link}
          href="/dashboard/professional/register"
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.78rem",
            borderColor: "#cbd5e1",
            color: "#1e293b",
            "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
          }}
        >
          Add Practice Area
        </Button>
      }
    >
      <Stack spacing={2}>
        {professions.map((p) => {
          const statusColor =
            p.status === "approved"
              ? "success"
              : p.status === "rejected"
                ? "error"
                : "warning";

          return (
            <Box
              key={`${p.registration_id}-${p.profession_id || p.profession_name}`}
              sx={{
                p: 2.5,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "#ffffff",
                  borderColor: "#cbd5e1",
                  boxShadow: "0 4px 12px -2px rgba(15,23,42,0.06)",
                },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <WorkspacePremiumIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
                      {p.profession_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8125rem", mt: 0.25 }}>
                      {p.category_name}
                      {p.group_name ? ` • ${p.group_name}` : ""} •{" "}
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#475569" }}>
                        Ref: {p.reference_id}
                      </span>
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  size="small"
                  label={formatProfessionalStatusLabel(p.status)}
                  color={statusColor}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                />
              </Stack>

              {p.profession_field_values && Object.keys(p.profession_field_values).length > 0 && (
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, mt: 2 }}>
                  {Object.entries(p.profession_field_values)
                    .slice(0, 8)
                    .map(([k, v]) => (
                      <Chip
                        key={k}
                        size="small"
                        variant="outlined"
                        label={`${k.replace(/_/g, " ")}: ${String(v)}`}
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: "#ffffff",
                          borderColor: "#e2e8f0",
                          color: "#334155",
                          maxWidth: 320,
                        }}
                      />
                    ))}
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
    </SectionCard>
  );
}
