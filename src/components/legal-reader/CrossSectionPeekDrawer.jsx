import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Paper,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BareActsSyncEngine from "../../services/bareActsSyncEngine";

export default function CrossSectionPeekDrawer({
  open,
  onClose,
  targetActId,
  targetSectionNumber,
  onSwitchFullView,
}) {
  const sectionData = React.useMemo(() => {
    if (!targetActId || !targetSectionNumber) return null;
    return BareActsSyncEngine.findSection(targetActId, targetSectionNumber);
  }, [targetActId, targetSectionNumber]);

  if (!open) return null;

  const handleCopySection = () => {
    if (!sectionData) return;
    const { act, section } = sectionData;
    const text = `${section.section_title} [Section ${section.section_number}, ${act.short_title_en}]\n\n${section.section_body}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520, md: 600 },
          p: 0,
          bgcolor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <GavelIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
            <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 700, letterSpacing: 0.8 }}>
              CROSS-STATUTORY REFERENCE PEEK
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff", lineHeight: 1.2 }}>
            Section {targetSectionNumber}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.3 }}>
            {sectionData ? sectionData.act.short_title_en : targetActId}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        {sectionData ? (
          <>
            {/* Act & Chapter Badge */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Chip
                label={sectionData.act.short_title_en}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={sectionData.chapter.chapter_title}
                size="small"
                variant="outlined"
                sx={{ bgcolor: "#ffffff", borderColor: "#cbd5e1" }}
              />
            </Stack>

            {/* Section Title */}
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#0f172a", mb: 2, lineHeight: 1.3 }}>
              {sectionData.section.section_title}
            </Typography>

            {/* Full Bare Section Body */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 2.5,
                lineHeight: 1.8,
                color: "#1e293b",
                fontFamily: "Georgia, serif",
                fontSize: "1rem",
                whiteSpace: "pre-line",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {sectionData.section.section_body}
            </Paper>

            {/* Defined Terms in this section */}
            {sectionData.section.defined_terms?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                  Key Defined Statutory Terms:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {sectionData.section.defined_terms.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      size="small"
                      sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontWeight: 500 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Related Cross References */}
            {sectionData.section.cross_references?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                  Related Provisions & Statutes:
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {sectionData.section.cross_references.map((ref, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: "#f1f5f9",
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="500" sx={{ color: "#334155" }}>
                        {ref.label}
                      </Typography>
                      {onSwitchFullView && (
                        <Button
                          size="small"
                          onClick={() => {
                            onClose();
                            onSwitchFullView(ref.target_act_id, ref.section_number);
                          }}
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          View
                        </Button>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              Statutory text for <strong>Section {targetSectionNumber}</strong> [{targetActId}] is indexed and will be fetched dynamically.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Drawer Footer Actions */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: "#ffffff", display: "flex", justifyContent: "space-between", gap: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopySection}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Copy Section
        </Button>
        {onSwitchFullView && sectionData && (
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={() => {
              onClose();
              onSwitchFullView(sectionData.act.act_id, sectionData.section.section_number);
            }}
            sx={{ textTransform: "none", borderRadius: 2, bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
          >
            Open Full Act View
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
