import React, { useState } from "react";
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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GavelIcon from "@mui/icons-material/Gavel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PrecedentSearchService from "../../services/precedentSearchService";

export default function CaseLawPeekDrawer({
  open,
  onClose,
  caseData,
  onOpenSection,
}) {
  const [copied, setCopied] = useState(false);

  if (!open || !caseData) return null;

  const handleCopyCitation = () => {
    const citation = PrecedentSearchService.formatCourtCitation(caseData);
    const fullText = `${citation}\n\nBench: ${caseData.bench_strength}\nCoram: ${caseData.coram.join(", ")}\n\nRatio Decidendi:\n${caseData.ratio_decidendi_en}\n\nAdvocate Practice Note:\n${caseData.practice_takeaway}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560, md: 650 },
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
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <AccountBalanceIcon sx={{ fontSize: 18, color: "#a5b4fc" }} />
            <Typography variant="caption" sx={{ color: "#a5b4fc", fontWeight: 700, letterSpacing: 0.8 }}>
              SUPREME COURT OF INDIA PRECEDENT
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff", lineHeight: 1.3 }}>
            {caseData.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "#c7d2fe", mt: 0.3, display: "block" }}>
            {caseData.cause_title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        {/* Official Citation Badges */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
          <Chip
            label={caseData.official_citation}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "0.8rem" }}
          />
          {caseData.parallel_citations?.map((cite) => (
            <Chip
              key={cite}
              label={cite}
              size="small"
              variant="outlined"
              sx={{ bgcolor: "#ffffff", borderColor: "#cbd5e1", fontWeight: 600 }}
            />
          ))}
          <Chip
            label={caseData.bench_strength}
            size="small"
            sx={{ bgcolor: "#fdf4ff", color: "#86198f", border: "1px solid #f0abfc", fontWeight: 600 }}
          />
          <Chip
            label={`Decided: ${caseData.judgment_date}`}
            size="small"
            sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 500 }}
          />
        </Stack>

        {/* Bench Coram */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2.5, bgcolor: "#ffffff", borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
            CORAM (BENCH OF JUDGES):
          </Typography>
          <Typography variant="body2" fontWeight="600" sx={{ color: "#1e293b", mt: 0.3 }}>
            {caseData.coram.join(" • ")}
          </Typography>
        </Paper>

        {/* Ratio Decidendi (English) */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          LEGAL RATIO DECIDENDI (सार):
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mt: 0.5,
            mb: 2,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            borderLeft: "4px solid #4338ca",
            lineHeight: 1.8,
            color: "#1e293b",
            fontSize: "0.95rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          {caseData.ratio_decidendi_en}
        </Paper>

        {/* Ratio Decidendi (Hindi) */}
        {caseData.ratio_decidendi_hi && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
              हिंदी विधिक सार:
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", mt: 0.3, lineHeight: 1.6 }}>
              {caseData.ratio_decidendi_hi}
            </Typography>
          </Box>
        )}

        {/* Advocate Practice Takeaway */}
        {caseData.practice_takeaway && (
          <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2.5, border: "1px solid #bbf7d0", mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: "#16a34a" }} />
              <Typography variant="caption" fontWeight="bold" sx={{ color: "#166534", textTransform: "uppercase" }}>
                ADVOCATE COURTROOM TAKEAWAY / RATIO NOTE:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#14532d", fontSize: "0.85rem", lineHeight: 1.6 }}>
              {caseData.practice_takeaway}
            </Typography>
          </Box>
        )}

        {/* Headnotes */}
        {caseData.headnotes?.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
              HEADNOTES & KEYWORDS:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {caseData.headnotes.map((note, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.2, bgcolor: "#f8fafc", borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem" }}>
                    • {note}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Linked Statutory Sections */}
        {caseData.linked_sections?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
              LINKED STATUTORY SECTIONS:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              {caseData.linked_sections.map((sec, idx) => (
                <Chip
                  key={idx}
                  icon={<GavelIcon sx={{ fontSize: "14px !important" }} />}
                  label={`Sec. ${sec.section_number} [${sec.act_id.replace("ACT_", "")}]`}
                  onClick={() => onOpenSection && onOpenSection(sec.act_id, sec.section_number)}
                  clickable={Boolean(onOpenSection)}
                  color="primary"
                  variant="outlined"
                  sx={{ bgcolor: "#ffffff", fontWeight: 600, fontSize: "0.75rem" }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Drawer Footer Actions */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: "#ffffff", display: "flex", justifyContent: "space-between", gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
          onClick={handleCopyCitation}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: copied ? "#16a34a" : "#312e81",
            "&:hover": { bgcolor: copied ? "#15803d" : "#1e1b4b" },
          }}
        >
          {copied ? "Citation & Ratio Copied!" : "Copy Legal Citation & Ratio"}
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
