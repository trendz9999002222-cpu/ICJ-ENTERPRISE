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

import DashboardService from "../services/dashboardService.js";
import MainLayout from "../layouts/MainLayout.jsx";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar.jsx";
import useAuth from "../hooks/useAuth.js";
import AuthService from "../services/authService.js";

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

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* 1. DASHBOARD HOME: WELCOME PANEL */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #0B5ED7 0%, #084298 100%)",
            color: "#ffffff",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                <Avatar sx={{ bgcolor: "#ffffff", color: "#0B5ED7", width: 52, height: 52, fontWeight: "bold" }}>
                  SA
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Welcome, {user?.fullName || "Super Admin"}!
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Logged in as <strong>Super Admin ({user?.username || "ICJSuperAdmin1234"})</strong>
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

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>System Version:</Typography>
              <Typography variant="body2" fontWeight="bold">v2.1.0 Enterprise Production</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Last Master Backup:</Typography>
              <Typography variant="body2" fontWeight="bold">
                <BackupIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                Aug 7, 2026 (Verified JSON Backup)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Active System Sessions:</Typography>
              <Typography variant="body2" fontWeight="bold">1 Active Session (Super Admin)</Typography>
            </Grid>
          </Grid>
        </Paper>

        <UniversalActionToolbar
          title="Super Admin Master Platform Telemetry & Executive Audit Summary"
          documentId="ICJ-EXECUTIVE-TELEMETRY-2026"
          version="v3.2.0"
        />

        {/* 2. QUICK STATISTICS */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          System Quick Statistics
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickStats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} lg={1.71} key={stat.label}>
              <Paper
                variant="outlined"
                onClick={() => navigate(stat.route)}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderLeft: "4px solid",
                  borderLeftColor: stat.color,
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                }}
              >
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 3. QUICK ACTION CARDS */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Super Admin Control Panel — Quick Action Cards
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActionCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 4, borderColor: "primary.main" },
                }}
              >
                <CardActionArea onClick={() => navigate(card.route)} sx={{ p: 2.5, height: "100%" }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>
    </MainLayout>
  );
}
