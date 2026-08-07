/**
 * ICJ Enterprise Platform
 * Dashboard Page
 * Version : 1.0.0
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Groups as MembersIcon,
  AccountBalanceWallet as WalletIcon,
  Token as TokenIcon,
  Gavel as LegalIcon,
  Folder as DocumentsIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../layouts/MainLayout";
import DashboardService from "../services/dashboardService";
import AIService from "../services/aiService";
import { hasRouteAccess } from "../core/rbac";
import { resolveRoleCode } from "../core/roles";

const dashboardModules = [
  { id: "members", title: "Members", description: "Manage member profiles", icon: <MembersIcon />, route: "/members", color: "#198754" },
  { id: "wallet", title: "Wallet", description: "Community wallet management", icon: <WalletIcon />, route: "/wallet", color: "#0DCAF0" },
  { id: "finance", title: "Finance", description: "Financial overview and activity", icon: <WalletIcon />, route: "/finance", color: "#20C997" },
  { id: "tokens", title: "Tokens", description: "Community token system", icon: <TokenIcon />, route: "/tokens", color: "#FFC107" },
  { id: "legal", title: "Legal Cases", description: "Legal services and cases", icon: <LegalIcon />, route: "/legal", color: "#6610f2" },
  { id: "documents", title: "Documents", description: "Document vault and storage", icon: <DocumentsIcon />, route: "/documents", color: "#D63384" },
  { id: "notifications", title: "Notifications", description: "System notifications", icon: <NotificationsIcon />, route: "/notifications", color: "#FD7E14" },
  { id: "profile", title: "Profile", description: "Your account profile", icon: <ProfileIcon />, route: "/profile", color: "#6C757D" },
  { id: "settings", title: "Settings", description: "Platform configuration", icon: <SettingsIcon />, route: "/settings", color: "#20C997" },
  { id: "administration", title: "Administration", description: "Role and platform administration", icon: <AdminIcon />, route: "/administration", color: "#0B5ED7" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const role = resolveRoleCode(profile, user);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalWallets: 0,
    totalTokens: 0,
    totalLegalCases: 0,
    donationAmount: 0,
    pendingApprovals: 0,
    pendingVerification: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const filteredModules = dashboardModules.filter(
    (module) =>
      hasRouteAccess(role, module.route) &&
      (
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  useEffect(() => {
    let mounted = true;

    Promise.all([
      DashboardService.getStatistics(),
      DashboardService.getRecentMembers(5),
      DashboardService.getRecentActivities(5),
      DashboardService.getNotifications(),
    ])
      .then(([data, members, activities, alerts]) => {
        if (!mounted || !data) return;
        setStats({
          totalMembers: Number(data.totalMembers || 0),
          totalWallets: Number(data.totalWallets || 0),
          totalTokens: Number(data.totalTokens || 0),
          totalLegalCases: Number(data.totalLegalCases || 0),
          donationAmount: Number(data.donationAmount || 0),
          pendingApprovals: Number(data.pendingApprovals || 0),
          pendingVerification: Number(data.pendingVerification || 0),
        });
        setRecentMembers(Array.isArray(members) ? members : []);
        setRecentActivities(Array.isArray(activities) ? activities : []);
        setNotifications(Array.isArray(alerts) ? alerts : []);
      })
      .catch(() => {
        // Ignore dashboard stat errors and keep defaults.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const aiStatus = AIService.getFoundationStatus(role);

  const statCards = [
    { title: "Total Members", value: String(stats.totalMembers), color: "#0B5ED7" },
    { title: "Active Wallets", value: String(stats.totalWallets), color: "#198754" },
    { title: "Total Tokens", value: String(stats.totalTokens), color: "#FFC107" },
    { title: "Legal Cases", value: String(stats.totalLegalCases), color: "#6610f2" },
    { title: "Pending Approval", value: String(stats.pendingApprovals), color: "#FD7E14" },
    { title: "Pending Verification", value: String(stats.pendingVerification), color: "#6C757D" },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: "linear-gradient(135deg, #0B5ED7 0%, #084298 100%)", color: "#fff" }}>
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
            <Grid xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold">ICJ Enterprise Platform</Typography>
              <Typography color="rgba(255,255,255,0.85)" sx={{ mt: 1 }}>International Consortium of Jurists</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                <CalendarIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.7)" }} />
                <Chip label={today} sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", height: 28 }} />
              </Box>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "rgba(255,255,255,0.5)" }} /></InputAdornment>,
                    sx: {
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.5)" },
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {profile && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: "#0B5ED7" }}>
              {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">{profile.full_name || "Welcome"}</Typography>
              <Typography color="text.secondary">Member ID: {profile.member_id} | {profile.email}</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <Chip label={profile.member_type || "Individual"} size="small" />
                <Chip label={profile.member_level || "BASIC"} size="small" color="primary" />
                <Chip label={profile.verification_status || "Pending"} size="small" color="warning" />
              </Box>
            </Box>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat) => (
            <Grid xs={12} sm={6} md={2} key={stat.title}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">{stat.title}</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{stat.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">Total Donations</Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            ₹{stats.donationAmount.toLocaleString("en-IN")}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">AI Foundation MVP</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
            {aiStatus.enabled ? "Enabled" : "Disabled"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Provider: {aiStatus.provider} | Modules: {aiStatus.modulesEnabled}/{aiStatus.modulesRegistered} | Flags Enabled: {aiStatus.flagsEnabled}
          </Typography>
          {hasRouteAccess(role, "/ai") ? (
            <Button variant="text" sx={{ mt: 1, p: 0, textTransform: "none" }} onClick={() => navigate("/ai")}>Open AI Foundation Console</Button>
          ) : null}
        </Paper>

        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 2.5 }}>Quick Actions</Typography>

        <Grid container spacing={3}>
          {filteredModules.map((module) => (
            <Grid xs={12} sm={6} md={4} key={module.id}>
              <Paper
                sx={{
                  p: 3, borderRadius: 3, cursor: "pointer", transition: "all 0.3s ease", height: "100%", display: "flex", flexDirection: "column",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }
                }}
                onClick={() => navigate(module.route)}
              >
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${module.color}15`, color: module.color, mb: 2 }}>
                  {React.cloneElement(module.icon, { sx: { fontSize: 28 } })}
                </Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>{module.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>{module.description}</Typography>
                <Button variant="text" size="small" sx={{ color: module.color, textTransform: "none", fontWeight: "bold", p: 0, "&:hover": { backgroundColor: "transparent" } }}>
                  Open →
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" fontWeight="bold" sx={{ mt: 5, mb: 3 }}>Recent Members</Typography>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Stack spacing={1.5}>
            {recentMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No recent members found.</Typography>
            ) : (
              recentMembers.map((member) => (
                <Box key={member.id || member.member_id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                  <Typography variant="body2" fontWeight="bold">{member.name || member.full_name || "Member"}</Typography>
                  <Typography variant="body2" color="text.secondary">{member.member_id || "-"}</Typography>
                </Box>
              ))
            )}
          </Stack>
        </Paper>

        <Typography variant="h5" fontWeight="bold" sx={{ mt: 5, mb: 3 }}>Recent Activity</Typography>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: 280 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>Activity Feed</Typography>
              <Stack spacing={2}>
                {recentActivities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No recent activity available.</Typography>
                ) : (
                  recentActivities.map((item) => (
                    <Paper key={item.id} sx={{ p: 2, backgroundColor: "#F8F9FA" }}>
                      <Typography variant="body2" color="text.secondary">{item.title}: {item.user}</Typography>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: 280 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>Notifications</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {notifications.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No notifications.</Typography>
                ) : (
                  notifications.map((item) => (
                    <Chip key={item.id} label={item.title} color={item.priority === "High" ? "warning" : "default"} />
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}

