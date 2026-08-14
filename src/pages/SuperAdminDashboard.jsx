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

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

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

    return () => clearInterval(timer);
  }, []);

  const seedUsers = AuthService.getSeedUsers();
  const totalUsers = stats?.totalMembers ?? (seedUsers.length || 0);
  const superAdmins = seedUsers.filter(u => (u.user_type === "super_admin" || u.username === "ICJSuperAdmin1234")).length || 1;
  const admins = seedUsers.filter(u => u.role === "admin" && u.username !== "ICJSuperAdmin1234").length || 0;
  const members = seedUsers.filter(u => u.role === "member").length || totalUsers;

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
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* 1. DASHBOARD HOME: WELCOME BANNER */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #0B5ED7 0%, #084298 100%)",
            color: "#ffffff",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#ffffff", color: "#0B5ED7", width: 52, height: 52, fontWeight: "bold" }}>
                  SA
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Welcome, {user?.fullName || "Super Admin"}!
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Logged in as <strong>Super Admin ({user?.username || "ICJSuperAdmin1234"})</strong> | Role Governance Active
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }} sx={{ mb: 1 }}>
                <Chip icon={<StorageIcon style={{ color: "#fff" }} />} label="Server Status: 🟢 Online" color="success" size="small" />
                <Chip label="v2.1.0 Enterprise" color="secondary" size="small" />
              </Stack>
              <Typography variant="caption" sx={{ display: "block", opacity: 0.85 }}>
                <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                {currentTime}
              </Typography>
            </Grid>
          </Grid>
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
                    <Box key={req.requestId} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#fff1f2", border: "1px solid #fda4af" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Box sx={{ flex: 1, minWidth: 260 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#9f1239">
                            Client: {req.clientName} (ID: {req.clientId || "N/A"})
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="#be123c" mt={0.5}>
                            Problem: "{req.problemText}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            Category: <strong>{req.caseCategory}</strong> | Outcome: {req.desiredOutcome}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<GavelIcon />}
                            onClick={() => {
                              ClientWorkflowService.appointAdvocate({
                                requestId: req.requestId,
                                advocateId: "ADV-101",
                                advocateName: "Adv. Rajesh Sharma",
                                adminUsername: user?.username || "Admin",
                              });
                              alert(`✅ Appointed Adv. Rajesh Sharma for ${req.clientName}!`);
                              window.location.reload();
                            }}
                          >
                            🤝 Appoint Adv. Rajesh Sharma
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            onClick={() => {
                              ClientWorkflowService.appointAdvocate({
                                requestId: req.requestId,
                                advocateId: "ADV-102",
                                advocateName: "Adv. Meera Sen",
                                adminUsername: user?.username || "Admin",
                              });
                              alert(`✅ Appointed Adv. Meera Sen for ${req.clientName}!`);
                              window.location.reload();
                            }}
                          >
                            🤝 Appoint Adv. Meera Sen
                          </Button>
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
    </MainLayout>
  );
}
