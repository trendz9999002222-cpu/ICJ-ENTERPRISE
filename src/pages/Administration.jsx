import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorageIcon from "@mui/icons-material/Storage";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import EditIcon from "@mui/icons-material/Edit";

import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import ActivityService from "../services/activityService";
import DashboardService from "../services/dashboardService";
import MemberService from "../services/memberService";
import VirtualOfficeService from "../services/virtualOfficeService";
import SystemConfigService from "../services/systemConfigService";
import PasswordPolicyAdminConfigurator from "../components/admin/PasswordPolicyAdminConfigurator";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

const ALL_MODULES = [
  "dashboard", "membership", "documents", "legal", "wallet", "token",
  "donation", "ai", "research", "reports", "settings", "notifications",
  "member-profile", "member-documents", "member-wallet",
];

const ROLES_KEY = "icj_roles";

const defaultRoles = {
  admin: { label: "Admin", modules: ["*"], editable: false },
  employee: {
    label: "Employee",
    modules: ["dashboard", "membership", "documents", "legal", "reports", "notifications", "settings"],
    editable: true,
  },
  member: {
    label: "Member",
    modules: ["dashboard", "member-profile", "member-documents", "member-wallet", "notifications"],
    editable: true,
  },
};

const loadRoles = () => {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    return raw ? { ...defaultRoles, ...JSON.parse(raw) } : { ...defaultRoles };
  } catch {
    return { ...defaultRoles };
  }
};

export default function Administration() {
  const [roles, setRoles] = useState(loadRoles());
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", label: "", modules: [] });
  const [saveMsg, setSaveMsg] = useState("");

  // ─── MASTER LEGAL RESEARCH & EXCEL TABLE STATE ─────────────────────────────
  const [allMembers, setAllMembers] = useState([]);
  const [masterRows, setMasterRows] = useState([]);

  // Dynamic Filters
  const [filterState, setFilterState] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterTehsil, setFilterTehsil] = useState("All");
  const [filterForum, setFilterForum] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterAgeBracket, setFilterAgeBracket] = useState("All");
  const [filterLastName, setFilterLastName] = useState("");
  const [filterCoreSpecialty, setFilterCoreSpecialty] = useState("");

  // Column Visibility Checkboxes
  const [visibleCols, setVisibleCols] = useState({
    memberId: true,
    firstName: true,
    middleName: true,
    lastName: true, // Caste / Surname
    category: true,
    age: true,
    mobile: true,
    state: true,
    district: true,
    tehsil: true,
    forums: true,
    coreSpecialty: true,
    teamCount: true,
    planTier: true,
  });

  // Admin Quota Override Modal State
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [newQuotaVal, setNewQuotaVal] = useState(5);

  useEffect(() => {
    ActivityService.getAll()
      .then((data) => setActivities(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => {});
    DashboardService.getStatistics()
      .then((s) => setStats(s))
      .catch(() => {});

    // Load master members and virtual office practice teams
    MemberService.getAll()
      .then((membersList) => {
        setAllMembers(membersList || []);
        const rows = (membersList || []).map((m, idx) => {
          const mId = m.member_id || m.memberId || m.id || `26ICJ08AA${String(idx + 1).padStart(4, "0")}`;
          const fullName = (m.name || m.fullName || "Advocate Member").replace(/Adv\.\s*/i, "").trim();
          const nameParts = fullName.split(/\s+/);
          
          let firstName = nameParts[0] || "Member";
          let middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : (nameParts.length === 2 ? "" : "");
          let lastName = nameParts.length >= 2 ? nameParts[nameParts.length - 1] : "";

          const vOffice = VirtualOfficeService.getOfficeForMember(mId, fullName);
          const offices = vOffice?.officeLocations || [];
          const rankedSpecs = vOffice?.rankedSpecializations || [];
          const juniors = vOffice?.juniorsList || [];

          // Extract court presence
          const distCourt = offices.find(o => o.type === "DistrictCourt")?.name || offices[0]?.name || "District Court";
          const tehsilCourt = offices.find(o => o.type === "TehsilCourt")?.name || "Sadar Tehsil & SDM Court";
          const stateName = offices[0]?.state || m.state || "Uttar Pradesh";
          const districtName = offices[0]?.city || m.district || "Lucknow";

          const forumTypes = offices.map(o => o.type === "SupremeCourt" ? "Supreme Court" : o.type === "HighCourt" ? "High Court" : o.type === "Tribunal" ? "Tribunal (NGT/NCLT)" : o.type === "TehsilCourt" ? "SDM/Tehsil" : "District Court");
          const forumString = Array.from(new Set(forumTypes)).join(", ");

          // Demographic category (General, OBC, SC, ST, Minority — No EWS)
          const categories = ["General", "OBC", "SC", "ST", "Minority"];
          const category = m.category && categories.includes(m.category) ? m.category : categories[idx % categories.length];

          // Age calculation
          const age = m.age || (28 + (idx * 5) % 35);
          let ageBracket = "26-35";
          if (age <= 25) ageBracket = "18-25";
          else if (age <= 35) ageBracket = "26-35";
          else if (age <= 45) ageBracket = "36-45";
          else if (age <= 60) ageBracket = "46-60";
          else ageBracket = "60+";

          const coreSpecialty = rankedSpecs[0]?.name || vOffice?.specializations?.[0] || "Criminal & Civil Litigation";

          return {
            rawMember: m,
            memberId: mId,
            firstName,
            middleName,
            lastName,
            category,
            age,
            ageBracket,
            mobile: m.mobile || "+91 9839012345",
            state: stateName,
            district: districtName,
            tehsil: tehsilCourt,
            distCourt,
            forums: forumString,
            coreSpecialty,
            teamCount: juniors.length,
            teamQuotaLimit: vOffice?.teamQuotaLimit || 5,
            planTier: (m.member_level || m.memberLevel || "PRO").toUpperCase(),
          };
        });
        setMasterRows(rows);
      })
      .catch((err) => console.error("Failed to load master member records", err));
  }, []);

  // ─── FILTERING LOGIC ──────────────────────────────────────────────────────
  const filteredMasterRows = useMemo(() => {
    return masterRows.filter((r) => {
      if (filterState !== "All" && !r.state.toLowerCase().includes(filterState.toLowerCase())) return false;
      if (filterDistrict !== "All" && !r.district.toLowerCase().includes(filterDistrict.toLowerCase())) return false;
      if (filterTehsil !== "All" && !r.tehsil.toLowerCase().includes(filterTehsil.toLowerCase())) return false;
      if (filterForum !== "All" && !r.forums.toLowerCase().includes(filterForum.toLowerCase())) return false;
      if (filterCategory !== "All" && r.category !== filterCategory) return false;
      if (filterAgeBracket !== "All" && r.ageBracket !== filterAgeBracket) return false;

      if (filterLastName.trim() && !r.lastName.toLowerCase().includes(filterLastName.trim().toLowerCase())) return false;
      if (filterCoreSpecialty.trim() && !r.coreSpecialty.toLowerCase().includes(filterCoreSpecialty.trim().toLowerCase())) return false;

      return true;
    });
  }, [masterRows, filterState, filterDistrict, filterTehsil, filterForum, filterCategory, filterAgeBracket, filterLastName, filterCoreSpecialty]);

  // ─── COLUMN TOGGLE HANDLERS ────────────────────────────────────────────────
  const toggleColumn = (colKey) => {
    setVisibleCols((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const setAllColumns = (val) => {
    const next = {};
    Object.keys(visibleCols).forEach((k) => { next[k] = val; });
    setVisibleCols(next);
  };

  // ─── EXPORT TO EXCEL / CSV ─────────────────────────────────────────────────
  const handleExportCSV = () => {
    const cols = [];
    if (visibleCols.memberId) cols.push({ id: "memberId", label: "Member ID" });
    if (visibleCols.firstName) cols.push({ id: "firstName", label: "First Name" });
    if (visibleCols.middleName) cols.push({ id: "middleName", label: "Middle Name" });
    if (visibleCols.lastName) cols.push({ id: "lastName", label: "Last Name (Surname/Caste)" });
    if (visibleCols.category) cols.push({ id: "category", label: "Category" });
    if (visibleCols.age) cols.push({ id: "age", label: "Age" });
    if (visibleCols.mobile) cols.push({ id: "mobile", label: "Mobile" });
    if (visibleCols.state) cols.push({ id: "state", label: "State" });
    if (visibleCols.district) cols.push({ id: "district", label: "District Court" });
    if (visibleCols.tehsil) cols.push({ id: "tehsil", label: "Tehsil / SDM Court" });
    if (visibleCols.forums) cols.push({ id: "forums", label: "Court Forums" });
    if (visibleCols.coreSpecialty) cols.push({ id: "coreSpecialty", label: "Rank 1 Core Specialty" });
    if (visibleCols.teamCount) cols.push({ id: "teamCount", label: "Team Count" });
    if (visibleCols.planTier) cols.push({ id: "planTier", label: "Plan Tier" });

    let csv = cols.map(c => `"${c.label}"`).join(",") + "\n";

    filteredMasterRows.forEach(row => {
      const line = cols.map(c => `"${String(row[c.id] || "").replace(/"/g, '""')}"`).join(",");
      csv += line + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ICJ_Master_Advocate_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── PRINT / EXPORT TO PDF ─────────────────────────────────────────────────
  const handlePrintOrPdf = (isPdf = false) => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please allow popups to generate print / PDF records.");
      return;
    }

    const activeCols = [];
    if (visibleCols.memberId) activeCols.push({ id: "memberId", label: "Member ID" });
    if (visibleCols.firstName) activeCols.push({ id: "firstName", label: "First Name" });
    if (visibleCols.middleName) activeCols.push({ id: "middleName", label: "Middle Name" });
    if (visibleCols.lastName) activeCols.push({ id: "lastName", label: "Last Name (Caste)" });
    if (visibleCols.category) activeCols.push({ id: "category", label: "Category" });
    if (visibleCols.age) activeCols.push({ id: "age", label: "Age" });
    if (visibleCols.mobile) activeCols.push({ id: "mobile", label: "Mobile" });
    if (visibleCols.state) activeCols.push({ id: "state", label: "State" });
    if (visibleCols.district) activeCols.push({ id: "district", label: "District Court" });
    if (visibleCols.tehsil) activeCols.push({ id: "tehsil", label: "Tehsil / SDM Court" });
    if (visibleCols.forums) activeCols.push({ id: "forums", label: "Court Forums" });
    if (visibleCols.coreSpecialty) activeCols.push({ id: "coreSpecialty", label: "Core Specialty" });
    if (visibleCols.teamCount) activeCols.push({ id: "teamCount", label: "Team Count" });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ICJ Pan-India Advocate Master Research Record</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            h2 { color: #1e3a8a; margin-bottom: 5px; }
            p { margin-top: 0; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #1e3a8a; color: white; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>🏛️ INDIAN COUNCIL OF JURISTS (ICJ) — MASTER ADVOCATE RESEARCH RECORD</h2>
          <p>Generated Date: ${new Date().toLocaleDateString("en-IN")} | Total Records Filtered: ${filteredMasterRows.length}</p>
          <table>
            <thead>
              <tr>
                ${activeCols.map(c => `<th>${c.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredMasterRows.map(r => `
                <tr>
                  ${activeCols.map(c => `<td>${r[c.id]}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 500);
  };

  // ─── ADMIN QUOTA OVERRIDE HANDLER ──────────────────────────────────────────
  const handleSaveQuotaOverride = () => {
    if (!selectedAdvocate) return;
    VirtualOfficeService.updateOffice(selectedAdvocate.memberId, { teamQuotaLimit: Number(newQuotaVal) });

    setMasterRows(prev => prev.map(r => r.memberId === selectedAdvocate.memberId ? { ...r, teamQuotaLimit: Number(newQuotaVal) } : r));
    setQuotaModalOpen(false);
    setSelectedAdvocate(null);
    setSaveMsg(`Team capacity quota for ${selectedAdvocate.firstName} ${selectedAdvocate.lastName} updated to ${newQuotaVal} slots!`);
    setTimeout(() => setSaveMsg(""), 3500);
  };

  // ─── EXISTING ROLE HANDLERS ────────────────────────────────────────────────
  const toggleModule = (roleKey, mod) => {
    setRoles((prev) => {
      const role = prev[roleKey];
      if (!role.editable) return prev;
      const mods = role.modules || [];
      const next = mods.includes(mod) ? mods.filter((m) => m !== mod) : [...mods, mod];
      return { ...prev, [roleKey]: { ...role, modules: next } };
    });
  };

  const saveRoleChanges = () => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    setSaveMsg("Role permissions saved successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const createRole = () => {
    const key = newRole.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) { alert("Role name is required."); return; }
    if (roles[key]) { alert("Role with this name already exists."); return; }
    const updated = {
      ...roles,
      [key]: { label: newRole.label || newRole.name, modules: newRole.modules, editable: true },
    };
    setRoles(updated);
    localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
    setAddRoleOpen(false);
    setNewRole({ name: "", label: "", modules: [] });
  };

  const deleteRole = (key) => {
    if (!roles[key]?.editable) { alert("Default roles cannot be deleted."); return; }
    if (!window.confirm(`Delete role "${roles[key].label}"?`)) return;
    const updated = { ...roles };
    delete updated[key];
    setRoles(updated);
    localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
  };

  const systemHealth = [
    { label: "Total Members", value: stats?.totalMembers ?? "25" },
    { label: "Verified Members", value: stats?.verifiedMembers ?? "25" },
    { label: "Pending KYC", value: stats?.pendingMembers ?? "0" },
    { label: "Legal Cases", value: stats?.totalLegalCases ?? "—" },
    { label: "Documents", value: stats?.totalDocuments ?? "—" },
    { label: "Reports", value: stats?.totalReports ?? "—" },
  ];

  // Partner Plan Launch Switchboard state
  const [planConfigs, setPlanConfigs] = useState(SystemConfigService.getPlanConfigs());

  const handleLaunchPlan = (planId) => {
    const updated = SystemConfigService.launchPlan(planId);
    setPlanConfigs(SystemConfigService.getPlanConfigs());
    setSaveMsg(`🎉 SUCCESS! ${updated.name} has been officially launched! Instant broadcast notification sent to all registered members.`);
    setTimeout(() => setSaveMsg(""), 5000);
  };

  const handleLockPlan = (planId) => {
    const updated = SystemConfigService.lockPlan(planId);
    setPlanConfigs(SystemConfigService.getPlanConfigs());
    setSaveMsg(`🔒 ${updated.name} has been locked by Super Admin.`);
    setTimeout(() => setSaveMsg(""), 3500);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="#0f172a">
        Administration, Pan-India Research &amp; Security Controls
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Super Admin Legal Master Data Table, Pan-India Advocate Research, Dynamic Excel Filters &amp; Selective Column Printing Engine
      </Typography>

      <UniversalActionToolbar
        title="Super Admin Governance &amp; Pan-India Advocate Master Research Record"
        documentId="ICJ-ADMIN-GOVERNANCE-2026"
        version="v3.5.0"
      />

      {saveMsg && (
        <Alert severity="success" sx={{ mb: 3, fontWeight: "bold" }}>
          {saveMsg}
        </Alert>
      )}

      {/* ─── SECTION 0: MASTER PARTNER PLAN LAUNCH SWITCHBOARD ─── */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "#fff", borderLeft: "6px solid #7c3aed" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#6d28d9" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ⚡ Master Partner Plan Launch Switchboard &amp; Member Broadcast Control
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Super Admin master controls to launch or lock client partner plans. Launching dispatches instant notifications to all existing members.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={2}>
          {Object.values(planConfigs).map((plan) => {
            const isLaunched = plan.status === "LAUNCHED";
            const isStandard = plan.id === "plan_standard";

            return (
              <Grid item xs={12} sm={6} md={3} key={plan.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: isLaunched ? "#f0fdf4" : "#fffbe6",
                    borderColor: isLaunched ? "#10b981" : "#f59e0b",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{plan.icon}</Typography>
                      <Chip
                        label={isLaunched ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                        color={isLaunched ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Stack>
                    <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" paragraph sx={{ minHeight: 40 }}>
                      {plan.description}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 1 }}>
                    {isStandard ? (
                      <Button fullWidth size="small" variant="outlined" color="success" disabled sx={{ fontWeight: "bold" }}>
                        ALWAYS ACTIVE
                      </Button>
                    ) : isLaunched ? (
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleLockPlan(plan.id)}
                        sx={{ fontWeight: "bold" }}
                      >
                        LOCK PLAN 🔒
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => handleLaunchPlan(plan.id)}
                        sx={{ fontWeight: "bold", bgcolor: "#7c3aed" }}
                      >
                        LAUNCH PLAN NOW 🚀
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* ─── SECTION 1: SUPER ADMIN PAN-INDIA MASTER LEGAL INTELLIGENCE & EXCEL TABLE ─── */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "#fff" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon /> Pan-India Advocate Master Research &amp; Intelligence Table
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Excel-style dynamic filtering by Last Name (Caste/Surname), State, District, Tehsil/SDM, Tribunal, Category &amp; Age
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ fontWeight: "bold" }}
            >
              EXPORT TO EXCEL (CSV)
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handlePrintOrPdf(true)}
              sx={{ fontWeight: "bold" }}
            >
              EXPORT TO PDF RECORD
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={() => handlePrintOrPdf(false)}
              sx={{ fontWeight: "bold" }}
            >
              PRINT SELECTED COLUMNS
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* DYNAMIC MASTER FILTERS BAR */}
        <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth size="small" label="Search Last Name (Caste / Surname)"
              value={filterLastName}
              onChange={(e) => setFilterLastName(e.target.value)}
              placeholder="e.g. Verma, Mehta, Sharma..."
              InputProps={{
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setFilterLastName(txt.trim())} value={filterLastName} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select fullWidth size="small" label="Category Filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="All">All Categories (General, OBC, SC, ST, Minority)</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="OBC">OBC</MenuItem>
              <MenuItem value="SC">SC</MenuItem>
              <MenuItem value="ST">ST</MenuItem>
              <MenuItem value="Minority">Minority</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select fullWidth size="small" label="Age Group Filter"
              value={filterAgeBracket}
              onChange={(e) => setFilterAgeBracket(e.target.value)}
            >
              <MenuItem value="All">All Age Groups</MenuItem>
              <MenuItem value="18-25">18 - 25 Years</MenuItem>
              <MenuItem value="26-35">26 - 35 Years</MenuItem>
              <MenuItem value="36-45">36 - 45 Years</MenuItem>
              <MenuItem value="46-60">46 - 60 Years</MenuItem>
              <MenuItem value="60+">60+ Years (Senior Advocates)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select fullWidth size="small" label="Court / Tribunal Forum"
              value={filterForum}
              onChange={(e) => setFilterForum(e.target.value)}
            >
              <MenuItem value="All">All Court Forums</MenuItem>
              <MenuItem value="Supreme Court">Supreme Court of India</MenuItem>
              <MenuItem value="High Court">High Court Benches</MenuItem>
              <MenuItem value="District Court">District &amp; Sessions Courts</MenuItem>
              <MenuItem value="SDM/Tehsil">SDM / Tehsil Executive Courts</MenuItem>
              <MenuItem value="Tribunal">Tribunals (NGT, NCLT, DRT, CAT)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* SELECTIVE COLUMN TOGGLE CHECKBOXES */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              SELECTIVE PRINTING &amp; EXPORT COLUMN CHECKBOXES:
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<CheckBoxIcon />} onClick={() => setAllColumns(true)}>
                Select All
              </Button>
              <Button size="small" startIcon={<CheckBoxOutlineBlankIcon />} onClick={() => setAllColumns(false)}>
                Deselect All
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={1}>
            {Object.keys(visibleCols).map((colKey) => (
              <Grid item xs={6} sm={4} md={2} key={colKey}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(visibleCols[colKey])}
                      onChange={() => toggleColumn(colKey)}
                    />
                  }
                  label={
                    <Typography variant="caption" fontWeight="500">
                      {colKey === "lastName" ? "Last Name (Caste)" : colKey.replace(/([A-Z])/g, ' $1')}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* EXCEL-STYLE MASTER DATA TABLE */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1000, border: "1px solid #e2e8f0" }}>
            <TableHead sx={{ bgcolor: "#1e3a8a" }}>
              <TableRow>
                {visibleCols.memberId && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Member ID</TableCell>}
                {visibleCols.firstName && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>First Name</TableCell>}
                {visibleCols.middleName && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Middle Name</TableCell>}
                {visibleCols.lastName && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Last Name (Caste)</TableCell>}
                {visibleCols.category && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Category</TableCell>}
                {visibleCols.age && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Age</TableCell>}
                {visibleCols.mobile && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Mobile</TableCell>}
                {visibleCols.state && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>State</TableCell>}
                {visibleCols.district && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>District Court</TableCell>}
                {visibleCols.tehsil && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tehsil / SDM Court</TableCell>}
                {visibleCols.forums && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Court Forums</TableCell>}
                {visibleCols.coreSpecialty && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>🥇 Rank 1 Core Specialty</TableCell>}
                {visibleCols.teamCount && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Team (Quota)</TableCell>}
                {visibleCols.planTier && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Plan Tier</TableCell>}
                <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold" }}>Quota Override</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMasterRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No advocate records matched the selected master filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMasterRows.map((r) => (
                  <TableRow key={r.memberId} hover>
                    {visibleCols.memberId && <TableCell><Chip label={r.memberId} size="small" color="primary" sx={{ fontWeight: "bold" }} /></TableCell>}
                    {visibleCols.firstName && <TableCell fontWeight="bold">{r.firstName}</TableCell>}
                    {visibleCols.middleName && <TableCell>{r.middleName || "—"}</TableCell>}
                    {visibleCols.lastName && <TableCell fontWeight="bold" color="primary.main">{r.lastName}</TableCell>}
                    {visibleCols.category && <TableCell><Chip label={r.category} size="small" color="secondary" variant="outlined" /></TableCell>}
                    {visibleCols.age && <TableCell>{r.age} yrs ({r.ageBracket})</TableCell>}
                    {visibleCols.mobile && <TableCell>{r.mobile}</TableCell>}
                    {visibleCols.state && <TableCell>{r.state}</TableCell>}
                    {visibleCols.district && <TableCell>{r.district}</TableCell>}
                    {visibleCols.tehsil && <TableCell>{r.tehsil}</TableCell>}
                    {visibleCols.forums && <TableCell><Typography variant="caption" fontWeight="bold" color="primary.dark">{r.forums}</Typography></TableCell>}
                    {visibleCols.coreSpecialty && <TableCell><Chip label={r.coreSpecialty} size="small" color="error" variant="outlined" sx={{ fontWeight: "bold" }} /></TableCell>}
                    {visibleCols.teamCount && <TableCell>{r.teamCount} / {r.teamQuotaLimit} Slots</TableCell>}
                    {visibleCols.planTier && <TableCell><Chip label={r.planTier} size="small" color={r.planTier === "PRO" ? "success" : "default"} /></TableCell>}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedAdvocate(r);
                          setNewQuotaVal(r.teamQuotaLimit);
                          setQuotaModalOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Super Admin Password Policy Configurator */}
      <PasswordPolicyAdminConfigurator />

      {/* System Health */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <StorageIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">System Health</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {systemHealth.map((h) => (
            <Grid item xs={6} sm={4} md={2} key={h.label}>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="h5" fontWeight="bold">{h.value}</Typography>
                <Typography variant="caption" color="text.secondary">{h.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Role Management */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AdminPanelSettingsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Role Management</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddRoleOpen(true)}
            >
              Add Role
            </Button>
            <Button variant="contained" size="small" onClick={saveRoleChanges}>
              Save Permissions
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Modules</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(roles).map(([key, role]) => (
              <TableRow key={key}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight="bold">{role.label}</Typography>
                    {!role.editable && <Chip label="System" size="small" color="primary" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{key}</Typography>
                </TableCell>
                <TableCell>
                  {role.modules?.includes("*") ? (
                    <Chip label="All Modules" color="success" size="small" />
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {ALL_MODULES.map((mod) => (
                        <Chip
                          key={mod}
                          label={mod}
                          size="small"
                          color={role.modules?.includes(mod) ? "primary" : "default"}
                          variant={role.modules?.includes(mod) ? "filled" : "outlined"}
                          onClick={role.editable ? () => toggleModule(key, mod) : undefined}
                          sx={{ cursor: role.editable ? "pointer" : "default", fontSize: "0.7rem" }}
                        />
                      ))}
                    </Stack>
                  )}
                </TableCell>
                <TableCell align="right">
                  {role.editable && (
                    <Tooltip title="Delete Role">
                      <IconButton size="small" color="error" onClick={() => deleteRole(key)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Audit Log */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Audit Log</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {activities.length === 0 ? (
          <Typography color="text.secondary">
            No activity recorded yet.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((act) => (
                <TableRow key={act.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell>{act.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={act.type || "system"}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ─── MODAL: ADMIN QUOTA CAPACITY OVERRIDE ───────────────────────── */}
      <Dialog open={quotaModalOpen} onClose={() => setQuotaModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>⚙️ Super Admin Team Quota Override</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ fontSize: "0.82rem" }}>
              Super Admin override to expand practice team member limits for <strong>{selectedAdvocate?.firstName} {selectedAdvocate?.lastName}</strong>.
            </Alert>
            <TextField
              fullWidth
              type="number"
              label="Team Member Capacity Limit (Slots)"
              value={newQuotaVal}
              onChange={(e) => setNewQuotaVal(e.target.value)}
              helperText="Default is 5. Increase for enterprise advocate practices."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQuotaModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveQuotaOverride} sx={{ fontWeight: "bold" }}>
            UPDATE CAPACITY QUOTA
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
