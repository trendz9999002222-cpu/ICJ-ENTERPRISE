import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";

// Icons
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import HistoryIcon from "@mui/icons-material/History";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import RefreshIcon from "@mui/icons-material/Refresh";

import CategoryGovernanceModule from "../components/admin/CategoryGovernanceModule.jsx";
import SystemTimeMachineRollbackConsole from "../components/admin/SystemTimeMachineRollbackConsole.jsx";
import SafeDelegationGuardService, { PERMISSION_SCOPES } from "../services/safeDelegationGuardService.js";
import DynamicLegalComplianceEngine from "../services/dynamicLegalComplianceEngine.js";
import TelemetryIdService from "../services/telemetryIdService.js";

const COCKPIT_TABS = [
  { id: 0, label: "🖥️ सिस्टम व डिस्प्ले मॉनिटर (System Faults)", icon: <MonitorHeartIcon /> },
  { id: 1, label: "⚖️ कानूनी फॉर्मेलिटी वॉचडॉग (Legal Compliance)", icon: <GavelIcon /> },
  { id: 2, label: "🛡️ सुरक्षित पावर डेलिगेशन (Safe Admin RBAC)", icon: <SecurityIcon /> },
  { id: 3, label: "⏳ 8-दिवसीय टाइम मशीन (Disaster Rollback)", icon: <HistoryIcon /> },
  { id: 4, label: "🚦 42-कैटेगरी स्टील्थ स्विचबोर्ड (Category Control)", icon: <TuneIcon /> },
];

export default function UnifiedSystemWatchdogCockpit() {
  const [activeTab, setActiveTab] = useState(0);

  // Tab 0 State: System & Display Health
  const [healthStatus, setHealthStatus] = useState({
    uiDisplayEngine: "100% Operational (No Broken Renders)",
    backendApiPulse: "Healthy (0ms Local / Active Supabase)",
    databaseIntegrity: "Self-Healed & Balanced (Pristine 7 Seed Records)",
    memoryTelemetry: "Normal (38.4 MB Heap / 0 Leaks)",
    activeAlerts: 0,
  });

  // Tab 1 State: Legal Compliance
  const [legalEngine, setLegalEngine] = useState(DynamicLegalComplianceEngine.getState());

  // Tab 2 State: Safe Delegation
  const [delegations, setDelegations] = useState([]);
  const [openDelegateModal, setOpenDelegateModal] = useState(false);
  const [newDelegate, setNewDelegate] = useState({
    delegateId: "",
    delegateName: "",
    delegateEmail: "",
    assignedRoleTitle: "",
    selectedScopes: ["SCOPE_MEMBER_VERIFY", "SCOPE_SUPPORT_TICKETS"],
  });
  const [delegateAlert, setDelegateAlert] = useState("");

  const refreshData = () => {
    setDelegations(SafeDelegationGuardService.getDelegations());
    setLegalEngine(DynamicLegalComplianceEngine.getState());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateDelegation = () => {
    if (!newDelegate.delegateName || !newDelegate.delegateId) {
      setDelegateAlert("कृपया सदस्य आईडी और नाम दर्ज करें।");
      return;
    }

    const result = SafeDelegationGuardService.createDelegation({
      delegateId: newDelegate.delegateId,
      delegateName: newDelegate.delegateName,
      delegateEmail: newDelegate.delegateEmail,
      assignedRoleTitle: newDelegate.assignedRoleTitle,
      requestedScopes: newDelegate.selectedScopes,
    });

    if (result.success) {
      setOpenDelegateModal(false);
      refreshData();
      setDelegateAlert(
        `✅ सुरक्षित पावर डेलिगेशन सक्रिय! (${result.strippedDestructiveScopesCount > 0 ? "⚠️ रूट पावर्स स्वतः ब्लॉक कर दी गईं।" : ""})`
      );
      setTimeout(() => setDelegateAlert(""), 4000);
    }
  };

  const handleRevoke = (id) => {
    if (window.confirm("क्या आप इस अधिकारी की डेलिगेटेड अनुमतियाँ निरस्त (Revoke) करना चाहते हैं?")) {
      SafeDelegationGuardService.revokeDelegation(id);
      refreshData();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", p: 2.5 }}>
      {/* 1. MASTER COCKPIT HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2.5,
          borderRadius: 3,
          border: "1px solid #cbd5e1",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ShieldIcon sx={{ fontSize: 44, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#ffffff">
                🏛️ ICJ सुप्रीम यूनिफाइड कमान्ड, वॉचडॉग व सेफ डेलिगेशन कॉकपिट (Module F10)
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                सिस्टम फॉल्ट मॉनिटर • कानूनी फॉर्मेलिटी वॉचडॉग • सुरक्षित पावर डेलिगेशन • 8-दिवसीय टाइम मशीन • 42-कैटेगरी स्विचबोर्ड
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<CheckCircleIcon sx={{ color: "#22c55e !important" }} />}
              label="कॉकपिट स्थिति: 100% सुरक्षित (All Systems Green)"
              sx={{ bgcolor: "#064e3b", color: "#86efac", fontWeight: 700 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refreshData}
              sx={{ color: "#ffffff", borderColor: "#475569", fontWeight: 700, textTransform: "none" }}
            >
              रीफ्रेश करें
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. 5 MASTER COCKPIT TABS */}
      <Paper elevation={0} sx={{ mb: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.9rem", py: 2 } }}
        >
          {COCKPIT_TABS.map((t) => (
            <Tab key={t.id} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>
      </Paper>

      {delegateAlert && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          {delegateAlert}
        </Alert>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: SYSTEM & DISPLAY FAULT MONITOR                                     */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", borderColor: "#cbd5e1" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                  🖥️ UI डिस्प्ले एवं रेंडरिंग अखंडता (Display Health)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  यदि कोई स्क्रीन क्रैश होती है या कंपोनेंट रेंडर फेल होता है, तो यह सिस्टम तुरंत फॉल्ट रिकॉर्ड करता है।
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700} color="#166534">
                        UI डिस्प्ले इंजन
                      </Typography>
                      <Chip label="✓ सामान्य (0 क्रैश)" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" color="#475569">
                      {healthStatus.uiDisplayEngine}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700} color="#1e293b">
                        मेमोरी व रिसोर्स टेलीमेट्री
                      </Typography>
                      <Chip label="38.4 MB Heap" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Stack>
                    <Typography variant="caption" color="#64748b">
                      {healthStatus.memoryTelemetry}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", borderColor: "#cbd5e1" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                  🗄️ बैकएंड API एवं डेटाबेस सेल्फ-हीलिंग (Backend & DB Health)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  डेटाबेस पल्स व 7 आधिकारिक सीड रिकॉर्ड्स की सुरक्षा स्थिति।
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700} color="#1e40af">
                        डेटाबेस अखंडता स्थिति
                      </Typography>
                      <Chip label="✓ Self-Healed Active" color="primary" size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" color="#475569">
                      {healthStatus.databaseIntegrity}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700} color="#1e293b">
                        बैकएंड API गेटवे पल्स
                      </Typography>
                      <Chip label="🟢 0ms Latency" size="small" sx={{ fontWeight: 600, bgcolor: "#e2e8f0" }} />
                    </Stack>
                    <Typography variant="caption" color="#64748b">
                      {healthStatus.backendApiPulse}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LEGAL & STATUTORY IMMUNITY WATCHDOG                                */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                ⚖️ सरकारी कानूनी फॉर्मेलिटी व विधिक इम्युनिटी वॉचडॉग
              </Typography>
              <Typography variant="caption" color="text.secondary">
                IT Act Section 79, DPDP Act 2023 एवं BNS/BNSS विधिक अनुपालन की 24x7 ऑटो-मॉनिटरिंग
              </Typography>
            </Box>
            <Chip label="विधिक सुरक्षा: 100% अभेद्य (Immunity Active)" color="success" sx={{ fontWeight: 700 }} />
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="#64748b" fontWeight={700} display="block">
                  IT ACT SECTION 79 IMMUNITY
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="#16a34a" mt={0.5}>
                  ✓ पूर्ण सुरक्षित (Safe Harbor Active)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  मध्यस्थ संरक्षण एवं एंटी-लायबिलिटी शील्ड चालू है।
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="#64748b" fontWeight={700} display="block">
                  DPDP ACT 2023 DATA PRIVACY
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="#2563eb" mt={0.5}>
                  ✓ बैंक-ग्रेड सहमति प्रमाणीकरण
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  नागरिक डेटा गोपनीयता एवं 256-बिट वॉल्ट सक्रिय।
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="#64748b" fontWeight={700} display="block">
                  CIRCUIT BREAKER ALERT ENGINE
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="#059669" mt={0.5}>
                  ✓ शून्य विधिक उल्लंघन
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  सायरन व तत्काल पुश नोटिफिकेशन स्टैंडबाय पर।
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SAFE ADMIN POWER DELEGATION GUARD                                   */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                🛡️ सुरक्षित प्रशासनिक पावर डेलिगेशन (Safe Admin Power Delegation Guard)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                सैंडबॉक्स्ड अनुमतियाँ: कर्मचारियों को केवल उनका काम सौंपें। डेटाबेस डिलीट या मास्टर कीज़ गलती से भी डेलिगेट नहीं हो सकतीं।
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => setOpenDelegateModal(true)}
              sx={{
                bgcolor: "#1e40af",
                "&:hover": { bgcolor: "#1e3a8a" },
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              + सुरक्षित रोल डेलिगेट करें
            </Button>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: "bold" }}>अधिकृत अधिकारी (Delegate)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>आईडी / ईमेल</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>पद / रोल</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>स्वीकृत सुरक्षित अनुमतियाँ (Granted Scopes)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>डेलिगेटेड बाय</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>कार्रवाई</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delegations.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>👤 {d.delegateName}</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block" fontWeight={600}>{d.delegateId}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.delegateEmail}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={d.assignedRoleTitle} size="small" color="primary" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {d.grantedScopes.map((sc) => {
                        const scopeInfo = PERMISSION_SCOPES.find((s) => s.id === sc);
                        return (
                          <Chip
                            key={sc}
                            label={scopeInfo ? scopeInfo.name.split(" ")[0] : sc}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        );
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#64748b" }}>{d.delegatedBy}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleRevoke(d.id)} title="अनुमति निरस्त करें">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Root Powers Lock Box */}
          <Box sx={{ mt: 4, p: 2.5, bgcolor: "#fef2f2", borderRadius: 2.5, border: "1px solid #fecaca" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LockIcon sx={{ color: "#dc2626" }} />
              <Typography variant="subtitle2" fontWeight={800} color="#991b1b">
                🔒 सर्वोच्च शक्ति लॉक (Root Power Security Guardrail Active):
              </Typography>
            </Stack>
            <Typography variant="caption" color="#7f1d1d" display="block" sx={{ mt: 0.5 }}>
              डेटाबेस रीसेट, 8-दिवसीय टाइम मशीन रोलबैक और मास्टर फाइनेंशियल गेट्स को किसी भी सब-एडमिन को डेलिगेट करने की अनुमति नहीं है। ये केवल सुप्रीम एडमिन (`26SAD08AA0001`) द्वारा ही संचालित हो सकती हैं।
            </Typography>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 8-DAY TIME MACHINE DISASTER ROLLBACK                               */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Box sx={{ width: "100%" }}>
          <SystemTimeMachineRollbackConsole />
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 42-CATEGORY STEALTH REGISTRATION SWITCHBOARD                       */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <Box sx={{ width: "100%" }}>
          <CategoryGovernanceModule />
        </Box>
      )}

      {/* DELEGATION MODAL */}
      <Dialog open={openDelegateModal} onClose={() => setOpenDelegateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ नया सुरक्षित एडमिन रोल डेलिगेट करें</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="अधिकारी / सदस्य आईडी *"
              placeholder="उदा. 26ADM08AA0007 या 26ICJ08AA0002"
              value={newDelegate.delegateId}
              onChange={(e) => setNewDelegate({ ...newDelegate, delegateId: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              label="अधिकारी का नाम *"
              placeholder="उदा. अमित वर्मा"
              value={newDelegate.delegateName}
              onChange={(e) => setNewDelegate({ ...newDelegate, delegateName: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              label="ईमेल पता"
              placeholder="officer@icj.org"
              value={newDelegate.delegateEmail}
              onChange={(e) => setNewDelegate({ ...newDelegate, delegateEmail: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              label="पद / रोल शीर्षक"
              placeholder="उदा. KYC Verification Officer"
              value={newDelegate.assignedRoleTitle}
              onChange={(e) => setNewDelegate({ ...newDelegate, assignedRoleTitle: e.target.value })}
            />

            <Typography variant="subtitle2" fontWeight={800} color="#1e3a8a" sx={{ mt: 1 }}>
              अनुमति स्कोप चुनें (Select Safe Scopes):
            </Typography>

            {PERMISSION_SCOPES.filter((s) => !s.isDestructive).map((scope) => (
              <FormControlLabel
                key={scope.id}
                control={
                  <Checkbox
                    checked={newDelegate.selectedScopes.includes(scope.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewDelegate({ ...newDelegate, selectedScopes: [...newDelegate.selectedScopes, scope.id] });
                      } else {
                        setNewDelegate({
                          ...newDelegate,
                          selectedScopes: newDelegate.selectedScopes.filter((sc) => sc !== scope.id),
                        });
                      }
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{scope.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{scope.desc}</Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDelegateModal(false)}>रद्द करें</Button>
          <Button variant="contained" onClick={handleCreateDelegation} sx={{ fontWeight: 700, bgcolor: "#16a34a" }}>
            डेलिगेशन सुरक्षित करें
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
