import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";

export default function PublicLegalHomepage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#0f172a", pb: 8 }}>
      {/* 1. TOP OFFICIAL NATIONAL HELPLINE STRIP */}
      <Box
        sx={{
          bgcolor: "#064e3b",
          color: "#ffffff",
          py: 1,
          px: 2,
          borderBottom: "2px solid #059669",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label="🇮🇳 ALL-INDIA LEGAL AID"
                size="small"
                sx={{
                  bgcolor: "#047857",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  borderRadius: "12px",
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#a7f3d0" }}>
                अखिल भारतीय विधिक सहायता एवं न्याय मंच
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneInTalkIcon sx={{ fontSize: 14, color: "#34d399" }} /> हेल्पलाइन: +91 7053002222 / 9999002222
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#cbd5e1", display: { xs: "none", md: "inline" } }}>
                ✉️ Consortiumofjurist@gmail.com
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 2. MAIN BRAND NAVIGATION NAVBAR */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1.5px solid #e2e8f0",
          py: 1.8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#1a73e8",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(26, 115, 232, 0.35)",
                }}
              >
                <GavelIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ lineHeight: 1.1, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
                  INTERNATIONAL CONSORTIUM OF JURISTS
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#047857" sx={{ letterSpacing: 0.5 }}>
                  ICJ APEX LEGAL PORTAL • न्याय सबके लिए सुलभ
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                startIcon={<LockOpenIcon />}
                sx={{
                  borderRadius: "24px",
                  px: 2.2,
                  py: 0.8,
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  borderColor: "#1a73e8",
                  color: "#1a73e8",
                  "&:hover": { bgcolor: "#eff6ff", borderColor: "#1557b0" },
                }}
              >
                लॉगिन (Sign In)
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 3. HERO BANNER: 3 MAJOR ENTRY DOORS */}
      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            borderRadius: "24px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
            mb: 4,
            textAlign: "center",
          }}
        >
          <Chip
            label="🏛️ OFFICIAL CITIZEN & LITIGANT ASSISTANCE NETWORK"
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.12)",
              color: "#38bdf8",
              fontWeight: 900,
              fontSize: "0.75rem",
              borderRadius: "14px",
              mb: 2,
              px: 1,
            }}
          />
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5, fontSize: { xs: "1.5rem", sm: "2.1rem", md: "2.5rem" } }}>
            विधिक सहायता एवं न्याय मंच (ICJ Portal)
          </Typography>
          <Typography variant="body1" sx={{ color: "#94a3b8", maxWidth: 750, mx: "auto", mb: 4, fontSize: { xs: "0.9rem", sm: "1.05rem" } }}>
            सुप्रीम कोर्ट, हाई कोर्ट, ज़िला अदालत, तहसील राजस्व एवं विशेष अधिकरणों (NCLT, DRT, CAT, RERA, Consumer) में कानूनी सहायता, केस ड्राफ्टिंग एवं प्रमाणित अधिवक्ता पैनल।
          </Typography>

          {/* 3 PRIMARY TACTILE ACTION BUTTONS (MOBILE-FIRST) */}
          <Grid container spacing={2.5} justifyContent="center">
            {/* DOOR 1: LITIGANT / CITIZEN */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "20px",
                  bgcolor: "#ffffff",
                  borderColor: "#34d399",
                  borderWidth: 2.5,
                  boxShadow: "0 6px 20px rgba(4, 120, 87, 0.15)",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 28px rgba(4, 120, 87, 0.3)" },
                }}
              >
                <CardActionArea component={RouterLink} to="/join" sx={{ p: 2.5, textAlign: "left" }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#d1fae5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                    <ShieldIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={900} color="#064e3b" sx={{ fontSize: "1.1rem" }}>
                    📜 विधिक समस्या / केस दर्ज करें
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#047857" display="block" sx={{ mb: 1 }}>
                    Free Legal Problem Intake & Case Filing
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.82rem", lineHeight: 1.3 }}>
                    ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर व उपभोक्ता समस्याओं हेतु तुरंत केस फ़ाइल करें।
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* DOOR 2: ADVOCATE EMPANELMENT */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "20px",
                  bgcolor: "#ffffff",
                  borderColor: "#60a5fa",
                  borderWidth: 2.5,
                  boxShadow: "0 6px 20px rgba(26, 115, 232, 0.15)",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 28px rgba(26, 115, 232, 0.3)" },
                }}
              >
                <CardActionArea component={RouterLink} to="/join?role=advocate" sx={{ p: 2.5, textAlign: "left" }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#dbeafe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                    <GavelIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={900} color="#1557b0" sx={{ fontSize: "1.1rem" }}>
                    ⚖️ अधिवक्ता पैनल में जुड़ें
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#1a73e8" display="block" sx={{ mb: 1 }}>
                    Join Empaneled Advocate Directory
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.82rem", lineHeight: 1.3 }}>
                    बार काउंसिल पंजीकृत अधिवक्ता सुप्रीम कोर्ट, हाई कोर्ट व ज़िला स्तर पर पैनल से जुड़कर प्रैक्टिस करें।
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* DOOR 3: DISTRICT FRANCHISE */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "20px",
                  bgcolor: "#ffffff",
                  borderColor: "#fbbf24",
                  borderWidth: 2.5,
                  boxShadow: "0 6px 20px rgba(180, 83, 9, 0.15)",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 28px rgba(180, 83, 9, 0.3)" },
                }}
              >
                <CardActionArea component={RouterLink} to="/join?role=franchise" sx={{ p: 2.5, textAlign: "left" }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                    <StorefrontIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={900} color="#78350f" sx={{ fontSize: "1.1rem" }}>
                    🏢 ज़िला पैरेंट फ्रैंचाइज़ी केंद्र
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#b45309" display="block" sx={{ mb: 1 }}>
                    District Legal Call Center Agency
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ fontSize: "0.82rem", lineHeight: 1.3 }}>
                    ज़िला स्तर पर विधिक सहायता व कॉल सेंटर फ्रेंचाइज़ी एजेंसी हेतु अधिकृत आवेदन प्रस्तुत करें।
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* 4. FAST CITIZEN QUICK-ACCESS UTILITIES */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              component={RouterLink}
              to="/track-case"
              variant="outlined"
              size="large"
              startIcon={<SearchIcon />}
              sx={{
                borderRadius: "30px",
                py: 1.5,
                fontWeight: 900,
                fontSize: "0.9rem",
                bgcolor: "#ffffff",
                borderColor: "#cbd5e1",
                color: "#1e293b",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                "&:hover": { borderColor: "#1a73e8", bgcolor: "#eff6ff" },
              }}
            >
              🔍 केस ट्रैक करें (Track Case & CNR)
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              component={RouterLink}
              to="/verify"
              variant="outlined"
              size="large"
              startIcon={<VerifiedUserIcon />}
              sx={{
                borderRadius: "30px",
                py: 1.5,
                fontWeight: 900,
                fontSize: "0.9rem",
                bgcolor: "#ffffff",
                borderColor: "#cbd5e1",
                color: "#1e293b",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                "&:hover": { borderColor: "#047857", bgcolor: "#ecfdf5" },
              }}
            >
              🎖️ सर्टिफिकेट सत्यापन (Verify Certificate)
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              startIcon={<LockOpenIcon />}
              sx={{
                borderRadius: "30px",
                py: 1.5,
                fontWeight: 900,
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #047857 0%, #1a73e8 100%)",
                boxShadow: "0 4px 14px rgba(4, 120, 87, 0.3)",
              }}
            >
              🔐 सदस्य पोर्टल लॉगिन (Member Portal)
            </Button>
          </Grid>
        </Grid>

        {/* 5. 5-TIER ALL-INDIA JUDICIAL FORUMS SUMMARY */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: "20px", bgcolor: "#ffffff", borderColor: "#e2e8f0" }}>
          <Typography variant="subtitle1" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
            🏛️ 5-स्तरीय अखिल भारतीय न्यायपालिका एवं अधिकरण नेटवर्क
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
            All-India Judicial Forums Covered by ICJ Legal Protection Network:
          </Typography>

          <Grid container spacing={1.5}>
            {[
              { label: "सुप्रीम कोर्ट (Supreme Court)", icon: "🏛️", color: "#6b21a8", bg: "#f3e8ff", border: "#c084fc", desc: "Art. 32 Writs, SLP, Transfers & Constitution Benches" },
              { label: "25 हाई कोर्ट्स (High Courts)", icon: "⚖️", color: "#1a73e8", bg: "#dbeafe", border: "#60a5fa", desc: "Writs, Criminal Bail, 482 Quashing & Regular Appeals" },
              { label: "780+ ज़िला अदालतें (Districts)", icon: "🏢", color: "#047857", bg: "#d1fae5", border: "#34d399", desc: "District & Sessions, Commercial, Family, POCSO & CJM" },
              { label: "तहसील व राजस्व (Tehsil & Revenue)", icon: "📜", color: "#b45309", bg: "#fef3c7", border: "#fbbf24", desc: "दाखिल-खारिज (Mutation), पैमाइश, चकबंदी व SDM कोर्ट" },
              { label: "8 वैधानिक अधिकरण (Tribunals)", icon: "💼", color: "#b91c1c", bg: "#fee2e2", border: "#f87171", desc: "NCLT, DRT, NGT, CAT, Consumer, ITAT, RERA & AFT" },
            ].map((forum, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "16px",
                    bgcolor: forum.bg,
                    border: `2px solid ${forum.border}`,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={900} sx={{ color: forum.color, mb: 0.5 }}>
                    {forum.icon} {forum.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600, lineHeight: 1.2, display: "block" }}>
                    {forum.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 6. TRUSTED FOOTER */}
        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Typography variant="body2" fontWeight={800} color="#475569">
            INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Regd. Sovereign Legal Trust • All-India Helpline: +91 7053002222 / 9999002222 • Official Portal: icj.co.in
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
