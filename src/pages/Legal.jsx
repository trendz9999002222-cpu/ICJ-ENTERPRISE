import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TodayIcon from "@mui/icons-material/Today";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WarningIcon from "@mui/icons-material/Warning";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import LegalService from "../services/legalService";
import ActivityService from "../services/activityService";
import CaseDetailModal from "../components/legal/CaseDetailModal";
import AdvocateAssignmentModal from "../components/legal/AdvocateAssignmentModal";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";
import CascadingCourtSelector from "../components/common/CascadingCourtSelector";

export default function Legal() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentCase, setAssignmentCase] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [courtHierarchyData, setCourtHierarchyData] = useState({});

  const [form, setForm] = useState({
    title: "",
    caseType: "Constitutional / PIL",
    clientName: "",
    advocateName: "",
    courtName: "Supreme Court of India",
    bench: "Division Bench",
    jurisdiction: "Writ / Original",
    caseNumber: "",
    filingNumber: "",
    filingDate: new Date().toISOString().split("T")[0],
    registrationDate: new Date().toISOString().split("T")[0],
    nextHearing: "",
    status: "Pending",
    priority: "High",
    category: "Constitutional",
    remarks: "",
  });

  const loadCases = async () => {
    try {
      const data = await LegalService.getAll();
      const safeData = Array.isArray(data) ? data : [];
      setCases(safeData);
    } catch (error) {
      console.error("Failed to load cases", error);
      setCases([]);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCreate = async () => {
    if (!form.title.trim()) {
      alert("Case title is required.");
      return;
    }

    const newId = `ICJ-2026-CASE-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCaseNumber = form.caseNumber || (courtHierarchyData.caseTypeCode ? `${courtHierarchyData.caseTypeCode}/${Math.floor(1000 + Math.random() * 9000)}/2026` : `WP(C)/${Math.floor(1000 + Math.random() * 9000)}/2026`);

    const payload = {
      ...form,
      id: newId,
      caseId: newId,
      caseNumber: newCaseNumber,
      // Structured Judicial Taxonomy Data
      courtName: courtHierarchyData.courtName || form.courtName,
      courtComplex: courtHierarchyData.courtComplex || "",
      establishmentType: courtHierarchyData.establishmentType || "",
      stateCode: courtHierarchyData.stateCode || "",
      stateName: courtHierarchyData.stateName || "",
      districtCode: courtHierarchyData.districtCode || "",
      districtName: courtHierarchyData.districtName || "",
      caseTypeId: courtHierarchyData.caseTypeId || "",
      caseTypeCode: courtHierarchyData.caseTypeCode || "",
      caseTypeName: courtHierarchyData.caseTypeName || form.caseType,
      caseCategory: courtHierarchyData.caseCategory || form.category,
      caseSubCategory: courtHierarchyData.caseSubCategory || "",
      cnrNumber: courtHierarchyData.cnrNumber || "",
      isCNRValid: courtHierarchyData.isCNRValid || false,
      createdAt: new Date().toISOString(),
    };

    await LegalService.create(payload);
    ActivityService.create({
      title: `New Case Registered: ${form.title} (${newCaseNumber}) [${courtHierarchyData.courtName || form.courtName}]`,
      type: "legal",
      meta: { caseId: newId, status: form.status },
    });

    setAlertMsg(`Case "${form.title}" (${newCaseNumber}) registered successfully with Official Court Taxonomy!`);
    setTimeout(() => setAlertMsg(""), 3500);

    setForm({
      title: "",
      caseType: "Constitutional / PIL",
      clientName: "",
      advocateName: "",
      courtName: "Supreme Court of India",
      bench: "Division Bench",
      jurisdiction: "Writ / Original",
      caseNumber: "",
      filingNumber: "",
      filingDate: new Date().toISOString().split("T")[0],
      registrationDate: new Date().toISOString().split("T")[0],
      nextHearing: "",
      status: "Pending",
      priority: "High",
      category: "Constitutional",
      remarks: "",
    });
    setShowAddForm(false);
    await loadCases();
  };

  const onDeleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case from the Legal Master Registry?")) return;
    await LegalService.remove(id);
    ActivityService.create({ title: `Case Deleted: ID ${id}`, type: "legal" });
    await loadCases();
    setAlertMsg("Case record removed from Legal Master Registry.");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedCase(item);
    setModalOpen(true);
  };

  const handleSaveModal = async (updatedCase) => {
    await LegalService.update(updatedCase.id || updatedCase.caseId, updatedCase);
    await loadCases();
    setAlertMsg(`Case "${updatedCase.title}" updated successfully!`);
    setTimeout(() => setAlertMsg(""), 3500);
  };

  // Real-time Statistics Cards Calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const totalCases = cases.length;
    const pendingCases = cases.filter((c) => ["pending", "filing", "hearing", "in progress"].includes((c.status || "").toLowerCase())).length;
    const disposedCases = cases.filter((c) => ["disposed", "closed"].includes((c.status || "").toLowerCase())).length;
    const todayHearings = cases.filter((c) => (c.nextHearing || c.next_hearing) === todayStr).length;
    const upcomingHearings = cases.filter((c) => (c.nextHearing || c.next_hearing) && (c.nextHearing || c.next_hearing) > todayStr).length;
    const urgentCases = cases.filter((c) => (c.priority || "").toLowerCase() === "urgent").length;

    return { totalCases, pendingCases, disposedCases, todayHearings, upcomingHearings, urgentCases };
  }, [cases]);

  // Phase F — Multi-field Search Engine
  const filteredCases = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cases;

    return cases.filter((c) =>
      [
        c.id,
        c.caseId,
        c.caseNumber,
        c.case_number,
        c.title,
        c.clientName,
        c.client_name,
        c.advocateName,
        c.advocate_name,
        c.courtName,
        c.court_name,
        c.judgeName,
        c.mobile,
        c.email,
        c.category,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [cases, search]);

  const cards = [
    { title: "Total Master Cases", value: stats.totalCases, color: "primary.main", icon: <GavelIcon /> },
    { title: "Pending Cases", value: stats.pendingCases, color: "warning.main", icon: <HourglassEmptyIcon /> },
    { title: "Disposed Cases", value: stats.disposedCases, color: "success.main", icon: <CheckCircleIcon /> },
    { title: "Today's Hearings", value: stats.todayHearings, color: "info.main", icon: <TodayIcon /> },
    { title: "Upcoming Hearings", value: stats.upcomingHearings, color: "secondary.main", icon: <EventAvailableIcon /> },
    { title: "Urgent Priority", value: stats.urgentCases, color: "error.main", icon: <WarningIcon /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Enterprise Legal Registry & Case Management Engine
          </Typography>
          <Typography color="text.secondary">
            Master Case Repository, Cause List Governance, SHA-256 Document Vault & Audit Trail
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setShowAddForm((p) => !p)}
          sx={{ fontWeight: "bold" }}
        >
          {showAddForm ? "Hide Case Entry Form" : "Register New Legal Case"}
        </Button>
      </Stack>

      {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

      {/* Phase G — Dashboard Statistic Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={2} key={item.title}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderLeft: "4px solid",
                borderLeftColor: item.color,
              }}
            >
              <Box sx={{ color: item.color }}>{item.icon}</Box>
              <Box>
                <Typography color="text.secondary" variant="caption" fontWeight="bold" display="block">
                  {item.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {item.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Case Registration Form */}
      {showAddForm && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Register New Legal Case in Master Repository
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Case Title / Subject Matter *" name="title" value={form.title} onChange={onChange} placeholder="e.g. Ramvir Jatav vs State of UP & Ors." />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Priority" name="priority" value={form.priority} onChange={onChange}>
                <MenuItem value="Urgent">🔴 Urgent Priority</MenuItem>
                <MenuItem value="High">🟠 High Priority</MenuItem>
                <MenuItem value="Medium">🟡 Medium Priority</MenuItem>
                <MenuItem value="Low">🟢 Low Priority</MenuItem>
              </TextField>
            </Grid>

            {/* INTEGRATED OFFICIAL INDIA COURT & TAXONOMY HIERARCHY */}
            <Grid item xs={12}>
              <CascadingCourtSelector
                value={courtHierarchyData}
                onChange={setCourtHierarchyData}
                showCNR={true}
              />
            </Grid>

            {/* ROW 1: CLIENT & ADVOCATE NAMES (Generous Width) */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Petitioner / Client Name *" name="clientName" value={form.clientName} onChange={onChange} placeholder="e.g. Ramvir Jatav" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Lead Empaneled Advocate Name *" name="advocateName" value={form.advocateName} onChange={onChange} placeholder="e.g. Senior Advocate Mr. PAWAN GUPTA" />
            </Grid>

            {/* ROW 2: FILING DETAILS & STATUS */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Custom Case / Filing No. (Optional)" name="caseNumber" value={form.caseNumber} onChange={onChange} placeholder="Auto-generated if blank" />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Next Hearing Date"
                name="nextHearing"
                value={form.nextHearing}
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiInputLabel-root": {
                    bgcolor: "#ffffff",
                    px: 0.6,
                    fontWeight: 700,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Case Status" name="status" value={form.status} onChange={onChange}>
                <MenuItem value="Filing">Filing</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Hearing">Hearing</MenuItem>
                <MenuItem value="Disposed">Disposed</MenuItem>
                <MenuItem value="Stayed">Stayed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth size="large" variant="contained" onClick={onCreate} sx={{ height: "40px", fontWeight: 800, letterSpacing: 0.2 }}>
                SAVE MASTER CASE RECORD ➔
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Phase F — Search Engine & Master Case Table */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Master Legal Case Directory ({filteredCases.length})
          </Typography>

          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Case ID, Case No, Party, Advocate, Court, Judge, Mobile..."
            sx={{ width: 450 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
            }}
          />
        </Stack>

        <UniversalActionToolbar
          title="Master Legal Case Registry & Cause List Records"
          documentId="ICJ-CASE-REGISTRY-2026"
          version="v3.2.0"
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Case ID & Number</strong></TableCell>
              <TableCell><strong>Case Title</strong></TableCell>
              <TableCell><strong>Client / Petitioner</strong></TableCell>
              <TableCell><strong>Advocate</strong></TableCell>
              <TableCell><strong>Court Name</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Next Hearing</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No Legal Cases Found Matching Search Criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((item) => {
                const caseId = item.caseId || item.id;
                const caseNo = item.caseNumber || item.case_number || "CS/2026/L";

                return (
                  <TableRow key={caseId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{caseId}</Typography>
                      <Typography variant="caption" color="text.secondary">{caseNo}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight="bold">{item.title}</Typography></TableCell>
                    <TableCell>{item.clientName || item.client_name || "-"}</TableCell>
                    <TableCell>{item.advocateName || item.advocate_name || "-"}</TableCell>
                    <TableCell>{item.courtName || item.court_name || "Supreme Court"}</TableCell>
                    <TableCell>
                      <Chip label={item.priority || "High"} color={item.priority === "Urgent" ? "error" : "warning"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={item.status || "Pending"} color={item.status === "Disposed" ? "success" : "primary"} size="small" />
                    </TableCell>
                    <TableCell>{item.nextHearing || item.next_hearing || "-"}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                        <Tooltip title="⚖️ Assign / Change Advocate & Notify Client">
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<GavelIcon sx={{ fontSize: "0.85rem" }} />}
                            onClick={() => {
                              setAssignmentCase(item);
                              setAssignmentModalOpen(true);
                            }}
                            sx={{ fontWeight: 800, fontSize: "0.68rem", py: 0.2, px: 0.8 }}
                          >
                            {item.advocateName ? "Reassign" : "Assign Advocate"}
                          </Button>
                        </Tooltip>
                        <Tooltip title="View / Edit Case Details">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDetailModal(item)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Case">
                          <IconButton size="small" color="error" onClick={() => onDeleteCase(caseId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 6-Tab Case Detail & Master Governance Modal */}
      {selectedCase && (
        <CaseDetailModal
          open={modalOpen}
          caseItem={selectedCase}
          userRole="admin"
          onClose={() => setModalOpen(false)}
          onSave={handleSaveModal}
        />
      )}

      {/* ⚖️ Advocate Allocation & Tri-Channel Notification Modal */}
      {assignmentCase && (
        <AdvocateAssignmentModal
          open={assignmentModalOpen}
          caseItem={assignmentCase}
          onClose={() => setAssignmentModalOpen(false)}
          onAssigned={() => {
            loadCases();
            setAlertMsg("Advocate allocated and customer care notifications dispatched!");
            setTimeout(() => setAlertMsg(""), 5000);
          }}
        />
      )}
    </Box>
  );
}
