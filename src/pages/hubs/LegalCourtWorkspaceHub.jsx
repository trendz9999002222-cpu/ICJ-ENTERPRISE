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
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// Direct sub-modules
import AdvocateDashboard from "../AdvocateDashboard.jsx";
import ClientPortal from "../ClientPortal.jsx";
import CourtCalendar from "../CourtCalendar.jsx";
import TrustDashboard from "../TrustDashboard.jsx";
import Documents from "../Documents.jsx";
import BareActsLibrary from "../BareActsLibrary.jsx";
import PrecedentsLibrary from "../PrecedentsLibrary.jsx";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import JudicialForumsNetworkCard from "../../components/common/JudicialForumsNetworkCard.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "advocate",
    label: "⚖️ अधिवक्ता केस डेस्क (Advocate Desk)",
    icon: <GavelIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "अधिवक्ताओं के सक्रिय मुकदमों की सूची, केस डायरी एवं हियरिंग टाइमलाइन",
  },
  {
    id: "client",
    label: "👤 मुवक्किल केस पोर्टल (Client Desk)",
    icon: <AccountBoxIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "मुवक्किल केस स्टेज (0-4), वकील से सीधा संपर्क एवं स्थिति ट्रैकिंग",
  },
  {
    id: "calendar",
    label: "📅 न्यायालय हियरिंग कैलेंडर (Court Calendar)",
    icon: <CalendarMonthIcon />,
    color: "#d97706", // Amber Gold
    bg: "#fffbeb",
    border: "#f59e0b",
    desc: "ऑल-इंडिया कोर्ट्स की आगामी पेशी, कॉज लिस्ट एवं रिमाइंडर्स",
  },
  {
    id: "vault",
    label: "📁 केस दस्तावेज़ वॉल्ट (Case Documents)",
    icon: <FolderIcon />,
    color: "#7c3aed", // Regal Purple
    bg: "#f5f3ff",
    border: "#8b5cf6",
    desc: "याचिकाएं, शपथ पत्र, डिजिटल साक्ष्य एवं सर्टिफाइड ऑर्डर कॉपीज",
  },
  {
    id: "trust",
    label: "🏛️ ट्रस्ट एग्जीक्यूटिव (Trust Dashboard)",
    icon: <AccountBalanceIcon />,
    color: "#4f46e5", // Indigo Blue
    bg: "#eef2ff",
    border: "#6366f1",
    desc: "सॉवरेन लीगल ट्रस्ट मॉनिटरिंग, राष्ट्रीय न्याय मंच आंकड़े",
  },
  {
    id: "bareacts",
    label: "📖 बेयर एक्ट्स लाइब्रेरी (Bare Acts Engine)",
    icon: <AutoStoriesIcon />,
    color: "#1e3a8a", // Deep Navy Blue
    bg: "#eff6ff",
    border: "#2563eb",
    desc: "1836-2026 संपूर्ण भारतीय कानून, इंटरएक्टिव विधिक शब्द परिभाषा, क्रॉस-धारा एवं 100% ऑफलाइन सिंक",
  },
  {
    id: "precedents",
    label: "🏛️ सुप्रीम कोर्ट निर्णय (e-SCR Precedents)",
    icon: <AccountBalanceIcon />,
    color: "#312e81", // Deep Indigo Purple
    bg: "#eef2ff",
    border: "#4338ca",
    desc: "1950-2026 सुप्रीम कोर्ट ऐतिहासिक फैसले, ऑफिशियल e-SCR/INSC साइटेशन एवं लीगल रेश्यो",
  },
];

export default function LegalCourtWorkspaceHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "advocate";

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
          label="All-India Judicial Forums Connected"
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

      {/* 3. 5-TIER ALL-INDIA JUDICIAL NETWORK OVERVIEW */}
      <JudicialForumsNetworkCard />

      {/* 4. TAB CONTENT PANELS */}
      <Box sx={{ borderTop: `2px dashed ${activeTabConfig.color}40`, pt: 2 }}>
        {activeTab === 0 && <AdvocateDashboard />}

        {activeTab === 1 && <ClientPortal />}

        {activeTab === 2 && <CourtCalendar />}

        {activeTab === 3 && <Documents />}

        {activeTab === 4 && <TrustDashboard />}

        {activeTab === 5 && <BareActsLibrary />}

        {activeTab === 6 && <PrecedentsLibrary />}
      </Box>
    </Box>
  );
}
