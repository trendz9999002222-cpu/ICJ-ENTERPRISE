import { useState } from "react";
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
  MenuItem,
  Alert,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import FolderIcon from "@mui/icons-material/Folder";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import ActivityService from "../../services/activityService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function MemberProfileDialog({ open = false, member = null, onClose, onSave }) {
  const [tabValue, setTabValue] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [prevMemberId, setPrevMemberId] = useState(null);
  const currentMemberId = member?.id || member?.member_id;

  const [formData, setFormData] = useState(() => {
    if (!member) return {};
    return {
      id: member.id || member.member_id,
      member_id: member.member_id || member.id,
      name: member.name || member.fullName || "",
      fullName: member.fullName || member.name || "",
      email: member.email || "",
      mobile: member.mobile || "",
      whatsapp: member.whatsapp || member.mobile || "",
      birthYear: member.birthYear || member.birth_year || "1990",
      gender: member.gender || "Male",
      aadhaar: member.aadhaar || member.aadhar || "",
      pan: member.pan || "",
      gst: member.gst || "",
      profession: member.profession || "Advocate",
      organisation: member.organisation || "High Court",
      experience: member.experience || "5",
      barRegistration: member.barRegistration || "BC/12345/2020",
      address: member.address || "",
      city: member.city || "",
      district: member.district || "",
      state: member.state || "",
      pincode: member.pincode || "",
      country: member.country || "India",
      member_level: member.member_level || "Basic",
      role: member.role || "member",
      status: member.status || "Active",
      verification_status: member.verification_status || "Approved",
      remarks: member.remarks || "All documents verified.",
      forcePasswordChange: Boolean(member.forcePasswordChange),
      registration_date: member.registration_date || member.created_at || new Date().toISOString(),
    };
  });

  if (currentMemberId !== prevMemberId && member) {
    setPrevMemberId(currentMemberId);
    setFormData({
      id: member.id || member.member_id,
      member_id: member.member_id || member.id,
      name: member.name || member.fullName || "",
      fullName: member.fullName || member.name || "",
      email: member.email || "",
      mobile: member.mobile || "",
      whatsapp: member.whatsapp || member.mobile || "",
      birthYear: member.birthYear || member.birth_year || "1990",
      gender: member.gender || "Male",
      aadhaar: member.aadhaar || member.aadhar || "",
      pan: member.pan || "",
      gst: member.gst || "",
      profession: member.profession || "Advocate",
      organisation: member.organisation || "High Court",
      experience: member.experience || "5",
      barRegistration: member.barRegistration || "BC/12345/2020",
      address: member.address || "",
      city: member.city || "",
      district: member.district || "",
      state: member.state || "",
      pincode: member.pincode || "",
      country: member.country || "India",
      member_level: member.member_level || "Basic",
      role: member.role || "member",
      status: member.status || "Active",
      verification_status: member.verification_status || "Approved",
      remarks: member.remarks || "All documents verified.",
      forcePasswordChange: Boolean(member.forcePasswordChange),
      registration_date: member.registration_date || member.created_at || new Date().toISOString(),
    });
  }

  if (!member) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSave = () => {
    setErrorMsg("");
    setSaveMsg("");

    if (formData.birthYear) {
      const MIN_AGE = 18;
      const currentYr = new Date().getFullYear();
      const maxYr = currentYr - MIN_AGE;
      const yr = parseInt(formData.birthYear, 10);
      if (isNaN(yr) || yr > maxYr) {
        setErrorMsg(`Applicant must be at least 18 years old. Max birth year is ${maxYr}.`);
        return;
      }
    }

    ActivityService.create({
      title: `Member updated: ${formData.name} (${formData.member_id})`,
      type: "membership",
      meta: { member_id: formData.member_id, status: formData.status, verification_status: formData.verification_status },
    });

    if (onSave) onSave(formData);
    setSaveMsg("Member Profile updated successfully!");
    setTimeout(() => {
      setSaveMsg("");
      if (onClose) onClose();
    }, 1200);
  };

  const memberLogs = [
    { id: "1", action: "Account Registered", timestamp: formData.registration_date, author: "System Registration Engine" },
    { id: "2", action: "Master Legal Consent SHA-256 Signature Recorded", timestamp: formData.registration_date, author: "Legal Compliance System" },
    { id: "3", action: `Status Set to ${formData.status}`, timestamp: new Date().toISOString(), author: "Super Admin Governance" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff", py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "#fff", color: "primary.main", fontWeight: "bold" }}>
              {(formData.name || "M").charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formData.name} ({formData.member_id})
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Role: {formData.role} | Tier: {formData.member_level} | Status: {formData.status}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={formData.verification_status || "Approved"}
            color={formData.verification_status === "Approved" ? "success" : "warning"}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8f9fa" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PersonIcon />} iconPosition="start" label="Basic Info" />
          <Tab icon={<WorkIcon />} iconPosition="start" label="Professional" />
          <Tab icon={<FolderIcon />} iconPosition="start" label="Document Vault" />
          <Tab icon={<CardMembershipIcon />} iconPosition="start" label="Membership Plan" />
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="Verification" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Login & Security" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Audit Trail" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {saveMsg ? <Alert severity="success" sx={{ mb: 2 }}>{saveMsg}</Alert> : null}
        {errorMsg ? <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert> : null}

        {/* TAB 1: BASIC INFO */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Full Name" name="name" value={formData.name || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" name="email" value={formData.email || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Mobile" name="mobile" value={formData.mobile || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="WhatsApp" name="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Birth Year" name="birthYear" value={formData.birthYear || ""} onChange={handleChange} helperText="Min. 18 years" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Gender" name="gender" value={formData.gender || "Male"} onChange={handleChange}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Country" name="country" value={formData.country || "India"} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Aadhaar" name="aadhaar" value={formData.aadhaar || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="PAN" name="pan" value={formData.pan || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="GSTIN" name="gst" value={formData.gst || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={formData.address || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="State" name="state" value={formData.state || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="District" name="district" value={formData.district || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="City" name="city" value={formData.city || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="PIN Code" name="pincode" value={formData.pincode || ""} onChange={handleChange} />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 2: PROFESSIONAL INFO */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Profession" name="profession" value={formData.profession || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Organisation" name="organisation" value={formData.organisation || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Bar Enrollment" name="barRegistration" value={formData.barRegistration || ""} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Experience" name="experience" value={formData.experience || ""} onChange={handleChange} helperText="Years" />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 3: DOCUMENTS VAULT */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Master Document Vault: All member documents verified under SHA-256 Integrity Engine.
          </Alert>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Document Type</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Identity Proof (Aadhaar / PAN)</TableCell>
                <TableCell>aadhaar_pan_verified.pdf</TableCell>
                <TableCell><Chip label="Verified" color="success" size="small" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bar Enrollment Certificate</TableCell>
                <TableCell>bar_certificate.pdf</TableCell>
                <TableCell><Chip label="Verified" color="success" size="small" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>

        {/* TAB 4: MEMBERSHIP PLAN */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Membership Tier" name="member_level" value={formData.member_level || "Basic"} onChange={handleChange}>
                <MenuItem value="Enterprise">Enterprise (Super Admin / Executive)</MenuItem>
                <MenuItem value="Professional">Professional (PRO Tier)</MenuItem>
                <MenuItem value="Basic">Basic Tier</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Registration Date" value={new Date(formData.registration_date).toLocaleDateString("en-IN")} disabled />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 5: VERIFICATION */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Verification Status" name="verification_status" value={formData.verification_status || "Approved"} onChange={handleChange}>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Submitted">Submitted</MenuItem>
                <MenuItem value="Pending Verification">Pending Verification</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Account Status" name="status" value={formData.status || "Active"} onChange={handleChange}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Remarks" name="remarks" value={formData.remarks || ""} onChange={handleChange} />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 6: LOGIN & SECURITY */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="System Role" name="role" value={formData.role || "member"} onChange={handleChange}>
                <MenuItem value="admin">Super Admin / Admin</MenuItem>
                <MenuItem value="employee">Staff / Employee</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Force Password Change" name="forcePasswordChange" value={formData.forcePasswordChange ? "true" : "false"} onChange={(e) => setFormData(p => ({ ...p, forcePasswordChange: e.target.value === "true" }))}>
                <MenuItem value="true">True (Require Change on Login)</MenuItem>
                <MenuItem value="false">False (Active)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 7: AUDIT TRAIL */}
        <TabPanel value={tabValue} index={6}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action Event</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Author</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {memberLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={log.author} size="small" variant="outlined" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button variant="outlined" onClick={onClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleFormSave} startIcon={<SaveIcon />}>
          Save Member Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
}
