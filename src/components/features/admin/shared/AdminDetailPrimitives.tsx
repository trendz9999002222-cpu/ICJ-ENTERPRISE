"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "0.725rem",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#0f172a", wordBreak: "break-word" }}>
        {value ?? "—"}
      </Box>
    </Box>
  );
}

export function SectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {icon && <Box sx={{ color: "#2563eb", display: "flex" }}>{icon}</Box>}
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{title}</Typography>
        </Stack>
        {badge}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
    </Paper>
  );
}

export function renderFieldValue(val: unknown): ReactNode {
  if (val === null || val === undefined || val === "") {
    return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
    }
    return (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
        {val.map((item, idx) => (
          <Chip
            key={idx}
            size="small"
            label={String(item)}
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: 1.5 }}
          />
        ))}
      </Stack>
    );
  }
  if (typeof val === "boolean") {
    return (
      <Chip
        size="small"
        label={val ? "Yes" : "No"}
        color={val ? "success" : "default"}
        variant="outlined"
        sx={{ fontWeight: 700, fontSize: "0.75rem", borderRadius: 1.5 }}
      />
    );
  }
  if (typeof val === "object") {
    return (
      <Typography sx={{ color: "#0f172a", fontSize: "0.85rem", wordBreak: "break-word" }}>
        {JSON.stringify(val)}
      </Typography>
    );
  }
  return (
    <Typography sx={{ color: "#0f172a", fontSize: "0.875rem", fontWeight: 500, wordBreak: "break-word" }}>
      {String(val)}
    </Typography>
  );
}
