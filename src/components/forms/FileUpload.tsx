"use client";

import { useRef } from "react";
import { Box, Button, Chip, FormHelperText, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { DocumentUploadItem } from "@/types/onboarding-form";
import { RADIUS, TRANSITION } from "@/theme/designTokens";

interface Props {
  label: string;
  name: string;
  value?: DocumentUploadItem | null;
  onChange: (fileItem: DocumentUploadItem | null) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  acceptTypes?: string;
  maxSizeMb?: number;
  disabled?: boolean;
}

export default function FileUpload({
  label,
  name,
  value,
  onChange,
  required,
  error,
  helperText,
  acceptTypes = ".pdf,.jpg,.jpeg,.png",
  maxSizeMb = 5,
  disabled,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      alert(`फ़ाइल का साइज़ ${maxSizeMb}MB से अधिक नहीं होना चाहिए (File exceeds ${maxSizeMb}MB limit).`);
      return;
    }

    const item: DocumentUploadItem = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    onChange(item);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem", mb: 1 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        id={`file-${name}`}
        accept={acceptTypes}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {value ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: RADIUS.sm,
            border: "1.5px solid #10b981",
            bgcolor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <DescriptionOutlinedIcon sx={{ color: "#059669", fontSize: 28, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "#065f46",
                  fontSize: "0.9rem",
                  maxWidth: { xs: 180, sm: 300, md: 400 },
                }}
              >
                {value.fileName}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.78rem" }}>
                {formatSize(value.fileSize)} • अपलोड किया गया: {value.uploadedAt}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
            <Chip
              icon={<CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "#059669 !important" }} />}
              label="अपलोड पूर्ण (Uploaded)"
              size="small"
              sx={{
                bgcolor: "#d1fae5",
                color: "#065f46",
                fontWeight: 700,
                fontSize: "0.75rem",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{
                color: "#ef4444",
                "&:hover": { bgcolor: "#fee2e2" },
              }}
              title="Remove File"
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          onClick={() => !disabled && fileInputRef.current?.click()}
          sx={{
            p: 2.5,
            borderRadius: RADIUS.sm,
            border: `2px dashed ${error ? "#ef4444" : "#cbd5e1"}`,
            bgcolor: "#f8fafc",
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: TRANSITION.fast,
            "&:hover": {
              borderColor: disabled ? "#cbd5e1" : "#2563eb",
              bgcolor: disabled ? "#f8fafc" : "#eff6ff",
            },
          }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: error ? "#ef4444" : "#2563eb", mb: 0.5 }} />
          <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
            फ़ाइल चुनें या यहाँ ड्रैग करें (Click to upload document)
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "0.78rem", mt: 0.5 }}>
            स्वीकृत फॉर्मेट: {acceptTypes.replace(/\./g, "").toUpperCase()} • अधिकतम आकार: {maxSizeMb}MB
          </Typography>
          {helperText && (
            <Typography sx={{ color: "#475569", fontSize: "0.76rem", mt: 0.75, fontStyle: "italic" }}>
              {helperText}
            </Typography>
          )}
        </Paper>
      )}

      {error && (
        <FormHelperText error sx={{ fontWeight: 600, fontSize: "0.78rem", mt: 0.75 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
