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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

import HistoricalBareActsService from "../../services/historicalBareActsService.js";
import LandmarkJudgmentsCitationService from "../../services/landmarkJudgmentsCitationService.js";

export default function AllIndiaStatuteAndJudgmentsExplorerConsole() {
  const [activeTab, setActiveTab] = useState("ACTS");
  const [selectedYear, setSelectedYear] = useState(1882);
  const [actSearch, setActSearch] = useState("");
  const [judgmentSearch, setJudgmentSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const yearsList = HistoricalBareActsService.getYearsList();
  const actsList = HistoricalBareActsService.getActsByYear(selectedYear);
  const filteredActs = actSearch ? HistoricalBareActsService.searchActsAndSections(actSearch) : actsList;
  const filteredJudgments = LandmarkJudgmentsCitationService.searchJudgments(judgmentSearch);

  const handleCopyCitation = (text) => {
    navigator.clipboard.writeText(text);
    setAlertMsg("📋 नज़ीर उद्धरण सफलतापूर्वक कॉपी हो गया! अब आप इसे सीधे अपनी रिट याचिका या ड्राफ्ट में पेस्ट कर सकते हैं।");
    setTimeout(() => setAlertMsg(""), 4000);
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
            <HistoryEduIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                📜 1836-2026 समस्त भारतीय अधिनियम, बेयर एक्ट्स एवं ऐतिहासिक नज़ीर (Citations) महा-ज्ञानकोश
              </Typography>
              <Chip
                label="[CODE G8] All-India Legal Repository"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 800, border: "1px solid #bfdbfe", fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              1882 से लेकर 2026 तक के सभी बेयर एक्ट्स व धाराएं और सुप्रीम कोर्ट के ऐतिहासिक फैसलों का 1-क्लिक उद्धरण कॉपी इंजन।
            </Typography>
          </Box>
        </Stack>

        {/* TAB SWITCHER */}
        <Stack direction="row" spacing={1}>
          <Button
            variant={activeTab === "ACTS" ? "contained" : "outlined"}
            size="small"
            startIcon={<MenuBookIcon />}
            onClick={() => setActiveTab("ACTS")}
            sx={{ fontWeight: 900, textTransform: "none", borderRadius: "10px" }}
          >
            📜 बेयर एक्ट्स (1836 - 2026)
          </Button>
          <Button
            variant={activeTab === "CITATIONS" ? "contained" : "outlined"}
            size="small"
            startIcon={<AccountBalanceIcon />}
            onClick={() => setActiveTab("CITATIONS")}
            sx={{ fontWeight: 900, textTransform: "none", borderRadius: "10px" }}
          >
            🏛️ सुप्रीम कोर्ट नज़ीरें (Citations)
          </Button>
        </Stack>
      </Stack>

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px", fontWeight: 800 }}>
          {alertMsg}
        </Alert>
      )}

      {/* TAB 1: BARE ACTS & SECTIONS BROWSER */}
      {activeTab === "ACTS" && (
        <Box>
          {/* YEAR SELECTOR CHIPS */}
          <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 0.8 }}>
            📅 ऐतिहासिक वर्ष चुनें (Select Historic Year):
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
            {yearsList.map((yr) => (
              <Chip
                key={yr}
                label={`वर्ष ${yr} ${yr === 1882 ? "★ (TPA, Trusts, Easements)" : yr === 2023 ? "★ (BNS, BNSS, BSA)" : ""}`}
                onClick={() => {
                  setSelectedYear(yr);
                  setActSearch("");
                }}
                sx={{
                  bgcolor: selectedYear === yr && !actSearch ? "#0f172a" : "#f1f5f9",
                  color: selectedYear === yr && !actSearch ? "#38bdf8" : "#475569",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>

          {/* ACT SEARCH INPUT */}
          <TextField
            fullWidth
            size="small"
            placeholder="किसी भी कानून या धारा का नाम लिखें (उदा. धारा 54, Transfer of Property, Trusts, BNS 318)..."
            value={actSearch}
            onChange={(e) => setActSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#0284c7" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5, bgcolor: "#f8fafc", borderRadius: "10px" }}
          />

          {/* ACTS & SECTIONS ACCORDION LIST */}
          <Stack spacing={2}>
            {filteredActs.map((act) => (
              <Paper key={act.id} elevation={0} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#f8fafc", border: "1.5px solid #cbd5e1" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                      {act.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      {act.actNo} • पारित तिथि: {act.enactedDate} • कुल धाराएं: {act.totalSections}
                    </Typography>
                  </Box>
                  <Chip label="🟢 100% In Force" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 900 }} />
                </Stack>

                <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.82rem", mb: 2 }}>
                  {act.description}
                </Typography>

                {/* KEY SECTIONS EXPANDER */}
                <Typography variant="caption" fontWeight={900} color="#0284c7" sx={{ display: "block", mb: 1 }}>
                  📜 मुख्य धाराएं एवं वैधानिक प्रावधान (Key Sections Reader):
                </Typography>
                <Stack spacing={1}>
                  {act.keySections.map((sec, idx) => (
                    <Box key={idx} sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={900} color="#dc2626">
                          {sec.section}: {sec.title}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleCopyCitation(`${act.title} - ${sec.section}: ${sec.text}`)}
                          sx={{ fontSize: "0.65rem", textTransform: "none", color: "#0284c7", p: 0.5 }}
                        >
                          कॉपी धारा
                        </Button>
                      </Stack>
                      <Typography variant="caption" sx={{ color: "#475569", display: "block", fontSize: "0.75rem" }}>
                        {sec.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* TAB 2: LANDMARK CITATIONS REPOSITORY */}
      {activeTab === "CITATIONS" && (
        <Box>
          <TextField
            fullWidth
            size="small"
            placeholder="केस का नाम या विषय लिखें (उदा. ललिता कुमारी, केशवानंद भारती, डी.के. बसु, मेनका गांधी, रंगप्पा, व्हर्लपूल)..."
            value={judgmentSearch}
            onChange={(e) => setJudgmentSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#0284c7" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5, bgcolor: "#f8fafc", borderRadius: "10px" }}
          />

          <Stack spacing={2.5}>
            {filteredJudgments.map((j) => (
              <Paper key={j.id} elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#f8fafc", border: "2px solid #0284c7" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                      🏛️ {j.caseTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 900 }}>
                      साइटेशन: {j.citation} • निर्णय तिथि: {j.judgmentDate}
                    </Typography>
                  </Box>
                  <Chip label="⚖️ Landmark Precedent" size="small" sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 900 }} />
                </Stack>

                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, display: "block", mb: 1 }}>
                  पीठ (Coram): {j.bench}
                </Typography>

                <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#ffffff", border: "1.5px solid #86efac", mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={900} color="#065f46" display="block" sx={{ mb: 0.5 }}>
                    ⚖️ निर्णय का मूल सार (Ratio Decidendi):
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#334155", display: "block", fontSize: "0.78rem" }}>
                    {j.coreRatio}
                  </Typography>
                </Box>

                {/* READY TO CITE BLOCK WITH 1-CLICK COPY */}
                <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#0f172a", color: "#f8fafc" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 900 }}>
                      📑 कोर्ट याचिका में उद्धृत करने योग्य पैराग्राफ (Ready to Cite in High Court/Supreme Court):
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyCitation(j.readyToCiteParagraph)}
                      sx={{ bgcolor: "#0284c7", fontWeight: 900, fontSize: "0.7rem", textTransform: "none" }}
                    >
                      📋 1-क्लिक उद्धरण कॉपी करें
                    </Button>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.72rem", display: "block", fontFamily: "serif", lineHeight: 1.5 }}>
                    {j.readyToCiteParagraph}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
