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
import { MemberService } from "../services/memberService";
import ActivityService from "../services/activityService";
import useAuth from "../hooks/useAuth";

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
            sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#ffffff", fontWeight: "bold", px: 1, py: 2.2, borderRadius: 2 }}
          />
        </Stack>
      </Paper>

      {/* SUMMARY CATEGORY METRICS BAR */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">NOTARY & ATTESTATION</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.dark">{categoryStats.notary}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">ADVOCATES & COUNSEL</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.dark">{categoryStats.advocate}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#fff7ed", border: "1px solid #fed7aa" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">LEGAL HELP REQUESTERS</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.dark">{categoryStats.requester}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#f5f3ff", border: "1px solid #ddd6fe" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">FRANCHISE APPLICANTS</Typography>
            <Typography variant="h4" fontWeight="bold" color="secondary.dark">{categoryStats.franchise}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 2 }}>
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
                <TableCell colSpan={10} align="center">
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
    </Box>
  );
}