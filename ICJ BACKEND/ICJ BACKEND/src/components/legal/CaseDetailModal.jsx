import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  MenuItem,
  Alert,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import SecurityIcon from "@mui/icons-material/Security";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import VerifiedIcon from "@mui/icons-material/Verified";

import ActivityService from "../../services/activityService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function CaseDetailModal({ open = false, caseItem = null, userRole = "admin", onClose, onSave }) {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({});
  const [parties, setParties] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (caseItem) {
      setFormData({
        id: caseItem.id || caseItem.caseId || `ICJ-CASE-${Date.now()}`,
        caseId: caseItem.caseId || caseItem.id || `ICJ-CASE-${Date.now()}`,
        caseNumber: caseItem.caseNumber || caseItem.case_number || `WP(C)/${Math.floor(1000 + Math.random() * 9000)}/2026`,
        title: caseItem.title || "",
        caseType: caseItem.caseType || "Constitutional / PIL",
        courtName: caseItem.courtName || caseItem.court_name || "Supreme Court of India",
        bench: caseItem.bench || "Division Bench",
        jurisdiction: caseItem.jurisdiction || "Writ / Original",
        filingNumber: caseItem.filingNumber || `FL/2026/${Math.floor(10000 + Math.random() * 90000)}`,
        filingDate: caseItem.filingDate || new Date().toISOString().split("T")[0],
        registrationDate: caseItem.registrationDate || new Date().toISOString().split("T")[0],
        nextHearing: caseItem.nextHearing || caseItem.next_hearing || "2026-08-25",
        status: caseItem.status || "Pending",
        priority: caseItem.priority || "High",
        category: caseItem.category || "Constitutional",
        remarks: caseItem.remarks || caseItem.summary || "Case under active judicial review.",
        judgeName: caseItem.judgeName || "Hon'ble Justice A.K. Roy",
        courtHall: caseItem.courtHall || "Court Hall No. 3",
        createdBy: caseItem.createdBy || "Super Admin",
        createdAt: caseItem.createdAt || caseItem.created_at || new Date().toISOString(),
      });

      setParties(caseItem.parties || [
        { id: "p1", role: "Petitioner", name: caseItem.clientName || caseItem.client_name || "Environment Conservation Trust", contact: "+91 9876543210", advocate: caseItem.advocateName || caseItem.advocate_name || "Adv. Rajesh Sharma" },
        { id: "p2", role: "Respondent", name: "Union of India & Ors.", contact: "govt.counsel@gov.in", advocate: "Standing Counsel, Supreme Court" },
        { id: "p3", role: "Government Authority", name: "Ministry of Environment, Forest and Climate Change", contact: "moefcc@gov.in", advocate: "Additional Solicitor General" },
      ]);

      setDocuments(caseItem.documents || [
        { id: "d1", title: "Writ Petition Pleadings.pdf", fileType: "PDF", hash: "SHA256-8F9B1A2C3D4E5F6", version: "v1.0", tags: "#Pleadings #Writ", verified: true },
        { id: "d2", title: "Environmental Audit Report.xlsx", fileType: "Excel", hash: "SHA256-1A2B3C4D5E6F7A8", version: "v1.1", tags: "#Evidence #Report", verified: true },
        { id: "d3", title: "High Court Interim Order.pdf", fileType: "PDF", hash: "SHA256-9E8D7C6B5A4F3E2", version: "v2.0", tags: "#CourtOrder", verified: true },
      ]);

      setHearings(caseItem.hearings || [
        { id: "h1", date: caseItem.nextHearing || "2026-08-25", courtHall: "Court Hall 3", judge: "Hon'ble Justice A.K. Roy", purpose: "Final Arguments & Interim Relief", status: "Scheduled" },
        { id: "h2", date: "2026-07-10", courtHall: "Court Hall 3", judge: "Hon'ble Justice A.K. Roy", purpose: "Pleadings Verification & Notice Issuance", status: "Completed" },
      ]);
    }
  }, [caseItem]);

  if (!caseItem) return null;

  const isReadOnly = ["client", "readonly"].includes(String(userRole).toLowerCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedCase = {
      ...formData,
      parties,
      documents,
      hearings,
      updatedAt: new Date().toISOString(),
    };

    ActivityService.create({
      title: `Case Updated: ${formData.title} (${formData.caseNumber})`,
      type: "legal",
      meta: { caseId: formData.caseId, status: formData.status },
    });

    if (onSave) onSave(updatedCase);
    setSaveMsg("Case Master Record & Legal Registry updated successfully!");
    setTimeout(() => {
      setSaveMsg("");
      if (onClose) onClose();
    }, 1200);
  };

  const auditLogs = [
    { id: "l1", event: "Case Registered in Master Legal Registry", timestamp: formData.createdAt, author: formData.createdBy || "Super Admin", ip: "127.0.0.1 (Web Workstation)" },
    { id: "l2", event: `Case Status set to "${formData.status}"`, timestamp: new Date().toISOString(), author: "Legal Registry Engine", ip: "127.0.0.1 (Web Workstation)" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff", py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "#fff", color: "primary.main" }}>
              <GavelIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formData.title || "Legal Case Registry"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Case ID: {formData.caseId} | Case No: {formData.caseNumber} | Court: {formData.courtName}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip label={formData.priority || "High"} color={formData.priority === "Urgent" ? "error" : "warning"} size="small" sx={{ fontWeight: "bold" }} />
            <Chip label={formData.status || "Pending"} color={formData.status === "Disposed" ? "success" : "primary"} size="small" sx={{ fontWeight: "bold" }} />
          </Stack>
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8f9fa" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<GavelIcon />} iconPosition="start" label="Case Information" />
          <Tab icon={<GroupsIcon />} iconPosition="start" label="Party Management" />
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Document Management" />
          <Tab icon={<EventIcon />} iconPosition="start" label="Hearings & Cause List" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Security & Access" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Audit Trail" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {saveMsg ? <Alert severity="success" sx={{ mb: 2 }}>{saveMsg}</Alert> : null}

        {/* TAB 1: CASE INFORMATION */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Master Case ID" name="caseId" value={formData.caseId || ""} disabled />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Court Case Number" name="caseNumber" value={formData.caseNumber || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Filing Number" name="filingNumber" value={formData.filingNumber || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Case Title / Subject" name="title" value={formData.title || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Case Type" name="caseType" value={formData.caseType || "Constitutional / PIL"} onChange={handleChange} disabled={isReadOnly}>
                <MenuItem value="Constitutional / PIL">Constitutional / PIL</MenuItem>
                <MenuItem value="Civil Dispute">Civil Dispute</MenuItem>
                <MenuItem value="Criminal Proceeding">Criminal Proceeding</MenuItem>
                <MenuItem value="Commercial Arbitration">Commercial Arbitration</MenuItem>
                <MenuItem value="Tax & Finance">Tax & Finance</MenuItem>
                <MenuItem value="Corporate Law">Corporate Law</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Court Name" name="courtName" value={formData.courtName || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Bench Designation" name="bench" value={formData.bench || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Jurisdiction" name="jurisdiction" value={formData.jurisdiction || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Filing Date" name="filingDate" value={formData.filingDate || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Registration Date" name="registrationDate" value={formData.registrationDate || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Next Hearing Date" name="nextHearing" value={formData.nextHearing || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={isReadOnly} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Case Status" name="status" value={formData.status || "Pending"} onChange={handleChange} disabled={isReadOnly}>
                <MenuItem value="Filing">Filing</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Hearing">Hearing</MenuItem>
                <MenuItem value="Disposed">Disposed</MenuItem>
                <MenuItem value="Stayed">Stayed</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Judicial Remarks / Summary" name="remarks" value={formData.remarks || ""} onChange={handleChange} disabled={isReadOnly} />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 2: PARTY MANAGEMENT */}
        <TabPanel value={tabValue} index={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Party Management (Unlimited Parties)</Typography>
            {!isReadOnly && (
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setParties(p => [...p, { id: `p${Date.now()}`, role: "Respondent", name: "", contact: "", advocate: "" }])}>
                Add Party
              </Button>
            )}
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Party Name</TableCell>
                <TableCell>Contact / Email</TableCell>
                <TableCell>Advocate / Legal Counsel</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parties.map((p, idx) => (
                <TableRow key={p.id || idx}>
                  <TableCell>
                    <Chip label={p.role} color={p.role === "Petitioner" ? "primary" : "secondary"} size="small" />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={p.name} onChange={(e) => {
                      const val = e.target.value;
                      setParties(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                    }} disabled={isReadOnly} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={p.contact} onChange={(e) => {
                      const val = e.target.value;
                      setParties(prev => prev.map((item, i) => i === idx ? { ...item, contact: val } : item));
                    }} disabled={isReadOnly} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={p.advocate} onChange={(e) => {
                      const val = e.target.value;
                      setParties(prev => prev.map((item, i) => i === idx ? { ...item, advocate: val } : item));
                    }} disabled={isReadOnly} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        {/* TAB 3: DOCUMENT MANAGEMENT */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Supports PDF, Word, Excel, Images, Video & ZIP files with SHA-256 Digital Verification.
          </Alert>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Document Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>SHA-256 Digital Hash</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Verification</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell><Typography variant="body2" fontWeight="bold">{d.title}</Typography></TableCell>
                  <TableCell><Chip label={d.fileType} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{d.hash}</Typography></TableCell>
                  <TableCell>{d.version}</TableCell>
                  <TableCell><Chip label={d.tags} size="small" color="default" /></TableCell>
                  <TableCell><Chip icon={<VerifiedIcon />} label="SHA-256 Verified" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        {/* TAB 4: HEARINGS & CAUSE LIST */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Court Hearing Schedule & Cause List</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hearing Date</TableCell>
                <TableCell>Court Hall</TableCell>
                <TableCell>Presiding Judge</TableCell>
                <TableCell>Hearing Purpose</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hearings.map((h) => (
                <TableRow key={h.id}>
                  <TableCell><Typography fontWeight="bold">{h.date}</Typography></TableCell>
                  <TableCell>{h.courtHall}</TableCell>
                  <TableCell>{h.judge}</TableCell>
                  <TableCell>{h.purpose}</TableCell>
                  <TableCell><Chip label={h.status} color={h.status === "Scheduled" ? "primary" : "success"} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        {/* TAB 5: SECURITY & ACCESS */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Role-Based Access Control Rules</Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><Chip label="Super Admin" color="secondary" sx={{ width: "100%" }} /><Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>Full Master Access</Typography></Grid>
              <Grid item xs={12} md={3}><Chip label="Admin" color="primary" sx={{ width: "100%" }} /><Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>Create, Edit & Hearings</Typography></Grid>
              <Grid item xs={12} md={3}><Chip label="Advocate" color="info" sx={{ width: "100%" }} /><Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>Assigned Case Management</Typography></Grid>
              <Grid item xs={12} md={3}><Chip label="Client" color="success" sx={{ width: "100%" }} /><Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>View Status & Orders</Typography></Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* TAB 6: AUDIT TRAIL */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Case Audit Trail & Activity Log</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event Action</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>IP Address / Device</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={log.author} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption">{log.ip}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button variant="outlined" onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        {!isReadOnly && (
          <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
            Save Legal Master Record
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
