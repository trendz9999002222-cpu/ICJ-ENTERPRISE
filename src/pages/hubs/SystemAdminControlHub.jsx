import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Chip,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import TuneIcon from "@mui/icons-material/Tune";
import StorageIcon from "@mui/icons-material/Storage";
import ApiIcon from "@mui/icons-material/Api";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";

// Direct sub-modules
import SuperAdminDashboard from "../SuperAdminDashboard.jsx";
import SystemSecurityCompliance from "../../components/admin/SystemSecurityCompliance.jsx";
import FeatureControlCenter from "../../components/admin/FeatureControlCenter.jsx";
import GovernanceCenter from "../GovernanceCenter.jsx";
import LocationMasterAdmin from "../LocationMasterAdmin.jsx";
import DatabaseConfig from "../DatabaseConfig.jsx";
import APIConfigCenter from "../APIConfigCenter.jsx";
import DeploymentCenter from "../DeploymentCenter.jsx";
import SystemHealth from "../SystemHealth.jsx";
import ActivityLog from "../ActivityLog.jsx";
import Settings from "../Settings.jsx";
import Reports from "../Reports.jsx";
import ModuleCodeDirectoryConsole from "../../components/admin/ModuleCodeDirectoryConsole.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "codebook",
    label: "📑 कोड डायरेक्टरी (A to H Codebook)",
    icon: <MenuBookIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "40+ मॉड्यूल्स की मास्टर अल्फ़ान्यूमेरिक कोड डायरेक्टरी (A1 to H7) एवं सिस्टम कीवर्ड्स",
  },
  {
    id: "security",
    label: "🛡️ सुरक्षा व रोल्स (Security & RBAC)",
    icon: <SecurityIcon />,
    color: "#dc2626", // Crimson Red
    bg: "#fef2f2",
    border: "#ef4444",
    desc: "सुपर एडमिन कंसोल, RBAC रोल्स, अनुमतियाँ व सुरक्षा अनुपालन",
  },
  {
    id: "features",
    label: "⚙️ फ़ीचर व फ़ीस नियंत्रण (Feature Control)",
    icon: <TuneIcon />,
    color: "#ea580c", // Vivid Orange
    bg: "#fff7ed",
    border: "#f97316",
    desc: "डायनामिक मॉड्यूल ऑन/ऑफ, फ़ीस स्ट्रक्चर व प्लेटफ़ॉर्म नीतियां",
  },
  {
    id: "database",
    label: "🗄️ डेटाबेस व लोकेशन मास्टर (DB & Locations)",
    icon: <StorageIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "अखिल भारतीय राज्य, ज़िला, तहसील मास्टर एवं डेटाबेस स्टोरेज",
  },
  {
    id: "api",
    label: "🔌 API व डिप्लॉयमेंट (API & Deployment)",
    icon: <ApiIcon />,
    color: "#0891b2", // Cyan Blue
    bg: "#ecfeff",
    border: "#06b6d4",
    desc: "API गेटवे, एन्क्रिप्टेड की-वॉल्ट एवं परिनियोजन नियंत्रण",
  },
  {
    id: "health",
    label: "🩺 सिस्टम हेल्थ व लॉग्स (Health & Audit)",
    icon: <MonitorHeartIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "रीयल-टाइम सर्वर हेल्थ, अपटाइम मॉनिटर एवं सुरक्षा ऑडिट लॉग",
  },
  {
    id: "settings",
    label: "📊 सेटिंग्स व रिपोर्ट्स (Settings & Reports)",
    icon: <SettingsIcon />,
    color: "#7c3aed", // Regal Purple
    bg: "#f5f3ff",
    border: "#8b5cf6",
    desc: "ग्लोबल प्लेटफ़ॉर्म सेटिंग्स, बैकअप एवं एक्जीक्यूटिव रिपोर्ट्स",
  },
];

export default function SystemAdminControlHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "security";

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
          label="Root Sovereign Administration"
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
        {activeTab === 0 && <ModuleCodeDirectoryConsole />}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <SuperAdminDashboard />
            <Divider sx={{ my: 2 }} />
            <SystemSecurityCompliance />
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            <FeatureControlCenter />
            <Divider sx={{ my: 2 }} />
            <GovernanceCenter />
          </Stack>
        )}

        {activeTab === 3 && (
          <Stack spacing={3}>
            <LocationMasterAdmin />
            <Divider sx={{ my: 2 }} />
            <DatabaseConfig />
          </Stack>
        )}

        {activeTab === 4 && (
          <Stack spacing={3}>
            <APIConfigCenter />
            <Divider sx={{ my: 2 }} />
            <DeploymentCenter />
          </Stack>
        )}

        {activeTab === 5 && (
          <Stack spacing={3}>
            <SystemHealth />
            <Divider sx={{ my: 2 }} />
            <ActivityLog />
          </Stack>
        )}

        {activeTab === 6 && (
          <Stack spacing={3}>
            <Settings />
            <Divider sx={{ my: 2 }} />
            <Reports />
          </Stack>
        )}
      </Box>
    </Box>
  );
}
