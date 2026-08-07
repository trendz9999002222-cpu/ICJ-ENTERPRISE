import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Divider,
  Stack,
  Alert,
  MenuItem,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";

// Icons
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import StorageIcon from "@mui/icons-material/Storage";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BackupIcon from "@mui/icons-material/Backup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import SettingsService from "../services/settingsService";
import ActivityService from "../services/activityService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [tabIndex, setTabIndex] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");

  const [settings, setSettings] = useState({
    // Organization
    orgName: "International Consortium of Jurists (ICJ)",
    platformName: "ICJ Enterprise Platform",
    financialYear: "FY 2026-2027",
    workingDays: "Monday to Saturday",
    officeHours: "09:00 AM - 06:00 PM IST",
    orgEmail: "admin@icj.org",
    orgPhone: "+91 11 2345 6789",

    // Communication Gateways
    smtpServer: "smtp.icj.org (Port 587)",
    smsGateway: "Twilio / SMS-India Gateway Active",
    whatsappGateway: "Meta WhatsApp Business API Connected",

    // GST & Tax Config
    gstin: "07AAAAA0000A1Z5",
    hsnSac: "998211 (Legal Representation Services)",
    gstRate: "18% (CGST 9% + SGST 9%)",

    // Backup & Security
    backupFrequency: "Daily (02:00 AM IST)",
    retentionPolicy: "7 Years Statutory Legal Hold",
    forcePasswordChange: true,
    enableAuditLogging: true,
    sha256Verification: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    ActivityService.create({
      title: "Master Enterprise Settings Updated",
      type: "system",
    });
    setSaveMsg("Master Enterprise Settings saved and propagated across all modules!");
    setTimeout(() => setSaveMsg(""), 3500);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Master Enterprise Settings
            </Typography>
            <Typography color="text.secondary">
              Organization, Financial Year, Communication Gateways, GST Tax Config & Security Policies
            </Typography>
          </Box>
        </Stack>

        <Button variant="contained" size="large" startIcon={<CheckCircleIcon />} onClick={handleSave} sx={{ fontWeight: "bold" }}>
          Save Master Settings
        </Button>
      </Stack>

      {saveMsg ? <Alert severity="success" sx={{ mb: 3 }}>{saveMsg}</Alert> : null}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Organization & Financial Year" />
          <Tab icon={<EmailIcon />} iconPosition="start" label="Email, SMS & WhatsApp Gateways" />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="GST & Tax Configuration" />
          <Tab icon={<BackupIcon />} iconPosition="start" label="Backup & Data Retention" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Security & Password Policies" />
        </Tabs>
      </Box>

      {/* TAB 0: ORGANIZATION */}
      <TabPanel value={tabIndex} index={0}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Organization & Fiscal Calendar</Typography>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Organization Legal Name" name="orgName" value={settings.orgName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Platform Name" name="platformName" value={settings.platformName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Financial Year" name="financialYear" value={settings.financialYear} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Working Days" name="workingDays" value={settings.workingDays} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Office Hours" name="officeHours" value={settings.officeHours} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 1: COMMUNICATION GATEWAYS */}
      <TabPanel value={tabIndex} index={1}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Communication & Dispatcher Gateways</Typography>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="SMTP Mail Server" name="smtpServer" value={settings.smtpServer} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="SMS Gateway Status" name="smsGateway" value={settings.smsGateway} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="WhatsApp Business API" name="whatsappGateway" value={settings.whatsappGateway} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 2: GST & TAX */}
      <TabPanel value={tabIndex} index={2}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Statutory GST & Tax Rates</Typography>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="GSTIN Number" name="gstin" value={settings.gstin} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="SAC / HSN Code" name="hsnSac" value={settings.hsnSac} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="GST Tax Rate" name="gstRate" value={settings.gstRate} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 3: BACKUP */}
      <TabPanel value={tabIndex} index={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Automated Backup & Retention Policies</Typography>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Backup Frequency" name="backupFrequency" value={settings.backupFrequency} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Document Retention Policy" name="retentionPolicy" value={settings.retentionPolicy} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 4: SECURITY */}
      <TabPanel value={tabIndex} index={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Security, Password Policies & Audit Logs</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Switch checked={settings.forcePasswordChange} name="forcePasswordChange" onChange={handleChange} />}
              label="Enforce First Login Password Change (v3.0 Policy)"
            />
            <FormControlLabel
              control={<Switch checked={settings.enableAuditLogging} name="enableAuditLogging" onChange={handleChange} />}
              label="Enable Full SHA-256 Audit Trail Logging"
            />
          </Stack>
        </Paper>
      </TabPanel>
    </Box>
  );
}
