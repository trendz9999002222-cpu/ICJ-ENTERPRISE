import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
  Alert,
  Grid,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import { MemberService } from "../services/memberService";
import ActivityService from "../services/activityService";
import useAuth from "../hooks/useAuth";
import JudiciaryMasterService from "../services/judiciaryMasterService.js";
import SpecialtyUpgradeModal from "../components/membership/SpecialtyUpgradeModal.jsx";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SafeAccess from "../utils/safeAccess.js";

const STATUS_FILTERS = ["All", "Verified", "Pending", "Rejected", "Suspended"];
const CATEGORY_FILTERS = ["All", "Notary & Attestation", "Advocates & Counsel", "Legal Help Requesters", "Franchise Partners"];

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "verified": return "success";
    case "pending": return "warning";
    case "rejected": return "error";
    case "suspended": return "default";
    default: return "warning";
  }
};

const getMemberId = (member) =>
  member.member_id || member.memberId || member.id || member.uuid || "—";

const getMemberName = (member) =>
  member.fullName || member.full_name || member.name || "—";

const getPurposeDisplay = (member) => {
  if (member.serviceCategory) return `💼 Provider: ${member.serviceCategory}`;
  if (member.problemCategory) return `⚖️ Requester: ${member.problemCategory}`;
  if (member.franchiseCity)   return `🤝 Franchise: ${member.franchiseCity}`;
  return member.purpose || member.profession || "Standard Member";
};

export default function MemberDirectory() {
  const { user } = useAuth();
  const userRole = String(user?.role || "member").toLowerCase();
  const isAuthorizedAdmin = ["admin", "super_admin"].includes(userRole);

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editOpen, setEditOpen] = useState(false);
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editForm, setEditForm] = useState({});

  const refreshMembers = async () => {
    try {
      const list = await MemberService.getAll();
      setMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load members", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    MemberService.getAll()
      .then((list) => {
        if (isMounted) setMembers(Array.isArray(list) ? list : []);
      })
      .catch((error) => console.error("Failed to load members", error));

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryStats = useMemo(() => {
    let notary = 0, advocate = 0, requester = 0, franchise = 0;
    (members || []).forEach((m) => {
      const p = String(m.purpose || "").toLowerCase();
      const s = String(m.serviceCategory || "").toLowerCase();
      const pr = String(m.problemCategory || "").toLowerCase();
      const id = String(m.member_id || m.id || "").toLowerCase();

      if (s.includes("notar") || s.includes("attest") || p.includes("notary")) notary++;
      else if (id.includes("adv") || s.includes("court") || s.includes("consult") || p.includes("advocate")) advocate++;
      else if (m.purposeCode === "PROBLEM" || pr.length > 0) requester++;
      else if (m.purposeCode === "FRANCHISE" || m.franchiseCity) franchise++;
    });
    return { notary, advocate, requester, franchise, total: members.length };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return members.filter((member) => {
      const name = getMemberName(member);
      const prefix = member.namePrefix || member.name_prefix || "";
      const purp = getPurposeDisplay(member);

      const matchesSearch =
        !term ||
        [prefix, name, member.email, member.mobile, member.city, member.gender, member.purpose, purp, member.serviceCategory, member.problemCategory]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" ||
        (member.verification_status || "Pending").toLowerCase().includes(statusFilter.toLowerCase());

      let matchesCategory = true;
      if (categoryFilter === "Notary & Attestation") {
        matchesCategory = String(member.serviceCategory || "").toLowerCase().includes("notar") ||
                          String(member.serviceCategory || "").toLowerCase().includes("attest") ||
                          String(member.purpose || "").toLowerCase().includes("notary");
      } else if (categoryFilter === "Advocates & Counsel") {
        matchesCategory = String(member.member_id || "").toLowerCase().includes("adv") ||
                          String(member.serviceCategory || "").toLowerCase().includes("court") ||
                          String(member.serviceCategory || "").toLowerCase().includes("consult");
      } else if (categoryFilter === "Legal Help Requesters") {
        matchesCategory = member.purposeCode === "PROBLEM" || Boolean(member.problemCategory);
      } else if (categoryFilter === "Franchise Partners") {
        matchesCategory = member.purposeCode === "FRANCHISE" || Boolean(member.franchiseCity);
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [members, search, statusFilter, categoryFilter]);

  const openEdit = (member) => {
    setEditMember(member);
    setEditForm({
      namePrefix: member.namePrefix || member.name_prefix || "",
      name: getMemberName(member),
      gender: member.gender || "",
      dob: member.dob || "",
      email: member.email || "",
      mobile: member.mobile || "",
      city: member.city || "",
      state: member.state || "",
      verification_status: member.verification_status || "Pending",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const id = getMemberId(editMember);
      let birthYearVal = editMember.birthYear || editMember.birth_year || "";
      let ageVal = editMember.age || "";

      if (editForm.dob) {
        const d = new Date(editForm.dob);
        if (!isNaN(d.getTime())) {
          birthYearVal = String(d.getFullYear());
          const today = new Date();
          let yrs = today.getFullYear() - d.getFullYear();
          const m = today.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < d.getDate())) yrs--;
          if (yrs >= 0) ageVal = String(yrs);
        }
      }

      await MemberService.update(id, {
        ...editForm,
        fullName: editForm.name,
        name: editForm.name,
        birthYear: birthYearVal,
        birth_year: birthYearVal,
        age: ageVal,
      });
      ActivityService.create({
        title: `Member "${editForm.name}" profile updated`,
        type: "membership",
      });
      await refreshMembers();
    } catch (err) {
      alert(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setEditOpen(false);
      setEditMember(null);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete member "${getMemberName(member)}"?`)) return;
    try {
      await MemberService.remove(getMemberId(member));
      ActivityService.create({
        title: `Member "${getMemberName(member)}" deleted`,
        type: "membership",
      });
      await refreshMembers();
    } catch (err) {
      alert(`Failed to delete: ${err.message || "Unknown error"}`);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <Alert
          severity="error"
          icon={<LockIcon fontSize="large" />}
          sx={{ maxWidth: 650, width: "100%", p: 3, borderRadius: 3 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom color="error.main">
            Access Restricted — Administrator Permission Required
          </Typography>
          <Typography variant="body2">
            The Member Directory contains sensitive enterprise credentials and is strictly restricted to authorized Administrators only. Your account is logged in as a normal member.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ENTERPRISE BLUE GRADIENT HEADER BANNER */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.4)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Avatar sx={{ bgcolor: "#2563eb", width: 56, height: 56, boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
            <GroupsIcon sx={{ fontSize: 32, color: "#ffffff" }} />
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#ffffff", letterSpacing: 0.5 }}>
                Member Directory & Matchmaking Matrix
              </Typography>
              <Chip label="ENTERPRISE SCOPE" color="primary" size="small" sx={{ fontWeight: "bold", bgcolor: "#2563eb" }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
              Master Admin Command Centre: Real-Time Registry of Notary Public, Empaneled Lawyers, Service Providers & Legal Aid Requesters
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#34d399 !important" }} />}
            label={`${categoryStats.total} Total Registered Members`}
            onClick={() => setCategoryFilter("All")}
            sx={{
              bgcolor: categoryFilter === "All" ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.12)",
              color: "#ffffff",
              fontWeight: "bold",
              px: 1,
              py: 2.2,
              borderRadius: 2,
              cursor: "pointer",
              border: categoryFilter === "All" ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(59, 130, 246, 0.5)" },
            }}
          />
        </Stack>
      </Paper>

      {/* INTERACTIVE SUMMARY CATEGORY METRICS BAR */}
      <Grid container spacing={2} sx={{ mb: 3 }} id="kpi-stat-cards-container">
        <Grid item xs={6} sm={3}>
          <Paper
            onClick={() => {
              setCategoryFilter(categoryFilter === "Notary & Attestation" ? "All" : "Notary & Attestation");
              document.getElementById("members-table-container")?.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: categoryFilter === "Notary & Attestation" ? "#d1fae5" : "#ecfdf5",
              border: categoryFilter === "Notary & Attestation" ? "2.5px solid #059669" : "1px solid #a7f3d0",
              boxShadow: categoryFilter === "Notary & Attestation" ? "0 0 15px rgba(16, 185, 129, 0.4)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              NOTARY & ATTESTATION
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" fontWeight="bold" color="success.dark">
                {categoryStats.notary}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                ({categoryStats.total > 0 ? ((categoryStats.notary / categoryStats.total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Stack>
            <Typography variant="caption" color="#059669" fontWeight={700}>
              {categoryFilter === "Notary & Attestation" ? "✓ Filter Active (Click to Reset)" : "👉 Click to View List"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            onClick={() => {
              setCategoryFilter(categoryFilter === "Advocates & Counsel" ? "All" : "Advocates & Counsel");
              document.getElementById("members-table-container")?.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: categoryFilter === "Advocates & Counsel" ? "#dbeafe" : "#eff6ff",
              border: categoryFilter === "Advocates & Counsel" ? "2.5px solid #2563eb" : "1px solid #bfdbfe",
              boxShadow: categoryFilter === "Advocates & Counsel" ? "0 0 15px rgba(37, 99, 235, 0.4)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              ADVOCATES & COUNSEL
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" fontWeight="bold" color="primary.dark">
                {categoryStats.advocate}
              </Typography>
              <Typography variant="caption" color="primary.main" fontWeight={700}>
                ({categoryStats.total > 0 ? ((categoryStats.advocate / categoryStats.total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Stack>
            <Typography variant="caption" color="#2563eb" fontWeight={700}>
              {categoryFilter === "Advocates & Counsel" ? "✓ Filter Active (Click to Reset)" : "👉 Click to View List"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            onClick={() => {
              setCategoryFilter(categoryFilter === "Legal Help Requesters" ? "All" : "Legal Help Requesters");
              document.getElementById("members-table-container")?.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: categoryFilter === "Legal Help Requesters" ? "#fef3c7" : "#fff7ed",
              border: categoryFilter === "Legal Help Requesters" ? "2.5px solid #d97706" : "1px solid #fed7aa",
              boxShadow: categoryFilter === "Legal Help Requesters" ? "0 0 15px rgba(217, 119, 6, 0.4)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              LEGAL HELP REQUESTERS
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" fontWeight="bold" color="warning.dark">
                {categoryStats.requester}
              </Typography>
              <Typography variant="caption" color="warning.main" fontWeight={700}>
                ({categoryStats.total > 0 ? ((categoryStats.requester / categoryStats.total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Stack>
            <Typography variant="caption" color="#d97706" fontWeight={700}>
              {categoryFilter === "Legal Help Requesters" ? "✓ Filter Active (Click to Reset)" : "👉 Click to View List"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            onClick={() => {
              setCategoryFilter(categoryFilter === "Franchise Partners" ? "All" : "Franchise Partners");
              document.getElementById("members-table-container")?.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: categoryFilter === "Franchise Partners" ? "#ede9fe" : "#f5f3ff",
              border: categoryFilter === "Franchise Partners" ? "2.5px solid #7c3aed" : "1px solid #ddd6fe",
              boxShadow: categoryFilter === "Franchise Partners" ? "0 0 15px rgba(124, 58, 237, 0.4)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              FRANCHISE APPLICANTS
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" fontWeight="bold" color="secondary.dark">
                {categoryStats.franchise}
              </Typography>
              <Typography variant="caption" color="secondary.main" fontWeight={700}>
                ({categoryStats.total > 0 ? ((categoryStats.franchise / categoryStats.total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Stack>
            <Typography variant="caption" color="#7c3aed" fontWeight={700}>
              {categoryFilter === "Franchise Partners" ? "✓ Filter Active (Click to Reset)" : "👉 Click to View List"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper id="members-table-container" sx={{ p: 3, mt: 2 }}>
        {/* CATEGORY & PURPOSE FILTERS */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, city, notary, advocate, or matter..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setSearch(txt.trim())} value={search} />,
              }}
            />

            <Stack direction="row" spacing={1} flexShrink={0}>
              {STATUS_FILTERS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  clickable
                  color={statusFilter === f ? "primary" : "default"}
                  onClick={() => setStatusFilter(f)}
                  variant={statusFilter === f ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Stack>

          {/* CATEGORY SWITCHES */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", fontWeight: "bold", mr: 1 }}>
              Filter by Service Category:
            </Typography>
            {CATEGORY_FILTERS.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                clickable
                color={categoryFilter === cat ? "secondary" : "default"}
                onClick={() => setCategoryFilter(cat)}
                variant={categoryFilter === cat ? "filled" : "outlined"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            ))}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> registered members
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Purpose / Service Request</TableCell>
              <TableCell>🥇 Core Specialty Badges</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>DOB / Age</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No matching members found for selected service category filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={getMemberId(member)} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {getMemberId(member)}
                  </TableCell>
                  <TableCell fontWeight="bold">
                    {member.namePrefix ? `${member.namePrefix} ` : ""}
                    {getMemberName(member)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPurposeDisplay(member)}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: "bold", fontSize: "0.72rem" }}
                    />
                  </TableCell>
                  {/* CORE SPECIALTY STACKED BADGES */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {JudiciaryMasterService.formatSpecialtyBadges(member.unlockedSpecialties || [member.profession || "CRIMINAL_BAIL"]).map((spec, idx) => (
                        <Chip
                          key={idx}
                          label={`${spec?.rankIcon || "🥇"} ${SafeAccess.splitFirst(spec?.name, " ", "Specialty")}`}
                          size="small"
                          color={idx === 0 ? "success" : "info"}
                          sx={{ fontWeight: 800, fontSize: "0.68rem" }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{member.gender || "—"}</TableCell>
                  <TableCell>
                    {member.dob ? member.dob : member.age ? `${member.age} yrs` : member.birthYear ? `Yr: ${member.birthYear}` : "—"}
                  </TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>{member.mobile || "—"}</TableCell>
                  <TableCell>{member.city || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.verification_status || "Pending"}
                      size="small"
                      color={statusColor(member.verification_status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <Button size="small" onClick={() => openEdit(member)}>
                        <EditIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button size="small" color="error" onClick={() => handleDelete(member)}>
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Member Profile</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                sx={{ width: 110 }}
                label="Title"
                value={editForm.namePrefix || ""}
                onChange={(e) => setEditForm({ ...editForm, namePrefix: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Mr.">Mr.</MenuItem>
                <MenuItem value="Mrs.">Mrs.</MenuItem>
                <MenuItem value="Ms.">Ms.</MenuItem>
                <MenuItem value="Dr.">Dr.</MenuItem>
                <MenuItem value="Adv.">Adv.</MenuItem>
                <MenuItem value="Prof.">Prof.</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={editForm.gender || ""}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={editForm.dob || ""}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email"
              value={editForm.email || ""}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />

            <TextField
              fullWidth
              label="Mobile"
              value={editForm.mobile || ""}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
            />

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="City"
                value={editForm.city || ""}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
              <TextField
                fullWidth
                label="State"
                value={editForm.state || ""}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              />
            </Stack>

            <TextField
              select
              fullWidth
              label="Verification Status"
              value={editForm.verification_status || "Pending"}
              onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value })}
            >
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <SpecialtyUpgradeModal
        open={specialtyModalOpen}
        onClose={() => setSpecialtyModalOpen(false)}
        onSuccess={() => refreshData()}
        memberId={getMemberId(editMember || {})}
        memberName={getMemberName(editMember || {})}
        initialSpecialties={editMember?.unlockedSpecialties || ["CRIMINAL_BAIL"]}
      />
    </Box>
  );
}