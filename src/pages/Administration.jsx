import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

import AdvocateResearchDirectory from "../components/admin/AdvocateResearchDirectory.jsx";
import SystemSecurityCompliance from "../components/admin/SystemSecurityCompliance.jsx";
import FeatureControlCenter from "../components/admin/FeatureControlCenter.jsx";
import SandboxAndResetCenter from "../components/admin/SandboxAndResetCenter.jsx";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";

export default function Administration() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", p: { xs: 2, md: 3 }, color: "#ffffff" }}>
      {/* CENTRAL CONTROL HUB HEADER */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#1e293b", color: "#ffffff", borderRadius: 3, border: "1px solid #334155" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AdminPanelSettingsIcon sx={{ color: "#38bdf8", fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#ffffff">
                👑 Super Admin Executive Control & Governance Hub
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Modular Administration Platform — Select a dedicated control center below:
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip label="🔒 System Safeguard Active" color="success" sx={{ fontWeight: 800 }} />
            <Chip label="⚡ 4 Modular Centers Active" color="info" sx={{ fontWeight: 800 }} />
          </Stack>
        </Stack>

        {/* DEDICATED MODULE TABS */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            mt: 3,
            borderBottom: "1px solid #334155",
            "& .MuiTab-root": { fontWeight: 800, fontSize: "0.92rem", color: "#94a3b8", textTransform: "none" },
            "& .Mui-selected": { color: "#38bdf8" },
          }}
        >
          <Tab icon={<WorkspacePremiumIcon />} iconPosition="start" label="🏢 1. Advocate Master Directory" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="🛡️ 2. Security, Access & Role Control" />
          <Tab icon={<ToggleOnIcon />} iconPosition="start" label="🎛️ 3. Feature & Fee Monetization" />
          <Tab icon={<PlayCircleFilledWhiteIcon sx={{ color: "#10b981" }} />} iconPosition="start" label="⚙️ 4. Sandbox & Factory Reset (डेमो व रीसेट)" sx={{ fontWeight: "bold" }} />
        </Tabs>
      </Paper>

      {/* MODULE RENDER CONTROLLER */}
      <Box>
        {activeTab === 0 && <AdvocateResearchDirectory />}
        {activeTab === 1 && <SystemSecurityCompliance />}
        {activeTab === 2 && <FeatureControlCenter />}
        {activeTab === 3 && <SandboxAndResetCenter />}
      </Box>
    </Box>
  );
}
