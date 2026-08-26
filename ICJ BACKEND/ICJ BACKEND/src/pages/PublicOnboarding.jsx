import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

// Icons
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GavelIcon from "@mui/icons-material/Gavel";

import CategoryEnrollmentService from "../services/categoryEnrollmentService.js";
import TelemetryIdService from "../services/telemetryIdService.js";
import GpsLocationService from "../services/gpsLocationService.js";

export default function PublicOnboarding() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    categoryCode5: "CLINT", // Default Litigant / Citizen
    state: "Delhi",
    district: "New Delhi",
    tehsil: "",
    villageOrWard: "",
    pincode: "110001",
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stealth active categories only (No 'Coming Soon' hints)
  const activeCategories = CategoryEnrollmentService.getPublicActiveCategories();

  // 1-Click GPS Quick Fill
  const handleAutoFillGps = async () => {
    setLoadingGps(true);
    setGpsMessage("");
    try {
      const geo = await GpsLocationService.getCurrentLocationAddress();
      setForm((prev) => ({
        ...prev,
        state: geo.state || prev.state,
        district: geo.district || prev.district,
        tehsil: geo.tehsil || prev.tehsil,
        villageOrWard: geo.villageOrCity || prev.villageOrWard,
        pincode: geo.pincode || prev.pincode,
      }));
      setGpsMessage(`📍 GPS से पता स्वतः भर गया: ${geo.district} (${geo.pincode})`);
    } catch (err) {
      setGpsMessage(err.message || "GPS लोकेशन प्राप्त नहीं हो सकी।");
    } finally {
      setLoadingGps(false);
    }
  };

  // 1-Click Instant Registration & Direct Portal Entry
  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.mobile.trim()) {
      setErrorMsg("कृपया अपना पूरा नाम और मोबाइल नंबर दर्ज करें।");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // Generate 26-Series Dual-Telemetry ID
      const newMemberId = TelemetryIdService.generateMemberId(form.categoryCode5);
      const currentYear = new Date().getFullYear();

      const newUser = {
        id: newMemberId,
        member_id: newMemberId,
        memberId: newMemberId,
        fullName: form.fullName.trim(),
        name: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim() || `${form.mobile.trim()}@icj.org`,
        categoryCode5: form.categoryCode5,
        role: form.categoryCode5.startsWith("ADV") || form.categoryCode5 === "SRADV" ? "advocate" : form.categoryCode5 === "CLINT" ? "client" : "member",
        user_type: form.categoryCode5.startsWith("ADV") ? "advocate" : form.categoryCode5 === "CLINT" ? "client" : "member",
        state: form.state,
        district: form.district,
        tehsil: form.tehsil,
        villageOrWard: form.villageOrWard,
        pincode: form.pincode,
        created_at: new Date().toISOString(),
      };

      // Save user session
      localStorage.setItem("icj_user", JSON.stringify(newUser));

      // Append to members list
      try {
        const rawMembers = localStorage.getItem("icj_members");
        const list = rawMembers ? JSON.parse(rawMembers) : [];
        localStorage.setItem("icj_members", JSON.stringify([newUser, ...list]));
      } catch (err) {
        console.warn(err);
      }

      // Instant redirect based on role
      setTimeout(() => {
        if (newUser.role === "advocate") {
          navigate("/advocate-portal");
        } else if (newUser.role === "client") {
          navigate("/client-portal");
        } else {
          navigate("/member-dashboard");
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setErrorMsg("पंजीकरण में त्रुटि आई। कृपया पुनः प्रयास करें।");
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0f172a",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 540,
          p: 4,
          borderRadius: 3.5,
          bgcolor: "#ffffff",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
          <GavelIcon sx={{ color: "#1e3a8a", fontSize: 36 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              🏛️ त्वरित विधिक पंजीकरण (1-Click Instant Onboarding)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              140 करोड़ भारतीयों के लिए सरल, बाधा-रहित डिजिटल प्रवेश
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {gpsMessage && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {gpsMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister}>
          <Stack spacing={2.2}>
            {/* 1. Full Name */}
            <TextField
              fullWidth
              size="medium"
              label="पूरा नाम (Full Name) *"
              placeholder="उदा. राजेश कुमार"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />

            {/* 2. Mobile */}
            <TextField
              fullWidth
              size="medium"
              label="मोबाइल नंबर (Mobile Number) *"
              placeholder="+91 9876543210"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
            />

            {/* 3. Email */}
            <TextField
              fullWidth
              size="medium"
              label="ईमेल पता (Email Address - Optional)"
              placeholder="name@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* 4. Role / Persona Selector */}
            <TextField
              select
              fullWidth
              size="medium"
              label="आपकी भूमिका / श्रेणी (Select Category / Role) *"
              value={form.categoryCode5}
              onChange={(e) => setForm({ ...form, categoryCode5: e.target.value })}
              required
            >
              {activeCategories.map((cat) => (
                <MenuItem key={cat.code5} value={cat.code5}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            {/* 5. 1-Click GPS Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={loadingGps ? <CircularProgress size={18} /> : <MyLocationIcon />}
              onClick={handleAutoFillGps}
              disabled={loadingGps}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                color: "#16a34a",
                borderColor: "#16a34a",
                "&:hover": { borderColor: "#15803d", bgcolor: "#f0fdf4" },
              }}
            >
              {loadingGps ? "GPS से पता खोज रहा है..." : "📍 मेरी लोकेशन से पता भरें (GPS Auto-Fill)"}
            </Button>

            {/* 6. Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
              sx={{
                bgcolor: "#1e3a8a",
                "&:hover": { bgcolor: "#1e40af" },
                fontWeight: 800,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                textTransform: "none",
                mt: 1,
              }}
            >
              {submitting ? "आईडी जनरेट हो रही है..." : "पंजीकरण करें एवं पोर्टल में प्रवेश करें →"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
