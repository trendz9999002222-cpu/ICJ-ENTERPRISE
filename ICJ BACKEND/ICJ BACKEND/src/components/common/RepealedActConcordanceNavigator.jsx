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
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import RepealedActsConcordanceService from "../../services/repealedActsConcordanceService.js";

export default function RepealedActConcordanceNavigator() {
  const [searchQuery, setSearchQuery] = useState("420");
  const [alertMsg, setAlertMsg] = useState("");

  const filteredItems = RepealedActsConcordanceService.searchConcordance(searchQuery);
  const gazette = RepealedActsConcordanceService.getRepealGazetteDetails();

  const handleCopyCitation = (text) => {
    navigator.clipboard.writeText(text);
    setAlertMsg("📋 तुलनात्मक विधिक उद्धरण कॉपी हो गया! अब आप इसे सीधे अपने कानूनी ड्राफ्ट में जोड़ सकते हैं।");
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
            <PublishedWithChangesIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                🔄 निरसित अधिनियम (Repealed Acts) एवं 'पुराना vs नया' तुलनात्मक सेतु
              </Typography>
              <Chip
                label="[CODE G10] IPC/CrPC ➔ BNS/BNSS/BSA"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 800, border: "1px solid #bfdbfe", fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              भारत सरकार राजपत्र (1 जुलाई 2024) आधारित: पुरानी धारा डालते ही नया BNS सेक्शन, अंतर, और विधिक बचत धाराएं।
            </Typography>
          </Box>
        </Stack>

        {/* OFFICIAL GAZETTE BADGE */}
        <Paper elevation={0} sx={{ p: 1, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #cbd5e1" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountBalanceIcon sx={{ color: "#059669", fontSize: 18 }} />
            <Typography variant="caption" fontWeight={900} color="#0f172a">
              {gazette.officialDataSource}
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px", fontWeight: 800 }}>
          {alertMsg}
        </Alert>
      )}

      {/* SEARCH & CONVERTER BAR */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="पुराना या नया सेक्शन नंबर लिखें (उदा. 420, 302, 154, 156(3), 65B, 318, 173, 63)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#0284c7" }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "#f8fafc", borderRadius: "10px" }}
        />

        {/* QUICK CONVERTER CHIPS */}
        <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, alignSelf: "center", mr: 0.5 }}>
            त्वरित कनवर्टर:
          </Typography>
          {[
            { label: "IPC 420 ➔ BNS 318(4) (धोखाधड़ी)", val: "420" },
            { label: "IPC 302 ➔ BNS 103 (हत्या)", val: "302" },
            { label: "CrPC 154 ➔ BNSS 173 (FIR)", val: "154" },
            { label: "CrPC 156(3) ➔ BNSS 175(3)", val: "156(3)" },
            { label: "CrPC 438 ➔ BNSS 482 (अग्रिम जमानत)", val: "438" },
            { label: "Evidence 65B ➔ BSA 63 (डिजिटल साक्ष्य)", val: "65B" },
            { label: "राजद्रोह 124A ➔ BNS 152 (देशद्रोह)", val: "124A" },
          ].map((item, idx) => (
            <Chip
              key={idx}
              label={item.label}
              size="small"
              onClick={() => setSearchQuery(item.val)}
              sx={{
                bgcolor: searchQuery === item.val ? "#0f172a" : "#f1f5f9",
                color: searchQuery === item.val ? "#38bdf8" : "#475569",
                fontWeight: 800,
                fontSize: "0.68rem",
                cursor: "pointer",
                "&:hover": { bgcolor: "#0f172a", color: "#38bdf8" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* COMPARATIVE CARDS LIST */}
      <Stack spacing={2.5}>
        {filteredItems.map((item, idx) => (
          <Paper key={idx} elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#f8fafc", border: "1.5px solid #cbd5e1" }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                ⚖️ {item.oldTitle}
              </Typography>
              <Chip
                label={`निरसित: ${item.repealDate}`}
                size="small"
                sx={{ bgcolor: "#fee2e2", color: "#991b1b", fontWeight: 800, fontSize: "0.68rem" }}
              />
            </Stack>

            {/* SIDE-BY-SIDE COMPARISON */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* OLD ACT BOX */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#ffffff", border: "1.5px solid #fca5a5", height: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" fontWeight={900} color="#dc2626">
                      🔴 पुराना कानून (निरसित / REPEALED)
                    </Typography>
                    <Chip label={item.oldSection} size="small" sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 900 }} />
                  </Stack>
                  <Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ mb: 0.5 }}>
                    {item.oldAct}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>
                    {item.oldText}
                  </Typography>
                </Box>
              </Grid>

              {/* NEW ACT BOX */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#ffffff", border: "2px solid #86efac", height: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" fontWeight={900} color="#059669">
                      🟢 नया कानून (वर्तमान में 100% लागू / ENACTED)
                    </Typography>
                    <Chip label={item.newSection} size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 900 }} />
                  </Stack>
                  <Typography variant="body2" fontWeight={800} color="#047857" sx={{ mb: 0.5 }}>
                    {item.newAct}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#334155", display: "block", fontSize: "0.75rem", fontWeight: 700 }}>
                    {item.newText}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* KEY LEGISLATIVE CHANGES & SAVINGS CLAUSE */}
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#ecfdf5", border: "1px solid #a7f3d0", mb: 1.5 }}>
              <Typography variant="caption" fontWeight={900} color="#065f46" display="block">
                🌟 क्या-क्या मुख्य बदलाव हुए (Key Legislative Improvements):
              </Typography>
              <Typography variant="caption" sx={{ color: "#047857", display: "block", fontSize: "0.75rem", mt: 0.3 }}>
                • {item.keyChangesHighlight}
              </Typography>
              <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 800, display: "block", fontSize: "0.72rem", mt: 0.5 }}>
                ⚖️ विधिक संक्रमण नियम (Savings Clause): {item.savingsClause}
              </Typography>
            </Box>

            {/* COPY BUTTON */}
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopyCitation(`[तुलनात्मक विधिक संदर्भ]: पुराना ${item.oldAct} ${item.oldSection} अब नए ${item.newAct} की ${item.newSection} के रूप में लागू है। (निरसन तिथि: ${item.repealDate})`)}
              sx={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "none", color: "#0284c7" }}
            >
              📋 कोर्ट याचिका हेतु तुलनात्मक संदर्भ कॉपी करें
            </Button>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
