import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SearchIcon from "@mui/icons-material/Search";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";

const JUDICIAL_TIERS = [
  {
    title: "1. भारत का सर्वोच्च न्यायालय (Supreme Court of India)",
    desc: "अपील, विशेष अनुमति याचिका (SLP), रिट (Art. 32) व संविधान पीठ",
    scope: "New Delhi — Pan India Apex Jurisdiction",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#f87171",
    icon: "🏛️",
  },
  {
    title: "2. 25 राज्य उच्च न्यायालय (25 State High Courts)",
    desc: "रिट याचिकाएं (Art. 226/227), प्रथम अपील, 482 व अंतरिम स्टे",
    scope: "सभी 25 राज्य व केंद्र शासित प्रदेश",
    color: "#1e40af",
    bg: "#eff6ff",
    border: "#60a5fa",
    icon: "⚖️",
  },
  {
    title: "3. 780+ ज़िला एवं सत्र न्यायालय (District & Sessions Courts)",
    desc: "सिविल वाद, आपराधिक ट्रायल, अग्रिम/नियमित जमानत व पारिवारिक वाद",
    scope: "780+ ज़िला न्यायालय परिसर (Pan-India)",
    color: "#047857",
    bg: "#ecfdf5",
    border: "#34d399",
    icon: "🏢",
  },
  {
    title: "4. तहसील, SDM व राजस्व न्यायालय (Tehsil & Revenue Courts)",
    desc: "दाखिल-खारिज (Mutation), पैमाइश, सीमांकन, चकबंदी व भू-राजस्व",
    scope: "नायब तहसीलदार, तहसीलदार, SDM व DM कोर्ट",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fbbf24",
    icon: "📜",
  },
  {
    title: "5. 8 वैधानिक अधिकरण (Specialized Tribunals)",
    desc: "NCLT, DRT, NGT, CAT, Consumer, RERA, ITAT व AFT अधिकरण",
    scope: "कंपनी, ऋण वसूली, पर्यावरण, सेवा व उपभोक्ता आयोग",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#a78bfa",
    icon: "💼",
  },
];

export default function PublicLegalHomepage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#0f172a", display: "flex", flexDirection: "column" }}>
      {/* 1. ENTERPRISE TOP NAVIGATION BAR (FULL WIDTH) */}
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: "#0f172a", color: "#ffffff", borderBottom: "2px solid #1e293b" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 74 }, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* BRAND / LOGO */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  p: 1.2,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                <AccountBalanceIcon sx={{ color: "#38bdf8", fontSize: { xs: 26, md: 32 } }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={{
                    letterSpacing: 0.5,
                    fontSize: { xs: "0.95rem", sm: "1.15rem", md: "1.35rem" },
                    color: "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.82rem" },
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  अखिल भारतीय विधिक सहायता एवं 140 करोड़ नागरिक डिजिटल न्याय मंच
                </Typography>
              </Box>
            </Stack>

            {/* TOP RIGHT CONTROLS */}
            <Stack direction="row" spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center">
              <Chip
                icon={<PhoneInTalkIcon sx={{ color: "#34d399 !important", fontSize: 16 }} />}
                label="24x7: +91 7053002222 / 9999002222"
                sx={{
                  bgcolor: "#064e3b",
                  color: "#6ee7b7",
                  fontWeight: 800,
                  fontSize: { xs: "0.7rem", md: "0.8rem" },
                  display: { xs: "none", lg: "inline-flex" },
                  border: "1px solid #059669",
                  py: 2,
                }}
              />

              <Button
                component={RouterLink}
                to="/track-case"
                variant="outlined"
                size="small"
                startIcon={<SearchIcon />}
                sx={{
                  color: "#38bdf8",
                  borderColor: "#38bdf8",
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  display: { xs: "none", md: "inline-flex" },
                  textTransform: "none",
                  "&:hover": { borderColor: "#7dd3fc", bgcolor: "rgba(56, 189, 248, 0.1)" },
                }}
              >
                केस ट्रैक करें
              </Button>

              <Button
                component={RouterLink}
                to="/verify-certificate"
                variant="outlined"
                size="small"
                startIcon={<VerifiedUserIcon />}
                sx={{
                  color: "#fbbf24",
                  borderColor: "#fbbf24",
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  display: { xs: "none", lg: "inline-flex" },
                  textTransform: "none",
                  "&:hover": { borderColor: "#fcd34d", bgcolor: "rgba(251, 191, 36, 0.1)" },
                }}
              >
                सर्टिफिकेट सत्यापन
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="medium"
                startIcon={<LockOpenIcon />}
                sx={{
                  bgcolor: "#2563eb",
                  fontWeight: 800,
                  borderRadius: 2,
                  px: { xs: 2, md: 3 },
                  py: { xs: 0.8, md: 1 },
                  fontSize: { xs: "0.82rem", md: "0.92rem" },
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                लॉगिन (Sign In)
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 2. HERO HEADLINE & PURPOSE BANNER */}
      <Box sx={{ bgcolor: "#0f172a", color: "#ffffff", pt: { xs: 4, md: 5 }, pb: { xs: 5, md: 7 }, borderBottom: "1px solid #334155" }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", maxWidth: 1100, mx: "auto" }}>
            <Chip
              label="⚖️ Bar Council Rule 36 & IT Act Sec 79 Sovereign Compliant Digital Platform"
              size="small"
              sx={{ bgcolor: "#1e293b", color: "#38bdf8", fontWeight: 700, mb: 2, border: "1px solid #334155" }}
            />
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.4rem", md: "3.1rem" },
                lineHeight: 1.2,
                color: "#ffffff",
                letterSpacing: -0.5,
                mb: 1.5,
              }}
            >
              विधिक सहायता, केस इनटेक एवं अधिकृत अधिवक्ता पैनल
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
                color: "#94a3b8",
                fontWeight: 500,
                maxWidth: 900,
                mx: "auto",
                lineHeight: 1.5,
              }}
            >
              140 करोड़ नागरिकों, अधिवक्ताओं और ज़िला केंद्रों के लिए अखिल भारतीय स्तर पर पारदर्शी, सशक्त और त्वरित डिजिटल न्याय मंच
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* 3. 3 MAIN RECTANGLE GATEWAY CARDS (SYMMETRICAL 3-COLUMN DESKTOP GRID) */}
      <Container maxWidth="xl" sx={{ mt: { xs: -3, md: -4 }, mb: 6 }}>
        <Grid container spacing={3.5} alignItems="stretch">
          {/* DOOR 1: LITIGANT / CITIZEN INTAKE */}
          <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            <Card
              elevation={4}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: "2.5px solid #10b981",
                boxShadow: "0 12px 30px rgba(16, 185, 129, 0.12)",
                transition: "all 0.25s ease-in-out",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(16, 185, 129, 0.22)" },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to="/join"
                sx={{
                  flex: 1,
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 3,
                        bgcolor: "#d1fae5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShieldIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Chip label="नागरिक पोर्टल" size="small" sx={{ bgcolor: "#064e3b", color: "#6ee7b7", fontWeight: 800 }} />
                  </Stack>

                  <Typography variant="h5" fontWeight={900} color="#064e3b" sx={{ mb: 1, lineHeight: 1.3 }}>
                    📜 1. विधिक समस्या / नया केस दर्ज करें
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="#059669" sx={{ mb: 2 }}>
                    Citizen Legal Intake & Instant Telemetry ID
                  </Typography>

                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.95rem", lineHeight: 1.6, mb: 3 }}>
                    ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, उपभोक्ता व पारिवारिक मामलों में बिना अग्रिम जटिलता के तुरंत सहायता प्राप्त करें।
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SecurityIcon sx={{ color: "#059669", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#064e3b">
                        100% सुरक्षित व गोपनीय विधिक सहायता
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VerifiedUserIcon sx={{ color: "#059669", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#064e3b">
                        अधिकृत बार काउंसिल अधिवक्ता परामर्श
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    borderRadius: 2.5,
                    textTransform: "none",
                  }}
                >
                  केस दर्ज करें व पोर्टल में प्रवेश करें →
                </Button>
              </CardActionArea>
            </Card>
          </Grid>

          {/* DOOR 2: ADVOCATE / LEGAL PROFESSIONAL */}
          <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            <Card
              elevation={4}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: "2.5px solid #3b82f6",
                boxShadow: "0 12px 30px rgba(59, 130, 246, 0.12)",
                transition: "all 0.25s ease-in-out",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(59, 130, 246, 0.22)" },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to="/join"
                sx={{
                  flex: 1,
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 3,
                        bgcolor: "#dbeafe",
                        color: "#1d4ed8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GavelIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Chip label="अधिवक्ता डेस्क" size="small" sx={{ bgcolor: "#1e3a8a", color: "#93c5fd", fontWeight: 800 }} />
                  </Stack>

                  <Typography variant="h5" fontWeight={900} color="#1e3a8a" sx={{ mb: 1, lineHeight: 1.3 }}>
                    ⚖️ 2. अधिवक्ता व विशेषज्ञ पैनल में जुड़ें
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="#2563eb" sx={{ mb: 2 }}>
                    Advocates, CAs, Forensics & Specialists
                  </Typography>

                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.95rem", lineHeight: 1.6, mb: 3 }}>
                    बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फॉरेंसिक एक्सपर्ट, सेवानिवृत्त अधिकारी व कोर्ट मुंशी अखिल भारतीय पैनल से जुड़ें।
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SecurityIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#1e3a8a">
                        डिजिटल कोर्ट चैंबर व ई-वकालतनामा
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VerifiedUserIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#1e3a8a">
                        अखिल भारतीय केस रेफ़रल व क्लिनिकल डेस्क
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: "#1d4ed8",
                    "&:hover": { bgcolor: "#1e40af" },
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    borderRadius: 2.5,
                    textTransform: "none",
                  }}
                >
                  पैनल में पंजीकरण करें →
                </Button>
              </CardActionArea>
            </Card>
          </Grid>

          {/* DOOR 3: DISTRICT FRANCHISE AGENCY */}
          <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            <Card
              elevation={4}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: "2.5px solid #f59e0b",
                boxShadow: "0 12px 30px rgba(245, 158, 11, 0.12)",
                transition: "all 0.25s ease-in-out",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(245, 158, 11, 0.22)" },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to="/join"
                sx={{
                  flex: 1,
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 3,
                        bgcolor: "#fef3c7",
                        color: "#b45309",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <StorefrontIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Chip label="ज़िला फ्रेंचाइज़ी" size="small" sx={{ bgcolor: "#78350f", color: "#fde68a", fontWeight: 800 }} />
                  </Stack>

                  <Typography variant="h5" fontWeight={900} color="#78350f" sx={{ mb: 1, lineHeight: 1.3 }}>
                    🏢 3. ज़िला विधिक सहायता फ्रेंचाइज़ी केंद्र
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="#d97706" sx={{ mb: 2 }}>
                    District Legal Franchise & Assistance Hub
                  </Typography>

                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.95rem", lineHeight: 1.6, mb: 3 }}>
                    ज़िला स्तर पर विधिक सहायता, ई-फाइलिंग सहायता व टेलीफोनिक लीगल कॉल सेंटर फ्रेंचाइज़ी एजेंसी हेतु अधिकृत आवेदन।
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SecurityIcon sx={{ color: "#d97706", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#78350f">
                        ज़िला स्तर पर अधिकृत अधिकार क्षेत्र
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VerifiedUserIcon sx={{ color: "#d97706", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color="#78350f">
                        ई-फाइलिंग व नागरिक सहायता केंद्र
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: "#b45309",
                    "&:hover": { bgcolor: "#92400e" },
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    borderRadius: 2.5,
                    textTransform: "none",
                  }}
                >
                  फ्रेंचाइज़ी आवेदन प्रस्तुत करें →
                </Button>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 4. QUICK ACTION PUBLIC UTILITIES BAR */}
      <Container maxWidth="xl" sx={{ mb: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3.5,
            bgcolor: "#1e293b",
            color: "#ffffff",
            border: "1px solid #334155",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            gap={2.5}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="#38bdf8">
                ⚡ त्वरित नागरिक सेवाएं (Quick Citizen Legal Utilities)
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                बिना लॉगिन के सीधे CNR केस ट्रैकिंग, प्रमाणपत्र सत्यापन एवं वैधानिक सहायता
              </Typography>
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              <Button
                component={RouterLink}
                to="/track-case"
                variant="contained"
                size="medium"
                startIcon={<SearchIcon />}
                sx={{
                  bgcolor: "#2563eb",
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                🔍 ट्रैक केस स्टेटस (Track Case & FIR)
              </Button>

              <Button
                component={RouterLink}
                to="/verify-certificate"
                variant="contained"
                size="medium"
                startIcon={<VerifiedUserIcon />}
                sx={{
                  bgcolor: "#d97706",
                  color: "#ffffff",
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#b45309" },
                }}
              >
                📜 सर्टिफिकेट सत्यापन (Verify Certificate)
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="medium"
                startIcon={<LockOpenIcon />}
                sx={{
                  color: "#34d399",
                  borderColor: "#34d399",
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { borderColor: "#6ee7b7", bgcolor: "rgba(52, 211, 153, 0.1)" },
                }}
              >
                👤 सदस्य पोर्टल लॉगिन (Members Portal)
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* 5. 5-TIER PAN-INDIA JUDICIAL NETWORK MATRIX (SINGLE CLEAN RENDER) */}
      <Container maxWidth="xl" sx={{ mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3.5 }}>
            <Box>
              <Typography variant="h5" fontWeight={900} color="#0f172a">
                🏛️ 5-स्तरीय अखिल भारतीय न्यायपालिका एवं अधिकरण नेटवर्क
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                All-India Judicial Forums Council & Legal Protection Network — INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
              </Typography>
            </Box>

            <Chip
              label="Pan-India Comprehensive Jurisdiction"
              size="medium"
              sx={{ bgcolor: "#0f172a", color: "#fcd34d", fontWeight: 800, py: 2 }}
            />
          </Stack>

          {/* 5 Tier Cards Grid */}
          <Grid container spacing={2.5}>
            {JUDICIAL_TIERS.map((tier, idx) => (
              <Grid item xs={12} sm={6} lg={idx === 4 ? 12 : 6} key={tier.title} sx={{ display: "flex" }}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: tier.bg,
                    borderColor: tier.border,
                    borderLeft: `6px solid ${tier.color}`,
                    transition: "all 0.2s ease",
                    "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Typography variant="h4" sx={{ mt: 0.5 }}>{tier.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={900} color="#0f172a" sx={{ mb: 0.5 }}>
                        {tier.title}
                      </Typography>
                      <Typography variant="body2" color="#334155" sx={{ fontSize: "0.9rem", lineHeight: 1.5, mb: 1 }}>
                        {tier.desc}
                      </Typography>
                      <Chip
                        label={tier.scope}
                        size="small"
                        sx={{ bgcolor: "#ffffff", color: tier.color, fontWeight: 700, border: `1px solid ${tier.border}` }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* 6. STATUTORY COMPLIANCE ENTERPRISE FOOTER */}
      <Box sx={{ bgcolor: "#0f172a", color: "#94a3b8", py: 5, borderTop: "2px solid #1e293b", mt: "auto" }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" fontWeight={800} color="#ffffff" gutterBottom>
                INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7, color: "#cbd5e1", mb: 2 }}>
                अखिल भारतीय विधिक सहायता, डिजिटल कोर्ट चैंबर, ई-वकालतनामा एवं कानूनी संरक्षण हेतु अधिकृत मंच। Bar Council of India (BCI) Rule 36 एवं Information Technology Act 2000 (Section 79) के तहत पूर्णतः अनुपालित।
              </Typography>
              <Typography variant="caption" color="#94a3b8" display="block">
                DPDP Act 2023 Compliant | ISO 27001 Certified Security Standard
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" fontWeight={800} color="#ffffff" gutterBottom>
                त्वरित संपर्क व सहायता
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 2 }}>
                🌐 www.icj.co.in<br />
                📞 +91 7053002222<br />
                📞 +91 9999002222<br />
                📧 consortiumofjurists@gmail.com<br />
                ⏰ 24x7 इमरजेंसी विधिक डेस्क
              </Typography>
            </Grid>

            <Grid item xs={6} md={4}>
              <Typography variant="subtitle2" fontWeight={800} color="#ffffff" gutterBottom>
                महत्वपूर्ण वैधानिक लिंक्स
              </Typography>
              <Stack spacing={1}>
                <Typography component={RouterLink} to="/terms" variant="caption" sx={{ color: "#38bdf8", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  • Intermediary Terms of Service (IT Act Sec 79)
                </Typography>
                <Typography component={RouterLink} to="/verify-certificate" variant="caption" sx={{ color: "#38bdf8", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  • Certificate & Advocate Verification Desk
                </Typography>
                <Typography component={RouterLink} to="/track-case" variant="caption" sx={{ color: "#38bdf8", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  • Pan-India CNR Case Tracking Engine
                </Typography>
                <Typography component={RouterLink} to="/login" variant="caption" sx={{ color: "#38bdf8", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  • Official Advocate & Member Dashboard Login
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "#334155", mb: 3 }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="caption" color="#64748b">
              © {new Date().getFullYear()} International Consortium of Jurists (ICJ). All Rights Reserved.
            </Typography>
            <Typography variant="caption" color="#64748b">
              Regd. Sovereign Legal Intermediary & Technology Protection Platform
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
