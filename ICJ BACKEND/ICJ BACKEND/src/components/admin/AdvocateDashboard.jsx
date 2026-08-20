import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import HistoryIcon from "@mui/icons-material/History";

import MemberService from "../../services/memberService";
import ActivityService from "../../services/activityService";

export default function AdvocateDashboard({ loggedInAdvocate, onUpdateAdvocate }) {
  const [leads, setLeads] = useState([]);
  const [walletBalance, setWalletBalance] = useState(loggedInAdvocate?.token_balance || 500);
  
  // Search & Filter state
  const [filterState, setFilterState] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterService, setFilterService] = useState("");
  
  // Stats
  const [unlockedLeadIds, setUnlockedLeadIds] = useState(loggedInAdvocate?.unlockedLeads || []);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const PROBLEM_CATEGORIES = [
    "Legal Dispute",
    "Criminal Matter",
    "Property / Real Estate / Land Dispute",
    "Consumer Complaint / Exploitation",
    "Cheque Bounce / Debt Recovery",
    "Taxation & Revenue Disputes"
  ];

  const INTAKE_SERVICES = [
    "Notary / नोटरी",
    "Drafting / ड्राफ्टिंग",
    "Writer/Typist / लिखने वाला",
    "Court Representation / कोर्ट पैरवी"
  ];

  const loadLeads = async () => {
    try {
      const filters = {
        state: filterState,
        category: filterCategory,
        service: filterService,
      };
      const matched = await MemberService.searchLeads(filters);
      setLeads(matched);
    } catch (err) {
      console.error("Failed to load leads:", err);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filterState, filterCategory, filterService]);

  const handleUnlockLead = async (lead) => {
    const unlockCost = 100;
    if (walletBalance < unlockCost) {
      setMsg({ type: "error", text: "अपर्याप्त वॉलेट बैलेंस! कृपया अधिक कॉइन्स खरीदने के लिए अपना वॉलेट रीचार्ज करें।" });
      return;
    }

    try {
      const updatedBalance = walletBalance - unlockCost;
      const updatedUnlocked = [...unlockedLeadIds, lead.id];
      
      await MemberService.update(loggedInAdvocate.id, {
        token_balance: updatedBalance,
        unlockedLeads: updatedUnlocked
      });

      setWalletBalance(updatedBalance);
      setUnlockedLeadIds(updatedUnlocked);
      setMsg({ type: "success", text: `लीड सफलतापूर्वक अनलॉक की गई! ₹${unlockCost} मूल्य के कॉइन्स डेबिट किए गए।` });
      
      ActivityService.create({
        title: `Advocate unlocked lead of ${lead.name || "Client"} (Cost: 100 Coins)`,
        type: "wallet",
      });

      if (onUpdateAdvocate) {
        onUpdateAdvocate({
          ...loggedInAdvocate,
          token_balance: updatedBalance,
          unlockedLeads: updatedUnlocked
        });
      }
    } catch (err) {
      setMsg({ type: "error", text: "लीड अनलॉक करने में असमर्थ। कृपया दोबारा कोशिश करें।" });
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Upper Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#fff" }}>
            <Box>
              <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">वॉलेट बैलेंस (Remaining Coins)</Typography>
              <Typography variant="h4" fontWeight="extrabold" sx={{ color: "#7c3aed", mt: 1 }}>🪙 {walletBalance} Coins</Typography>
            </Box>
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: "#c084fc" }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#fff" }}>
            <Box>
              <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">अनलॉक की गई कुल लीड्स (Total Unlocked)</Typography>
              <Typography variant="h4" fontWeight="extrabold" sx={{ color: "#16a34a", mt: 1 }}>{unlockedLeadIds.length} Leads</Typography>
            </Box>
            <LockOpenIcon sx={{ fontSize: 48, color: "#4ade80" }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#fff" }}>
            <Box>
              <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">सक्रिय बातचीत (Active Chats)</Typography>
              <Typography variant="h4" fontWeight="extrabold" sx={{ color: "#2563eb", mt: 1 }}>{unlockedLeadIds.length} Active</Typography>
            </Box>
            <HistoryIcon sx={{ fontSize: 48, color: "#60a5fa" }} />
          </Paper>
        </Grid>
      </Grid>

      {msg.text && (
        <Alert severity={msg.type} onClose={() => setMsg({ type: "", text: "" })} sx={{ mb: 3, borderRadius: 2 }}>
          {msg.text}
        </Alert>
      )}

      {/* Filter panel */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon color="primary" /> लीड्स फ़िल्टर करें (Search & Filter Leads)
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth select size="small"
              label="राज्य (State)"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <MenuItem value="">All States (सभी राज्य)</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
              <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
              <MenuItem value="Punjab">Punjab</MenuItem>
              <MenuItem value="Haryana">Haryana</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth select size="small"
              label="केस प्रकार (Category)"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="">All Categories (सभी श्रेणियां)</MenuItem>
              {PROBLEM_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth select size="small"
              label="आवश्यक सेवा (Service)"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <MenuItem value="">All Services (सभी सेवाएं)</MenuItem>
              {INTAKE_SERVICES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Leads matched grid */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>खोज परिणाम ({leads.length} Leads Matched)</Typography>
      <Grid container spacing={3}>
        {leads.map((lead) => {
          const isUnlocked = unlockedLeadIds.includes(lead.id);
          return (
            <Grid item xs={12} md={6} key={lead.id}>
              <Card elevation={1} sx={{ borderRadius: 3, border: isUnlocked ? "2px solid #22c55e" : "1px solid #e2e8f0" }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Chip label={lead.problemCategory || "General dispute"} size="small" color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
                    {(lead.intakeServices || []).map((s) => (
                      <Chip key={s} label={s} size="small" color="secondary" sx={{ fontWeight: "bold" }} />
                    ))}
                  </Stack>

                  <Typography variant="subtitle1" fontWeight="bold" color="#1e293b" gutterBottom>
                    लोकेशन: {lead.problemCity || "City Unknown"}, {lead.problemState} (Pincode: {lead.problemPincode || "N/A"})
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    "{lead.problemDescription || "कोई अतिरिक्त विवरण नहीं दिया गया।"}"
                  </Typography>

                  <Divider />

                  <Box sx={{ mt: 2 }}>
                    {isUnlocked ? (
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold" color="#16a34a" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CheckCircleIcon fontSize="small" /> लीड अनलॉक है (Lead Contact Details):
                        </Typography>
                        <Typography variant="body2"><strong>नाम:</strong> {lead.name}</Typography>
                        <Typography variant="body2"><strong>मोबाइल:</strong> {lead.mobile}</Typography>
                        <Typography variant="body2"><strong>ईमेल:</strong> {lead.email}</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                        <LockIcon fontSize="small" />
                        <Typography variant="caption">संपर्क विवरण छुपा हुआ है (Locked)</Typography>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                  {!isUnlocked && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleUnlockLead(lead)}
                      sx={{ fontWeight: "bold", borderRadius: 2 }}
                    >
                      Unlock Contact (100 Coins)
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
