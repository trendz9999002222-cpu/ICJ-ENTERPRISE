"use client";

import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Stack, Typography } from "@mui/material";

import { isFieldVisible } from "@/lib/validation";
import type { FormSchema, Theme } from "@/types/registration";

import { RADIUS } from "./iconMap";

type Props = {
  schema: FormSchema;
  values: Record<string, unknown>;
  files: Record<string, File | null>;
  theme: Theme;
  selectionSummary: { label: string; value: string }[];
  onEditSelection: () => void;
  onEditDetails: () => void;
  onEditDocuments: () => void;
};

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function Block({
  title,
  onEdit,
  children,
  accent,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <Box sx={{ border: "1px solid #e2e8f0", borderRadius: RADIUS.md, bgcolor: "#fff", overflow: "hidden" }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>{title}</Typography>
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 15 }} />}
          onClick={onEdit}
          sx={{ textTransform: "none", fontWeight: 600, color: accent }}
        >
          Edit
        </Button>
      </Stack>
      <Box
        sx={{
          p: 2,
          display: "grid",
          gap: 1.75,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.86rem", color: "#0f172a", wordBreak: "break-word" }}>{value}</Typography>
    </Box>
  );
}

export default function ReviewSummary({
  schema,
  values,
  files,
  theme,
  selectionSummary,
  onEditSelection,
  onEditDetails,
  onEditDocuments,
}: Props) {
  return (
    <Stack spacing={2}>
      <Block title="Your selection" onEdit={onEditSelection} accent={theme.color}>
        {selectionSummary.map((s) => (
          <Row key={s.label} label={s.label} value={s.value} />
        ))}
      </Block>

      {schema.sections.map((section) => (
        <Block key={section.id} title={section.title} onEdit={onEditDetails} accent={theme.color}>
          {section.fields
            .filter((f) => isFieldVisible(f.visibleWhen, values))
            .map((f) => (
              <Row key={f.name} label={f.label} value={displayValue(values[f.name])} />
            ))}
        </Block>
      ))}

      <Block title="Documents" onEdit={onEditDocuments} accent={theme.color}>
        {schema.documents.map((d) => (
          <Row key={d.name} label={d.label} value={files[d.name]?.name ?? "—"} />
        ))}
      </Block>
    </Stack>
  );
}
