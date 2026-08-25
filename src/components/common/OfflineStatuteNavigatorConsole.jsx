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
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShieldIcon from "@mui/icons-material/Shield";
import StorageIcon from "@mui/icons-material/Storage";

import StatuteKnowledgeMatrixService from "../../services/statuteKnowledgeMatrixService.js";

export default function OfflineStatuteNavigatorConsole() {
  const [searchQuery, setSearchQuery] = useState("चेक बाउंस");
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [analysis, setAnalysis] = useState(
    StatuteKnowledgeMatrixService.generateFavorAgainstAnalysis("चेक बाउंस")
  );

  const clusters = StatuteKnowledgeMatrixService.getClusters();
  const footprint = StatuteKnowledgeMatrixService.getStorageFootprint();

  const handleSearch = (query) => {
    setSearchQuery(query);
    const newAnalysis = StatuteKnowledgeMatrixService.generateFavorAgainstAnalysis(query);
    setAnalysis(newAnalysis);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "20px",
        bgcolor: "#ffffff",
        border: "2px solid #cbd5e1",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
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
              bgcolor: "#0f172a",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GavelIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                🏛️ 2,000+ भारतीय कानून संप्रभु ज्ञानकोश एवं न्यायिक बुद्धि कंसोल
              </Typography>
              <Chip
                label="[CODE G7] 100% Offline Engine"
                size="small"
                sx={{ bgcolor: "#ecfdf5", color: "#065f46", fontWeight: 800, border: "1px solid #10b981", fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              बिना इंटरनेट (0ms ऑफलाइन): भारत के सभी 2,000+ कानूनों से स्वतः बहु-अधिनियम मिलान एवं वरिष्ठ जज/वकील स्तर का पक्ष-विपक्ष विश्लेषण।
            </Typography>
          </Box>
        </Stack>

        {/* STORAGE FOOTPRINT BADGE */}
        <Paper elevation={0} sx={{ p: 1, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #cbd5e1" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StorageIcon sx={{ color: "#0284c7", fontSize: 18 }} />
            <Typography variant="caption" fontWeight={900} color="#0f172a">
              {footprint.compressedBrotliMB} Local Cached • {footprint.searchLatencyMs}
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      {/* 0MS OFFLINE SEARCH BAR */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="समस्या या कीवर्ड लिखें (उदा. चेक बाउंस, अवैध हिरासत, धोखाधड़ी, तलाक, सड़क दुर्घटना)..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#0284c7" }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "#f8fafc", borderRadius: "10px" }}
        />

        {/* QUICK TAGS */}
        <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, alignSelf: "center", mr: 0.5 }}>
            त्वरित उदाहरण:
          </Typography>
          {["चेक बाउंस", "अवैध हिरासत (Habeas Corpus)", "धोखाधड़ी (BNS 318)", "घरेलू हिंसा व भरण-पोषण", "सड़क दुर्घटना MACT", "साइबर हैकिंग"].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => handleSearch(tag)}
              sx={{
                bgcolor: searchQuery === tag ? "#0f172a" : "#f1f5f9",
                color: searchQuery === tag ? "#38bdf8" : "#475569",
                fontWeight: 800,
                fontSize: "0.68rem",
                cursor: "pointer",
                "&:hover": { bgcolor: "#0f172a", color: "#38bdf8" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 8 JUDICIAL CLUSTERS GRID */}
      <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
        📑 8 प्रमुख न्यायिक क्लस्टर्स (2,000+ Acts Indexed):
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {clusters.map((c) => (
          <Grid item xs={6} sm={3} key={c.id}>
            <Box
              onClick={() => {
                setSelectedCluster(c);
                handleSearch(c.sampleKeywords[0]);
              }}
              sx={{
                p: 1.2,
                borderRadius: "10px",
                bgcolor: selectedCluster?.id === c.id ? "#eff6ff" : "#f8fafc",
                border: `1.5px solid ${selectedCluster?.id === c.id ? "#3b82f6" : "#e2e8f0"}`,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" },
              }}
            >
              <Typography variant="caption" fontWeight={900} color="#0f172a" display="block">
                {c.icon} {c.name.split(" ")[0]}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", display: "block" }}>
                {c.actsCount} कानून • {c.primaryActs[0]}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* FAVOR VS AGAINST JUDICIAL SWOT MATRIX */}
      {analysis && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#f8fafc", border: "2px solid #0284c7" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                ⚖️ वरिष्ठ न्यायाधीश व अधिवक्ता पैनल विश्लेषण: <strong>"{analysis.query}"</strong>
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#64748b">
                2,000+ कानूनों से स्वतः पहचाने गए अधिनियम: {analysis.applicableActs.join(" • ")}
              </Typography>
            </Box>
            <Chip label="🟢 100% Offline Active" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 900 }} />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* 🟢 POINTS IN FAVOR */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f0fdf4", border: "1.5px solid #86efac", height: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <CheckCircleIcon sx={{ color: "#059669" }} />
                  <Typography variant="subtitle2" fontWeight={900} color="#065f46">
                    🟢 हमारे पक्ष में मजबूत बिंदु (Points in FAVOR):
                  </Typography>
                </Stack>
                <Stack spacing={1.2}>
                  {analysis.pointsInFavor.map((p, idx) => (
                    <Box key={idx} sx={{ p: 1.2, borderRadius: "8px", bgcolor: "#ffffff", border: "1px solid #bbf7d0" }}>
                      <Typography variant="caption" fontWeight={900} color="#047857" display="block">
                        • {p.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#334155", display: "block", fontSize: "0.72rem" }}>
                        {p.detail}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 800, fontSize: "0.68rem", display: "block", mt: 0.3 }}>
                        🏛️ सुप्रीम कोर्ट नज़ीर: {p.precedent}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* 🔴 POINTS AGAINST & COUNTER */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#fef2f2", border: "1.5px solid #fca5a5", height: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <WarningAmberIcon sx={{ color: "#dc2626" }} />
                  <Typography variant="subtitle2" fontWeight={900} color="#991b1b">
                    🔴 विपक्ष के संभावित खतरे एवं विधिक काट (Counter-Shields):
                  </Typography>
                </Stack>
                <Stack spacing={1.2}>
                  {analysis.pointsAgainstAndCounter.map((p, idx) => (
                    <Box key={idx} sx={{ p: 1.2, borderRadius: "8px", bgcolor: "#ffffff", border: "1px solid #fecaca" }}>
                      <Typography variant="caption" fontWeight={900} color="#dc2626" display="block">
                        ⚠️ {p.riskTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#065f46", fontWeight: 800, display: "block", fontSize: "0.72rem", mt: 0.3, bgcolor: "#ecfdf5", p: 0.8, borderRadius: "6px" }}>
                        🛡️ {p.counterShield}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* SENIOR ADVOCATE ADVISORY NOTE */}
          <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#0f172a", color: "#f8fafc" }}>
            <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 900, display: "block" }}>
              💡 वरिष्ठ अधिवक्ता रणनीतिक सम्मति (Senior Advocate Strategic Note):
            </Typography>
            <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.75rem", display: "block", mt: 0.3 }}>
              {analysis.seniorAdvocateNote}
            </Typography>
          </Box>
        </Paper>
      )}
    </Paper>
  );
}
