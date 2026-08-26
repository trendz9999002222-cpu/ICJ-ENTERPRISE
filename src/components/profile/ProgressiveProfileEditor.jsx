import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

// Icons
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import BadgeIcon from "@mui/icons-material/Badge";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import GpsLocationService from "../../services/gpsLocationService.js";
import PanIndiaTehsilMaster from "../../data/masters/panIndiaTehsilMaster.js";
import CategoryEnrollmentService from "../../services/categoryEnrollmentService.js";
import TelemetryIdService from "../../services/telemetryIdService.js";
import { states } from "../../data/states.js";
import { ALL_INDIA_DISTRICTS } from "../../data/indiaDistrictMaster.js";

export default function ProgressiveProfileEditor({ currentUser, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName || currentUser?.name || "",
    mobile: currentUser?.mobile || "",
    email: currentUser?.email || "",
    categoryCode5: currentUser?.categoryCode5 || "CLINT",
    birthYear: currentUser?.birthYear || "1985",
    gender: currentUser?.gender || "Male",
    state: currentUser?.state || "Uttar Pradesh",
    district: currentUser?.district || "Gautam Buddha Nagar (Noida/Gr. Noida)",
    tehsil: currentUser?.tehsil || "",
    villageOrWard: currentUser?.villageOrWard || "",
    address: currentUser?.address || "",
    pincode: currentUser?.pincode || "201301",
    barOrRegNumber: currentUser?.barOrRegNumber || "",
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState({ type: "", text: "" });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Available tehsils based on selected district
  const availableTehsils = PanIndiaTehsilMaster.getTehsils(profile.district);
  const activeCategories = CategoryEnrollmentService.getPublicActiveCategories();

  // Handle 1-Click GPS Auto-Fill
  const handleAutoFillGps = async () => {
    setLoadingGps(true);
    setGpsMessage({ type: "", text: "" });
    try {
      const geo = await GpsLocationService.getCurrentLocationAddress();
      setProfile((prev) => ({
        ...prev,
        state: geo.state || prev.state,
        district: geo.district || prev.district,
        tehsil: geo.tehsil || prev.tehsil,
        villageOrWard: geo.villageOrCity || prev.villageOrWard,
        pincode: geo.pincode || prev.pincode,
        address: geo.fullFormattedAddress || prev.address,
      }));
      setGpsMessage({
        type: "success",
        text: `📍 GPS द्वारा पता स्वतः भर दिया गया: ${geo.villageOrCity}, ${geo.tehsil}, ${geo.district} (${geo.pincode})`,
      });
    } catch (err) {
      setGpsMessage({ type: "error", text: err.message || "GPS लोकेशन प्राप्त नहीं हो सकी।" });
    } finally {
      setLoadingGps(false);
    }
  };

  // Handle Save
  const handleSave = () => {
    const currentYear = new Date().getFullYear();
    const calculatedAge = profile.birthYear ? currentYear - Number(profile.birthYear) : null;

    const updatedUser = {
      ...currentUser,
      ...profile,
      age: calculatedAge,
      memberId: currentUser?.memberId || TelemetryIdService.generateMemberId(profile.categoryCode5),
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("icj_user", JSON.stringify(updatedUser));
      if (onProfileUpdated) onProfileUpdated(updatedUser);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const currentCategory = CategoryEnrollmentService.getCategoryByCode(profile.categoryCode5);
  const currentAge = profile.birthYear ? new Date().getFullYear() - Number(profile.birthYear) : "दर्ज नहीं";

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {/* 1. TOP HEADER & GPS QUICK TRIGGER */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          color: "#ffffff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              👤 व्यक्तिगत प्रोफाइल एवं राजस्व क्षेत्राधिकार (Personal & Revenue Profile)
            </Typography>
            <Typography variant="caption" sx={{ color: "#93c5fd" }}>
              26-सीरीज़ मास्टर टेलीमेट्री आईडी • राज्य ➔ जिला ➔ तहसील ➔ गाँव प्रशासनिक ढांचा
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={loadingGps ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
            onClick={handleAutoFillGps}
            disabled={loadingGps}
            sx={{
              bgcolor: "#16a34a",
              "&:hover": { bgcolor: "#15803d" },
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: "none",
            }}
          >
            {loadingGps ? "GPS खोज रहा है..." : "📍 मेरी लोकेशन से पता भरें (GPS Auto-Fill)"}
          </Button>
        </Stack>

        {gpsMessage.text && (
          <Alert severity={gpsMessage.type} sx={{ mt: 2, borderRadius: 2 }}>
            {gpsMessage.text}
          </Alert>
        )}
      </Paper>

      {/* 2. SYMMETRICAL PROFILE EDITING BOXES */}
      <Grid container spacing={3}>
        {/* BOX 1: PERSONAL & PROFESSIONAL PERSONA */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", borderColor: "#cbd5e1" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                1. व्यक्तिगत पहचान एवं व्यावसायिक श्रेणी
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                आपकी आधिकारिक 26-सीरीज़ आईडी इसी श्रेणी के आधार पर जनरेट होती है।
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="पूरा नाम (Full Name)"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="मोबाइल नंबर (Mobile)"
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ईमेल पता (Email)"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="जन्म वर्ष (Birth Year)"
                    placeholder="उदा. 1980"
                    value={profile.birthYear}
                    onChange={(e) => setProfile({ ...profile, birthYear: e.target.value })}
                    helperText={`गणना की गई उम्र: ${currentAge} वर्ष`}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="लिंग (Gender)"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <MenuItem value="Male">पुरुष (Male)</MenuItem>
                    <MenuItem value="Female">महिला (Female)</MenuItem>
                    <MenuItem value="Other">अन्य (Other)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="व्यावसायिक श्रेणी / पद (Active Professional Persona)"
                    value={profile.categoryCode5}
                    onChange={(e) => setProfile({ ...profile, categoryCode5: e.target.value })}
                  >
                    {activeCategories.map((cat) => (
                      <MenuItem key={cat.code5} value={cat.code5}>
                        [{cat.code5}] {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="पंजीकरण / बार काउंसिल / सदस्यता संख्या (Reg No.)"
                    placeholder="उदा. D/1042/1998 या ICAI/ICSI सदस्य संख्या"
                    value={profile.barOrRegNumber}
                    onChange={(e) => setProfile({ ...profile, barOrRegNumber: e.target.value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* BOX 2: PAN-INDIA REVENUE & RESIDENTIAL HIERARCHY */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", borderColor: "#cbd5e1" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                  2. राजस्व प्रशासनिक पता (State ➔ District ➔ Tehsil ➔ Village)
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                तहसील व गाँव पूरी तरह वैकल्पिक हैं; आप सीधे शहर और पिनकोड भी दर्ज कर सकते हैं।
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="राज्य (State / UT)"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  >
                    {states.map((st) => (
                      <MenuItem key={st.code || st.name} value={st.name}>
                        {st.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="जिला (District)"
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="तहसील / सब-डिवीज़न (Tehsil - Optional)"
                    value={profile.tehsil}
                    onChange={(e) => setProfile({ ...profile, tehsil: e.target.value })}
                  >
                    <MenuItem value="">-- तहसील छोड़ें / ड्रॉपडाउन चुनें --</MenuItem>
                    {availableTehsils.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="गाँव / मोहल्ला / वार्ड (Village / Ward - Optional)"
                    placeholder="उदा. छपरौला / सेक्टर 62"
                    value={profile.villageOrWard}
                    onChange={(e) => setProfile({ ...profile, villageOrWard: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="पिनकोड (Pincode)"
                    value={profile.pincode}
                    onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                    helperText="ऑटो-सुझाव (आप 1-क्लिक में खुद बदल सकते हैं)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="पूरा डाक पता (Full Postal Address)"
                    placeholder="मकान नंबर, गली, लैंडमार्क..."
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={savedSuccess ? <CheckCircleIcon /> : <SaveIcon />}
                onClick={handleSave}
                sx={{
                  bgcolor: savedSuccess ? "#16a34a" : "#1e40af",
                  "&:hover": { bgcolor: savedSuccess ? "#15803d" : "#1e3a8a" },
                  fontWeight: 800,
                  py: 1.3,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {savedSuccess ? "✓ प्रोफाइल सफलतापूर्वक सेव हुई!" : "💾 प्रोफाइल व पता सुरक्षित करें"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
