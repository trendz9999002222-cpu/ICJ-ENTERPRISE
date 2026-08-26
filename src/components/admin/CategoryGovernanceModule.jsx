import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
} from "@mui/material";

// Icons
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RefreshIcon from "@mui/icons-material/Refresh";

import CategoryEnrollmentService from "../../services/categoryEnrollmentService.js";
import TelemetryIdService from "../../services/telemetryIdService.js";

const GROUP_TABS = [
  { id: "ALL", label: "सभी 42 श्रेणियां (All 42)" },
  { id: "Legal", label: "⚖️ विधिक व अधिवक्ता (Legal)" },
  { id: "CourtOfficers", label: "🏛️ कोर्ट अधिकारी व नोटरी (Officers)" },
  { id: "Forensics", label: "🔬 फॉरेंसिक विशेषज्ञ (Forensics)" },
  { id: "Corporate", label: "💼 कॉर्पोरेट व सीए (Corporate)" },
  { id: "Revenue", label: "🚜 राजस्व व अमीन (Revenue)" },
  { id: "Retired", label: "🎖️ सेवानिवृत्त अधिकारी (Retired)" },
  { id: "Support", label: "📋 कोर्ट मुंशी व क्लर्क (Support)" },
  { id: "Citizens", label: "👤 नागरिक / मुवक्किल (Citizens)" },
];

export default function CategoryGovernanceModule() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [telemetry, setTelemetry] = useState({ globalTotal: 0, categoryCounts: {} });
  const [savedMsg, setSavedMsg] = useState("");

  const loadData = () => {
    const list = CategoryEnrollmentService.getAllCategoriesWithState();
    setCategories(list);
    const counts = TelemetryIdService.getLiveHeadcounts();
    setTelemetry(counts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (code5, currentStatus) => {
    const nextStatus = !currentStatus;
    CategoryEnrollmentService.toggleCategoryStatus(code5, nextStatus);
    setCategories((prev) =>
      prev.map((c) => (c.code5 === code5 ? { ...c, isOpen: nextStatus } : c))
    );
    setSavedMsg(`✅ श्रेणी "${code5}" का पंजीकरण अब ${nextStatus ? "खुला (OPEN)" : "अदृश्य (HIDDEN)"} है।`);
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const filteredCategories =
    activeTab === "ALL"
      ? categories
      : categories.filter((c) => c.group === activeTab);

  const openCount = categories.filter((c) => c.isOpen).length;
  const hiddenCount = categories.length - openCount;

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {/* 1. TOP HEADER & TELEMETRY METER */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h6" fontWeight={800} color="#ffffff">
                🛡️ 42-कैटेगरी स्टील्थ रजिस्ट्रेशन स्विचबोर्ड (Category Governance Switchboard)
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                100% स्टील्थ मोड: अनचेक श्रेणियां पब्लिक फॉर्म से पूर्णतः अदृश्य रहेंगी (Zero 'Coming Soon' Leaks)
              </Typography>
            </Box>
          </Stack>

          {/* Telemetry Pills */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<PeopleAltIcon sx={{ color: "#10b981 !important" }} />}
              label={`कुल 140 करोड़ टेलीमेट्री सदस्य: ${telemetry.globalTotal}`}
              sx={{ bgcolor: "#1e293b", color: "#f8fafc", fontWeight: 700, borderColor: "#334155" }}
              variant="outlined"
            />
            <Chip
              icon={<CheckCircleIcon sx={{ color: "#22c55e !important" }} />}
              label={`सक्रिय श्रेणियां: ${openCount}`}
              sx={{ bgcolor: "#064e3b", color: "#86efac", fontWeight: 700 }}
            />
            <Chip
              icon={<VisibilityOffIcon sx={{ color: "#cbd5e1 !important" }} />}
              label={`अदृश्य श्रेणियां: ${hiddenCount}`}
              sx={{ bgcolor: "#334155", color: "#cbd5e1", fontWeight: 700 }}
            />
          </Stack>
        </Stack>

        {savedMsg && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 2, bgcolor: "#065f46", color: "#ffffff" }}>
            {savedMsg}
          </Alert>
        )}
      </Paper>

      {/* 2. GROUP TABS */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.85rem" } }}
        >
          {GROUP_TABS.map((t) => (
            <Tab key={t.id} value={t.id} label={t.label} />
          ))}
        </Tabs>
      </Paper>

      {/* 3. SYMMETRICAL 42-CATEGORY GRID BOXES */}
      <Grid container spacing={2.5}>
        {filteredCategories.map((cat) => {
          const registeredCount = telemetry.categoryCounts[cat.code5] || 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={cat.code5}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: cat.isOpen ? "#93c5fd" : "#e2e8f0",
                  bgcolor: cat.isOpen ? "#ffffff" : "#f8fafc",
                  boxShadow: cat.isOpen ? "0 4px 12px rgba(37,99,235,0.06)" : "none",
                  borderLeft: `6px solid ${cat.isOpen ? "#2563eb" : "#94a3b8"}`,
                  transition: "all 0.2s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      label={cat.code5}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: cat.isOpen ? "#eff6ff" : "#e2e8f0",
                        color: cat.isOpen ? "#1e40af" : "#64748b",
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cat.isOpen}
                          onChange={() => handleToggle(cat.code5, cat.isOpen)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" fontWeight={800} color={cat.isOpen ? "#16a34a" : "#64748b"}>
                          {cat.isOpen ? "🟢 खुला (OPEN)" : "🔒 बंद (HIDDEN)"}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={0.5}>
                    {cat.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    {cat.badgeTitle}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="#64748b" fontWeight={600}>
                      कुल पंजीकृत सदस्य:
                    </Typography>
                    <Chip
                      label={`${registeredCount} सदस्य (Registered)`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, borderColor: "#cbd5e1" }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
