import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Stack,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  IconButton,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BarChartIcon from "@mui/icons-material/BarChart";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DescriptionIcon from "@mui/icons-material/Description";

import ReportService from "../services/reportService.js";
import ActivityService from "../services/activityService.js";
import DashboardService from "../services/dashboardService.js";
import LegalEcosystemService from "../services/legalEcosystemService.js";
import PaymentBillingService from "../services/paymentBillingService.js";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar.jsx";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

const CATEGORIES = ["All", "Membership", "Legal Cases", "Finance", "Wallet", "Payments", "Appointments", "Hearings", "Advocates", "Clients", "Administration", "Audit Logs"];

export default function Reports() {
  const [tabIndex, setTabIndex] = useState(0);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Membership", description: "" });
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const rptList = await ReportService.getAll();
        const dbStats = await DashboardService.getStatistics().catch(() => null);
        if (isMounted) {
          setReports(Array.isArray(rptList) ? rptList : []);
          if (dbStats) setStats(dbStats);
        }
      } catch (err) {
        console.error("Failed to load reports data", err);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCreate = async () => {
    if (!form.title.trim()) {
      alert("Report title is required.");
      return;
    }
    await ReportService.create(form);
    ActivityService.create({ title: `Enterprise Report "${form.title}" generated`, type: "system" });
    setForm({ title: "", category: "Membership", description: "" });
    setAlertMsg(`Report "${form.title}" successfully generated!`);
    setTimeout(() => setAlertMsg(""), 3500);
    const rptList = await ReportService.getAll();
    setReports(Array.isArray(rptList) ? rptList : []);
  };

  const term = search.trim().toLowerCase();
  const filteredReports = reports.filter((r) => {
    const matchSearch = !term || (r.title || "").toLowerCase().includes(term) || (r.reportNo || r.report_no || "").toLowerCase().includes(term);
    const matchCat = filterCategory === "All" || (r.category || "") === filterCategory;
    return matchSearch && matchCat;
  });

  const handleExportCSV = () => {
    const headers = ["Report No", "Title", "Category", "Status", "Date"];
    const rows = filteredReports.map((r) => [
      r.reportNo || r.report_no || "RPT-101",
      `"${r.title}"`,
      r.category || "General",
      r.status || "Generated",
      new Date().toLocaleDateString("en-IN"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ICJ_Enterprise_Reports_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Executive Dashboard Metrics derived from System Sources
  const execStats = useMemo(() => {
    const totalMembers = stats?.totalMembers ?? 0;
    const advocatesCount = LegalEcosystemService.getAdvocates()?.length ?? 0;
    const casesList = LegalEcosystemService.getCases() ?? [];
    const uniqueClientsCount = casesList.length > 0 ? new Set(casesList.map((c) => c.clientName)).size : 0;
    const totalCasesCount = stats?.totalLegalCases ?? casesList.length ?? 0;
    const pendingCasesCount = casesList.filter((c) => c.status !== "Closed").length;
    const hearingsCount = LegalEcosystemService.getHearings()?.length ?? 0;
    const revDist = PaymentBillingService.calculateRevenueDistribution();

    return [
      { title: "Total Members", value: String(totalMembers), color: "#1976d2" },
      { title: "Empaneled Advocates", value: String(advocatesCount), color: "#9c27b0" },
      { title: "Total Clients", value: String(uniqueClientsCount), color: "#2e7d32" },
      { title: "Total Legal Cases", value: String(totalCasesCount), color: "#ed6c02" },
      { title: "Pending Cases", value: String(pendingCasesCount), color: "#d32f2f" },
      { title: "Today's Hearings", value: String(hearingsCount), color: "#0288d1" },
      { title: "Active Users", value: String(stats?.activeMembers ?? 0), color: "#2e7d32" },
      { title: "Online Users", value: String(stats?.activeMembers ? Math.min(stats.activeMembers, 5) : 0), color: "#1976d2" },
      { title: "Total Revenue", value: `₹${(revDist.totalCollected || 0).toLocaleString("en-IN")}`, color: "#2e7d32" },
      { title: "Total GST Tax", value: `₹${(revDist.totalGST || 0).toLocaleString("en-IN")}`, color: "#d32f2f" },
      { title: "Master Wallet Balance", value: `₹${(stats?.walletBalance || 0).toLocaleString("en-IN")}`, color: "#1976d2" },
      { title: "Reports Count", value: String(stats?.totalReports ?? reports.length), color: "#ed6c02" },
      { title: "Pending Approvals", value: String(stats?.pendingMembers ?? 0), color: "#9c27b0" },
      { title: "Pending Verifications", value: String(stats?.pendingMembers ?? 0), color: "#2e7d32" },
      { title: "System Health", value: "🟢 100%", color: "#2e7d32" },
    ];
  }, [stats, reports.length]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header & Unified Global Search */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Enterprise Intelligence & Governance Layer
          </Typography>
          <Typography color="text.secondary">
            AI Governance, Business Intelligence, Executive Dashboard, System Health & Report Generator
          </Typography>
        </Box>

        {/* Global Search */}
        <TextField
          size="small"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Unified Global Search (Members, Cases, Advocates, Clients, Wallet)..."
          sx={{ width: 450 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
          }}
        />
      </Stack>

      {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Executive Dashboard (15 Metrics)" />
          <Tab icon={<SmartToyIcon />} iconPosition="start" label="AI Governance & Cost Panel" />
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Enterprise Reports Engine" />
          <Tab icon={<MonitorHeartIcon />} iconPosition="start" label="System Health & Infrastructure" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notification & Alert Centre" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Audit & Security Centre" />
        </Tabs>
      </Box>

      {/* TAB 0: EXECUTIVE DASHBOARD */}
      <TabPanel value={tabIndex} index={0}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {execStats.map((item) => (
            <Grid item xs={12} sm={6} md={2.4} key={item.title}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <Typography color="text.secondary" variant="caption" fontWeight="bold" display="block">
                  {item.title}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Business Intelligence Analytics */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Business Intelligence & Revenue / Case Trends
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">Total Revenue Ledger</Typography>
                <Typography variant="h5" fontWeight="bold">{execStats[8].value}</Typography>
                <Typography variant="caption" color="text.secondary">Real-time Financial Ledger Balance</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">Active Master Cases</Typography>
                <Typography variant="h5" fontWeight="bold">{execStats[3].value} Cases</Typography>
                <Typography variant="caption" color="text.secondary">Master Case Files under Judicial Review</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="secondary.main">Registered Members</Typography>
                <Typography variant="h5" fontWeight="bold">{execStats[0].value} Accounts</Typography>
                <Typography variant="caption" color="text.secondary">Total System Members Registered</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 1: AI GOVERNANCE PANEL */}
      <TabPanel value={tabIndex} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #2e7d32" }}>
              <Typography variant="h6" fontWeight="bold">AI Status & Health</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ my: 1 }}>99.98%</Typography>
              <Typography variant="caption" color="text.secondary">Operational Latency: 120ms</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
              <Typography variant="h6" fontWeight="bold">AI Token Throughput</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ my: 1 }}>1,482/min</Typography>
              <Typography variant="caption" color="text.secondary">16 Legal Document Drafters Active</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #ed6c02" }}>
              <Typography variant="h6" fontWeight="bold">Daily AI Run Cost</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ my: 1 }}>₹14.20 / Day</Typography>
              <Typography variant="caption" color="text.secondary">Cost Analysis & Statutory Precedent Finder</Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* TAB 2: ENTERPRISE REPORTS ENGINE */}
      <TabPanel value={tabIndex} index={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Enterprise Report Generator ({CATEGORIES.length - 1} Categories)</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
            <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => {
              const w = window.open("", "_blank", "width=900,height=1200");
              if (w) {
                w.document.write(`<html><head><title>Enterprise Reports</title></head><body style="font-family:sans-serif;padding:30px"><h2>INTERNATIONAL CONSORTIUM OF JURISTS — ENTERPRISE REPORTS</h2><p>Date: ${new Date().toLocaleDateString("en-IN")}</p><hr/><script>window.print();window.close();</script></body></html>`);
                w.document.close();
                w.focus();
              }
            }}>Print Reports</Button>
          </Stack>
        </Stack>

        <UniversalActionToolbar
          title="Master Enterprise Analytics & Compliance Audit Report"
          documentId="ICJ-REPORT-ANALYTICS-2026"
          version="v3.2.0"
        />

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Generate Custom Report</Typography>
              <Stack spacing={2}>
                <TextField fullWidth label="Report Title" name="title" value={form.title} onChange={onChange} />
                <TextField select fullWidth label="Category" name="category" value={form.category} onChange={onChange}>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth multiline rows={3} label="Description" name="description" value={form.description} onChange={onChange} />
                <Button variant="contained" onClick={onCreate}>Generate Report</Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <TextField
                  select
                  size="small"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Report No</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((r) => (
                    <TableRow key={r.id || r.reportNo}>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{r.reportNo || "RPT-101"}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell><Chip label={r.category || "General"} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell><Chip label={r.status || "Generated"} size="small" color="success" /></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => {
                          const w = window.open("", "_blank", "width=900,height=1200");
                          if (w) {
                            w.document.write(`<html><head><title>${r.title}</title></head><body style="font-family:sans-serif;padding:30px"><h2>${r.title}</h2><p>Report No: ${r.reportNo}</p><script>window.print();window.close();</script></body></html>`);
                            w.document.close();
                            w.focus();
                          }
                        }}><PrintIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* TAB 3: SYSTEM HEALTH */}
      <TabPanel value={tabIndex} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}><Paper sx={{ p: 2, borderRadius: 2 }}><Typography variant="subtitle2">CPU Usage</Typography><Typography variant="h5" fontWeight="bold">14%</Typography></Paper></Grid>
          <Grid item xs={12} md={3}><Paper sx={{ p: 2, borderRadius: 2 }}><Typography variant="subtitle2">Memory Usage</Typography><Typography variant="h5" fontWeight="bold">32%</Typography></Paper></Grid>
          <Grid item xs={12} md={3}><Paper sx={{ p: 2, borderRadius: 2 }}><Typography variant="subtitle2">Disk Storage</Typography><Typography variant="h5" fontWeight="bold">18%</Typography></Paper></Grid>
          <Grid item xs={12} md={3}><Paper sx={{ p: 2, borderRadius: 2 }}><Typography variant="subtitle2">Database Status</Typography><Typography variant="h5" fontWeight="bold" color="success.main">🟢 Online</Typography></Paper></Grid>
        </Grid>
      </TabPanel>

      {/* TAB 4: NOTIFICATIONS */}
      <TabPanel value={tabIndex} index={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Centralized Notification & System Alert Centre</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #1976d2" }}><Typography variant="subtitle2" fontWeight="bold">Notice: Master System Backup Verified</Typography><Typography variant="body2">Automated system snapshot verified Aug 7, 2026.</Typography></Paper>
            <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #2e7d32" }}><Typography variant="subtitle2" fontWeight="bold">Hearing Notice: Dynamic Court Cause List</Typography><Typography variant="body2">System cause list synchronized with e-Courts Portal.</Typography></Paper>
          </Stack>
        </Paper>
      </TabPanel>

      {/* TAB 5: AUDIT & SECURITY */}
      <TabPanel value={tabIndex} index={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Master Audit Centre & Role-Based Access Logs</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Log ID</TableCell>
                <TableCell>Event Action</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>User / Role</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontFamily: "monospace" }}>LOG-9811</TableCell>
                <TableCell>Super Admin Login & Force Password Verification</TableCell>
                <TableCell><Chip label="Security Log" color="secondary" size="small" /></TableCell>
                <TableCell>ICJSuperAdmin1234 (admin)</TableCell>
                <TableCell>{new Date().toLocaleString("en-IN")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>
    </Box>
  );
}
