import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import BadgeIcon from "@mui/icons-material/Badge";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import HistoryIcon from "@mui/icons-material/History";

// Lazy / direct sub-modules
import MemberDirectory from "../MemberDirectory.jsx";
import MemberVerification from "../MemberVerification.jsx";
import MemberKYC from "../MemberKYC.jsx";
import MemberCard from "../MemberCard.jsx";
import MemberCertificates from "../MemberCertificates.jsx";
import MemberDocuments from "../MemberDocuments.jsx";
import MemberHistory from "../MemberHistory.jsx";
import Membership from "../Membership.jsx";
import MemberActivity from "../MemberActivity.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "directory",
    label: "👥 सदस्य सूची (Directory)",
    icon: <PeopleIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "अखिल भारतीय सदस्य डायरेक्टरी, संपर्क एवं प्रोफ़ाइल खोज",
  },
  {
    id: "verification",
    label: "✅ सत्यापन व KYC (KYC & Verify)",
    icon: <HowToRegIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "आधार, पैन एवं ई-केवाईसी सत्यापन कंसोल",
  },
  {
    id: "cards",
    label: "🎖️ पहचान पत्र व प्रमाण-पत्र (ID & Certs)",
    icon: <BadgeIcon />,
    color: "#7c3aed", // Regal Purple
    bg: "#f5f3ff",
    border: "#8b5cf6",
    desc: "आधिकारिक डिजिटल मेंबर कार्ड एवं अधिकृत प्रमाण पत्र डाउनलोड",
  },
  {
    id: "documents",
    label: "📁 दस्तावेज़ व इतिहास (Documents)",
    icon: <FolderSharedIcon />,
    color: "#d97706", // Amber Gold
    bg: "#fffbeb",
    border: "#f59e0b",
    desc: "अपलोड किए गए दस्तावेज़, अभिलेख एवं सदस्य ऑडिट इतिहास",
  },
  {
    id: "membership",
    label: "📜 पंजीयन इंजन (Membership)",
    icon: <CardMembershipIcon />,
    color: "#dc2626", // Crimson Red
    bg: "#fef2f2",
    border: "#ef4444",
    desc: "नया सदस्य एनरोलमेंट, प्लान नवीनीकरण व सदस्यता प्रबंधन",
  },
  {
    id: "activity",
    label: "⏱️ गतिविधि लॉग (Activity)",
    icon: <HistoryIcon />,
    color: "#ea580c", // Vivid Orange
    bg: "#fff7ed",
    border: "#f97316",
    desc: "रीयल-टाइम सदस्य गतिविधि, सुरक्षा ऑडिट एवं लॉग्स",
  },
];

export default function MemberOperationsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "directory";

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
      {/* 1. DYNAMIC COLOR-MATCHED HUB BANNER (बटन दबाने पर पूरा बैनर उसी कलर में बदलता है!) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          bgcolor: activeTabConfig.color, // DYNAMICALLY MATCHES ACTIVE TAB COLOR!
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
          label="Unified Member Master v50"
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
                  px: 2,
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
        {activeTab === 0 && <MemberDirectory />}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <MemberVerification />
            <Divider sx={{ my: 2 }} />
            <MemberKYC />
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            <MemberCard />
            <Divider sx={{ my: 2 }} />
            <MemberCertificates />
          </Stack>
        )}

        {activeTab === 3 && (
          <Stack spacing={3}>
            <MemberDocuments />
            <Divider sx={{ my: 2 }} />
            <MemberHistory />
          </Stack>
        )}

        {activeTab === 4 && <Membership />}

        {activeTab === 5 && <MemberActivity />}
      </Box>
    </Box>
  );
}
