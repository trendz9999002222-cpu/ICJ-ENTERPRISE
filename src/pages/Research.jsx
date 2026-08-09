import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { MemberService } from "../services/memberService";
import DashboardService from "../services/dashboardService";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

export default function Research() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    MemberService.getAll()
      .then((list) => setMembers(Array.isArray(list) ? list : []))
      .catch(() => {});
    DashboardService.getStatistics()
      .then((s) => setStats(s))
      .catch(() => {});
  }, []);

  // Member growth by month (based on registration_date)
  const growthByMonth = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      const date = m.registration_date || m.created_at || m.createdAt;
      if (!date) return;
      const d = new Date(date);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  }, [members]);

  // Top cities
  const topCities = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      const city = (m.city || "").trim();
      if (city) counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [members]);

  // Top states
  const topStates = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      const state = (m.state || "").trim();
      if (state) counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [members]);

  // Verification rate
  const verificationRate = members.length
    ? Math.round(((stats?.verifiedMembers ?? 0) / members.length) * 100)
    : 0;

  const kycCompleteCount = useMemo(() =>
    members.filter((m) => (m.aadhaar || m.aadhar) && m.pan).length,
    [members]
  );

  const kycRate = members.length
    ? Math.round((kycCompleteCount / members.length) * 100)
    : 0;

  const statCards = [
    {
      title: "Total Members",
      value: members.length,
      icon: <GroupsIcon />,
      color: "primary.main",
    },
    {
      title: "Verification Rate",
      value: `${verificationRate}%`,
      icon: <VerifiedUserIcon />,
      color: "success.main",
    },
    {
      title: "KYC Complete Rate",
      value: `${kycRate}%`,
      icon: <HourglassEmptyIcon />,
      color: "warning.main",
    },
    {
      title: "States Covered",
      value: topStates.length,
      icon: <LocationCityIcon />,
      color: "info.main",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Research & Analytics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Live analytics and insights derived from platform data.
      </Typography>

      <UniversalActionToolbar
        title="Legal Research & Precedent Findings Dossier"
        documentId="ICJ-RESEARCH-ANALYSIS-2026"
        version="v3.2.0"
      />

      {/* Overview Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                borderLeft: "4px solid",
                borderLeftColor: card.color,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Box>
                <Typography color="text.secondary" variant="body2">{card.title}</Typography>
                <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Member Growth by Month */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Member Growth (Last 6 Months)</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {growthByMonth.length === 0 ? (
              <Typography color="text.secondary">No registration data available yet.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {growthByMonth.map(([month, count]) => {
                  const max = Math.max(...growthByMonth.map(([, c]) => c));
                  const pct = max ? Math.round((count / max) * 100) : 0;
                  return (
                    <Box key={month}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{month}</Typography>
                        <Typography variant="body2" fontWeight="bold">{count} registrations</Typography>
                      </Stack>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${pct}%`,
                            bgcolor: "primary.main",
                            borderRadius: 4,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Top Cities */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LocationCityIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Top Cities</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {topCities.length === 0 ? (
              <Typography color="text.secondary">No city data available.</Typography>
            ) : (
              <Stack spacing={1}>
                {topCities.map(([city, count]) => (
                  <Stack key={city} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{city}</Typography>
                    <Chip label={count} size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Top States */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LocationCityIcon color="secondary" />
              <Typography variant="h6" fontWeight="bold">Top States</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {topStates.length === 0 ? (
              <Typography color="text.secondary">No state data available.</Typography>
            ) : (
              <Stack spacing={1}>
                {topStates.map(([state, count]) => (
                  <Stack key={state} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{state}</Typography>
                    <Chip label={count} size="small" color="secondary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* KYC Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>KYC Analysis</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {[
                {
                  label: "Aadhaar + PAN (Complete KYC)",
                  count: kycCompleteCount,
                  color: "success.main",
                },
                {
                  label: "Aadhaar Only",
                  count: members.filter((m) => (m.aadhaar || m.aadhar) && !m.pan).length,
                  color: "warning.main",
                },
                {
                  label: "PAN Only",
                  count: members.filter((m) => m.pan && !(m.aadhaar || m.aadhar)).length,
                  color: "info.main",
                },
                {
                  label: "No KYC Documents",
                  count: members.filter((m) => !m.pan && !(m.aadhaar || m.aadhar)).length,
                  color: "error.main",
                },
              ].map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                  <Typography variant="body2" fontWeight="bold" color={row.color}>
                    {row.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Verification Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Verification Status Breakdown</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {[
                { label: "Verified", value: stats?.verifiedMembers ?? 0, color: "success" },
                { label: "Pending", value: stats?.pendingMembers ?? 0, color: "warning" },
                { label: "Rejected", value: stats?.rejectedMembers ?? 0, color: "error" },
                { label: "Suspended", value: stats?.suspendedMembers ?? 0, color: "default" },
              ].map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Chip label={row.label} size="small" color={row.color} />
                  <Typography variant="body2" fontWeight="bold">{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
