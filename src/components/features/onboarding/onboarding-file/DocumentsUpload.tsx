"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Button, Typography } from "@mui/material";

import type { DocumentField, Theme } from "@/types/registration";

import { RADIUS } from "./iconMap";

type Props = {
  documents: DocumentField[];
  files: Record<string, File | null>;
  errors: Record<string, string>;
  theme: Theme;
  onChange: (name: string, file: File | null) => void;
};

export default function DocumentsUpload({ documents, files, errors, theme, onChange }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
      }}
    >
      {documents.map((doc) => {
        const file = files[doc.name];
        const error = errors[doc.name];

        return (
          <Box
            key={doc.name}
            data-field={doc.name}
            sx={{
              p: 2,
              borderRadius: RADIUS.md,
              border: error ? "1px solid #ef4444" : file ? `1px solid ${theme.color}` : "1px solid #e2e8f0",
              bgcolor: "#fff",
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a", mb: 1.25 }}>
              {doc.label}
              {doc.required ? " *" : " (Optional)"}
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={file ? <CheckCircleIcon /> : <UploadFileIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: RADIUS.sm,
                borderColor: file ? theme.color : "#cbd5e1",
                color: file ? theme.color : "#334155",
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              <Box
                component="span"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {file ? file.name : "Choose file"}
              </Box>
              <input
                hidden
                type="file"
                accept={doc.accept}
                onChange={(e) => onChange(doc.name, e.target.files?.[0] ?? null)}
              />
            </Button>

            <Typography sx={{ fontSize: "0.72rem", color: error ? "#ef4444" : "#94a3b8", mt: 0.75 }}>
              {error ?? doc.hint}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
