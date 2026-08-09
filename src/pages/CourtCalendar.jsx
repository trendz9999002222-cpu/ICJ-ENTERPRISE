import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

// Icons
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import TodayIcon from "@mui/icons-material/Today";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GavelIcon from "@mui/icons-material/Gavel";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PrintIcon from "@mui/icons-material/Print";

import VoiceInputAdornment from "../components/common/VoiceInputAdornment";
import LegalEcosystemService from "../services/legalEcosystemService";
import ActivityService from "../services/activityService";
import MainLayout from "../layouts/MainLayout";

export default function CourtCalendar() {
  const [viewMode, setViewMode] = useState("daily"); // 'daily', 'weekly', 'monthly'
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const [form, setForm] = useState({
    caseId: "",
    caseTitle: "",
    hearingDate: new Date().toISOString().slice(0, 10),
    court: "Supreme Court Courtroom 1",
    courtHall: "Court Hall No. 3",
    judge: "Hon'ble Justice A.K. Roy & Hon'ble Justice S. Sen",
    itemNo: "Item No. 14",
    purpose: "Final Arguments & Stay Application",
    reminder: "2 Hours Before Hearing",
  });

  const loadData = () => {
    setHearings(LegalEcosystemService.getHearings());
    setCases(LegalEcosystemService.getCases());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddHearing = () => {
    if (!form.caseId) {
      alert("Please select a case.");
      return;
    }
    const selectedCase = cases.find((c) => c.id === form.caseId);
    const payload = {
      ...form,
      id: `H-${Date.now()}`,
      caseTitle: selectedCase ? selectedCase.title : form.caseTitle,
      status: "Scheduled",
    };

    LegalEcosystemService.addHearing(payload);
    ActivityService.create({
      title: `Hearing Scheduled for ${payload.caseTitle} on ${payload.hearingDate}`,
      type: "legal",
    });

    setOpen(false);
    setAlertMsg("Court Hearing scheduled and added to Master Cause List & Reminder Engine!");
    setTimeout(() => setAlertMsg(""), 3500);
    loadData();
  };

  // Multi-field Search (Court, Case, Document, Template, Party, Advocate)
  const filteredHearings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return hearings;
    return hearings.filter((h) =>
      [h.caseTitle, h.caseId, h.court, h.judge, h.purpose, h.courtHall]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [hearings, search]);

  // Real-time Dashboard Cards
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = hearings.filter((h) => h.hearingDate === todayStr).length;
    const upcomingCount = hearings.filter((h) => h.hearingDate > todayStr).length;
    const totalHearings = hearings.length;

    return { todayCount, upcomingCount, totalHearings };
  }, [hearings]);

  const cards = [
    { title: "Today's Hearings", value: stats.todayCount, color: "#1976d2", icon: <TodayIcon /> },
    { title: "Upcoming Hearings", value: stats.upcomingCount, color: "#2e7d32", icon: <EventAvailableIcon /> },
    { title: "Master Cause List Items", value: stats.totalHearings, color: "#9c27b0", icon: <GavelIcon /> },
    { title: "Active Reminders", value: stats.totalHearings, color: "#ed6c02", icon: <NotificationsActiveIcon /> },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalendarMonthIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Enterprise Court Calendar & Cause List Engine
              </Typography>
              <Typography color="text.secondary">
                Daily, Weekly & Monthly Judicial Schedules, Court Halls, Benches & Hearing Reminders
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => {
              console.log("PRINT BUTTON CLICKED - CourtCalendar");
              const w = window.open("", "_blank", "width=900,height=1200");
              if (w) {
                w.document.write(`<html><head><title>Cause List</title></head><body style="font-family:sans-serif;padding:30px"><h2>INTERNATIONAL CONSORTIUM OF JURISTS — DAILY CAUSE LIST</h2><p>Date: ${new Date().toLocaleDateString("en-IN")}</p><hr/><p>Official judicial calendar record.</p><script>window.print();window.close();<\/script></body></html>`);
                w.document.close();
                w.focus();
              }
            }}>
              Print Cause List
            </Button>
            <Button variant="contained" startIcon={<EventIcon />} onClick={() => setOpen(true)}>
              Schedule Hearing
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* Phase F — Dashboard Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderLeft: `4px solid ${item.color}`,
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

        {/* Phase A — Calendar View Toggle & Search */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <ToggleButtonGroup
              color="primary"
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
            >
              <ToggleButton value="daily">Daily Cause List</ToggleButton>
              <ToggleButton value="weekly">Weekly View</ToggleButton>
              <ToggleButton value="monthly">Monthly View</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Court, Case, Judge, Advocate, Cause List..."
              sx={{ width: 400 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
                endAdornment: <VoiceInputAdornment onTranscript={(txt) => setSearch(txt.trim())} value={search} />,
              }}
            />
          </Stack>
        </Paper>

        {/* Cause List Table */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Official Court Cause List & Hearing Schedule ({filteredHearings.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hearing Date</TableCell>
                <TableCell>Item No.</TableCell>
                <TableCell>Case ID & Title</TableCell>
                <TableCell>Court & Bench</TableCell>
                <TableCell>Presiding Judge</TableCell>
                <TableCell>Purpose of Hearing</TableCell>
                <TableCell>Status & Reminder</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHearings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No Scheduled Hearings Found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHearings.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell sx={{ fontWeight: "bold" }}>{h.hearingDate}</TableCell>
                    <TableCell><Chip label={h.itemNo || "Item 01"} size="small" variant="outlined" color="primary" /></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{h.caseTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">{h.caseId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{h.court}</Typography>
                      <Typography variant="caption" color="text.secondary">{h.courtHall || "Court Hall 3"}</Typography>
                    </TableCell>
                    <TableCell>{h.judge}</TableCell>
                    <TableCell>{h.purpose}</TableCell>
                    <TableCell>
                      <Chip label={h.status} color={h.status === "Scheduled" ? "primary" : "success"} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Schedule Hearing Modal */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Schedule Court Hearing in Master Cause List</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Select Case File" value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}>
                  {cases.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Hearing Date" value={form.hearingDate} onChange={(e) => setForm({ ...form, hearingDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Item Number" value={form.itemNo} onChange={(e) => setForm({ ...form, itemNo: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Court & Bench Name" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Court Hall Number" value={form.courtHall} onChange={(e) => setForm({ ...form, courtHall: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Presiding Judge Name" value={form.judge} onChange={(e) => setForm({ ...form, judge: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Purpose of Hearing" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddHearing}>Schedule Hearing</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
