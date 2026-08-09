import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Stack,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";

import MemberService from "../../services/memberService.js";
import VirtualOfficeService, { DEFAULT_COURT_OFFICES } from "../../services/virtualOfficeService.js";

export default function AdvocatePracticeTeamCard({ profile, onUpdate }) {
  const memberLevel = (profile?.member_level || profile?.memberLevel || "BASIC").toUpperCase();
  const isPremium = ["PRO", "EXECUTIVE", "ENTERPRISE", "PROFESSIONAL", "ADVANCED"].includes(memberLevel);

  const memberId = profile?.member_id || profile?.memberId || profile?.id;
  const memberName = profile?.name || profile?.fullName || "Advocate";

  // Virtual office & team state
  const [officeData, setOfficeData] = useState(null);
  const [offices, setOffices] = useState(DEFAULT_COURT_OFFICES);
  const [juniors, setJuniors] = useState([]);

  // Office Add Modal State
  const [addOfficeOpen, setAddOfficeOpen] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    type: "DistrictCourt",
    name: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
  });

  // Junior Search & Add Modal State
  const [addJuniorOpen, setAddJuniorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [juniorForm, setJuniorForm] = useState({
    designation: "Junior Associate",
    assignedOffice: "",
  });

  useEffect(() => {
    if (memberId) {
      const data = VirtualOfficeService.getOfficeForMember(memberId, memberName);
      setOfficeData(data);
      if (data?.officeLocations && Array.isArray(data.officeLocations)) {
        setOffices(data.officeLocations);
      }
      if (data?.juniorsList && Array.isArray(data.juniorsList)) {
        setJuniors(data.juniorsList);
      }
    }
  }, [memberId, memberName]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const handleAddOffice = () => {
    if (!officeForm.name || !officeForm.city) return;
    const newOffice = {
      id: `OFF-${Date.now()}`,
      type: officeForm.type,
      name: officeForm.name.trim(),
      address: officeForm.address.trim(),
      city: officeForm.city.trim(),
      state: officeForm.state.trim(),
    };
    const updatedOffices = [...offices, newOffice];
    setOffices(updatedOffices);

    if (memberId) {
      VirtualOfficeService.updateOffice(memberId, { officeLocations: updatedOffices });
    }
    setAddOfficeOpen(false);
    setOfficeForm({ type: "DistrictCourt", name: "", address: "", city: "", state: "Uttar Pradesh" });
    if (onUpdate) onUpdate();
  };

  const handleRemoveOffice = (id) => {
    const updatedOffices = offices.filter((o) => o.id !== id);
    setOffices(updatedOffices);
    if (memberId) {
      VirtualOfficeService.updateOffice(memberId, { officeLocations: updatedOffices });
    }
    if (onUpdate) onUpdate();
  };

  const handleSearchMember = async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const allMembers = await MemberService.getAll();
      const match = allMembers.find((m) => {
        const mId = String(m.member_id || m.memberId || m.id || "").toLowerCase();
        const email = String(m.email || "").toLowerCase();
        const uname = String(m.username || "").toLowerCase();
        const mob = String(m.mobile || "").replace(/\D/g, "");
        const queryClean = q.replace(/\D/g, "");

        return (
          mId === q ||
          email === q ||
          uname === q ||
          (queryClean.length >= 7 && mob.endsWith(queryClean))
        );
      });

      if (match) {
        setSearchResult(match);
      } else {
        setSearchError(
          `No registered ICJ Member found matching "${searchQuery}". Persons must first complete free registration on ICJ Onboarding to generate their Member ID.`
        );
      }
    } catch (err) {
      setSearchError("Failed to query ICJ Member Registry. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleLinkJunior = () => {
    if (!searchResult) return;

    const newJunior = {
      id: `JR-${Date.now()}`,
      memberId: searchResult.member_id || searchResult.memberId || searchResult.id,
      name: searchResult.name || searchResult.fullName,
      designation: juniorForm.designation,
      assignedOffice: juniorForm.assignedOffice || offices[0]?.name || "Main Chamber",
      barId: searchResult.barId || searchResult.pan || "Registered ICJ Member",
      mobile: searchResult.mobile || "N/A",
      email: searchResult.email || "N/A",
      linkedAt: new Date().toISOString(),
    };

    const updatedJuniors = [...juniors.filter(j => j.memberId !== newJunior.memberId), newJunior];
    setJuniors(updatedJuniors);

    if (memberId) {
      VirtualOfficeService.updateOffice(memberId, { juniorsList: updatedJuniors });
    }

    setAddJuniorOpen(false);
    setSearchQuery("");
    setSearchResult(null);
    setSearchError("");
    if (onUpdate) onUpdate();
  };

  const handleRemoveJunior = (jId) => {
    const updatedJuniors = juniors.filter((j) => j.id !== jId);
    setJuniors(updatedJuniors);
    if (memberId) {
      VirtualOfficeService.updateOffice(memberId, { juniorsList: updatedJuniors });
    }
    if (onUpdate) onUpdate();
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GavelIcon /> Multi-Office Chambers & Practice Collegium
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage District Court, High Court & Supreme Court Chambers & Verified ICJ Member Junior Team
          </Typography>
        </Box>
        <Chip
          icon={isPremium ? <VerifiedUserIcon /> : <LockIcon />}
          label={isPremium ? `PLAN: ${memberLevel} (UNLOCKED)` : `PLAN: ${memberLevel} (LOCKED)`}
          color={isPremium ? "success" : "warning"}
          sx={{ fontWeight: "bold" }}
        />
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* TIER GATE LOCK FOR BASIC MEMBERS */}
      {!isPremium ? (
        <Alert severity="warning" variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fffbe6" }}>
          <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>
            🔒 PREMIUM ADVOCATE FEATURE LOCKED
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Multi-Office Chamber Management (District Court, High Court Benches, Supreme Court Offices) and Verified ICJ Member Junior Team Binding is exclusively available for <strong>PRO &amp; EXECUTIVE</strong> Advocate accounts.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Bar Council of India (BCI) Rule 36 Compliant Client Transparency &amp; Practice Collegium Governance.
          </Typography>
          <Button variant="contained" color="warning" sx={{ fontWeight: "bold" }}>
            UPGRADE TO PRO MEMBERSHIP 🚀
          </Button>
        </Alert>
      ) : (
        <Stack spacing={4}>
          {/* SECTION 1: MULTI-OFFICE COURT CHAMBERS */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <AccountBalanceIcon color="primary" fontSize="small" /> Registered Court Office Chambers ({offices.length})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddLocationIcon />}
                onClick={() => setAddOfficeOpen(true)}
                sx={{ fontWeight: "bold" }}
              >
                ADD COURT CHAMBER
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {offices.map((off) => {
                const isDistrict = off.type === "DistrictCourt";
                const isHighCourt = off.type === "HighCourt";
                const isSupreme = off.type === "SupremeCourt";

                const chipColor = isSupreme ? "#7c3aed" : isHighCourt ? "#1d4ed8" : "#059669";
                const chipLabel = isSupreme ? "🏛️ SUPREME COURT" : isHighCourt ? "⚖️ HIGH COURT BENCH" : "🏢 DISTRICT COURT";

                return (
                  <Grid item xs={12} sm={6} md={4} key={off.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: chipColor,
                        bgcolor: "#f8fafc",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Chip label={chipLabel} size="small" sx={{ bgcolor: chipColor, color: "#fff", fontWeight: "bold", fontSize: "0.68rem" }} />
                          {offices.length > 1 && (
                            <IconButton size="small" color="error" onClick={() => handleRemoveOffice(off.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                          {off.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          📍 {off.address}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color="primary.main">
                          {off.city}, {off.state}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* SECTION 2: VERIFIED PRACTICE TEAM (JUNIORS & ASSOCIATES) */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <VerifiedUserIcon color="success" fontSize="small" /> Verified Practice Collegium &amp; Junior Team ({juniors.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Only persons with a registered ICJ Member ID can be linked to your official Practice Collegium.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setSearchQuery("");
                  setSearchResult(null);
                  setSearchError("");
                  setAddJuniorOpen(true);
                }}
                sx={{ fontWeight: "bold" }}
              >
                LINK VERIFIED MEMBER ID
              </Button>
            </Stack>

            {juniors.length === 0 ? (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                No Junior Associates or Practice Team members linked yet. Click <strong>"LINK VERIFIED MEMBER ID"</strong> to link registered ICJ advocates/interns.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {juniors.map((jr) => (
                  <Grid item xs={12} sm={6} key={jr.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        borderColor: "#10b981",
                        bgcolor: "#f0fdf4",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: "#059669", fontWeight: "bold" }}>
                            {jr.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                              {jr.name}
                            </Typography>
                            <Chip label={`ID: ${jr.memberId}`} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold", mb: 0.5 }} />
                            <Typography variant="caption" display="block" color="text.secondary">
                              Role: <strong>{jr.designation}</strong>
                            </Typography>
                            <Typography variant="caption" display="block" color="success.dark" fontWeight="bold">
                              Assigned Office: {jr.assignedOffice}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Mobile: {jr.mobile}
                            </Typography>
                          </Box>
                        </Stack>

                        <IconButton size="small" color="error" onClick={() => handleRemoveJunior(jr.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      )}

      {/* ─── MODAL 1: ADD COURT OFFICE ───────────────────────────────────── */}
      <Dialog open={addOfficeOpen} onClose={() => setAddOfficeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>🏛️ Add Court Office Chamber</DialogTitle>
        <DialogContent dividers>
          <Stack spacing= {2} sx={{ pt: 1 }}>
            <TextField
              select fullWidth label="Court Level / Jurisdiction *"
              value={officeForm.type}
              onChange={(e) => setOfficeForm((p) => ({ ...p, type: e.target.value }))}
            >
              <MenuItem value="DistrictCourt">🏢 District &amp; Sessions Court</MenuItem>
              <MenuItem value="HighCourt">⚖️ High Court Bench</MenuItem>
              <MenuItem value="SupremeCourt">🏛️ Supreme Court of India</MenuItem>
            </TextField>
            <TextField
              fullWidth required label="Office / Chamber Name *"
              placeholder="e.g. Chamber #42, High Court Block"
              value={officeForm.name}
              onChange={(e) => setOfficeForm((p) => ({ ...p, name: e.target.value }))}
            />
            <TextField
              fullWidth label="Chamber Address *"
              placeholder="Address details..."
              value={officeForm.address}
              onChange={(e) => setOfficeForm((p) => ({ ...p, address: e.target.value }))}
            />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth required label="City *"
                  value={officeForm.city}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, city: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="State *"
                  value={officeForm.state}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, state: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOfficeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOffice} disabled={!officeForm.name || !officeForm.city}>
            SAVE COURT OFFICE
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MODAL 2: LINK VERIFIED ICJ MEMBER ───────────────────────────── */}
      <Dialog open={addJuniorOpen} onClose={() => setAddJuniorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          🔍 Search &amp; Link Verified ICJ Portal Member
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
              To add a Junior Advocate, Intern or Staff member, enter their <strong>ICJ Member ID</strong> (e.g. 26ICJ08AA0001), <strong>Email Address</strong>, or <strong>Mobile Number</strong>.
            </Alert>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="Enter Member ID / Email / Mobile *"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 26ICJ08AA0001 or mobile number..."
              />
              <Button
                variant="contained"
                onClick={handleSearchMember}
                disabled={!searchQuery.trim() || searching}
                startIcon={<SearchIcon />}
                sx={{ px: 3, fontWeight: "bold" }}
              >
                VERIFY
              </Button>
            </Stack>

            {searchError && (
              <Alert severity="error" sx={{ fontSize: "0.85rem" }}>
                {searchError}
              </Alert>
            )}

            {searchResult && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#f0fdf4", borderColor: "#10b981" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.dark" gutterBottom>
                  ✓ VERIFIED ICJ MEMBER FOUND!
                </Typography>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2" fontWeight="bold">{searchResult.name || searchResult.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Member ID</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {searchResult.member_id || searchResult.memberId || searchResult.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Mobile</Typography>
                    <Typography variant="body2">{searchResult.mobile}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{searchResult.email}</Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select fullWidth size="small" label="Designation / Role *"
                      value={juniorForm.designation}
                      onChange={(e) => setJuniorForm((p) => ({ ...p, designation: e.target.value }))}
                    >
                      <MenuItem value="Junior Associate">Junior Associate</MenuItem>
                      <MenuItem value="Senior Associate">Senior Associate</MenuItem>
                      <MenuItem value="Legal Intern">Legal Intern</MenuItem>
                      <MenuItem value="Research Assistant">Research Assistant</MenuItem>
                      <MenuItem value="Chamber Staff">Chamber Staff</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select fullWidth size="small" label="Assigned Court Office *"
                      value={juniorForm.assignedOffice}
                      onChange={(e) => setJuniorForm((p) => ({ ...p, assignedOffice: e.target.value }))}
                    >
                      {offices.map((o) => (
                        <MenuItem key={o.id} value={o.name}>{o.name} ({o.city})</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddJuniorOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleLinkJunior}
            disabled={!searchResult}
            sx={{ fontWeight: "bold" }}
          >
            LINK TO MY PRACTICE TEAM
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
