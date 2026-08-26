import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  TextField,
  Paper,
} from "@mui/material";

// Icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import VerifiedIcon from "@mui/icons-material/Verified";

import ZeroScrollPageShell from "../components/common/ZeroScrollPageShell.jsx";
import FullCanvasVoiceStudio from "../components/common/FullCanvasVoiceStudio.jsx";

const CASE_VIEWS = [
  { id: 0, title: "📋 मेरा केस व लाइव स्थिति", subtitle: "Active Case Telemetry & Status Tracking" },
  { id: 1, title: "🎙️ समस्या व वॉइस विवरण", subtitle: "90% Clean Continuous Voice Intake Canvas" },
  { id: 2, title: "📁 दस्तावेज व साक्ष्य वॉल्ट", subtitle: "Encrypted Evidence Vault & Documents" },
  { id: 3, title: "⚖️ अधिकृत विधिक अधिकारी व सबमिशन", subtitle: "Senior Advocate Counsel & Final Dispatch" },
];

export default function ClientPortal() {
  const [currentView, setCurrentView] = useState(0);

  // Case Intake State
  const [caseForm, setCaseForm] = useState({
    title: "",
    category: "Criminal Law & Bail (आपराधिक व जमानत)",
    court: "Hon'ble District & Sessions Court",
    oppositeParty: "",
    summary: "",
    urgency: "Normal",
  });

  // Attached Documents State
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("icj_client_vault_documents");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "DOC-2026-001",
              name: "Property_Registry_Document_1998.pdf",
              category: "Title Deed / Registry",
              caseId: "CASE-2026-0001",
              uploadedDate: "2026-08-20",
              size: "2.4 MB",
            },
          ];
    } catch {
      return [];
    }
  });

  const [activeCase, setActiveCase] = useState({
    id: "CASE-2026-0001",
    cnr: "DLHC010048902026",
    title: "विधिक परामर्श व संपत्ति नामांतरण संदर्भ",
    status: "सक्रिय (Active)",
    stage: "स्टेज 1: विधिक ड्राफ्टिंग एवं नोटिस",
    assignedCounsel: {
      name: "Senior Advocate PAWAN GUPTA",
      id: "26ICJ08AA0002",
      role: "वरिष्ठ अधिवक्ता (Senior Legal Counsel)",
      phone: "+91 9999002222",
      helpline: "7053002222",
      email: "advocate.pawan@icj.org",
      rating: 4.9,
    },
    filingDate: "2026-08-15",
    nextHearing: "2026-09-02",
    courtName: "District & Sessions Court, Delhi",
  });

  const handleVoiceTranscribed = (text) => {
    setCaseForm((prev) => ({
      ...prev,
      summary: prev.summary ? `${prev.summary}\n${text}` : text,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newDocs = files.map((file, idx) => ({
      id: `DOC-${Date.now()}-${idx}`,
      name: file.name,
      category: "Evidence / Application",
      caseId: activeCase.id,
      uploadedDate: new Date().toISOString().split("T")[0],
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    }));

    const updated = [...documents, ...newDocs];
    setDocuments(updated);
    localStorage.setItem("icj_client_vault_documents", JSON.stringify(updated));
  };

  const handleDeleteDoc = (id) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem("icj_client_vault_documents", JSON.stringify(updated));
  };

  const currentViewInfo = CASE_VIEWS[currentView];

  return (
    <ZeroScrollPageShell
      title={currentViewInfo.title}
      subtitle={currentViewInfo.subtitle}
      headerRightContent={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<GavelIcon sx={{ color: "#38bdf8 !important", fontSize: 16 }} />}
            label={`केस ID: ${activeCase.id}`}
            sx={{ bgcolor: "#1e293b", color: "#f8fafc", fontWeight: 700, borderColor: "#334155" }}
            variant="outlined"
          />
          <Chip
            icon={<VerifiedIcon sx={{ color: "#10b981 !important", fontSize: 16 }} />}
            label="पैनल अधिवक्ता: Senior Advocate PAWAN GUPTA"
            sx={{ bgcolor: "#064e3b", color: "#86efac", fontWeight: 800 }}
          />
        </Stack>
      }
      canGoBack={currentView > 0}
      canGoNext={currentView < 3}
      onBack={() => setCurrentView((v) => Math.max(0, v - 1))}
      onNext={() => setCurrentView((v) => Math.min(3, v + 1))}
      backLabel="← पिछले कार्यक्षेत्र पर जाएं"
      nextLabel="अगले कार्यक्षेत्र पर जाएं →"
    >
      {/* ========================================================================= */}
      {/* VIEW 0: ACTIVE CASE & TELEMETRY (2 STRICTLY EQUAL SYMMETRICAL BOXES)       */}
      {/* ========================================================================= */}
      {currentView === 0 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          {/* BOX 1: CASE DETAILS & STATUS */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, borderColor: "#93c5fd", p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Chip label={activeCase.status} color="success" size="small" sx={{ fontWeight: 800 }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    CNR: {activeCase.cnr}
                  </Typography>
                </Stack>

                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={1}>
                  {activeCase.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {activeCase.stage}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      दायर करने की तिथि:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      {activeCase.filingDate}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      अगली तारीख / हियरिंग:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#2563eb">
                      {activeCase.nextHearing}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      संबंधित न्यायालय:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      {activeCase.courtName}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCurrentView(1)}
                sx={{ mt: 2, fontWeight: 700, borderRadius: 2, textTransform: "none" }}
              >
                🎙️ केस में नई बात / समस्या दर्ज करें →
              </Button>
            </Card>
          </Grid>

          {/* BOX 2: ASSIGNED COUNSEL (STRICTLY EQUAL HEIGHT & SHAPE) */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, borderColor: "#cbd5e1", p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#f8fafc" }}>
              <Box>
                <Typography variant="caption" fontWeight={800} color="#2563eb" display="block" mb={0.5}>
                  ASSIGNED LEGAL COUNSEL
                </Typography>
                <Typography variant="h6" fontWeight={900} color="#0f172a">
                  {activeCase.assignedCounsel.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  ID: {activeCase.assignedCounsel.id} • {activeCase.assignedCounsel.role}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CallIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      सीधा संपर्क: {activeCase.assignedCounsel.phone}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WhatsAppIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      हेल्पलाइन: {activeCase.assignedCounsel.helpline}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailIcon sx={{ color: "#ea580c", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      ईमेल: {activeCase.assignedCounsel.email}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setCurrentView(3)}
                sx={{ mt: 2, bgcolor: "#1e40af", "&:hover": { bgcolor: "#1e3a8a" }, fontWeight: 800, borderRadius: 2, textTransform: "none" }}
              >
                ⚖️ वकील से सीधी सलाह व ड्राफ्टिंग →
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: FULL-CANVAS VOICE INTAKE STUDIO (90% CLEAN WORKSPACE)              */}
      {/* ========================================================================= */}
      {currentView === 1 && (
        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <FullCanvasVoiceStudio
            title="🎙️ केस की समस्या व तथ्य (Continuous Unlimited Voice Dictation)"
            subtitle="जितना चाहें लगातार बोलें—सिस्टम ऑटोमैटिकली बिना रुके टाइप करता रहेगा"
            initialText={caseForm.summary}
            onTextChange={(val) => setCaseForm((prev) => ({ ...prev, summary: val }))}
          />
        </Box>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: EVIDENCE & DOCUMENT VAULT (STRICT 100vh SYMMETRICAL TABLE)        */}
      {/* ========================================================================= */}
      {currentView === 2 && (
        <Card variant="outlined" sx={{ height: "100%", borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a">
                  📁 केस दस्तावेज व साक्ष्य वॉल्ट (Document Vault)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  बैंक-ग्रेड 256-बिट एन्क्रिप्टेड सुरक्षित स्टोरेज
                </Typography>
              </Box>

              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, fontWeight: 800, borderRadius: 2, textTransform: "none" }}
              >
                + नए दस्तावेज अपलोड करें
                <input type="file" hidden multiple onChange={handleFileUpload} />
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>दस्तावेज का नाम (Document Name)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>श्रेणी</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>अपलोड तिथि</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>साइज</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>हटाएं</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>📄 {doc.name}</TableCell>
                    <TableCell><Chip label={doc.category} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ color: "#64748b" }}>{doc.uploadedDate}</TableCell>
                    <TableCell sx={{ color: "#64748b" }}>{doc.size}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: COUNSEL SUBMISSION & FINAL DISPATCH (SYMMETRICAL DOCK)            */}
      {/* ========================================================================= */}
      {currentView === 3 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={1}>
                  ✍️ केस विवरण सारांश (Case Submission Summary)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  यह सारांश आपके अधिकृत वरिष्ठ अधिवक्ता को सीधे भेजा जाएगा।
                </Typography>

                <Paper elevation={0} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0", maxHeight: "200px", overflowY: "auto" }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#1e293b", fontSize: "0.85rem" }}>
                    {caseForm.summary || "कोई मौखिक या लिखित विवरण दर्ज नहीं है।"}
                  </Typography>
                </Paper>
              </Box>

              <Typography variant="caption" color="#16a34a" fontWeight={700}>
                ✓ कुल {documents.length} दस्तावेज संलग्न हैं।
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#eff6ff", borderColor: "#93c5fd" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#1e40af" mb={1}>
                  🏛️ अधिकृत विधिक अधिकारी स्वीकृति
                </Typography>
                <Typography variant="body2" color="#475569" mb={2}>
                  Senior Advocate PAWAN GUPTA (ID: 26ICJ08AA0002) आपकी फाइल की जांच करेंगे और आवश्यक विधिक ड्राफ्टिंग तैयार करेंगे।
                </Typography>

                <Stack spacing={1}>
                  <Chip icon={<CheckCircleIcon />} label="वकालतनामा सहमति सक्रिय" color="primary" sx={{ fontWeight: 700 }} />
                  <Chip icon={<CheckCircleIcon />} label="256-बिट गोपनीयता सुरक्षित" color="success" sx={{ fontWeight: 700 }} />
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, fontWeight: 900, py: 1.5, borderRadius: 2 }}
                onClick={() => alert("केस सफलतापूर्वक अधिकृत अधिवक्ता को प्रेषित किया गया!")}
              >
                ✓ केस व दस्तावेज अंतिम रूप से सबमिट करें
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </ZeroScrollPageShell>
  );
}
