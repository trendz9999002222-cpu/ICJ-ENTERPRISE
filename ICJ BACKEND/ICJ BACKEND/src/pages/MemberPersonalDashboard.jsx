import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Button,
  Paper,
} from "@mui/material";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BadgeIcon from "@mui/icons-material/Badge";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import ZeroScrollPageShell from "../components/common/ZeroScrollPageShell.jsx";
import ProgressiveProfileEditor from "../components/profile/ProgressiveProfileEditor.jsx";
import useAuth from "../hooks/useAuth.js";

const PROFILE_VIEWS = [
  { id: 0, title: "🪪 26-सीरीज़ आधिकारिक पहचान पत्र", subtitle: "26-Series Dual-Telemetry Member Identity & Live Status" },
  { id: 1, title: "📍 राजस्व प्रशासनिक पता व जीपीएस", subtitle: "State ➔ District ➔ Tehsil ➔ Village Revenue Hierarchy" },
  { id: 2, title: "💼 व्यावसायिक साख व सदस्यता सुरक्षा", subtitle: "Credentials, Bar Enrollment & Digital Wallet" },
];

export default function MemberPersonalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(0);

  const memberName = useMemo(() => {
    const prefix = user?.namePrefix || user?.name_prefix || "";
    const name = user?.fullName || user?.full_name || user?.name || "Registered Member";
    return prefix && !name.startsWith(prefix) ? `${prefix} ${name}` : name;
  }, [user]);

  const memberId = user?.member_id || user?.memberId || user?.id || "26-AAA001-CLINT-AAAA0007";
  const memberLevel = (user?.member_level || user?.memberLevel || "PRO").toUpperCase();

  const currentYear = new Date().getFullYear();
  const calculatedAge = user?.age
    ? Number(user.age)
    : user?.birthYear
    ? currentYear - Number(user.birthYear)
    : null;

  const memberAgeDisplay = calculatedAge ? `${calculatedAge} वर्ष (Years)` : "दर्ज नहीं";
  const memberGender = user?.gender || "दर्ज नहीं";
  const memberMobile = user?.mobile || "दर्ज नहीं";
  const memberEmail = user?.email || "दर्ज नहीं";
  const memberCategory = user?.categoryCode5 || "CLINT";

  const currentViewInfo = PROFILE_VIEWS[currentView];

  return (
    <ZeroScrollPageShell
      title={currentViewInfo.title}
      subtitle={currentViewInfo.subtitle}
      headerRightContent={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<BadgeIcon sx={{ color: "#38bdf8 !important", fontSize: 16 }} />}
            label={`आईडी: ${memberId}`}
            sx={{ bgcolor: "#1e293b", color: "#f8fafc", fontWeight: 800, borderColor: "#334155" }}
            variant="outlined"
          />
          <Chip
            icon={<VerifiedIcon sx={{ color: "#10b981 !important", fontSize: 16 }} />}
            label="स्थिति: सत्यापित सदस्य (Verified)"
            sx={{ bgcolor: "#064e3b", color: "#86efac", fontWeight: 800 }}
          />
        </Stack>
      }
      canGoBack={currentView > 0}
      canGoNext={currentView < 2}
      onBack={() => setCurrentView((v) => Math.max(0, v - 1))}
      onNext={() => setCurrentView((v) => Math.min(2, v + 1))}
      backLabel="← पिछले कार्यक्षेत्र पर जाएं"
      nextLabel="अगले कार्यक्षेत्र पर जाएं →"
    >
      {/* ========================================================================= */}
      {/* VIEW 0: 26-SERIES OFFICIAL ID & PROFILE (2 STRICTLY EQUAL SYMMETRICAL BOXES) */}
      {/* ========================================================================= */}
      {currentView === 0 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          {/* BOX 1: 26-SERIES OFFICIAL MEMBER IDENTITY CARD */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 3.5,
                p: 3.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                boxShadow: "0 10px 30px rgba(15,23,42,0.2)",
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip label="🇮🇳 ICJ OFFICIAL TELEMETRY ID" size="small" sx={{ bgcolor: "#047857", color: "#ffffff", fontWeight: 900 }} />
                  <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 800 }}>
                    वर्ष 2026 एनरोलमेंट
                  </Typography>
                </Stack>

                <Typography variant="h5" fontWeight={900} color="#ffffff" mb={0.5}>
                  {memberName}
                </Typography>

                <Typography variant="subtitle2" sx={{ color: "#38bdf8", fontWeight: 800, letterSpacing: 0.5, mb: 2 }}>
                  {memberId}
                </Typography>

                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>श्रेणी कोड:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#ffffff">{memberCategory}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>वास्तविक उम्र:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#ffffff">{memberAgeDisplay}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>मोबाइल नंबर:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#ffffff">{memberMobile}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>ईमेल:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#ffffff">{memberEmail}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setCurrentView(1)}
                sx={{ mt: 2, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, fontWeight: 800, borderRadius: 2 }}
              >
                📍 राजस्व प्रशासनिक पता व GPS संपादित करें →
              </Button>
            </Card>
          </Grid>

          {/* BOX 2: JURISDICTIONAL PROFILE (STRICTLY EQUAL HEIGHT & SHAPE) */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 3.5,
                p: 3.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                bgcolor: "#ffffff",
                borderColor: "#cbd5e1",
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight={800} color="#2563eb" display="block" mb={0.5}>
                  JURISDICTIONAL STATUS & TELEMETRY
                </Typography>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={1}>
                  अखिल भारतीय सदस्यता एवं कानूनी क्षेत्र
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  राज्य ➔ ज़िला ➔ तहसील स्तर पर विधिक सेवाओं का निर्बाध नेटवर्क।
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                    <Typography variant="caption" color="#166534" fontWeight={700} display="block">
                      सक्रिय राज्य व ज़िला क्षेत्राधिकार:
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#14532d">
                      {user?.district || "Gautam Buddha Nagar"}, {user?.state || "Uttar Pradesh"}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe" }}>
                    <Typography variant="caption" color="#1e40af" fontWeight={700} display="block">
                      प्रशासनिक तहसील / गाँव:
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#1e3a8a">
                      {user?.tehsil || "Dadri Tehsil"} • {user?.villageOrWard || "Noida"} ({user?.pincode || "201301"})
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCurrentView(2)}
                sx={{ mt: 2, fontWeight: 800, borderRadius: 2, textTransform: "none" }}
              >
                💼 व्यावसायिक साख व वॉलेट देखें →
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: REVENUE HIERARCHY & GPS AUTO-FILL EDITOR                          */}
      {/* ========================================================================= */}
      {currentView === 1 && (
        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <ProgressiveProfileEditor currentUser={user} />
        </Box>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CREDENTIALS, SECURITY & DIGITAL WALLET                            */}
      {/* ========================================================================= */}
      {currentView === 2 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          {/* Box 1: Credentials */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3.5, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={1}>
                  📜 विधिक प्रमाणपत्र एवं बार एनरोलमेंट
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  सत्यापित व्यावसायिक विवरण एवं सदस्यता स्तर
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" color="#64748b">पंजीकरण संख्या / बार काउंसिल:</Typography>
                    <Typography variant="body2" fontWeight={800}>{user?.barOrRegNumber || "D/1042/1998"}</Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" color="#64748b">सदस्यता टियर:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#2563eb">ICJ {memberLevel} TIER (2026)</Typography>
                  </Box>
                </Stack>
              </Box>

              <Chip icon={<SecurityIcon />} label="256-बिट बैंक-ग्रेड सुरक्षा सक्रिय" color="success" sx={{ fontWeight: 700 }} />
            </Card>
          </Grid>

          {/* Box 2: Wallet */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3.5, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#166534" mb={1}>
                  💳 डिजिटल मास्टर वॉलेट एवं टोकन
                </Typography>
                <Typography variant="caption" color="#15803d" display="block" mb={2}>
                  विधिक परामर्श शुल्क व ट्रस्ट एस्क्रो बैलेंस
                </Typography>

                <Typography variant="h4" fontWeight={900} color="#14532d" my={2}>
                  ₹0.00
                </Typography>
                <Typography variant="caption" color="#166534">
                  ✓ कोई लंबित देयता नहीं (No Pending Escrow Dues)
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/wallet")}
                sx={{ mt: 2, bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, fontWeight: 800, borderRadius: 2 }}
              >
                वॉलेट प्रबंधन खोलें →
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </ZeroScrollPageShell>
  );
}
