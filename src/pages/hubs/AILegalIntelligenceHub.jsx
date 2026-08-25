import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Chip,
  Button,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScienceIcon from "@mui/icons-material/Science";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import GavelIcon from "@mui/icons-material/Gavel";

// Direct sub-modules
import LegalDrafter from "../LegalDrafter.jsx";
import Research from "../Research.jsx";
import AIAssistant from "../AIAssistant.jsx";
import Legal from "../Legal.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "drafter",
    label: "✨ AI कानूनी ड्राफ्टर (Legal Drafter)",
    icon: <AutoAwesomeIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "ऑटोमेटेड सुप्रीम कोर्ट व हाई कोर्ट स्तर की याचिकाएं, बेल, नोटिस एवं एफिडेविट जनरेटर",
  },
  {
    id: "research",
    label: "🔬 न्यायिक निर्णय अनुसंधान (Judicial Research)",
    icon: <ScienceIcon />,
    color: "#0891b2", // Cyan Blue
    bg: "#ecfeff",
    border: "#06b6d4",
    desc: "सुप्रीम कोर्ट एवं 25 हाई कोर्ट्स के नज़ीर (Citations) व कानून निर्णय खोज इंजन",
  },
  {
    id: "assistant",
    label: "🤖 AI विधिक सहायक (AI Legal Assistant)",
    icon: <SmartToyIcon />,
    color: "#7c3aed", // Regal Purple
    bg: "#f5f3ff",
    border: "#8b5cf6",
    desc: "भारतीय कानून, BNS, BNSS, BSA पर त्वरित AI कानूनी सलाहकार एवं विश्लेषण",
  },
  {
    id: "registry",
    label: "⚖️ विधिक रजिस्ट्री व मामले (Legal Registry)",
    icon: <GavelIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "केंद्रीकृत केस रजिस्ट्री, कोर्ट वर्गीकरण एवं कानूनी मामले प्रबंधन",
  },
];

export default function AILegalIntelligenceHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "drafter";

  const tabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === initialTab)
  );

  const [activeTab, setActiveTab] = useState(tabIndex);

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === searchParams.get("tab"));
    if (idx !== -1) setActiveTab(idx);
  }, [searchParams]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: TABS[newValue].id });
  };

  const activeTabConfig = TABS[activeTab] || TABS[0];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 6 }}>
      {/* 1. DYNAMIC COLOR-MATCHED HUB BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          bgcolor: activeTabConfig.color,
          color: "#ffffff",
          borderRadius: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          boxShadow: `0 8px 24px ${activeTabConfig.color}40`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              {activeTabConfig.icon}
            </Box>
            <Typography variant="h5" fontWeight={900}>
              {activeTabConfig.label}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600 }}>
            {activeTabConfig.desc}
          </Typography>
        </Box>

        <Chip
          label="ICJ Generative Legal AI Engine"
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontWeight: 900,
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        />
      </Paper>

      {/* 2. TABS BAR WITH DISTINCT FROZEN SIGNATURE COLORS */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: `2px solid ${activeTabConfig.color}`,
          mb: 3,
          bgcolor: "#ffffff",
          p: 1,
          boxShadow: `0 4px 16px ${activeTabConfig.color}15`,
          transition: "all 0.3s ease",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: { xs: 0.5, md: 0 },
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 4 },
          }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <Button
                key={tab.id}
                onClick={() => handleTabChange(null, idx)}
                size="small"
                startIcon={tab.icon}
                sx={{
                  flexShrink: 0,
                  borderRadius: "12px",
                  px: 2.2,
                  py: 1,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  // 🟢 FROZEN COLOR RULES:
                  color: isActive ? "#ffffff" : tab.color,
                  bgcolor: isActive ? tab.color : tab.bg,
                  border: `1.5px solid ${tab.color}`,
                  boxShadow: isActive ? `0 4px 12px ${tab.color}45` : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isActive ? tab.color : tab.color + "20",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
      </Paper>

      {/* 3. TAB CONTENT PANELS */}
      <Box sx={{ borderTop: `2px dashed ${activeTabConfig.color}40`, pt: 2 }}>
        {activeTab === 0 && <LegalDrafter />}

        {activeTab === 1 && <Research />}

        {activeTab === 2 && <AIAssistant />}

        {activeTab === 3 && <Legal />}
      </Box>
    </Box>
  );
}
