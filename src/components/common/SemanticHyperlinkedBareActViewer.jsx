import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Grid,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

import SemanticLegalHypergraphService from "../../services/semanticLegalHypergraphService.js";

export default function SemanticHyperlinkedBareActViewer() {
  const actsList = SemanticLegalHypergraphService.getAllWestlawActs();
  const [selectedActId, setSelectedActId] = useState("ACT_1836_21");
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [previewLink, setPreviewLink] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trail, setTrail] = useState([
    { title: "बंगाल जिला अधिनियम 1836 (देश का पहला कानून)", actId: "ACT_1836_21" },
  ]);

  const activeAct = SemanticLegalHypergraphService.getActById(selectedActId);
  const activeSection = activeAct.sections[activeSectionIdx] || activeAct.sections[0];

  const handleOpenLink = (link) => {
    setPreviewLink(link);
    setDrawerOpen(true);
    setTrail((prev) => [...prev, { title: link.targetAct, actId: link.targetId }]);
  };

  const handleSelectAct = (act) => {
    setSelectedActId(act.id);
    setActiveSectionIdx(0);
    setTrail((prev) => [...prev, { title: act.title.split("(")[0], actId: act.id }]);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "20px",
        bgcolor: "#ffffff",
        border: "2px solid #0284c7",
        boxShadow: "0 10px 40px rgba(2, 132, 199, 0.08)",
        mb: 4,
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "#0284c7",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LanguageIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                🌐 वेस्ट-लॉ (Westlaw) व लेक्सिसनेक्सिस (LexisNexis) सेमेंटिक विधिक हाइपरग्राफ
              </Typography>
              <Chip
                label="[CODE G9] Interactive Hypergraph"
                size="small"
                sx={{ bgcolor: "#0f172a", color: "#38bdf8", fontWeight: 800, fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              देश के पहले कानून (1836) से लेकर 2026 तक: नीले क्लिकेबल लिंक्स, साइडबार इंडेक्स और विकिपीडिया-स्टाइल ज्ञान नेविगेशन।
            </Typography>
          </Box>
        </Stack>

        <Chip
          label="★ Westlaw / LexisNexis Grade Active"
          size="small"
          sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 900, border: "1px solid #93c5fd" }}
        />
      </Stack>

      {/* BREADCRUMB NAVIGATION TRAIL */}
      <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="caption" fontWeight={900} color="#64748b">
            🧭 ज्ञान यात्रा ट्रेल (Breadcrumb Trail):
          </Typography>
          {trail.slice(-4).map((t, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ArrowForwardIosIcon sx={{ fontSize: 10, color: "#94a3b8" }} />}
              <Chip
                label={t.title}
                size="small"
                sx={{
                  bgcolor: idx === trail.slice(-4).length - 1 ? "#0284c7" : "#e2e8f0",
                  color: idx === trail.slice(-4).length - 1 ? "#ffffff" : "#334155",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                }}
              />
            </React.Fragment>
          ))}
        </Stack>
      </Box>

      {/* MAIN TWO-PANEL INTERACTIVE EXPLORER */}
      <Grid container spacing={2.5}>
        {/* LEFT SIDEBAR: ACTS & SECTIONS TOC */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", bgcolor: "#f8fafc", border: "1.5px solid #cbd5e1" }}>
            <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
              📑 कानून चुनें (Select Historic or Modern Act):
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {actsList.map((act) => (
                <Box
                  key={act.id}
                  onClick={() => handleSelectAct(act)}
                  sx={{
                    p: 1.2,
                    borderRadius: "10px",
                    bgcolor: selectedActId === act.id ? "#eff6ff" : "#ffffff",
                    border: `1.5px solid ${selectedActId === act.id ? "#0284c7" : "#e2e8f0"}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#0284c7" },
                  }}
                >
                  <Typography variant="caption" fontWeight={900} color={selectedActId === act.id ? "#0284c7" : "#0f172a"} display="block">
                    {act.id === "ACT_1836_21" ? "🇮🇳 देश का पहला कानून (1836)" : act.year === 1882 ? "📜 1882 ऐतिहासिक कानून" : "⚖️ 2023-24 नया कानून"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, fontSize: "0.72rem", display: "block" }}>
                    {act.title.split("(")[0]}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.65rem", display: "block" }}>
                    {act.actNo} • {act.enactedDate}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* SECTIONS INDEX OF CURRENT ACT */}
            <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
              📜 अध्याय एवं धारा अनुक्रमणिका (Sections Index):
            </Typography>
            <Stack spacing={0.8}>
              {activeAct.sections.map((sec, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveSectionIdx(idx)}
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    bgcolor: activeSectionIdx === idx ? "#0f172a" : "#ffffff",
                    color: activeSectionIdx === idx ? "#38bdf8" : "#334155",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#0f172a", color: "#38bdf8" },
                  }}
                >
                  <Typography variant="caption" fontWeight={900} display="block">
                    {sec.sectionNum}: {sec.heading.split("(")[0]}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT MAIN CANVAS: ACTIVE SECTION WITH BLUE HYPERLINKS */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", bgcolor: "#ffffff", border: "2px solid #e2e8f0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a">
                  {activeAct.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 800 }}>
                  {activeAct.actNo} • पारित तिथि: {activeAct.enactedDate} • {activeAct.historicalSignificance}
                </Typography>
              </Box>
              <Chip
                label={activeAct.id === "ACT_1836_21" ? "🇮🇳 1ST ACT OF INDIA" : "ACTIVE STATUTE"}
                size="small"
                sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 900 }}
              />
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* SECTION HEADING & FULL TEXT */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={900} color="#dc2626" sx={{ mb: 1 }}>
                {activeSection.sectionNum}: {activeSection.heading}
              </Typography>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", bgcolor: "#f8fafc", border: "1px solid #cbd5e1", lineHeight: 1.8 }}>
                <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.88rem", fontWeight: 600 }}>
                  {activeSection.bodyText}
                </Typography>
              </Paper>
            </Box>

            {/* BLUE HYPERLINKED CROSS-REFERENCES BAR */}
            <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f0f9ff", border: "1.5px solid #7dd3fc" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                <OpenInNewIcon sx={{ color: "#0284c7", fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={900} color="#0369a1">
                  🔗 नीले सेमेंटिक क्रॉस-रेफरेंस लिंक (Click any Blue Link to Explore):
                </Typography>
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activeSection.crossLinks.map((link, idx) => (
                  <Chip
                    key={idx}
                    label={`🔗 ${link.term} ➔ ${link.targetAct}`}
                    onClick={() => handleOpenLink(link)}
                    sx={{
                      bgcolor: "#0284c7",
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#0369a1", transform: "scale(1.02)" },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* CONTEXTUAL SLIDE-OUT DRAWER / PREVIEW OVERLAY */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: "100vw", sm: 420 }, p: 3, bgcolor: "#ffffff", height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MenuBookIcon sx={{ color: "#0284c7" }} />
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                सेमेंटिक विधिक प्रिव्यू (Contextual Drawer)
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {previewLink && (
            <Stack spacing={2}>
              <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <Typography variant="caption" fontWeight={900} color="#1d4ed8" display="block">
                  🎯 संदर्भित कानून व धारा:
                </Typography>
                <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
                  {previewLink.targetAct}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f8fafc", border: "1px solid #cbd5e1" }}>
                <Typography variant="caption" fontWeight={900} color="#059669" display="block" sx={{ mb: 0.5 }}>
                  ⚖️ विधिक संबंध व व्याख्या:
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.82rem", lineHeight: 1.6 }}>
                  {previewLink.desc}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#0f172a", color: "#f8fafc" }}>
                <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 900, display: "block" }}>
                  💡 वेस्ट-लॉ / लेक्सिसनेक्सिस नेविगेशन टिप:
                </Typography>
                <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.72rem", display: "block", mt: 0.3 }}>
                  आप इस धारा से सीधे संबंधित सुप्रीम कोर्ट नज़ीर या कानून में आगे बढ़ सकते हैं। मूल पेज का स्थान सुरक्षित है।
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setDrawerOpen(false)}
                sx={{ bgcolor: "#0284c7", fontWeight: 900, textTransform: "none", borderRadius: "10px" }}
              >
                मूल धारा पर वापस जाएं (Back to Reading)
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Paper>
  );
}
