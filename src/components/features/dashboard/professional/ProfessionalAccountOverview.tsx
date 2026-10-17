"use client";

import { Stack, Typography } from "@mui/material";
import SectionCard from "@/components/ui/SectionCard";

interface ProfessionalAccountOverviewProps {
  name: string;
  email: string;
  approved: boolean;
  statusLabel: string;
  professionsCount: number;
}

export default function ProfessionalAccountOverview({
  name,
  email,
  approved,
  statusLabel,
  professionsCount,
}: ProfessionalAccountOverviewProps) {
  const rows = [
    { label: "Account Holder", value: name },
    { label: "Registered Email", value: email || "—" },
    { label: "Platform Role", value: "Registered Professional" },
    {
      label: "Empaneled Practices",
      value: `${professionsCount} Category${professionsCount > 1 ? "ies" : ""}`,
    },
    {
      label: "Platform Privileges",
      value: approved
        ? "Lead Marketplace, Wallet & Directory Access"
        : "Profile & password only (pending admin verification)",
    },
    { label: "Verification Status", value: statusLabel },
  ];

  return (
    <SectionCard title="Account & Practice Overview" subtitle="Registered credentials and platform tier">
      <Stack spacing={1.75}>
        {rows.map((row) => (
          <Stack
            key={row.label}
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #f1f5f9",
              pb: 1.25,
            }}
          >
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
              {row.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem", textAlign: "right" }}
            >
              {row.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}
