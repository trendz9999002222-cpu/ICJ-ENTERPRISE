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
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ForumIcon from "@mui/icons-material/Forum";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

// Direct sub-modules
import HelpdeskPortal from "../HelpdeskPortal.jsx";
import LegalCommunityFeed from "../LegalCommunityFeed.jsx";
import Notifications from "../Notifications.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "helpdesk",
    label: "🎧 सहायता टिकट व हेल्पडेस्क (Helpdesk)",
    icon: <SupportAgentIcon />,
    color: "#ea580c", // Vibrant Orange
    bg: "#fff7ed",
    border: "#f97316",
    desc: "24/7 नागरिक व अधिवक्ता शिकायत निवारण, टिकट प्रबंधन एवं समाधान",
  },
  {
    id: "community",
    label: "💬 विधिक समुदाय मंच (Community Feed)",
    icon: <ForumIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "अखिल भारतीय विधिक परिचर्चा, कानूनी विचार-विमर्श एवं कम्युनिटी पोस्ट्स",
  },
  {
    id: "alerts",
    label: "🔔 सिस्टम सूचनाएं व अलर्ट (Notifications)",
    icon: <NotificationsActiveIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "केस अपडेट्स, कोर्ट हियरिंग रिमाइंडर्स एवं महत्वपूर्ण कानूनी सूचनाएं",
  },
];

export default function HelpdeskSupportHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "helpdesk";

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
          label="24x7 Citizen Legal Assistance Desk"
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
        {activeTab === 0 && <HelpdeskPortal />}

        {activeTab === 1 && <LegalCommunityFeed />}

        {activeTab === 2 && <Notifications />}
      </Box>
    </Box>
  );
}
