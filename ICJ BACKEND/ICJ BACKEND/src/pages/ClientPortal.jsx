import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  Card,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  TextField,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import FullCanvasVoiceStudio from "../components/common/FullCanvasVoiceStudio.jsx";

// STEPS DEFINITION (4-STEP SEQUENTIAL PROGRESSION)
const STEPS = [
  { step: 1, title: "1. मेरा केस व स्थिति", subtitle: "Active Case & Telemetry" },
  { step: 2, title: "2. समस्या व वॉइस विवरण", subtitle: "Voice & Case Facts" },
  { step: 3, title: "3. दस्तावेज व साक्ष्य", subtitle: "Document Vault" },
  { step: 4, title: "4. वकील समीक्षा व सबमिशन", subtitle: "Counsel & Dispatch" },
];

export default function ClientPortal() {
  const [activeStep, setActiveStep] = useState(1); // Step 1 to 4

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

  // Active Cases State
  const [myCases, setMyCases] = useState(() => {
    try {
      const saved = localStorage.getItem("icj_client_active_cases");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "CASE-2026-0001",
              title: "Land Partition & Revenue Demarcation Matter",
              category: "Property & Revenue Law",
              court: "Hon'ble High Court of Judicature",
              oppositeParty: "Opposite Party (Demarcation Contest)",
              summary: "Ancestral agricultural land partition and boundary dispute requiring revenue demarcation.",
              filingDate: "2026-08-20",
              currentStage: 3, // Stage 3: e-Filing Verified
              cnrNumber: "DLHC010089222026",
              nextHearingDate: "28 Aug 2026 (10:30 AM)",
              assignedAdvocate: "Senior Advocate PAWAN GUPTA (Lead Counsel)",
              advocatePhone: "+91 9999002222 / 7053002222",
              status: "सक्रिय (Active)",
            },
          ];
    } catch {
      return [];
    }
  });

  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("icj_client_active_cases", JSON.stringify(myCases));
    } catch (e) {
      console.warn(e);
    }
  }, [myCases]);

  useEffect(() => {
    try {
      localStorage.setItem("icj_client_vault_documents", JSON.stringify(documents));
    } catch (e) {
      console.warn(e);
    }
  }, [documents]);

  // Handle Case Submission
  const handleSubmitNewCase = () => {
    const caseId = `CASE-${new Date().getFullYear()}-${String(myCases.length + 1).padStart(4, "0")}`;
    const newEntry = {
      id: caseId,
      title: caseForm.title || "नया केस विवरण (New Legal Matter)",
      category: caseForm.category,
      court: caseForm.court,
      oppositeParty: caseForm.oppositeParty || "विपक्षी पक्षकार",
      summary: caseForm.summary,
      filingDate: new Date().toISOString().split("T")[0],
      currentStage: 1,
      cnrNumber: `DL${new Date().getFullYear()}T${Math.floor(100000 + Math.random() * 900000)}`,
      nextHearingDate: "प्रक्रियाधीन (Under Scrutiny)",
      assignedAdvocate: "Senior Advocate PAWAN GUPTA (Lead Counsel)",
      advocatePhone: "+91 9999002222 / 7053002222",
      status: "सक्रिय (Active)",
    };

    setMyCases([newEntry, ...myCases]);
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setActiveStep(1); // Return to Step 1 showing active case
    }, 2000);
  };

  const handleAddDocument = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const newDoc = {
        id: `DOC-${Date.now()}`,
        name: file.name,
        category: "Case Evidence / Petition",
        caseId: myCases[0]?.id || "NEW-CASE",
        uploadedDate: new Date().toISOString().split("T")[0],
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  const handleDeleteDoc = (id) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f1f5f9",
        p: 2,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP 1-INCH HEADER & STEP BREADCRUMB                                   */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 1.5,
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <GavelIcon sx={{ color: "#1e3a8a", fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
              🏛️ विधिक समाधान व केस प्रबंधन पोर्टल (Litigant Client Desk)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              अधिकृत मुवक्किल कार्यक्षेत्र • सीनियर एडवोकेट पवन गुप्ता (पैनल लीड)
            </Typography>
          </Box>
        </Stack>

        {/* 4-Step Sequence Indicator */}
        <Stack direction="row" spacing={1} alignItems="center">
          {STEPS.map((s) => {
            const isActive = activeStep === s.step;
            const isCompleted = activeStep > s.step;
            return (
              <Button
                key={s.step}
                size="small"
                onClick={() => setActiveStep(s.step)}
                variant={isActive ? "contained" : isCompleted ? "outlined" : "text"}
                color={isActive ? "primary" : isCompleted ? "success" : "inherit"}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: isActive ? 800 : 600,
                  fontSize: "0.8rem",
                  px: 1.5,
                }}
              >
                {isCompleted ? "✓ " : ""}
                {s.title}
              </Button>
            );
          })}
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* 2. CENTER 88-90% CLEAN WORKSPACE CANVAS (ZERO SCROLL CLUTTER)            */}
      {/* ========================================================================= */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* ----------------------------------------------------------------------- */}
        {/* SCREEN 1: MY ACTIVE CASES & TELEMETRY                                   */}
        {/* ----------------------------------------------------------------------- */}
        {activeStep === 1 && (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0f172a">
                  📋 मेरा सक्रिय केस एवं लाइव स्थिति (My Case & Telemetry)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CNR नंबर, तारीखें एवं 5-चरणीय न्यायिक ट्रैकिंग
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setActiveStep(2)}
                sx={{
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#15803d" },
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  textTransform: "none",
                }}
              >
                ➕ नया केस दायर करें (Start Case Intake) →
              </Button>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            {myCases.length > 0 ? (
              <Grid container spacing={3}>
                {myCases.map((c) => (
                  <Grid item xs={12} md={7} key={c.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        borderColor: "#cbd5e1",
                        bgcolor: "#f8fafc",
                        borderLeft: "6px solid #2563eb",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={c.id} color="primary" size="small" sx={{ fontWeight: 700 }} />
                        <Chip label={c.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                      </Stack>

                      <Typography variant="h6" fontWeight={800} color="#1e293b" mb={0.5}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {c.summary}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="#64748b" display="block">
                            न्यायालय (Court)
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {c.court}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="#64748b" display="block">
                            CNR नंबर
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: "#2563eb" }}>
                            {c.cnrNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="#64748b" display="block">
                            अगली पेशी / सुनवाई
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: "#d97706" }}>
                            📅 {c.nextHearingDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="#64748b" display="block">
                            अधिकृत वकील (Assigned Counsel)
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: "#16a34a" }}>
                            👨‍⚖️ {c.assignedAdvocate}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}

                {/* Assigned Counsel Card */}
                <Grid item xs={12} md={5}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      borderColor: "#cbd5e1",
                      bgcolor: "#f0fdf4",
                      borderLeft: "6px solid #16a34a",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={800} color="#14532d" mb={0.5}>
                      👨‍⚖️ अधिकृत वरिष्ठ अधिवक्ता संपर्क
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#166534">
                      Senior Advocate PAWAN GUPTA (Lead Counsel)
                    </Typography>
                    <Typography variant="caption" color="#475569" display="block" mb={2}>
                      बार काउंसिल ऑफ दिल्ली एवं इलाहाबाद हाई कोर्ट बार
                    </Typography>

                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CallIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={700}>
                          +91 9999002222 / 7053002222
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <WhatsAppIcon sx={{ color: "#25D366", fontSize: 20 }} />
                        <Typography variant="body2">WhatsApp विधिक सहायता</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <EmailIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                        <Typography variant="body2">advocate.pawan@icj.org</Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  वर्तमान में कोई सक्रिय केस दर्ज नहीं है।
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, textTransform: "none", borderRadius: 2 }}
                  onClick={() => setActiveStep(2)}
                >
                  नया केस दर्ज करें
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SCREEN 2: 90% EXPANSIVE VOICE & TEXT INTAKE CANVAS                     */}
        {/* ----------------------------------------------------------------------- */}
        {activeStep === 2 && (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Top Category / Title Header within Canvas */}
            <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="केस का शीर्षक / मुख्य विषय (Case Title)"
                    placeholder="उदा. जमीन सीमा विवाद व पैमाइश / चेक बाउंस नोटिस"
                    value={caseForm.title}
                    onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="कानूनी श्रेणी (Legal Category)"
                    value={caseForm.category}
                    onChange={(e) => setCaseForm({ ...caseForm, category: e.target.value })}
                  >
                    <MenuItem value="Criminal Law & Bail (आपराधिक व जमानत)">आपराधिक कानून व जमानत (Criminal Law & Bail)</MenuItem>
                    <MenuItem value="Property & Revenue Law (संपत्ति व राजस्व)">संपत्ति, जमीन व राजस्व (Property & Revenue)</MenuItem>
                    <MenuItem value="Civil Disputes & Stay (दीवानी व स्थगन)">दीवानी विवाद व स्थगन (Civil Injunction)</MenuItem>
                    <MenuItem value="Cheque Bounce & Debt (138 NI Act)">चेक बाउंस व वसूली (138 NI Act)</MenuItem>
                    <MenuItem value="Consumer & RERA (उपभोक्ता व बिल्डर)">उपभोक्ता व रेरा विवाद (Consumer & RERA)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* 90% Full Voice Studio Canvas */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <FullCanvasVoiceStudio
                value={caseForm.summary}
                onChange={(txt) => setCaseForm({ ...caseForm, summary: txt })}
                placeholder="यहाँ माइक चालू करके बिना रुके अपनी पूरी कानूनी समस्या विस्तार से बोलें या टाइप करें..."
                title="🎙️ 90% क्लीन वॉइस कैनवस (Continuous Speech Typing - No Time Limit)"
              />
            </Box>
          </Paper>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SCREEN 3: 90% EXPANSIVE DOCUMENT VAULT CANVAS                           */}
        {/* ----------------------------------------------------------------------- */}
        {activeStep === 3 && (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0f172a">
                  📁 केस दस्तावेज एवं साक्ष्य वॉल्ट (Document Vault)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  नोटिस, एफआईआर, रसीद, रजिस्ट्री या साक्ष्य संलग्न करें (PDF, JPG, PNG)
                </Typography>
              </Box>

              <Button
                variant="contained"
                component="label"
                size="large"
                startIcon={<UploadFileIcon />}
                sx={{ bgcolor: "#2563eb", borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                + दस्तावेज अपलोड करें
                <input type="file" hidden onChange={handleAddDocument} />
              </Button>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            {documents.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>दस्तावेज नाम</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>श्रेणी</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>तारीख</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>साइज</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>कार्रवाई</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>📄 {doc.name}</TableCell>
                      <TableCell>
                        <Chip label={doc.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doc.uploadedDate}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <FolderIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  वर्तमान में कोई दस्तावेज अपलोड नहीं है।
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SCREEN 4: FINAL REVIEW & COUNSEL DISPATCH                               */}
        {/* ----------------------------------------------------------------------- */}
        {activeStep === 4 && (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#0f172a" mb={0.5}>
              👨‍⚖️ केस समीक्षा एवं वरिष्ठ वकील आवंटन (Case Review & Submission)
            </Typography>
            <Typography variant="caption" color="text.secondary" mb={2}>
              कृपया दर्ज विवरण की जांच कर केस सबमिट करें।
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1e3a8a" mb={1}>
                    {caseForm.title || "अनाम केस विवरण"}
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block" mb={1.5}>
                    श्रेणी: {caseForm.category}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#334155", mb: 2 }}>
                    {caseForm.summary || "कोई विस्तृत विवरण दर्ज नहीं किया गया।"}
                  </Typography>
                  <Chip
                    label={`📁 संलग्न दस्तावेज: ${documents.length} फाइल(एं)`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    borderColor: "#cbd5e1",
                    bgcolor: "#f0fdf4",
                    borderLeft: "6px solid #16a34a",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} color="#14532d" mb={0.5}>
                    अधिकृत विधिक अधिकारी (Designated Counsel)
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#166534">
                    Senior Advocate PAWAN GUPTA
                  </Typography>
                  <Typography variant="caption" color="#475569" display="block" mb={2}>
                    ID: 26ICJ08AA0002 • बार काउंसिल ऑफ दिल्ली एवं इलाहाबाद हाई कोर्ट बार
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleSubmitNewCase}
                    sx={{
                      bgcolor: "#16a34a",
                      "&:hover": { bgcolor: "#15803d" },
                      fontWeight: 800,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    {submissionSuccess ? "✓ केस सफलता पूर्वक दर्ज हुआ!" : "✅ केस वकील को प्रेषित करें (Submit Case)"}
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* ========================================================================= */}
      {/* 3. BOTTOM 1-INCH DOCK (BACK / NEXT ARROW NAVIGATION)                     */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mt: 1.5,
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
          disabled={activeStep === 1}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5 }}
        >
          ← पिछला चरण (Back)
        </Button>

        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b" }}>
          चरण {activeStep} / {STEPS.length}
        </Typography>

        {activeStep < STEPS.length ? (
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardIcon />}
            onClick={() => setActiveStep((prev) => Math.min(STEPS.length, prev + 1))}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              bgcolor: "#1e40af",
              "&:hover": { bgcolor: "#1e3a8a" },
            }}
          >
            अगला चरण (Next Step) →
          </Button>
        ) : (
          <Button
            variant="contained"
            size="medium"
            startIcon={<CheckCircleIcon />}
            onClick={handleSubmitNewCase}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              px: 3,
              bgcolor: "#16a34a",
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            केस सबमिट करें
          </Button>
        )}
      </Paper>
    </Box>
  );
}
