import { useState, useEffect } from "react";
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
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";

import VoiceInputAdornment from "../common/VoiceInputAdornment.jsx";
import MemberService from "../../services/memberService.js";
import VirtualOfficeService, { DEFAULT_COURT_OFFICES, DEFAULT_RANKED_SPECIALIZATIONS } from "../../services/virtualOfficeService.js";

export default function AdvocatePracticeTeamCard({ profile, onUpdate }) {
  const memberLevel = (profile?.member_level || profile?.memberLevel || "BASIC").toUpperCase();
  const isPremium = ["PRO", "EXECUTIVE", "ENTERPRISE", "PROFESSIONAL", "ADVANCED"].includes(memberLevel);

  const memberId = profile?.member_id || profile?.memberId || profile?.id;
  const memberName = profile?.name || profile?.fullName || "Advocate";

  // Virtual office & team state
  const [offices, setOffices] = useState(DEFAULT_COURT_OFFICES);
  const [juniors, setJuniors] = useState([]);
  const [rankedSpecs, setRankedSpecs] = useState(DEFAULT_RANKED_SPECIALIZATIONS);
  const [teamQuotaLimit, setTeamQuotaLimit] = useState(5);

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
    photoUrl: "",
  });

  // Ranked Specializations Editor State
  const [specsEditorOpen, setSpecsEditorOpen] = useState(false);
  const [rank1, setRank1] = useState(DEFAULT_RANKED_SPECIALIZATIONS[0]?.name || "Criminal Law & FIR Bail");
  const [rank2, setRank2] = useState(DEFAULT_RANKED_SPECIALIZATIONS[1]?.name || "Property & Revenue Litigation");
  const [rank3, setRank3] = useState(DEFAULT_RANKED_SPECIALIZATIONS[2]?.name || "Constitutional & High Court Writs");
  const [rank4, setRank4] = useState(DEFAULT_RANKED_SPECIALIZATIONS[3]?.name || "Arbitration & Commercial Contracts");

  useEffect(() => {
    if (memberId) {
      const data = VirtualOfficeService.getOfficeForMember(memberId, memberName);
      if (data?.officeLocations && Array.isArray(data.officeLocations)) {
        setOffices(data.officeLocations);
      }
      if (data?.juniorsList && Array.isArray(data.juniorsList)) {
        setJuniors(data.juniorsList);
      }
      if (data?.rankedSpecializations && Array.isArray(data.rankedSpecializations)) {
        setRankedSpecs(data.rankedSpecializations);
        setRank1(data.rankedSpecializations[0]?.name || "");
        setRank2(data.rankedSpecializations[1]?.name || "");
        setRank3(data.rankedSpecializations[2]?.name || "");
        setRank4(data.rankedSpecializations[3]?.name || "");
      }
      if (data?.teamQuotaLimit) {
        setTeamQuotaLimit(data.teamQuotaLimit);
      }
    }
  }, [memberId, memberName]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const handleSaveRankedSpecs = () => {
    const updated = [
      { rank: 1, name: rank1.trim() || "Criminal Law", label: "🥇 Primary Core Expertise" },
      { rank: 2, name: rank2.trim() || "Property Litigation", label: "🥈 Secondary Specialty" },
      { rank: 3, name: rank3.trim() || "Constitutional Writs", label: "🥉 Tertiary Specialty" },
      { rank: 4, name: rank4.trim() || "Arbitration", label: "🏅 Additional Practice Area" },
    ];
    setRankedSpecs(updated);
    if (memberId) {
      VirtualOfficeService.updateOffice(memberId, { rankedSpecializations: updated });
    }
    setSpecsEditorOpen(false);
    if (onUpdate) onUpdate();
  };

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
    if (juniors.length >= teamQuotaLimit) {
      alert(`Team capacity limit of ${teamQuotaLimit} members reached. Contact ICJ Admin to expand quota.`);
      return;
    }

    const defaultPhoto = searchResult.profilePhoto || searchResult.avatar || (
      juniorForm.designation.includes("Intern")
        ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
        : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
    );

    const newJunior = {
      id: `JR-${Date.now()}`,
      memberId: searchResult.member_id || searchResult.memberId || searchResult.id,
      name: searchResult.name || searchResult.fullName,
      designation: juniorForm.designation,
      assignedOffice: juniorForm.assignedOffice || offices[0]?.name || "Main Chamber",
      barId: searchResult.barId || searchResult.pan || "Registered ICJ Member",
      mobile: searchResult.mobile || "N/A",
      email: searchResult.email || "N/A",
      photoUrl: juniorForm.photoUrl.trim() || defaultPhoto,
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
    setJuniorForm({ designation: "Junior Associate", assignedOffice: "", photoUrl: "" });
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
            <GavelIcon /> Multi-Office Chambers, Ranked Practice &amp; Team Collegium
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage District Court, Tehsil/SDM, High Court &amp; Supreme Court Chambers, Ranked Core Expertise &amp; Verified ICJ Member Team
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
            Multi-Office Chamber Management (District Court, SDM Court, High Court Benches, Supreme Court &amp; NGT/NCLT Tribunals), Ranked Expertise Priority &amp; Verified ICJ Member Junior Team Binding is exclusively available for <strong>PRO &amp; EXECUTIVE</strong> Advocate accounts.
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
          {/* SECTION 0: RANKED SPECIALIZATION PRIORITY GRADING */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <StarIcon color="warning" fontSize="small" /> Ordered Specialization Priority Ranking
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Specialization ranked in order of primary core expertise (Rank 1) to lower priority areas
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setSpecsEditorOpen(true)}
                sx={{ fontWeight: "bold" }}
              >
                EDIT RANKING ✏️
              </Button>
            </Stack>

            <Grid container spacing={1.5}>
              {rankedSpecs.map((sp) => {
                const isRank1 = sp.rank === 1;
                const isRank2 = sp.rank === 2;
                const color = isRank1 ? "#b91c1c" : isRank2 ? "#d97706" : "#4c1d95";
                const bg = isRank1 ? "#fef2f2" : isRank2 ? "#fffbe6" : "#f3e8ff";

                return (
                  <Grid item xs={12} sm={6} key={sp.rank}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: bg, borderColor: color }}>
                      <Typography variant="caption" fontWeight="bold" color={color} display="block">
                        {sp.label}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                        {sp.name}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Divider />

          {/* SECTION 1: MULTI-OFFICE COURT & TRIBUNAL CHAMBERS */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <AccountBalanceIcon color="primary" fontSize="small" /> Registered Pan-India Court Offices &amp; Chambers ({offices.length})
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
                const isTehsil = off.type === "TehsilCourt";
                const isHighCourt = off.type === "HighCourt";
                const isSupreme = off.type === "SupremeCourt";
                const isTribunal = off.type === "Tribunal";

                const chipColor = isSupreme ? "#7c3aed" : isHighCourt ? "#1d4ed8" : isTribunal ? "#c2410c" : isTehsil ? "#0284c7" : "#059669";
                const chipLabel = isSupreme ? "🏛️ SUPREME COURT" : isHighCourt ? "⚖️ HIGH COURT BENCH" : isTribunal ? "⚖️ TRIBUNAL / FORUM" : isTehsil ? "🏛️ SDM / TEHSIL COURT" : "🏢 DISTRICT COURT";

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

          <Divider />

          {/* SECTION 2: VERIFIED PRACTICE TEAM (JUNIORS & ASSOCIATES) WITH PHOTOS & QUOTA */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <VerifiedUserIcon color="success" fontSize="small" /> Verified Practice Collegium &amp; Junior Team ({juniors.length} / {teamQuotaLimit} Slots Used)
                  </Typography>
                  <Chip
                    label={juniors.length >= teamQuotaLimit ? "QUOTA FULL 🔒" : `${teamQuotaLimit - juniors.length} SLOTS REMAINING`}
                    color={juniors.length >= teamQuotaLimit ? "error" : "success"}
                    size="small"
                    sx={{ fontWeight: "bold", height: 20, fontSize: "0.65rem" }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Only persons with a registered ICJ Member ID can be linked to your official Practice Collegium.
                </Typography>
              </Box>

              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<PersonAddIcon />}
                disabled={juniors.length >= teamQuotaLimit}
                onClick={() => {
                  setSearchQuery("");
                  setSearchResult(null);
                  setSearchError("");
                  setAddJuniorOpen(true);
                }}
                sx={{ fontWeight: "bold" }}
              >
                LINK VERIFIED MEMBER ID ➕
              </Button>
            </Stack>

            {juniors.length >= teamQuotaLimit && (
              <Alert severity="warning" sx={{ mb: 2, fontSize: "0.82rem", fontWeight: 500 }}>
                ⚠️ Team Capacity Quota of {teamQuotaLimit} members reached. To add more junior associates, legal interns, or staff, contact ICJ Admin for custom quota expansion.
              </Alert>
            )}

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
                          <Avatar
                            src={jr.photoUrl}
                            alt={jr.name}
                            sx={{ width: 48, height: 48, border: "2px solid #059669", bgcolor: "#059669", fontWeight: "bold" }}
                          >
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

      {/* ─── MODAL 0: EDIT RANKED SPECIALIZATION PRIORITY ───────────────── */}
      <Dialog open={specsEditorOpen} onClose={() => setSpecsEditorOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>🥇 Edit Ordered Specialization Priority</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
              Rank your practice fields in order of expertise. <strong>Rank 1</strong> represents your primary core specialization.
            </Alert>
            <TextField
              fullWidth required label="🥇 Rank 1: Primary Core Expertise *"
              value={rank1}
              onChange={(e) => setRank1(e.target.value)}
              placeholder="e.g. Criminal Law & FIR Bail"
              InputProps={{
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setRank1((p) => p + " " + txt)} value={rank1} />,
              }}
            />
            <TextField
              fullWidth label="🥈 Rank 2: Secondary Specialty *"
              value={rank2}
              onChange={(e) => setRank2(e.target.value)}
              placeholder="e.g. Property & Revenue Litigation"
              InputProps={{
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setRank2((p) => p + " " + txt)} value={rank2} />,
              }}
            />
            <TextField
              fullWidth label="🥉 Rank 3: Tertiary Specialty *"
              value={rank3}
              onChange={(e) => setRank3(e.target.value)}
              placeholder="e.g. Constitutional & High Court Writs"
              InputProps={{
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setRank3((p) => p + " " + txt)} value={rank3} />,
              }}
            />
            <TextField
              fullWidth label="🏅 Rank 4: Additional Practice Area"
              value={rank4}
              onChange={(e) => setRank4(e.target.value)}
              placeholder="e.g. Arbitration & Commercial Law"
              InputProps={{
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setRank4((p) => p + " " + txt)} value={rank4} />,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSpecsEditorOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSaveRankedSpecs} sx={{ fontWeight: "bold" }}>
            SAVE PRIORITY RANKING
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MODAL 1: ADD COURT OFFICE ───────────────────────────────────── */}
      <Dialog open={addOfficeOpen} onClose={() => setAddOfficeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>🏛️ Add Court Office Chamber</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select fullWidth label="Court Level / Jurisdiction *"
              value={officeForm.type}
              onChange={(e) => setOfficeForm((p) => ({ ...p, type: e.target.value }))}
            >
              <MenuItem value="DistrictCourt">🏢 District &amp; Sessions Court</MenuItem>
              <MenuItem value="TehsilCourt">🏛️ SDM / Tehsil Executive Court</MenuItem>
              <MenuItem value="HighCourt">⚖️ High Court Bench</MenuItem>
              <MenuItem value="SupremeCourt">🏛️ Supreme Court of India</MenuItem>
              <MenuItem value="Tribunal">⚖️ Tribunal (NGT, NCLT, DRT, CAT)</MenuItem>
            </TextField>
            <TextField
              fullWidth required label="Office / Chamber Name *"
              placeholder="e.g. Chamber #42, SDM Court Complex"
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
              To add a Junior Advocate, Legal Intern or Staff member, enter their <strong>ICJ Member ID</strong> (e.g. 26ICJ08AA0001), <strong>Email Address</strong>, or <strong>Mobile Number</strong>.
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Photo URL (Optional)"
                      placeholder="https://... photo link"
                      value={juniorForm.photoUrl}
                      onChange={(e) => setJuniorForm((p) => ({ ...p, photoUrl: e.target.value }))}
                    />
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
