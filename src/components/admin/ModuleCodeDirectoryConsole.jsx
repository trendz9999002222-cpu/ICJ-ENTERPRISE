import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CodeIcon from "@mui/icons-material/Code";
import DownloadIcon from "@mui/icons-material/Download";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export const MASTER_MODULE_GROUPS = [
  {
    group: "A",
    title: "👥 GROUP A: सदस्यता एवं प्रोफ़ाइल केंद्र (Membership Hub)",
    hubRoute: "/membership-hub",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#10b981",
    modules: [
      { code: "A1", keyword: "MEMBER_DIRECTORY", name: "सदस्य सूची व डायरेक्टरी", file: "MemberDirectory.jsx", route: "/membership-hub?tab=directory" },
      { code: "A2", keyword: "MEMBER_VERIFICATION", name: "सत्यापन व ई-KYC", file: "MemberVerification.jsx", route: "/membership-hub?tab=verification" },
      { code: "A3", keyword: "MEMBER_ID_CERTIFICATES", name: "पहचान पत्र व प्रमाण-पत्र", file: "MemberCard.jsx", route: "/membership-hub?tab=cards" },
      { code: "A4", keyword: "MEMBER_DOCS_HISTORY", name: "दस्तावेज़ व सदस्य इतिहास", file: "MemberDocuments.jsx", route: "/membership-hub?tab=documents" },
      { code: "A5", keyword: "MEMBERSHIP_ENGINE", name: "सदस्यता पंजीयन इंजन", file: "Membership.jsx", route: "/membership-hub?tab=membership" },
      { code: "A6", keyword: "MEMBER_ACTIVITY_LOG", name: "गतिविधि व सुरक्षा ऑडिट लॉग", file: "MemberActivity.jsx", route: "/membership-hub?tab=activity" },
    ],
  },
  {
    group: "B",
    title: "⚖️ GROUP B: विधिक एवं न्यायालय कार्यक्षेत्र (Legal Workspace Hub)",
    hubRoute: "/legal-workspace",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#3b82f6",
    modules: [
      { code: "B1", keyword: "ADVOCATE_DASHBOARD", name: "अधिवक्ता केस डेस्क", file: "AdvocateDashboard.jsx", route: "/legal-workspace?tab=advocate" },
      { code: "B2", keyword: "CLIENT_PORTAL", name: "मुवक्किल केस पोर्टल", file: "ClientPortal.jsx", route: "/legal-workspace?tab=client" },
      { code: "B3", keyword: "COURT_CALENDAR", name: "न्यायालय हियरिंग कैलेंडर", file: "CourtCalendar.jsx", route: "/legal-workspace?tab=calendar" },
      { code: "B4", keyword: "DOCUMENT_VAULT", name: "केस दस्तावेज़ वॉल्ट", file: "Documents.jsx", route: "/legal-workspace?tab=vault" },
      { code: "B5", keyword: "TRUST_DASHBOARD", name: "लीगल ट्रस्ट एग्जीक्यूटिव", file: "TrustDashboard.jsx", route: "/legal-workspace?tab=trust" },
      { code: "B6", keyword: "VIRTUAL_OFFICE", name: "वर्चुअल कोर्ट चैंबर", file: "VirtualOffice.jsx", route: "/virtual-office" },
    ],
  },
  {
    group: "C",
    title: "🤖 GROUP C: AI अनुसंधान एवं ड्राफ्टिंग केंद्र (AI Legal Intelligence Hub)",
    hubRoute: "/ai-legal-hub",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#8b5cf6",
    modules: [
      { code: "C1", keyword: "AI_LEGAL_DRAFTER", name: "AI कानूनी ड्राफ्टर", file: "LegalDrafter.jsx", route: "/ai-legal-hub?tab=drafter" },
      { code: "C2", keyword: "JUDICIAL_RESEARCH", name: "न्यायिक निर्णय अनुसंधान", file: "Research.jsx", route: "/ai-legal-hub?tab=research" },
      { code: "C3", keyword: "AI_LEGAL_ASSISTANT", name: "AI विधिक सहायक", file: "AIAssistant.jsx", route: "/ai-legal-hub?tab=assistant" },
      { code: "C4", keyword: "LEGAL_REGISTRY", name: "मास्टर लीगल रजिस्ट्री", file: "Legal.jsx", route: "/ai-legal-hub?tab=registry" },
    ],
  },
  {
    group: "D",
    title: "💳 GROUP D: वित्त, बिलिंग एवं वॉलेट केंद्र (Finance Hub)",
    hubRoute: "/finance-hub",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#f59e0b",
    modules: [
      { code: "D1", keyword: "BILLING_INVOICING", name: "बिलिंग व GST इनवॉइस", file: "BillingInvoicing.jsx", route: "/finance-hub?tab=billing" },
      { code: "D2", keyword: "PAYMENT_GATEWAY", name: "भुगतान प्रबंधन व गेटवे", file: "PaymentManagement.jsx", route: "/finance-hub?tab=payments" },
      { code: "D3", keyword: "DIGITAL_WALLET", name: "डिजिटल मास्टर वॉलेट", file: "Wallet.jsx", route: "/finance-hub?tab=wallet" },
      { code: "D4", keyword: "TOKEN_EXCHANGE", name: "ICJ टोकन व नियमावली", file: "TokenExchange.jsx", route: "/finance-hub?tab=token" },
      { code: "D5", keyword: "DONATIONS_CAMPAIGNS", name: "दान, क्राउडफंडिंग व अभियान", file: "Donations.jsx", route: "/finance-hub?tab=donations" },
      { code: "D6", keyword: "TRANSACTIONS_LEDGER", name: "वित्तीय खाता बही व लेजर", file: "Transactions.jsx", route: "/finance-hub?tab=transactions" },
    ],
  },
  {
    group: "E",
    title: "🎧 GROUP E: हेल्पडेस्क एवं नागरिक सहायता (Support Hub)",
    hubRoute: "/support-hub",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#f97316",
    modules: [
      { code: "E1", keyword: "HELPDESK_PORTAL", name: "24x7 सहायता टिकट पोर्टल", file: "HelpdeskPortal.jsx", route: "/support-hub?tab=helpdesk" },
      { code: "E2", keyword: "LEGAL_COMMUNITY", name: "विधिक समुदाय मंच", file: "LegalCommunityFeed.jsx", route: "/support-hub?tab=community" },
      { code: "E3", keyword: "NOTIFICATIONS_CENTER", name: "सिस्टम सूचनाएं व अलर्ट्स", file: "Notifications.jsx", route: "/support-hub?tab=alerts" },
    ],
  },
  {
    group: "F",
    title: "🛡️ GROUP F: सिस्टम प्रशासन एवं नियंत्रण कक्ष (Admin Control Hub)",
    hubRoute: "/admin-control-hub",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#ef4444",
    modules: [
      { code: "F1", keyword: "SUPER_ADMIN_SECURITY", name: "सुपर एडमिन सुरक्षा व RBAC", file: "SuperAdminDashboard.jsx", route: "/admin-control-hub?tab=security" },
      { code: "F2", keyword: "FEATURE_FEE_CONTROL", name: "फ़ीचर व फ़ीस नियंत्रण", file: "FeatureControlCenter.jsx", route: "/admin-control-hub?tab=features" },
      { code: "F3", keyword: "DATABASE_LOCATIONS", name: "डेटाबेस व लोकेशन मास्टर", file: "DatabaseConfig.jsx", route: "/admin-control-hub?tab=database" },
      { code: "F4", keyword: "API_DEPLOYMENT", name: "API गेटवे व डिप्लॉयमेंट", file: "APIConfigCenter.jsx", route: "/admin-control-hub?tab=api" },
      { code: "F5", keyword: "SYSTEM_HEALTH_LOGS", name: "सिस्टम हेल्थ व ऑडिट लॉग्स", file: "SystemHealth.jsx", route: "/admin-control-hub?tab=health" },
      { code: "F6", keyword: "SETTINGS_REPORTS", name: "ग्लोबल सेटिंग्स व रिपोर्ट्स", file: "Settings.jsx", route: "/admin-control-hub?tab=settings" },
    ],
  },
  {
    group: "G",
    title: "🌐 GROUP G: पब्लिक व ऑनबोर्डिंग पोर्टल (Public Gateways)",
    hubRoute: "/track-case",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#06b6d4",
    modules: [
      { code: "G1", keyword: "PUBLIC_HOMEPAGE", name: "मुख्य लीगल होमपेज", file: "PublicLegalHomepage.jsx", route: "/" },
      { code: "G2", keyword: "PUBLIC_ONBOARDING", name: "ज़ीरो-ब्लॉकिंग ऑनबोर्डिंग", file: "PublicOnboarding.jsx", route: "/join" },
      { code: "G3", keyword: "AUTH_LOGIN", name: "सुरक्षित लॉगिन पोर्टल", file: "Login.jsx", route: "/login" },
      { code: "G4", keyword: "PUBLIC_CASE_TRACKER", name: "सार्वजनिक केस ट्रैकर", file: "PublicCaseTracker.jsx", route: "/track-case" },
      { code: "G5", keyword: "JUDICIAL_NETWORK", name: "5-स्तरीय न्यायिक नेटवर्क", file: "JudicialForumsNetworkCard.jsx", route: "/legal-workspace" },
    ],
  },
  {
    group: "H",
    title: "🏗️ GROUP H: कोर लेआउट, सुरक्षा शील्ड व नेविगेशन (Core Infrastructure)",
    hubRoute: "/dashboard",
    color: "#475569",
    bg: "#f8fafc",
    border: "#94a3b8",
    modules: [
      { code: "H1", keyword: "MAIN_LAYOUT", name: "मुख्य एडॉप्टिव लेआउट", file: "MainLayout.jsx", route: "/dashboard" },
      { code: "H2", keyword: "COMMAND_PALETTE", name: "ग्लोबल टॉपबार व Ctrl+K", file: "Topbar.jsx", route: "/dashboard" },
      { code: "H3", keyword: "ROLE_TOP_NAV", name: "भूमिका आधारित टॉप नेवबार", file: "RoleTopNav.jsx", route: "/dashboard" },
      { code: "H4", keyword: "SESSION_AUTO_LOCK", name: "कोर्ट रूम प्राइवेसी ऑटो-लॉक", file: "SessionAutoLockModal.jsx", route: "/dashboard" },
      { code: "H5", keyword: "OFFLINE_SYNC_BANNER", name: "ऑफलाइन नेटवर्क सिंक बार", file: "OfflineNetworkSyncBanner.jsx", route: "/dashboard" },
      { code: "H6", keyword: "WATERMARK_OVERLAY", name: "एंटी-लीक सुरक्षा वाटरमार्क", file: "SecureWatermarkOverlay.jsx", route: "/dashboard" },
      { code: "H7", keyword: "VAULT_STORAGE", name: "बैंक-ग्रेड वॉल्ट स्टोरेज", file: "secureVaultStorageService.js", route: "/dashboard" },
    ],
  },
];

export default function ModuleCodeDirectoryConsole() {
  const [search, setSearch] = useState("");

  const filteredGroups = MASTER_MODULE_GROUPS.map((grp) => {
    if (!search.trim()) return grp;
    const q = search.toLowerCase().trim();
    const matchedModules = grp.modules.filter(
      (m) =>
        m.code.toLowerCase().includes(q) ||
        m.keyword.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.file.toLowerCase().includes(q)
    );
    return { ...grp, modules: matchedModules };
  }).filter((grp) => grp.modules.length > 0);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* 1. TOP HEADER BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "20px",
          bgcolor: "#0f172a",
          color: "#ffffff",
          mb: 4,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 0.8 }}>
              <Chip
                label="MASTER CODEBOOK CONSOLE"
                size="small"
                sx={{
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: "0.72rem",
                }}
              />
              <Chip
                label="Scope Isolation Active"
                size="small"
                sx={{
                  bgcolor: "#064e3b",
                  color: "#34d399",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  border: "1px solid #059669",
                }}
              />
            </Stack>

            <Typography variant="h5" fontWeight={900} color="#f8fafc">
              📑 मास्टर मॉड्यूल कोड डायरेक्टरी कंसोल (Groups A to H)
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600, mt: 0.5 }}>
              40+ मॉड्यूल्स के स्थायी कोड (A1 से H7), सिस्टम कीवर्ड्स एवं 1-क्लिक एक्सेस
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by Code (e.g. A1, C1), Keyword, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "100%", md: 320 },
              bgcolor: "#1e293b",
              borderRadius: "12px",
              "& .MuiInputBase-root": { color: "#ffffff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#38bdf8" }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {/* 2. GROUPS A TO H CARDS */}
      <Stack spacing={3}>
        {filteredGroups.map((grp) => (
          <Paper
            key={grp.group}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              bgcolor: "#ffffff",
              border: `2px solid ${grp.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            }}
          >
            {/* GROUP HEADER */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2, pb: 1, borderBottom: `1.5px solid ${grp.border}40` }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: grp.color,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                  }}
                >
                  {grp.group}
                </Box>
                <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                  {grp.title}
                </Typography>
              </Stack>

              <Button
                component={RouterLink}
                to={grp.hubRoute}
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: grp.color,
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "0.82rem",
                }}
              >
                Open Hub ➔
              </Button>
            </Stack>

            {/* MODULES GRID IN THIS GROUP */}
            <Grid container spacing={1.5}>
              {grp.modules.map((m) => (
                <Grid item xs={12} sm={6} md={4} key={m.code}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: grp.bg,
                      border: `1.5px solid ${grp.border}50`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: grp.color,
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 16px ${grp.color}20`,
                      },
                    }}
                  >
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                        <Chip
                          label={m.code}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: "0.82rem",
                            bgcolor: grp.color,
                            color: "#ffffff",
                            px: 0.5,
                          }}
                        />
                        <Chip
                          label={m.keyword}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            fontFamily: "monospace",
                            bgcolor: "#ffffff",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2, mb: 0.4 }}>
                        {m.name}
                      </Typography>

                      <Typography variant="caption" sx={{ color: "#64748b", fontFamily: "monospace", fontSize: "0.72rem" }}>
                        📁 {m.file}
                      </Typography>
                    </Box>

                    <Button
                      component={RouterLink}
                      to={m.route}
                      size="small"
                      variant="outlined"
                      sx={{
                        mt: 1.2,
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "0.74rem",
                        textTransform: "none",
                        borderColor: grp.color,
                        color: grp.color,
                        bgcolor: "#ffffff",
                        "&:hover": { bgcolor: grp.color, color: "#ffffff" },
                      }}
                    >
                      Access {m.code} ➔
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
