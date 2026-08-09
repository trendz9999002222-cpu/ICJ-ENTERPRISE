import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Stack,
  Button, Avatar, Container, Divider, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import VerifiedIcon from "@mui/icons-material/Verified";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import VirtualOfficeService from "../services/virtualOfficeService";
import useAuth from "../hooks/useAuth";

export default function VirtualOffice() {
  const { user } = useAuth();
  const memberId = user?.member_id || user?.id || "26ICJ08AA0001";
  const memberName = user?.name || "Advocate Pawan Kumar";

  const [office, setOffice] = useState(null);

  useEffect(() => {
    const data = VirtualOfficeService.getOfficeForMember(memberId, memberName);
    setOffice(data);
  }, [memberId, memberName]);

  if (!office) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      {/* Hero Banner */}
      <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)", color: "white", py: 5, px: 3, boxShadow: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 60, height: 60 }}>
              <BusinessIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h3" fontWeight="bold">ICJ Virtual Office Chamber</Typography>
                <Chip label="EMPANELLED VERIFIED" color="success" sx={{ fontWeight: "bold" }} />
              </Stack>
              <Typography variant="h6" sx={{ color: "#93c5fd" }}>
                वर्चुअल चैम्बर · डिजिटल नेमबोर्ड · क्लाइंट अपॉइंटमेंट क्यू · डॉक्यूमेंट वॉल्ट
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* Advocate Digital Office Board */}
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4, bgcolor: "#fff" }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: "#1e3a8a", fontSize: 28, fontWeight: "bold" }}>
                  {office.advocateName?.charAt(0)}
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4" fontWeight="bold" color="#0f172a">
                      {office.advocateName}
                    </Typography>
                    <VerifiedIcon color="primary" />
                  </Stack>
                  <Typography variant="subtitle1" color="text.secondary">
                    Enrollment No: <strong>{office.barEnrollmentNo}</strong>
                  </Typography>
                  <Typography variant="body2" color="#1e3a8a" fontWeight="bold">
                    Jurisdiction: {office.courtJurisdiction}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                {office.specializations.map((spec) => (
                  <Chip key={spec} label={spec} size="small" sx={{ bgcolor: "#ede9fe", color: "#4c1d95", fontWeight: 700 }} />
                ))}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                📍 {office.officeAddress} | ⏰ {office.workingHours}
              </Typography>
            </Grid>

            {/* QR Verification Card */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 3, textAlign: "center", border: "1px solid #e2e8f0" }}>
                <QrCode2Icon sx={{ fontSize: 90, color: "#1e3a8a" }} />
                <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                  ICJ Empanelled QR Code
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Scan to verify advocate credential on ICJ Public Portal
                </Typography>
                <Button size="small" variant="contained" sx={{ mt: 1, bgcolor: "#1e3a8a" }}>
                  Download QR Badge
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Office Dashboard Widgets */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid #1e3a8a" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">Client Appointments</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#1e3a8a">{office.clientAppointmentsCount}</Typography>
                  </Box>
                  <EventAvailableIcon sx={{ color: "#1e3a8a", fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid #f59e0b" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">Active Court Cases</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#d97706">{office.activeCasesCount}</Typography>
                  </Box>
                  <GavelIcon sx={{ color: "#f59e0b", fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid #7c3aed" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">AI Drafts Generated</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#7c3aed">{office.aiDraftsGeneratedCount}</Typography>
                  </Box>
                  <AutoAwesomeIcon sx={{ color: "#7c3aed", fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid #10b981" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold">Document Vault Files</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#059669">{office.documentsVaultCount}</Typography>
                  </Box>
                  <FolderSpecialIcon sx={{ color: "#10b981", fontSize: 36 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* MULTI-COURT OFFICE CHAMBERS BOARD */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: "#fff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#0f172a">
                🏛️ Multi-Office Court Chambers &amp; Jurisdictional Offices
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered District Court, High Court Bench, and Supreme Court Chambers
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => window.location.href = "/profile"}
              sx={{ fontWeight: "bold" }}
            >
              MANAGE OFFICE CHAMBERS IN PROFILE ⚙️
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {(office.officeLocations || []).map((loc) => {
              const isSupreme = loc.type === "SupremeCourt";
              const isHigh = loc.type === "HighCourt";
              const color = isSupreme ? "#7c3aed" : isHigh ? "#1d4ed8" : "#059669";
              const tag = isSupreme ? "🏛️ SUPREME COURT" : isHigh ? "⚖️ HIGH COURT BENCH" : "🏢 DISTRICT COURT";

              return (
                <Grid item xs={12} sm={6} md={4} key={loc.id || loc.name}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: color, bgcolor: "#f8fafc" }}>
                    <Chip label={tag} size="small" sx={{ bgcolor: color, color: "#fff", fontWeight: "bold", fontSize: "0.68rem", mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                      {loc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📍 {loc.address}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                      {loc.city}, {loc.state}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* VERIFIED PRACTICE COLLEGIUM BOARD */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: "#fff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#0f172a">
                👥 Verified Practice Collegium &amp; Junior Advocates Team
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Official BCI-compliant list of verified ICJ member junior associates posted across court offices
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => window.location.href = "/profile"}
              sx={{ fontWeight: "bold" }}
            >
              LINK NEW VERIFIED JUNIOR ➕
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {(office.juniorsList || []).length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" variant="body2" sx={{ fontStyle: "italic" }}>
                  No Junior Associates linked to this practice team yet. Manage team in Profile settings.
                </Typography>
              </Grid>
            ) : (
              (office.juniorsList || []).map((jr) => (
                <Grid item xs={12} sm={6} key={jr.id || jr.memberId}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "#10b981", bgcolor: "#f0fdf4" }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "#059669", fontWeight: "bold" }}>
                        {jr.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                          {jr.name}
                        </Typography>
                        <Chip label={`ID: ${jr.memberId}`} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold", mb: 0.5 }} />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Role: <strong>{jr.designation}</strong>
                        </Typography>
                        <Typography variant="caption" display="block" color="success.dark" fontWeight="bold">
                          Assigned Office: {jr.assignedOffice}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
