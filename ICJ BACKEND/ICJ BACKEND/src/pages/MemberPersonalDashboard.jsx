import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Avatar,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

import VirtualOfficeService from "../services/virtualOfficeService";
import MainLayout from "../layouts/MainLayout.jsx";
import useAuth from "../hooks/useAuth.js";

export default function MemberPersonalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const memberName = useMemo(() => {
    const prefix = user?.namePrefix || user?.name_prefix || "";
    const name = user?.fullName || user?.full_name || user?.name || "Member";
    return prefix && !name.startsWith(prefix) ? `${prefix} ${name}` : name;
  }, [user]);

  const memberId = user?.member_id || user?.memberId || user?.id || "ICJ-M-2026-MEMBER";
  const memberLevel = (user?.member_level || user?.memberLevel || "PRO").toUpperCase();
  const memberType = (user?.member_type || user?.memberType || "Individual").toUpperCase();

  const memberAge = user?.age || (user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : (user?.birthYear ? new Date().getFullYear() - Number(user.birthYear) : 38));
  const memberGender = user?.gender || "Male";
  const memberDob = user?.dob || (user?.birthYear ? `15-May-${user.birthYear}` : "15-May-1988");
  const memberMobile = user?.mobile || "+91 9876543210";
  const memberWhatsapp = user?.whatsapp || user?.mobile || "+91 9876543210";

  const [extraTokens, setExtraTokens] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const handleRequestDemoTokens = () => {
    setExtraTokens((prev) => prev + 10);
    setToastMsg("🎁 10 FREE ICJ Welcome Demo Tokens credited to your Wallet by ICJ Trust!");
  };

  const activeCasesCount = user?.activeCasesCount ?? 3;
  const resolvedCasesCount = user?.resolvedCasesCount ?? 8;
  const nextHearingDate = user?.nextHearingDate || "12 Aug 2026 (High Court Bench 4)";
  const walletBalance = user?.wallet_balance ?? 25000;
  const tokenBalance = (user?.token_balance ?? 10) + extraTokens;
  const aiDraftsCount = user?.aiDraftsCount ?? 12;
  const vaultDocsCount = user?.vaultDocsCount ?? 8;

  const seniorMentor = user?.seniorMentor || (user?.username === "ICJMember1234" || user?.member_id === "ICJ/7/MEM-000001/BASIC" ? "Adv. Ramesh Chandra Verma (Senior Advocate & Mentor)" : "Not Assigned (Independent Practice)");
  const juniorsList = user?.juniorsList || (user?.username === "ICJMember1234" || user?.member_id === "ICJ/7/MEM-000001/BASIC" ? ["Pooja Verma (Junior Associate)", "Siddharth Mehta (Legal Intern)"] : []);
  const firmName = user?.organisation || user?.firmName || user?.orgName || (user?.regType === "Organisation" ? user?.name : "Independent Legal Practice");
  const officeData = VirtualOfficeService.getOfficeForMember(memberId, memberName);

  return (
    <MainLayout>
      <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>

        {/* 1. PERSONAL MEMBER HEADER BANNER */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "#ffffff",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#047857",
                    width: 60,
                    height: 60,
                    fontWeight: "bold",
                    fontSize: "1.4rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {memberName.charAt(0)}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" fontWeight="bold">
                      Welcome, {memberName}!
                    </Typography>
                    <VerifiedIcon sx={{ color: "#34d399" }} />
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.3 }}>
                    Member ID: <strong>{memberId}</strong> | Type: <strong>{memberType}</strong>
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                <Chip label={`Tier: ${memberLevel}`} color="secondary" sx={{ fontWeight: 800 }} />
                <Chip label="Status: Active" color="success" sx={{ fontWeight: 800 }} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* 2. PERSONAL PARTICULARS & HIERARCHY */}
        <Grid container spacing={3} sx={{ mb: 3 }}>

          {/* PERSONAL DETAILS CARD */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    My Personal Particulars
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Full Name & Title
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {memberName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Member User ID
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace" }}>
                      {memberId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Gender / Age
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {memberGender} ({memberAge} yrs)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Date of Birth
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {memberDob}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Mobile Number
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{memberMobile}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      WhatsApp Number
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {memberWhatsapp}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Email Address
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{user?.email || "member@icj.org"}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography color="text.secondary" variant="caption" display="block">
                      Firm / Organisation
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      <BusinessIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                      {firmName}
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BadgeIcon />}
                  sx={{ mt: 2.5 }}
                  onClick={() => navigate("/member-profile")}
                >
                  View Full ID Card & Credentials
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* MENTORSHIP & JUNIOR HIERARCHY */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <GroupsIcon color="secondary" />
                  <Typography variant="h6" fontWeight="bold">
                    Mentorship & Practice Hierarchy
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2.5, p: 2, bgcolor: "#f8fafc", borderRadius: 2, borderLeft: "4px solid #2563eb" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    SENIOR COUNSEL / MENTOR
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    {seniorMentor}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, borderLeft: "4px solid #10b981" }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom sx={{ mt: 1 }}>
                    JUNIOR ASSOCIATES & LEGAL INTERNS TEAM ({officeData?.juniorsList?.length || 0})
                  </Typography>
                  {(officeData?.juniorsList || []).length > 0 ? (
                    <Stack spacing={1.5}>
                      {officeData.juniorsList.map((jr) => (
                        <Paper key={jr.id || jr.memberId} variant="outlined" sx={{ p: 1, borderRadius: 2, bgcolor: "#f0fdf4" }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar src={jr.photoUrl} alt={jr.name} sx={{ width: 34, height: 34, bgcolor: "#059669", fontSize: "0.8rem", fontWeight: "bold" }}>
                              {jr.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" fontWeight="bold" display="block">
                                {jr.name} ({jr.designation})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {jr.memberId} | 📍 {jr.assignedOffice}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No Junior Associates Added Yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* 3. LEGAL CASES, WALLET & BENEFITS STATS */}
        <Grid container spacing={3}>

          {/* COURT CASES CARD */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderTop: "4px solid #2563eb", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  COURT CASES FIGHTING
                </Typography>
                <GavelIcon color="primary" />
              </Stack>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                {activeCasesCount} Active
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Resolved / Won: <strong>{resolvedCasesCount} Cases</strong>
              </Typography>
              <Typography variant="caption" color="error.main" fontWeight="bold" display="block" sx={{ mb: 2 }}>
                <CalendarMonthIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                Next Hearing: {nextHearingDate}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button size="small" variant="contained" onClick={() => navigate("/client-portal")}>
                  My Court Cases Desk
                </Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => navigate("/advocate-dashboard")} sx={{ fontWeight: "bold" }}>
                  ⚖️ View Empaneled Advocate Desk (वकील का पोर्टल)
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* WALLET & TOKENS CARD */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderTop: "4px solid #10b981", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  MY ICJ WALLET & TOKENS
                </Typography>
                <AccountBalanceWalletIcon color="success" />
              </Stack>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 0.5 }}>
                ₹{walletBalance.toLocaleString("en-IN")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                ICJ Tokens Balance: <strong>{tokenBalance} Tokens</strong>
              </Typography>

              <Stack spacing={1}>
                <Button size="small" variant="contained" color="warning" startIcon={<CardGiftcardIcon />} onClick={handleRequestDemoTokens} sx={{ fontWeight: "bold" }}>
                  Request 10 Demo Tokens 🎁
                </Button>
                <Button size="small" variant="outlined" color="success" onClick={() => navigate("/member-wallet")}>
                  View Wallet & Ledger Passbook
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* PLATFORM MODULE BENEFITS */}
          <Grid item xs={12} sm={12} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderTop: "4px solid #8b5cf6", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  PLATFORM MODULE BENEFITS
                </Typography>
                <SmartToyIcon sx={{ color: "#8b5cf6" }} />
              </Stack>

              <Stack spacing={1.5} sx={{ my: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">
                    <SmartToyIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                    AI Legal Drafts Created:
                  </Typography>
                  <Chip label={`${aiDraftsCount} Drafts`} size="small" color="secondary" />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">
                    <FolderIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                    Document Vault Uploads:
                  </Typography>
                  <Chip label={`${vaultDocsCount} Files`} size="small" color="info" />
                </Box>
              </Stack>

              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => navigate("/ai-drafter")}>
                Open AI Legal Drafter
              </Button>
            </Paper>
          </Grid>

        </Grid>

      </Box>

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setToastMsg("")} sx={{ fontWeight: "bold" }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
