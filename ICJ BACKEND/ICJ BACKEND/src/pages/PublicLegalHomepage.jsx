import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SearchIcon from "@mui/icons-material/Search";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import ZeroScrollPageShell from "../components/common/ZeroScrollPageShell.jsx";

const JUDICIAL_TIERS = [
  { title: "1. भारत का सर्वोच्च न्यायालय (Supreme Court of India)", desc: "अपील, विशेष अनुमति याचिका (SLP) व संविधान पीठ संदर्भ", color: "#1e3a8a", icon: "🏛️" },
  { title: "2. 25 राज्य उच्च न्यायालय (25 State High Courts)", desc: "रिट याचिकाएं (Art. 226/227), प्रथम अपील व अंतरिम स्टे आदेश", color: "#065f46", icon: "⚖️" },
  { title: "3. 780+ ज़िला एवं सत्र न्यायालय (District & Sessions Courts)", desc: "सिविल वाद, आपराधिक ट्रायल, अग्रिम/नियमित जमानत व निष्पादन", color: "#78350f", icon: "📋" },
  { title: "4. विशेष अधिकरण (Tribunals: NCLT, DRT, CAT, RERA, NGT)", desc: "दिवालियापन, बैंक ऋण वसूली, प्रशासनिक व पर्यावरण विधिक फोरम", color: "#581c87", icon: "🏢" },
  { title: "5. तहसील, SDM व राजस्व न्यायालय (Tehsil & Revenue Courts)", desc: "दाखिल-खारिज, पैमाइश, सीमांकन, चकबंदी व भू-राजस्व संहिता मामले", color: "#0f766e", icon: "🚜" },
];

export default function PublicLegalHomepage() {
  const [currentView, setCurrentView] = useState(0); // 0: Main 3 Doors, 1: Judicial Forums Network

  return (
    <ZeroScrollPageShell
      title="🏛️ INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)"
      subtitle="अखिल भारतीय विधिक सहायता एवं 140 करोड़ नागरिक न्याय मंच"
      headerRightContent={
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<PhoneInTalkIcon sx={{ color: "#34d399 !important", fontSize: 16 }} />}
            label="हेल्पलाइन: +91 7053002222 / 9999002222"
            sx={{ bgcolor: "#064e3b", color: "#ffffff", fontWeight: 800, fontSize: "0.75rem" }}
          />
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            size="small"
            startIcon={<LockOpenIcon />}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              fontWeight: 800,
              borderRadius: 2,
              px: 2,
              textTransform: "none",
            }}
          >
            लॉगिन (Sign In)
          </Button>
        </Stack>
      }
      canGoBack={currentView > 0}
      canGoNext={currentView < 1}
      onBack={() => setCurrentView((v) => Math.max(0, v - 1))}
      onNext={() => setCurrentView((v) => Math.min(1, v + 1))}
      backLabel="← मुख्य द्वार पर वापस जाएं"
      nextLabel="अखिल भारतीय न्यायिक नेटवर्क देखें →"
    >
      {/* ========================================================================= */}
      {/* VIEW 0: 3 STRICTLY EQUAL SYMMETRICAL RECTANGLE BOXES                       */}
      {/* ========================================================================= */}
      {currentView === 0 && (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Top Headline Banner */}
          <Box sx={{ textAlign: "center", py: 1.5 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a" sx={{ letterSpacing: -0.5 }}>
              विधिक सहायता, केस इनटेक एवं अधिकृत अधिवक्ता पैनल
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.85rem", mt: 0.5 }}>
              140 करोड़ नागरिकों, अधिवक्ताओं और ज़िला केंद्रों के लिए बिना स्क्रॉलिंग का निर्बाध डिजिटल प्रवेश
            </Typography>
          </Box>

          {/* 3 STRICTLY EQUAL SYMMETRICAL RECTANGLE CARDS */}
          <Grid container spacing={3} sx={{ flex: 1, alignItems: "stretch", mb: 1 }}>
            {/* DOOR 1: LITIGANT / CITIZEN */}
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3.5,
                  bgcolor: "#ffffff",
                  borderColor: "#34d399",
                  borderWidth: 2,
                  boxShadow: "0 8px 24px rgba(4, 120, 87, 0.08)",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(4, 120, 87, 0.16)" },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to="/join"
                  sx={{ flex: 1, p: 3.5, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}
                >
                  <Box>
                    <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "#d1fae5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                      <ShieldIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={900} color="#064e3b" mb={0.5}>
                      📜 विधिक समस्या / केस दर्ज करें
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#059669" display="block" mb={2}>
                      Citizen Legal Intake & Instant Telemetry ID
                    </Typography>
                    <Typography variant="body2" color="#475569" sx={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                      ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, उपभोक्ता व पारिवारिक मामलों हेतु बिना अग्रिम जटिलता के तुरंत सहायता प्राप्त करें।
                    </Typography>
                  </Box>

                  <Button variant="contained" fullWidth sx={{ mt: 3, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, fontWeight: 800, borderRadius: 2 }}>
                    केस दर्ज करें व पोर्टल में प्रवेश करें →
                  </Button>
                </CardActionArea>
              </Card>
            </Grid>

            {/* DOOR 2: ADVOCATE / PROFESSIONAL */}
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3.5,
                  bgcolor: "#ffffff",
                  borderColor: "#60a5fa",
                  borderWidth: 2,
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.08)",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(37, 99, 235, 0.16)" },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to="/join"
                  sx={{ flex: 1, p: 3.5, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}
                >
                  <Box>
                    <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                      <GavelIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={900} color="#1e40af" mb={0.5}>
                      ⚖️ अधिवक्ता व विशेषज्ञ पैनल में जुड़ें
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#2563eb" display="block" mb={2}>
                      Advocates, CAs, Forensics & Officers Panel
                    </Typography>
                    <Typography variant="body2" color="#475569" sx={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                      बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फॉरेंसिक एक्सपर्ट, सेवानिवृत्त अधिकारी व कोर्ट मुंशी अखिल भारतीय पैनल से जुड़ें।
                    </Typography>
                  </Box>

                  <Button variant="contained" fullWidth sx={{ mt: 3, bgcolor: "#1d4ed8", "&:hover": { bgcolor: "#1e40af" }, fontWeight: 800, borderRadius: 2 }}>
                    पैनल में पंजीकरण करें →
                  </Button>
                </CardActionArea>
              </Card>
            </Grid>

            {/* DOOR 3: DISTRICT FRANCHISE AGENCY */}
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3.5,
                  bgcolor: "#ffffff",
                  borderColor: "#fbbf24",
                  borderWidth: 2,
                  boxShadow: "0 8px 24px rgba(217, 119, 6, 0.08)",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(217, 119, 6, 0.16)" },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to="/join"
                  sx={{ flex: 1, p: 3.5, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}
                >
                  <Box>
                    <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                      <StorefrontIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={900} color="#78350f" mb={0.5}>
                      🏢 ज़िला विधिक सहायता फ्रेंचाइज़ी केंद्र
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#d97706" display="block" mb={2}>
                      District Legal Franchise & Call Center Hub
                    </Typography>
                    <Typography variant="body2" color="#475569" sx={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                      ज़िला स्तर पर विधिक सहायता, ई-फाइलिंग सहायता व टेलीफोनिक लीगल कॉल सेंटर फ्रेंचाइज़ी एजेंसी हेतु अधिकृत आवेदन।
                    </Typography>
                  </Box>

                  <Button variant="contained" fullWidth sx={{ mt: 3, bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" }, fontWeight: 800, borderRadius: 2 }}>
                    फ्रेंचाइज़ी आवेदन प्रस्तुत करें →
                  </Button>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: 5-TIER JUDICIAL FORUMS NETWORK & CNR CASE TRACKER                  */}
      {/* ========================================================================= */}
      {currentView === 1 && (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                🏛️ अखिल भारतीय 5-स्तरीय न्यायिक व अधिकरण नेटवर्क
              </Typography>
              <Typography variant="caption" color="text.secondary">
                सुप्रीम कोर्ट से लेकर ग्राम-तहसील तक संपूर्ण विधिक क्षेत्राधिकार
              </Typography>
            </Box>

            <Button
              component={RouterLink}
              to="/track-case"
              variant="outlined"
              size="small"
              startIcon={<SearchIcon />}
              sx={{ fontWeight: 800, borderRadius: 2, borderColor: "#2563eb", color: "#2563eb", textTransform: "none" }}
            >
              🔍 केस स्थिति व CNR ट्रैक करें
            </Button>
          </Stack>

          {/* 5 Symmetrical Tier Boxes */}
          <Grid container spacing={2} sx={{ flex: 1, alignItems: "stretch", my: 1 }}>
            {JUDICIAL_TIERS.map((tier, idx) => (
              <Grid item xs={12} sm={6} md={idx === 4 ? 12 : 6} key={tier.title} sx={{ display: "flex" }}>
                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderLeft: `6px solid ${tier.color}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">{tier.icon}</Typography>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                        {tier.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tier.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </ZeroScrollPageShell>
  );
}
