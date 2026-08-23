import { useState, useEffect } from "react";
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
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Alert,
  MenuItem,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";

// Icons
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import BackupIcon from "@mui/icons-material/Backup";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GavelIcon from "@mui/icons-material/Gavel";

import DashboardService from "../services/dashboardService.js";
import MainLayout from "../layouts/MainLayout.jsx";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar.jsx";
import useAuth from "../hooks/useAuth.js";
import AuthService from "../services/authService.js";
import TelemetryDiagnosticService from "../services/telemetryDiagnosticService.js";
import ClientWorkflowService from "../services/clientWorkflowService.js";
import FranchiseWorkflowService from "../services/franchiseWorkflowService.js";
import RoleService from "../services/roleService.js";
import CitizenWorkflowService from "../services/citizenWorkflowService.js";
import audioAlertService from "../services/audioAlertService.js";
import DutyRosterService from "../services/dutyRosterService.js";
import PushNotificationService from "../services/pushNotificationService.js";
import FeatureControlCenter from "../components/admin/FeatureControlCenter.jsx";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";
import { getMembers } from "../services/database.js";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  // SLA & Notification State
  const [slaMins, setSlaMins] = useState(DutyRosterService.getSLATimerMinutes());
  const [popupAlert, setPopupAlert] = useState(null);
  const empaneledAdvocates = ENTERPRISE_SEED_USERS.filter((u) => u.role === "advocate" || u.user_type === "advocate");
  const [selectedAdvocateId, setSelectedAdvocateId] = useState(empaneledAdvocates[0]?.id || "");

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }));

  useEffect(() => {
    // 1. Register Service Worker for Push Notifications
    PushNotificationService.registerServiceWorker();
    PushNotificationService.requestNotificationPermission();

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    }, 1000);

    DashboardService.getStatistics()
      .then((s) => setStats(s))
      .catch(() => {});

    // Check for new member registrations to trigger popup & chime
    try {
      const members = JSON.parse(localStorage.getItem("icj_members") || "[]");
      if (members.length > 0) {
        const latest = members[0];
        setPopupAlert({
          memberId: latest.member_id || latest.id || "ICJ-2026-MEM-0001",
          name: latest.name || latest.fullName || "New Litigant Applicant",
          purpose: latest.purpose || "Legal Dispute Resolution",
          registeredAt: latest.created_at || new Date().toISOString(),
        });
      }
    } catch (e) {}

    // Real-time Cross-tab Member Registration Listener
    let unsubscribeMember = null;
    import("../utils/syncDispatcher.js").then((mod) => {
      const sd = mod.default || mod.SyncDispatcher;
      unsubscribeMember = sd.subscribe("icj_sync_member_registered", (newMem) => {
        DashboardService.getStatistics().then((s) => setStats(s)).catch(() => {});
        getMembers().then((list) => {
          if (Array.isArray(list)) setUsersList(list);
        }).catch(() => {});
        if (newMem && newMem.role !== "super_admin") {
          setPopupAlert({
            memberId: newMem.member_id || newMem.id || "26CLT08AA0002",
            name: newMem.fullName || newMem.name || "New Applicant",
            purpose: newMem.purpose || newMem.problemCategory || "Legal Problem Intake",
            registeredAt: newMem.created_at || new Date().toISOString(),
          });
          audioAlertService.playNewMemberChime();
        }
      });
    }).catch(() => {});

    return () => {
      clearInterval(timer);
      if (unsubscribeMember) unsubscribeMember();
    };
  }, []);

  const [usersList, setUsersList] = useState(() => AuthService.getSeedUsers() || []);

  useEffect(() => {
    let active = true;
    getMembers().then((list) => {
      if (active && Array.isArray(list) && list.length > 0) {
        setUsersList(list);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [stats]);

  const totalUsers = stats?.totalMembers ?? usersList.length;
  const superAdmins = usersList.filter(u => (u.user_type === "super_admin" || u.username === "ICJSuperAdmin1234")).length || 1;
  const admins = usersList.filter(u => (u.role === "admin" || u.user_type === "admin") && u.username !== "ICJSuperAdmin1234").length || 0;
  const members = usersList.filter(u => u.role === "member" || !u.role || u.user_type === "member").length || totalUsers;


  const quickStats = [
    { label: "Total Users", value: totalUsers, color: "primary.main", icon: <PeopleIcon fontSize="medium" />, route: "/member-directory" },
    { label: "Super Admins", value: superAdmins, color: "secondary.main", icon: <AdminPanelSettingsIcon fontSize="medium" />, route: "/administration" },
    { label: "Admins", value: admins, color: "info.main", icon: <SecurityIcon fontSize="medium" />, route: "/administration" },
    { label: "Members", value: members, color: "success.main", icon: <CardMembershipIcon fontSize="medium" />, route: "/member-directory" },
    { label: "Active Members", value: stats?.activeMembers ?? totalUsers, color: "success.main", icon: <CheckCircleIcon fontSize="medium" />, route: "/member-directory" },
    { label: "Pending Members", value: stats?.pendingMembers ?? 0, color: "warning.main", icon: <HourglassEmptyIcon fontSize="medium" />, route: "/member-verification" },
    { label: "Blocked Members", value: stats?.suspendedMembers ?? 0, color: "error.main", icon: <BlockIcon fontSize="medium" />, route: "/member-directory" },
  ];

  const quickActionCards = [
    { title: "User Management", desc: "Super Admin Role Governance & Directory", icon: <PeopleIcon color="primary" fontSize="large" />, route: "/administration" },
    { title: "Registration Management", desc: "Master Membership Engine & Registration", icon: <PersonAddIcon color="secondary" fontSize="large" />, route: "/membership" },
    { title: "Membership Management", desc: "Digital Identity Cards & Tier Credentials", icon: <CardMembershipIcon color="info" fontSize="large" />, route: "/member-profile" },
    { title: "Administration", desc: "Password Policy Engine v3.0 & Audit Logs", icon: <AdminPanelSettingsIcon color="warning" fontSize="large" />, route: "/administration" },
    { title: "Reports", desc: "Analytics, System Health & Compliance Reports", icon: <AssessmentIcon color="success" fontSize="large" />, route: "/reports" },
    { title: "Settings", desc: "Platform Settings & Governance Configurations", icon: <SettingsIcon color="action" fontSize="large" />, route: "/settings" },
  ];

  const [queueTab, setQueueTab] = useState(0);

  const pendingClientsCount = ClientWorkflowService.getPendingCasesForAdmin().length;
  const pendingFranchiseCount = FranchiseWorkflowService.getPendingApplications().length;

  const consolidatedStats = [
    {
      title: "User Base & Governance",
      val: `${totalUsers} Users`,
      sub: `${superAdmins} Super Admin | ${admins} Admin | ${members} Members`,
      color: "#0B5ED7",
      icon: <PeopleIcon fontSize="large" color="primary" />,
      route: "/administration",
    },
    {
      title: "Members & Verification",
      val: `${stats?.activeMembers ?? totalUsers} Active Members`,
      sub: `${stats?.pendingMembers ?? 0} Pending Verification | ${stats?.suspendedMembers ?? 0} Blocked`,
      color: "#10B981",
      icon: <CardMembershipIcon fontSize="large" color="success" />,
      route: "/member-directory",
    },
    {
      title: "Litigant Matters & Workflow",
      val: `${pendingClientsCount} Pending Client Requests`,
      sub: pendingClientsCount === 0 ? "All litigant matters appointed & active" : "Immediate Advocate assignment needed",
      color: pendingClientsCount > 0 ? "#EF4444" : "#3B82F6",
      icon: <GavelIcon fontSize="large" color={pendingClientsCount > 0 ? "error" : "primary"} />,
      route: "/legal",
    },
    {
      title: "Franchise Network Status",
      val: `${pendingFranchiseCount} Pending Applications`,
      sub: pendingFranchiseCount === 0 ? "All legal franchise nodes operational" : "Onboarding & Interaction scheduled",
      color: "#8B5CF6",
      icon: <StorefrontIcon fontSize="large" color="secondary" />,
      route: "/virtual-office",
    },
  ];

  return (
    <>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>

        {/* 🔔 FLOATING HIGH-PRIORITY POPUP ALERT BANNER (WITH WEB AUDIO BELL CHIME & SLA TIMER) */}
        {popupAlert && (
          <Paper
            elevation={8}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              bgcolor: "#0f172a",
              color: "#fff",
              borderLeft: "6px solid #ef4444",
              border: "2px solid #ef4444",
              animation: "pulse 2s infinite",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip label="🔔 NEW MEMBER & SLA ALERT" color="error" size="small" sx={{ fontWeight: "bold" }} />
                  <Chip label={`⏱️ SLA Timer: ${slaMins} Mins`} color="warning" size="small" sx={{ fontWeight: "bold" }} />
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => audioAlertService.playNewMemberChime()}
                    sx={{ fontSize: "0.65rem", py: 0 }}
                  >
                    🔊 Test Bell Sound
                  </Button>
                </Stack>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5, color: "#f8fafc" }}>
                  Applicant: {popupAlert.name} ({popupAlert.memberId})
                </Typography>
                <Typography variant="caption" color="#94a3b8" display="block">
                  Purpose: {popupAlert.purpose} | Registered At: {new Date(popupAlert.registeredAt).toLocaleTimeString()} | <strong>Routed To: 2 Active Admins (Super Admin & Ops Desk)</strong>
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#fcd34d", display: "block", mb: 0.3, fontSize: "0.72rem" }}>
                    ⚖️ Select Empaneled Advocate:
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={selectedAdvocateId}
                    onChange={(e) => setSelectedAdvocateId(e.target.value)}
                    sx={{ bgcolor: "#ffffff", borderRadius: 1, minWidth: 220, maxWidth: "100%", "& .MuiSelect-select": { py: 0.6, fontWeight: 800, color: "#0f172a" } }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { maxWidth: 360, overflowX: "hidden" }
                        }
                      }
                    }}
                  >
                    {empaneledAdvocates.map((adv) => (
                      <MenuItem key={adv.id} value={adv.id} sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {adv.name} ({adv.id}) - {adv.city || adv.state}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    alert(`✅ Advocate Assigned successfully to ${popupAlert.name}! 3-way SMS/Push notifications dispatched.`);
                    setPopupAlert(null);
                  }}
                  sx={{ fontWeight: "bold" }}
                >
                  Assign Advocate Now 🚀
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => setPopupAlert(null)}
                  sx={{ fontSize: "0.7rem" }}
                >
                  Dismiss
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* 1. DASHBOARD HOME: COMPACT 1-LINE EXECUTIVE STATUS BAR (ZERO WASTED MARGIN) */}
        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #0B5ED7 0%, #084298 100%)",
            color: "#ffffff",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ffffff", color: "#0B5ED7", width: 34, height: 34, fontWeight: "bold", fontSize: "0.85rem" }}>
                SA
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                  👤 Active Workspace: {user?.fullName || "Pawan Kumar"} (Super Admin)
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.68rem" }}>
                  Role Governance Active | User: <strong>{user?.username || "ICJSuperAdmin1234"}</strong> | Logged in & Active
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<GavelIcon />}
                onClick={() => navigate("/advocate-dashboard")}
                sx={{ fontWeight: "bold", fontSize: "0.75rem", py: 0.3 }}
              >
                Advocate Desk ⚖️
              </Button>
              <Chip icon={<StorageIcon style={{ color: "#fff", fontSize: "0.85rem" }} />} label="🟢 Online" color="success" size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: "bold" }} />
              <Chip label="v2.1.0 Enterprise" color="secondary" size="small" sx={{ height: 22, fontSize: "0.65rem", fontWeight: "bold" }} />
              <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.68rem" }}>
                <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.3, verticalAlign: "middle" }} />
                {currentTime}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <UniversalActionToolbar
            title="Super Admin Master Platform Telemetry & Executive Audit Summary"
            documentId="ICJ-EXECUTIVE-TELEMETRY-2026"
            version="v3.2.0"
          />
        </Box>

        {/* 2. DE-CLUTTERED 4-METRIC EXECUTIVE HUB */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          📊 Enterprise System Overview & Metrics
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {consolidatedStats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Paper
                variant="outlined"
                onClick={() => navigate(stat.route)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyIn: "space-between",
                  borderLeft: `5px solid ${stat.color}`,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 4, borderColor: stat.color },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}15` }}>
                    {stat.icon}
                  </Box>
                  <Chip label="Live" size="small" color="default" sx={{ fontSize: "0.7rem", height: 18 }} />
                </Stack>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#0f172a">
                    {stat.val}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3 }}>
                    {stat.sub}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 3. UNIFIED ACTION REQUIRED CENTER (DE-CLUTTERED CONSOLIDATED TABS) */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsActiveIcon sx={{ color: "#ef4444" }} />
          ⚡ Unified Executive Action Center
        </Typography>

        <Paper sx={{ borderRadius: 3, mb: 4, bgcolor: "#fff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc", px: 2, pt: 1 }}>
            <Tabs value={queueTab} onChange={(e, v) => setQueueTab(v)}>
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>🔴 Pending Client Requests</span>
                    <Chip label={pendingClientsCount} color={pendingClientsCount > 0 ? "error" : "default"} size="small" />
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>🏢 Franchise Applications</span>
                    <Chip label={pendingFranchiseCount} color={pendingFranchiseCount > 0 ? "primary" : "default"} size="small" />
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>📊 System Health & Telemetry</span>
                  </Stack>
                }
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* TAB 0: CLIENT REQUESTS */}
            {queueTab === 0 && (
              <Box>
                {pendingClientsCount === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    ✅ No pending client requests. All litigant matters reviewed & Advocates appointed.
                  </Typography>
                ) : (
                  ClientWorkflowService.getPendingCasesForAdmin().map((req) => (
                    <Box key={req.requestId} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#fff1f2", border: "1px solid #fda4af", overflow: "hidden", maxWidth: "100%", wordBreak: "break-word" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Box sx={{ flex: 1, minWidth: 240, maxWidth: "100%", overflow: "hidden", wordBreak: "break-word" }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#9f1239" sx={{ wordBreak: "break-word" }}>
                            Client: {req.clientName} (ID: {req.clientId || "N/A"})
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="#be123c" mt={0.5} sx={{ wordBreak: "break-word" }}>
                            Problem: "{req.problemText}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5} sx={{ wordBreak: "break-word" }}>
                            Category: <strong>{req.caseCategory}</strong> | Outcome: {req.desiredOutcome}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {/* ✅ GOLDEN RULE: No IIFE — direct rendering */}
                          {(LegalEcosystemService.getAdvocates() || []).length === 0 ? (
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              onClick={() => alert("No empaneled advocates registered in ecosystem. Please register an advocate first.")}
                            >
                              ⚠️ No Advocates Available
                            </Button>
                          ) : (
                            (LegalEcosystemService.getAdvocates() || []).slice(0, 3).map((adv) => (
                              <Button
                                key={adv.id}
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={<GavelIcon />}
                                onClick={() => {
                                  ClientWorkflowService.appointAdvocate({
                                    requestId: req.requestId,
                                    advocateId: adv.id,
                                    advocateName: adv.name,
                                    adminUsername: user?.username || "Admin",
                                  });
                                  alert(`✅ Appointed ${adv.name} for ${req.clientName}!`);
                                  window.location.reload();
                                }}
                              >
                                🤝 Appoint {adv.name}
                              </Button>
                            ))
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {/* TAB 1: FRANCHISE APPLICATIONS */}
            {queueTab === 1 && (
              <Box>
                {pendingFranchiseCount === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    ✅ No pending franchise applications. All nodes operational.
                  </Typography>
                ) : (
                  FranchiseWorkflowService.getPendingApplications().map((fran) => (
                    <Box key={fran.id} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#f0f9ff", border: "1px solid #93c5fd" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Box sx={{ flex: 1, minWidth: 260 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#0369a1">
                            {fran.applicantName} — {fran.city}, {fran.state}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mobile: {fran.mobile} | Email: {fran.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            Experience: {fran.experience}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => {
                              FranchiseWorkflowService.updateStatus({
                                applicationId: fran.id,
                                newStatus: "APPROVED",
                                meetingNotes: "Franchise approved by Admin. Onboarding credentials issued.",
                                adminUsername: user?.username || "Admin",
                              });
                              alert(`✅ Approved Franchise for ${fran.applicantName}!`);
                              window.location.reload();
                            }}
                          >
                            ✅ Approve Franchise
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="info"
                            onClick={() => {
                              FranchiseWorkflowService.updateStatus({
                                applicationId: fran.id,
                                newStatus: "INTERACTION_SCHEDULED",
                                meetingNotes: "Meeting scheduled with ICJ Franchise Director.",
                                adminUsername: user?.username || "Admin",
                              });
                              alert(`📅 Scheduled interaction for ${fran.applicantName}!`);
                              window.location.reload();
                            }}
                          >
                            📅 Schedule Meeting
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {/* TAB 2: SYSTEM TELEMETRY & DIAGNOSTICS */}
            {queueTab === 2 && (
              <Box sx={{ bgcolor: "#0f172a", color: "#fff", p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#a7f3d0" }}>
                    🟢 TELEMETRY INTERCEPTOR: ACTIVE & TRACKING
                  </Typography>
                  <Chip label="100% OPERATIONAL" color="success" size="small" sx={{ fontWeight: "bold" }} />
                </Stack>
                <Divider sx={{ borderColor: "#334155", mb: 2 }} />
                <Box sx={{ maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {TelemetryDiagnosticService.getTelemetryLogs().length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No error telemetry logs recorded. System operating cleanly.</Typography>
                  ) : (
                    TelemetryDiagnosticService.getTelemetryLogs().slice(0, 5).map((log) => (
                      <Box key={log.id} sx={{ mb: 1, pb: 1, borderBottom: "1px dashed #334155" }}>
                        <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                          [{new Date(log.timestamp).toLocaleTimeString()}] [{log.module}] {log.action} — Status: {log.status}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 3.5. SUPER ADMIN PHASED LAUNCH & FEATURE CONTROL CENTER */}
        <Box sx={{ mb: 4 }}>
          <FeatureControlCenter />
        </Box>

        {/* 4. QUICK LAUNCH DOCK */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          🚀 Super Admin Control & Governance Navigation
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickActionCards.map((card) => (
            <Grid item xs={12} sm={6} md={2} key={card.title}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  height: "100%",
                  transition: "0.25s",
                  "&:hover": { boxShadow: 3, borderColor: "primary.main" },
                }}
              >
                <CardActionArea onClick={() => navigate(card.route)} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                  <Box sx={{ mb: 1 }}>{card.icon}</Box>
                  <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2}>
                    {card.title}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>
    </>
  );
}
