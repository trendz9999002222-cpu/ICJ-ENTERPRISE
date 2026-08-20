import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocationService from "../services/locationService";
import MainLayout from "../layouts/MainLayout";

export default function LocationMasterAdmin() {
  const [tabIndex, setTabIndex] = useState(0);
  const [fieldConfig, setFieldConfig] = useState(LocationService.getFieldConfig());
  const [pendingQueue, setPendingQueue] = useState([]);
  const [configSaved, setConfigSaved] = useState(false);

  // Import State
  const [importJsonText, setImportJsonText] = useState("");
  const [importReport, setImportReport] = useState(null);

  const loadAll = () => {
    setFieldConfig(LocationService.getFieldConfig());
    setPendingQueue(LocationService.getPendingQueue());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleField = (fieldKey) => {
    const updated = {
      ...fieldConfig,
      [fieldKey]: {
        ...fieldConfig[fieldKey],
        enabled: !fieldConfig[fieldKey].enabled,
      },
    };
    setFieldConfig(updated);
    LocationService.updateFieldConfig(updated);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleApproveEntry = (id) => {
    LocationService.approveManualEntry(id);
    loadAll();
  };

  const handleRunImport = () => {
    if (!importJsonText) {
      alert("Please paste CSV or JSON dataset content.");
      return;
    }
    const report = LocationService.importDataset(importJsonText, importJsonText.trim().startsWith("[") ? "json" : "csv");
    setImportReport(report);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <LocationOnIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              India Master Location & Legal Jurisdiction Engine (v2.0)
            </Typography>
            <Typography color="text.secondary">
              Dynamic Master Field Configurator, Manual Entry Verification Queue & Official Dataset Import Engine
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)}>
            <Tab icon={<SettingsIcon />} label="Dynamic Field Configurator" />
            <Tab icon={<VerifiedUserIcon />} label="Manual Entry Verification Queue" />
            <Tab icon={<UploadFileIcon />} label="Dataset Import Engine" />
          </Tabs>
        </Box>

        {/* TAB 0: Dynamic Field Configurator */}
        {tabIndex === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Dynamic Field Visibility & Cascading Workflow Configurator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enable or disable master location fields. Disabled fields are automatically hidden from forms without breaking existing case records.
            </Typography>

            {configSaved && <Alert severity="success" sx={{ mb: 2 }}>Field configuration saved successfully!</Alert>}

            <Grid container spacing={2}>
              {Object.keys(fieldConfig).map((fieldKey) => {
                const conf = fieldConfig[fieldKey];
                return (
                  <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={conf.enabled}
                            onChange={() => handleToggleField(fieldKey)}
                            color="primary"
                          />
                        }
                        label={<Typography fontWeight="bold">{conf.label}</Typography>}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Status: {conf.enabled ? "Active in Forms" : "Hidden (Auto-Skipped)"}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* TAB 1: Verification Queue */}
        {tabIndex === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Pending Verification Queue ("Not found? Enter manually" Fallbacks)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Entry ID</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>Police Station</TableCell>
                  <TableCell>Court</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingQueue.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No pending manual location submissions</TableCell></TableRow>
                ) : (
                  pendingQueue.map((q) => (
                    <TableRow key={q.id} hover>
                      <TableCell sx={{ fontFamily: "monospace" }}>{q.id}</TableCell>
                      <TableCell>{q.stateName}</TableCell>
                      <TableCell>{q.districtName}</TableCell>
                      <TableCell>{q.policeStation}</TableCell>
                      <TableCell>{q.court}</TableCell>
                      <TableCell>
                        <Chip label={q.status} size="small" color={q.status === "Approved" ? "success" : "warning"} />
                      </TableCell>
                      <TableCell align="center">
                        {q.status !== "Approved" && (
                          <Button size="small" variant="contained" color="success" onClick={() => handleApproveEntry(q.id)}>
                            Approve & Merge into Master
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* TAB 2: Dataset Import Engine */}
        {tabIndex === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Official Government Dataset Import Engine (CSV / JSON / SQL)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Paste official LGD, Census, or Court directory JSON/CSV content below to import into master tables with schema validation.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder={`[
  { "stateName": "Maharashtra", "districtName": "Mumbai City", "pincode": "400001", "court": "District & Sessions Court" }
]`}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button variant="contained" color="primary" startIcon={<UploadFileIcon />} onClick={handleRunImport}>
              Validate & Import Dataset
            </Button>

            {importReport && (
              <Box sx={{ mt: 3 }}>
                <Alert severity={importReport.success ? "success" : "error"} sx={{ mb: 2 }}>
                  Total Rows: {importReport.totalRows} | Valid: {importReport.validCount} | Invalid: {importReport.invalidCount}
                </Alert>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </>
  );
}
