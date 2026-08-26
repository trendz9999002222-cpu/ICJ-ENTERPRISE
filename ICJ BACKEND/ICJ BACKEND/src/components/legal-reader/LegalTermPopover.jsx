import React from "react";
import {
  Popover,
  Paper,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GavelIcon from "@mui/icons-material/Gavel";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function LegalTermPopover({
  anchorEl,
  termData,
  onClose,
  onJumpToSection,
}) {
  const open = Boolean(anchorEl && termData);

  if (!termData) return null;

  const handleCopy = () => {
    const text = `${termData.term_display_en} (${termData.term_display_hi || ""})\nSource: ${termData.source_section} [${termData.source_act_id}]\n\nDefinition:\n${termData.definition_text_en}\n\nAdvocate Summary: ${termData.plain_english_summary || ""}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 420 },
          maxWidth: "95vw",
          borderRadius: 3,
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.22)",
          border: "1px solid #bfdbfe",
          bgcolor: "#ffffff",
          overflow: "hidden",
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          color: "#ffffff",
          p: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <MenuBookIcon sx={{ fontSize: 18, color: "#93c5fd" }} />
            <Typography variant="caption" sx={{ color: "#bfdbfe", fontWeight: 700, letterSpacing: 0.8 }}>
              STATUTORY DEFINITION & MEANING
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2, color: "#ffffff" }}>
            {termData.term_display_en}
          </Typography>
          {termData.term_display_hi && (
            <Typography variant="subtitle2" sx={{ color: "#e0e7ff", fontWeight: 500, mt: 0.2 }}>
              {termData.term_display_hi}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff", opacity: 0.8, "&:hover": { opacity: 1 } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Metadata Badges */}
      <Box sx={{ p: 2, bgcolor: "#f8fafc" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip
            icon={<GavelIcon sx={{ fontSize: "14px !important" }} />}
            label={termData.source_section}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
          {termData.category && (
            <Chip
              label={termData.category}
              size="small"
              variant="outlined"
              sx={{ bgcolor: "#eff6ff", borderColor: "#93c5fd", color: "#1e40af", fontWeight: 600, fontSize: "0.75rem" }}
            />
          )}
        </Stack>

        {/* English Statutory Definition */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          Statutory Legal Text:
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mt: 0.5,
            mb: 1.5,
            bgcolor: "#ffffff",
            borderColor: "#e2e8f0",
            borderRadius: 2,
            borderLeft: "3px solid #2563eb",
          }}
        >
          <Typography variant="body2" sx={{ color: "#1e293b", lineHeight: 1.6, fontStyle: "italic", fontSize: "0.85rem" }}>
            "{termData.definition_text_en}"
          </Typography>
        </Paper>

        {/* Hindi Meaning if available */}
        {termData.definition_text_hi && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              हिंदी विधिक अभिप्राय:
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", mt: 0.3, lineHeight: 1.5, fontSize: "0.82rem" }}>
              {termData.definition_text_hi}
            </Typography>
          </Box>
        )}

        {/* Advocate Practice Takeaway */}
        {termData.plain_english_summary && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              mb: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "#16a34a" }} />
              <Typography variant="caption" fontWeight="bold" sx={{ color: "#166534" }}>
                ADVOCATE PRACTICE NOTE / RATIO
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#14532d", fontSize: "0.8rem", lineHeight: 1.5 }}>
              {termData.plain_english_summary}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Footer Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            size="small"
            startIcon={<ContentCopyIcon fontSize="small" />}
            onClick={handleCopy}
            sx={{ textTransform: "none", fontSize: "0.75rem", color: "#475569" }}
          >
            Copy Citation
          </Button>
          {onJumpToSection && termData.source_act_id && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => {
                onClose();
                onJumpToSection(termData.source_act_id, termData.source_section);
              }}
              sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: 2 }}
            >
              Open Full Section
            </Button>
          )}
        </Stack>
      </Box>
    </Popover>
  );
}
