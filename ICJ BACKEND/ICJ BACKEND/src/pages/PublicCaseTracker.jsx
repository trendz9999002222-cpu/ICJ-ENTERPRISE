import React, { useState, useEffect, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Typography, Grid, Card, TextField, Button, Stack, Chip, Paper, Divider, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import EventIcon from "@mui/icons-material/Event";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LegalService from "../services/legalService.js";
import JudiciaryMasterService from "../services/judiciaryMasterService.js";

export default function PublicCaseTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCases, setAllCases] = useState([]);

  useEffect(() => {
    LegalService.getAll().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setAllCases(list);
      } else {
        setAllCases([
          {
            id: "CASE-2026-001",
            caseNumber: "WP(C)/2026/8942",
            cnrNumber: "UPGZ010012342026",
            title: "Ramvir Jatav vs. State of UP & Ors.",
            clientName: "Ramvir Jatav",
            advocateName: "Senior Advocate PAWAN GUPTA",
            courtName: "High Court of Judicature at Allahabad (Prayagraj Principal Seat)",
            status: "Hearing",
            nextHearing: "2026-09-15",
            clientSide: "SIDE_A",
          },
          {
            id: "CASE-2026-002",
            caseNumber: "CP/2026/1044",
            cnrNumber: "DLHC010043212026",
            title: "Suresh Sharma vs. Apex Realtech Infra Ltd.",
            clientName: "Suresh Sharma",
            advocateName: "Advocate Ananya Sharma",
            courtName: "State Consumer Disputes Redressal Commission (SCDRC Delhi)",
            status: "Pending",
            nextHearing: "2026-09-22",
            clientSide: "SIDE_A",
          },
        ]);
      }
    }).catch(() => {});
  }, []);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allCases;
    return allCases.filter((c) => {
      return (
        String(c.caseNumber || "").toLowerCase().includes(term) ||
        String(c.cnrNumber || "").toLowerCase().includes(term) ||
        String(c.title || "").toLowerCase().includes(term) ||
        String(c.clientName || "").toLowerCase().includes(term) ||
        String(c.advocateName || "").toLowerCase().includes(term) ||
        String(c.courtName || "").toLowerCase().includes(term) ||
        String(c.id || "").toLowerCase().includes(term)
      );
    });
  }, [searchTerm, allCases]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#0f172a", pb: 8 }}>
      <Box sx={{ bgcolor: "#064e3b", color: "#ffffff", py: 1, px: 2, borderBottom: "2px solid #059669" }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#a7f3d0" }}>
              ICJ PUBLIC CASE & CNR TRACKING PORTAL • केस स्थिति एवं कॉज लिस्ट
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: 0.5 }}>
              <PhoneInTalkIcon sx={{ fontSize: 14, color: "#34d399" }} /> हेल्पलाइन: +91 7053002222 / 9999002222
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#ffffff", borderBottom: "1.5px solid #e2e8f0", py: 1.8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Button component={RouterLink} to="/" variant="outlined" size="small" startIcon={<ArrowBackIcon />} sx={{ borderRadius: "20px", fontWeight: 800, textTransform: "none" }}>
                मुख्य होमपेज
              </Button>
              <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                सार्वजनिक केस ट्रैकिंग पोर्टल (Public Case Tracker)
              </Typography>
            </Stack>
            <Button component={RouterLink} to="/join" variant="contained" size="small" sx={{ borderRadius: "20px", fontWeight: 900, textTransform: "none", bgcolor: "#047857", "&:hover": { bgcolor: "#065f46" } }}>
              + नया केस दर्ज करें
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: "24px", bgcolor: "#ffffff", border: "2px solid #cbd5e1", boxShadow: "0 6px 24px rgba(0,0,0,0.05)", mb: 4 }}>
          <Typography variant="h5" fontWeight={900} color="#0f172a" sx={{ mb: 1, textAlign: "center" }}>
            अपना केस या eCourts CNR नंबर खोजें
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            16-अंकों का CNR नंबर (जैसे: UPGZ010012342026), केस नंबर, या वादी/क्लाइंट का नाम दर्ज करें:
          </Typography>
          <TextField
            fullWidth
            placeholder="Search by 16-Digit CNR, Case No, Party Name, Court Name, or Advocate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#1a73e8", fontSize: 28 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <Button size="small" onClick={() => setSearchTerm("")} sx={{ fontWeight: 800 }}>
                  Clear
                </Button>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px", fontSize: "1rem", p: 0.5, bgcolor: "#f8fafc" } }}
          />
        </Paper>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={900} color="#1e293b">
            सक्रिय केस परिणाम ({searchResults.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            लाइव ऑल-इंडिया कॉज लिस्ट एवं न्यायिक स्टेटस
          </Typography>
        </Stack>

        {searchResults.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: "20px", bgcolor: "#fff", border: "1.5px solid #e2e8f0" }}>
            <Typography variant="h6" fontWeight={800} color="#64748b" sx={{ mb: 1 }}>
              कोई केस रिकॉर्ड नहीं मिला
            </Typography>
            <Button component={RouterLink} to="/join" variant="contained" sx={{ borderRadius: "24px", bgcolor: "#047857", fontWeight: 800 }}>
              नया केस दर्ज करें (Free Filing)
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {searchResults.map((c) => (
              <Card key={c.id} variant="outlined" sx={{ borderRadius: "20px", bgcolor: "#ffffff", borderColor: "#cbd5e1", borderWidth: 2, boxShadow: "0 4px 14px rgba(0,0,0,0.04)", p: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ bgcolor: "#dbeafe", color: "#1e40af", px: 1, py: 0.3, borderRadius: "8px", fontWeight: 900 }}>
                        {c.id}
                      </Typography>
                      {c.cnrNumber && (
                        <Typography variant="caption" sx={{ bgcolor: "#f3e8ff", color: "#6b21a8", px: 1, py: 0.3, borderRadius: "8px", fontWeight: 900 }}>
                          CNR: {c.cnrNumber}
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="h6" fontWeight={900} color="#0f172a">
                      {c.title}
                    </Typography>
                  </Box>
                  <Chip label={c.status || "Active"} color="success" size="small" sx={{ fontWeight: 900, borderRadius: "14px" }} />
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      अदालत एवं पीठ:
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">
                      {c.courtName || "High Court of Judicature"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      अधिकृत लीड एडवोकेट:
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#1a73e8">
                      {c.advocateName || "Senior Advocate PAWAN GUPTA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      अगली सुनवाई की तारीख:
                    </Typography>
                    <Typography variant="body2" fontWeight={900} color="#b45309" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EventIcon sx={{ fontSize: 16 }} /> {c.nextHearing || "Listed for Next Session"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      पक्षकार प्रतिनिधित्व:
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#047857">
                      {c.clientSide === "SIDE_B" ? "प्रतिवादी पक्ष (Defendant / Respondent)" : "वादी पक्ष (Petitioner / Plaintiff - Our Client)"}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}