import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Stack,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Container, Avatar, LinearProgress, Table, TableHead, TableBody, TableRow, TableCell
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/Campaign";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GavelIcon from "@mui/icons-material/Gavel";

import CampaignService from "../services/campaignService";
import TokenRateService from "../services/tokenRateService";
import useAuth from "../hooks/useAuth";

export default function Campaigns() {
  const { user } = useAuth();
  const memberId = user?.member_id || user?.id || "26ICJ08AA0001";
  const memberName = user?.name || "ICJ Member";

  const [campaigns, setCampaigns] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [units, setUnits] = useState("2");
  const [notes, setNotes] = useState("");

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const loadData = () => {
    try {
      const camps = CampaignService.getAll();
      const parts = CampaignService.getParticipationsForMember(memberId);
      const rate = TokenRateService.getCurrentRate();
      setCampaigns(camps);
      setParticipations(parts);
      setCurrentRate(rate);
    } catch (e) {
      console.error("Failed to load campaigns", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenPromise = (camp) => {
    setSelectedCamp(camp);
    setUnits("2");
    setNotes("");
    setOpenDialog(true);
  };

  const handleSubmitPromise = () => {
    if (!selectedCamp || !units || Number(units) <= 0) {
      setSnack({ open: true, msg: "कृपया वैध समय/इकाइयाँ दर्ज करें।", severity: "error" });
      return;
    }

    try {
      CampaignService.acceptCampaign({
        campaignId: selectedCamp.id,
        memberId,
        memberName,
        promisedUnits: units,
        notes,
      });
      setSnack({ open: true, msg: `✅ प्रॉमिस दर्ज हुआ! ${selectedCamp.rewardPerUnit * Number(units)} Token कार्य सत्यापन पर मिलेंगे।`, severity: "success" });
      setOpenDialog(false);
      loadData();
    } catch (e) {
      setSnack({ open: true, msg: e.message, severity: "error" });
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      {/* Hero Banner */}
      <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4c1d95 100%)", color: "white", py: 5, px: 3, boxShadow: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 60, height: 60 }}>
              <CampaignIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">ICJ Campaign Earning Portal</Typography>
              <Typography variant="h6" sx={{ color: "#93c5fd" }}>
                काम का वादा करें → समाज की सेवा करें → टोकन कमाएँ (1 Token = ₹{currentRate?.tokenToInr || 10})
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* Active Campaigns Grid */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="#0f172a" mb={3}>
            📢 उपलब्ध समाज सेवा अभियानों में भाग लें (Active Campaigns)
          </Typography>

          <Grid container spacing={3}>
            {campaigns.map((camp) => (
              <Grid item xs={12} md={6} key={camp.id}>
                <Card elevation={2} sx={{ borderRadius: 3, height: "100%", borderLeft: "6px solid #1e3a8a", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" fontWeight="bold" color="#1e3a8a">{camp.title}</Typography>
                      <Chip label={`${camp.rewardPerUnit} Token / unit`} sx={{ bgcolor: "#fef3c7", color: "#b45309", fontWeight: "bold" }} />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" mb={2}>{camp.description}</Typography>

                    <Stack spacing={0.5} mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>शर्त (Eligibility):</strong> {camp.qualificationNeeded}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>इकाई (Unit):</strong> {camp.unitLabel}
                      </Typography>
                      <Typography variant="caption" color="#059669" fontWeight="bold">
                        मूल्य: ₹{camp.rewardPerUnit * (currentRate?.tokenToInr || 10)} प्रति इकाई
                      </Typography>
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleOpenPromise(camp)}
                      sx={{ bgcolor: "#1e3a8a", fontWeight: "bold", "&:hover": { bgcolor: "#1e40af" } }}
                    >
                      🤝 मैं यह काम करूँगा (Accept Promise)
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Member Participation History */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="#0f172a" mb={2}>
            📋 मेरी भागिदारियाँ एवं अर्जित टोकन (My Campaign History)
          </Typography>

          {participations.length === 0 ? (
            <Alert severity="info" icon={<HourglassEmptyIcon />}>
              आपने अभी किसी अभियान में भाग नहीं लिया है। ऊपर दिए गए अभियानों में से किसी एक को स्वीकार करें।
            </Alert>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    {["Participation ID", "अभियान", "प्रॉमिस इकाइयाँ", "संभावित टोकन", "INR मूल्य", "स्थिति", "स्वीकृति तिथि"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: "#1e3a8a", whiteSpace: "nowrap" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participations.map((p) => (
                    <TableRow key={p.participationId} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{p.participationId}</TableCell>
                      <TableCell fontWeight={600}>{p.campaignTitle}</TableCell>
                      <TableCell align="center">{p.promisedUnits}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${p.expectedTokens} Tokens`} size="small" sx={{ bgcolor: "#fef3c7", color: "#b45309", fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>₹{(p.expectedTokens * (currentRate?.tokenToInr || 10)).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.status === "WORK_IN_PROGRESS" ? "कार्य प्रगति पर" : "सत्यापित एवं क्रेडिट ✅"}
                          size="small"
                          color={p.status === "WORK_IN_PROGRESS" ? "warning" : "success"}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{new Date(p.acceptedAt).toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Promise Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1e3a8a", color: "#fff" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HandshakeIcon /> <span>अभियान का कार्य प्रॉमिस करें</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedCamp && (
            <Stack spacing={2}>
              <Alert severity="info" icon={<GavelIcon />}>
                आप <strong>{selectedCamp.title}</strong> के लिए प्रॉमिस दर्ज कर रहे हैं।
                कार्य पूरा और सत्यापित होने पर टोकन सीधे आपके वॉलेट में क्रेडिट होंगे।
              </Alert>

              <TextField
                fullWidth
                type="number"
                label={`कितनी इकाइयाँ / घंटे कार्य करेंगे? (${selectedCamp.unitLabel})`}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="अतिरिक्त टिप्पणी / समय स्लॉट"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. मैं प्रतिदिन दोपहर 2 से 4 बजे कॉल अटेंड करूँगा"
              />

              {units && (
                <Paper sx={{ p: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="#059669" fontWeight="bold">
                    💰 कुल टोकन रिवॉर्ड: {Number(units) * selectedCamp.rewardPerUnit} Tokens
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    INR Value: ₹{(Number(units) * selectedCamp.rewardPerUnit * (currentRate?.tokenToInr || 10)).toLocaleString("en-IN")}
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>रद्द करें</Button>
          <Button variant="contained" onClick={handleSubmitPromise} sx={{ bgcolor: "#1e3a8a" }}>✅ प्रॉमिस दर्ज करें</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

function HandshakeIcon() {
  return <CampaignIcon />;
}
