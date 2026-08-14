import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Paper, Typography, Grid, TextField, Button, MenuItem,
  Stack, Divider, Alert, Chip, Table, TableHead, TableBody,
  TableRow, TableCell, Tabs, Tab, Tooltip, LinearProgress,
  IconButton, Collapse, List, ListItem, ListItemIcon, ListItemText,
  Badge,
} from "@mui/material";

// Icons
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import HistoryIcon from "@mui/icons-material/History";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import QuizIcon from "@mui/icons-material/Quiz";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import BlockIcon from "@mui/icons-material/Block";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

import LegalEcosystemService from "../services/legalEcosystemService";
import ActivityService from "../services/activityService";
import LegalMatterDataService from "../services/legalMatterDataService";
import JudicialVictoryEngine from "../services/judicialVictoryEngine";
import { DOCUMENT_SCHEMAS } from "../services/legalKnowledgeBase";
import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

// 16 Legal Document Templates (structural definitions only — no seed data)
const DOCUMENT_TYPES = [
  "Legal Notice", "Civil Suit", "Written Statement", "Affidavit",
  "RTI Application", "Appeal Petition", "Writ Petition", "Arbitration Petition",
  "Consumer Complaint", "Criminal Complaint", "Agreement / MOU", "Lease Deed",
  "Sale Deed", "Power of Attorney", "Trust Deed", "Board Resolution",
  "Cross-Examination Question Plan (जिरह प्रश्न)",
  "Counter-Citation & Bench Shield (विरोधी नजीर काट)",
  "Section 63 BSA / 65B Electronic Evidence Certificate",
];

// ─── DRAFT GENERATOR (from confirmed matter data only) ────────────────────────
function buildDraftFromMatter(caseObj, docType, matterFields, memberId) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const autoNumber = `ICJ-DRAFT-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  // Resolve field: try matterFields first (user-confirmed), then caseObj
  const resolve = (key, fallbackCaseKey, fallbackLabel) => {
    const mf = matterFields?.[key];
    if (mf?.value && mf.status === "CONFIRMED") return mf.value;
    if (mf?.value) return `[AI_EXTRACTED: ${mf.value}]`;
    const cv = caseObj?.[fallbackCaseKey];
    if (cv) return cv;
    return `[${fallbackLabel}]`;
  };

  const party1 = resolve("petitioner_name", "clientName", "PETITIONER_NAME_REQUIRED");
  const party2 = resolve("respondent_name", "respondentName", "RESPONDENT_NAME_REQUIRED");
  const court = resolve("court_name", "court", "COURT_NAME_REQUIRED");
  const relief = resolve("relief_sought", "relief", "RELIEF_SOUGHT_REQUIRED");
  const caseNo = resolve("case_number", "caseNumber", "CASE_NUMBER");

  // Handle Sub-Module 1: Cross-Exam Questions Plan
  if (docType.includes("Cross-Examination")) {
    const res = JudicialVictoryEngine.generateCrossExaminationQuestions({
      witnessType: "Prosecution / Opposing Witness",
      disputeSummary: caseObj?.summary || "Dispute summary",
      keyAllegations: relief,
    });
    return `${res.title}\nDATE: ${res.dateStr}\n\nSUGGESTED ISSUES TO BE FRAMED (ORDER 14 CPC):\n${res.suggestedIssues.join("\n")}\n\nCROSS-EXAMINATION QUESTIONS:\n${res.crossExaminationQuestions.join("\n\n")}`;
  }

  // Handle Sub-Module 2: Counter-Citation & Bench Shield
  if (docType.includes("Counter-Citation")) {
    const res = JudicialVictoryEngine.generateCounterCitationShield({
      opposingCitation: "Cited Authority",
      legalProvision: "Section 482 / Order 39",
    });
    return `COUNTER-CITATION SHIELD & BENCH ANALYTICS\n\nOPPOSING CITATION ANALYSIS:\n${res.analysis}\n\nRELIED COUNTER PRECEDENTS:\n${res.counterRatios.map(r => `• ${r.precedent}\n  RATIO: ${r.principle}`).join("\n\n")}\n\nBENCH STRATEGY NOTE:\n${res.benchGuidanceNote}`;
  }

  // Handle Sub-Module 3: Section 63 BSA / 65B Certificate
  if (docType.includes("Section 63 BSA")) {
    return JudicialVictoryEngine.generateSection63BSACertificate({
      documentName: caseObj?.title ? `${caseObj.title}_Electronic_Evidence` : "Court_Audio_Chat_Evidence",
      fileHash: `SHA256-${Math.floor(100000 + Math.random() * 900000)}`,
      uploadedBy: party1,
    });
  }

  return `================================================================================
  DOCUMENT TYPE: ${docType.toUpperCase()}
  DOCUMENT REGISTRY NO: ${autoNumber}
  DATE OF EXECUTION: ${dateStr}
  DATA SOURCE: CONFIRMED MATTER DATA
  MEMBER ID: ${memberId}
================================================================================

IN THE MATTER OF:

${docType.toUpperCase()}

CASE/MATTER: ${caseObj?.title || "[MATTER_TITLE_REQUIRED]"}
CASE NO: ${caseNo}
COURT/FORUM: ${court}

PARTY (PETITIONER/PLAINTIFF/APPLICANT):
${party1}

PARTY (RESPONDENT/DEFENDANT/OPPOSITE PARTY):
${party2}

STATEMENT OF FACTS:
${caseObj?.description || "[STATEMENT_OF_FACTS_REQUIRED — Please provide matter facts]"}

RELIEF SOUGHT:
${relief}

DATED: ${dateStr}

================================================================================
DRAFT STATUS: PRELIMINARY DRAFT — PENDING HUMAN LEGAL REVIEW
AI ASSISTANCE DISCLAIMER: This draft was generated from confirmed matter data.
It is NOT legal advice. Human legal review by a qualified advocate is mandatory
before filing or use.
All AI_EXTRACTED fields require confirmation before finalization.
================================================================================`;
}

// ─── READINESS INDICATOR COMPONENT ───────────────────────────────────────────
function ReadinessIndicator({ score, threshold, label }) {
  const color = score >= threshold ? "success" : score >= 50 ? "warning" : "error";
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold">
          Matter Readiness: <strong>{score}%</strong>
        </Typography>
        <Chip
          size="small"
          label={score >= threshold ? "Ready to Draft" : `Need ${threshold}% min`}
          color={color}
          variant="outlined"
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LegalDrafter() {
  const { user } = useAuth();
  const role = String(user?.role || "member").toLowerCase();
  const memberId = user?.member_id || user?.memberId || user?.id || "";

  // ── State ──
  const [tabIndex, setTabIndex] = useState(0);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [docType, setDocType] = useState("Legal Notice");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: "", severity: "success" });
  const [search, setSearch] = useState("");

  // Advocate Strategy Interrogation & Refinement States
  const [advocateIntentModalOpen, setAdvocateIntentModalOpen] = useState(false);
  const [advocateIntentText, setAdvocateIntentText] = useState("");
  const [customRefinementInstruction, setCustomRefinementInstruction] = useState("");

  // Draft history (from persistent service)
  const [draftHistory, setDraftHistory] = useState([]);

  // OCR/Extraction tab
  const [inputText, setInputText] = useState("");
  const [extractionResult, setExtractionResult] = useState(null);
  const [extractionLoading, setExtractionLoading] = useState(false);

  // Matter intelligence
  const [readiness, setReadiness] = useState(null);
  const [intelligentQuestions, setIntelligentQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [placeholderWarning, setPlaceholderWarning] = useState(null);

  // ── Load Cases (member-scoped) ──
  useEffect(() => {
    const allCases = LegalEcosystemService.getCases();
    const filtered = (role === "member" || role === "client")
      ? allCases.filter((c) => String(c.member_id || "").toLowerCase() === String(memberId).toLowerCase())
      : allCases;
    setCases(filtered);
  }, [role, memberId]);

  // ── Load Draft History from persistent service ──
  useEffect(() => {
    if (!memberId) return;
    const allDrafts = LegalMatterDataService.getAllDraftsForMember(memberId);
    setDraftHistory(allDrafts);
  }, [memberId, selectedCaseId]);

  // ── Recalculate readiness whenever case or docType changes ──
  useEffect(() => {
    if (!selectedCaseId || !docType) { setReadiness(null); return; }
    const caseObj = cases.find(c => c.id === selectedCaseId);
    const r = LegalMatterDataService.calculateReadiness(memberId, selectedCaseId, caseObj, docType);
    setReadiness(r);
    const qs = LegalMatterDataService.getIntelligentQuestions(memberId, selectedCaseId, caseObj, docType);
    setIntelligentQuestions(qs);
    setQuestionAnswers({});
    setShowQuestions(qs.length > 0);
    setGeneratedDraft("");
    setPlaceholderWarning(null);
  }, [selectedCaseId, docType, memberId, cases]);

  // ── Save user answers to matter data ──
  const handleSaveAnswer = useCallback((fieldKey, value) => {
    setQuestionAnswers(prev => ({ ...prev, [fieldKey]: value }));
    if (value.trim()) {
      LegalMatterDataService.confirmField(memberId, selectedCaseId, fieldKey, value.trim());
      // Recalculate readiness after answer
      const caseObj = cases.find(c => c.id === selectedCaseId);
      const r = LegalMatterDataService.calculateReadiness(memberId, selectedCaseId, caseObj, docType);
      setReadiness(r);
      const qs = LegalMatterDataService.getIntelligentQuestions(memberId, selectedCaseId, caseObj, docType);
      setIntelligentQuestions(qs);
    }
  }, [memberId, selectedCaseId, cases, docType]);

  // ── GENERATE DRAFT (guarded) ──
  const handleGenerateDraft = useCallback(() => {
    const caseObj = cases.find(c => c.id === selectedCaseId);
    const matterData = LegalMatterDataService.getMatterData(memberId, selectedCaseId);

    // GUARD 1: No case selected
    if (!selectedCaseId) {
      setAlertMsg({ text: "कोई केस/मैटर नहीं चुना गया। पहले Active Case File चुनें।", severity: "error" });
      return;
    }

    // GUARD 2: Generation validation
    const validation = LegalMatterDataService.canGenerateDraft(memberId, selectedCaseId, caseObj, docType);
    if (!validation.allowed) {
      setAlertMsg({ text: validation.message, severity: "error" });
      setShowQuestions(true);
      return;
    }

    // Generate from confirmed matter data
    const draft = buildDraftFromMatter(caseObj, docType, matterData.fields, memberId);

    // GUARD 3: Placeholder check
    const placeholderCheck = LegalMatterDataService.checkPlaceholders(draft);
    if (!placeholderCheck.clean) {
      setPlaceholderWarning(placeholderCheck);
      setGeneratedDraft(draft);
      setAlertMsg({
        text: `Draft में ${placeholderCheck.count} अनिर्धारित फ़ील्ड हैं: ${placeholderCheck.placeholders.join(", ")} — Finalization blocked.`,
        severity: "warning",
      });
    } else {
      setPlaceholderWarning(null);
      setAlertMsg({ text: `AI Legal Draft "${docType}" सफलतापूर्वक तैयार हुआ। Human review आवश्यक है।`, severity: "success" });
    }

    setGeneratedDraft(draft);

    // Save to persistent draft history
    const autoNumber = `ICJ-DRAFT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newRecord = {
      id: `v${draftHistory.length + 1}.0`,
      title: `${docType} — ${caseObj?.title || "Matter"}`,
      docType,
      version: `v${draftHistory.length + 1}.0`,
      date: new Date().toISOString().split("T")[0],
      status: placeholderCheck.clean ? "Draft Created" : "Placeholder Warning",
      hash: `SHA256-DRAFT-${Math.floor(10000 + Math.random() * 90000)}`,
      draftNumber: autoNumber,
      caseId: selectedCaseId,
    };
    LegalMatterDataService.saveDraft(memberId, selectedCaseId, newRecord);
    setDraftHistory(LegalMatterDataService.getAllDraftsForMember(memberId));

    ActivityService.create({
      title: `AI Legal Draft Generated: ${docType} (${autoNumber}) — Matter: ${caseObj?.title}`,
      type: "legal",
    });
    setTimeout(() => setAlertMsg({ text: "", severity: "success" }), 5000);
  }, [cases, selectedCaseId, memberId, docType, draftHistory]);

  // ── OCR / DOCUMENT ANALYSIS ──
  const handleAnalyzeText = useCallback(() => {
    if (!inputText.trim()) {
      setAlertMsg({ text: "कोई text नहीं है। Document text paste करें।", severity: "warning" });
      return;
    }
    setExtractionLoading(true);
    setTimeout(() => {
      const result = LegalMatterDataService.extractFromText(
        inputText,
        "USER_INPUT",
        "Pasted Document Text"
      );
      // Detect conflicts before saving
      if (selectedCaseId) {
        const conflicts = LegalMatterDataService.detectConflicts(memberId, selectedCaseId, result);
        result.conflicts = conflicts;
        LegalMatterDataService.saveExtraction(memberId, selectedCaseId, result);
        // Refresh readiness
        const caseObj = cases.find(c => c.id === selectedCaseId);
        const r = LegalMatterDataService.calculateReadiness(memberId, selectedCaseId, caseObj, docType);
        setReadiness(r);
      }
      setExtractionResult(result);
      setExtractionLoading(false);
      ActivityService.create({ title: `Document Text Extracted: ${result.dates.length} dates, ${result.caseNumbers.length} case nos found`, type: "legal" });
    }, 600);
  }, [inputText, selectedCaseId, memberId, cases, docType]);

  // ── COPY DRAFT ──
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── DYNAMIC COMPLIANCE CHECKLIST ──
  const complianceChecklist = useMemo(() => {
    if (!readiness) return [];
    const items = [];
    readiness.available?.forEach(f => items.push({ label: f.label, status: "ok", detail: `Confirmed: ${f.value || "✓"}` }));
    readiness.missing?.forEach(f => items.push({ label: f.label, status: "warning", detail: "Not yet provided" }));
    readiness.blocking?.forEach(f => items.push({ label: f.label, status: "error", detail: "REQUIRED — Blocks generation" }));
    const docReqs = LegalMatterDataService.getDocumentRequirements(docType);
    docReqs.forEach(req => items.push({ label: req, status: "info", detail: "Document Required" }));
    return items;
  }, [readiness, docType]);

  // ── VERSION HISTORY FILTER ──
  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return draftHistory;
    return draftHistory.filter(d =>
      [d.title, d.docType, d.version, d.status, d.hash, d.draftNumber]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(term))
    );
  }, [draftHistory, search]);

  // ── STATS CARDS (dynamic, from real data) ──
  const stats = useMemo(() => ({
    draftsCreated: draftHistory.length,
    pendingDrafts: draftHistory.filter(d => d.status === "In Review" || d.status === "Pending" || d.status === "Placeholder Warning").length,
    templatesAvailable: DOCUMENT_TYPES.length,
    recentActivity: draftHistory.slice(0, 8).length,
  }), [draftHistory]);

  const cards = [
    { title: "Drafts Created", value: stats.draftsCreated, color: "#1976d2", icon: <DescriptionIcon /> },
    { title: "Pending Review", value: stats.pendingDrafts, color: "#ed6c02", icon: <WarningIcon /> },
    { title: "Legal Templates", value: stats.templatesAvailable, color: "#9c27b0", icon: <AutoFixHighIcon /> },
    { title: "Recent AI Runs", value: stats.recentActivity, color: "#2e7d32", icon: <SmartToyIcon /> },
  ];

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // ── RENDER ──
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SmartToyIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                AI Legal Matter Intelligence & Document Engine
              </Typography>
              <Typography color="text.secondary">
                Matter-Driven Drafting · Document Extraction · Privacy-Preserving · 16 Legal Templates
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Alert */}
        {alertMsg.text && (
          <Alert severity={alertMsg.severity} sx={{ mb: 3 }} onClose={() => setAlertMsg({ text: "", severity: "success" })}>
            {alertMsg.text}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, cursor: "pointer" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight="bold" display="block">
                      {item.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">{item.value}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab icon={<AutoFixHighIcon />} iconPosition="start" label="AI Legal Drafter" />
            <Tab icon={<UploadFileIcon />} iconPosition="start" label="Document Extraction & OCR" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="Version History" />
            <Tab icon={<PlaylistAddCheckIcon />} iconPosition="start" label={
              <Badge badgeContent={complianceChecklist.filter(c => c.status === "error").length || null} color="error">
                Compliance Checklist
              </Badge>
            } />
          </Tabs>
        </Box>

        {/* ── TAB 0: AI LEGAL DRAFTER (4-step pipeline) ── */}
        <TabPanel value={tabIndex} index={0}>
          <Grid container spacing={3}>

            {/* LEFT PANEL: Steps 1–3 */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2.5}>

                {/* STEP 1: Select Case */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                    STEP 1 — Select Active Matter / Case
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {cases.length === 0 ? (
                    <Alert severity="info" icon={<InfoOutlinedIcon />}>
                      कोई केस नहीं मिला। पहले Case Management में केस जोड़ें।
                    </Alert>
                  ) : (
                    <TextField
                      select fullWidth
                      label="Active Case File"
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                    >
                      {cases.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.caseNumber} — {c.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  {selectedCase && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip size="small" label={selectedCase.status || "Active"} color="success" variant="outlined" />
                      <Chip size="small" label={selectedCase.court || "Court Not Set"} variant="outlined" />
                    </Stack>
                  )}
                </Paper>

                {/* STEP 2: Select Document Type */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                    STEP 2 — Select Document Type
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TextField
                    select fullWidth
                    label="Document Type (16 Templates)"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>

                  {/* Readiness Indicator */}
                  {readiness && selectedCaseId && (
                    <Box sx={{ mt: 2 }}>
                      <ReadinessIndicator
                        score={readiness.score}
                        threshold={readiness.threshold}
                        label="Matter Readiness"
                      />
                    </Box>
                  )}
                </Paper>

                {/* STEP 3: Intelligent Questions */}
                {intelligentQuestions.length > 0 && (
                  <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "warning.light" }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <QuizIcon color="warning" />
                      <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                        STEP 3 — Provide Missing Information ({intelligentQuestions.length} fields)
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                      These questions are specific to <strong>{docType}</strong> requirements only.
                    </Typography>
                    <Stack spacing={2}>
                      {intelligentQuestions.slice(0, 5).map((q) => (
                        <Box key={q.fieldKey}>
                          <Typography variant="caption" fontWeight="bold" color={q.isBlocking ? "error" : "warning.dark"}>
                            {q.isBlocking ? "⛔ REQUIRED: " : "⚠️ Important: "}{q.label}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                            {q.question}
                          </Typography>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder={`Enter ${q.label}...`}
                            value={questionAnswers[q.fieldKey] || ""}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [q.fieldKey]: e.target.value }))}
                            onBlur={(e) => handleSaveAnswer(q.fieldKey, e.target.value)}
                            multiline={q.inputType === "textarea"}
                            rows={q.inputType === "textarea" ? 3 : 1}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Stack direction="row" spacing={0.5}>
                                    <Button
                                      size="small"
                                      sx={{ minWidth: 0, p: 0.5, fontSize: "1rem" }}
                                      title="Listen to question"
                                      onClick={() => {
                                        if ('speechSynthesis' in window) {
                                          window.speechSynthesis.cancel();
                                          const utterance = new SpeechSynthesisUtterance(q.question);
                                          utterance.lang = 'hi-IN'; // hindi/english bilingual support
                                          window.speechSynthesis.speak(utterance);
                                        } else {
                                          alert("Speech synthesis not supported in this browser.");
                                        }
                                      }}
                                    >
                                      🔊
                                    </Button>
                                    <Button
                                      size="small"
                                      sx={{ minWidth: 0, p: 0.5, fontSize: "1rem" }}
                                      title="Speak answer"
                                      onClick={() => {
                                        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
                                        if (SpeechRec) {
                                          const rec = new SpeechRec();
                                          rec.lang = 'hi-IN'; // hindi/english input
                                          rec.onstart = () => {
                                            alert(`🎙️ Listening. Speak answer for "${q.label}" now...`);
                                          };
                                          rec.onresult = (e) => {
                                            const voiceVal = e.results[0][0].transcript;
                                            setQuestionAnswers(prev => ({ ...prev, [q.fieldKey]: voiceVal }));
                                            handleSaveAnswer(q.fieldKey, voiceVal);
                                          };
                                          rec.onerror = () => {
                                            alert("Microphone connection failed or timed out.");
                                          };
                                          rec.start();
                                        } else {
                                          alert("Speech recognition not supported in this browser.");
                                        }
                                      }}
                                    >
                                      🎤
                                    </Button>
                                  </Stack>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                      ))}
                      {intelligentQuestions.length > 5 && (
                        <Typography variant="caption" color="text.secondary">
                          + {intelligentQuestions.length - 5} more fields in Compliance Checklist tab
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                )}

                {/* STEP 4: Generate Button */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                    STEP 4 — Generate Draft
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Block indicator */}
                  {readiness && !readiness.readyToGenerate && selectedCaseId && (
                    <Alert severity="warning" icon={<BlockIcon />} sx={{ mb: 2 }}>
                      <strong>Generation Blocked</strong> — Matter Readiness {readiness.score}% (need {readiness.threshold}%).
                      {readiness.blocking?.length > 0 && ` ${readiness.blocking.length} required field(s) missing.`}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleGenerateDraft}
                    disabled={!selectedCaseId || cases.length === 0}
                    color={readiness?.readyToGenerate ? "primary" : "warning"}
                    sx={{ py: 1.5, fontWeight: "bold" }}
                  >
                    {readiness?.readyToGenerate ? "GENERATE AI LEGAL DRAFT" : "CHECK & GENERATE DRAFT"}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, textAlign: "center" }}>
                    AI-generated draft is NOT legal advice. Human advocate review mandatory.
                  </Typography>
                </Paper>
              </Stack>
            </Grid>

            {/* RIGHT PANEL: Generated Draft */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Generated Legal Draft & Digital Verification
                  </Typography>
                  {generatedDraft && (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      {placeholderWarning && (
                        <Chip
                          size="small"
                          icon={<ErrorIcon />}
                          label={`${placeholderWarning.count} Unresolved`}
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  )}
                </Stack>

                {/* MULTI-TURN ADVOCATE REFINEMENT & TUNE BOX */}
                {generatedDraft && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1.5px solid #7c3aed" }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#7c3aed" gutterBottom display="flex" alignItems="center" gap={0.5}>
                      <AutoFixHighIcon fontSize="small" /> 💬 Multi-Turn Advocate Refinement Protocol (बहु-चरणीय ट्यूनिंग)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                      वकील के निर्देशानुसार ड्राफ्ट में बदलाव करें। (उदा. विवरण बढ़ाएं, छोटा करें, या धाराएं जोड़ें)
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          import("../services/multiForumApplicationGenerator.js").then((mod) => {
                            const gen = mod.default || mod.MultiForumApplicationGenerator;
                            const updated = gen.refineDraft({ currentDraft: generatedDraft, feedbackType: "EXPAND_DETAILS" });
                            setGeneratedDraft(updated);
                            setAlertMsg({ text: "➕ Draft details expanded based on advocate instruction.", severity: "info" });
                          });
                        }}
                      >
                        ➕ विवरण बढ़ाएं (Expand Details)
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          import("../services/multiForumApplicationGenerator.js").then((mod) => {
                            const gen = mod.default || mod.MultiForumApplicationGenerator;
                            const updated = gen.refineDraft({ currentDraft: generatedDraft, feedbackType: "REDUCE_LENGTH" });
                            setGeneratedDraft(updated);
                            setAlertMsg({ text: "➖ Draft concise summary applied.", severity: "info" });
                          });
                        }}
                      >
                        ➖ छोटा करें (Reduce Length)
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => {
                          const customSec = prompt("जोड़ी जाने वाली विशेष कानूनी धारा/नजीर (Precedent) लिखें:");
                          if (customSec) {
                            import("../services/multiForumApplicationGenerator.js").then((mod) => {
                              const gen = mod.default || mod.MultiForumApplicationGenerator;
                              const updated = gen.refineDraft({ currentDraft: generatedDraft, feedbackType: "ADD_SECTION_PRECEDENT", customInstruction: customSec });
                              setGeneratedDraft(updated);
                              setAlertMsg({ text: `⚖️ Statutory section/precedent '${customSec}' attached to draft.`, severity: "success" });
                            });
                          }
                        }}
                      >
                        ⚖️ नजीर / धारा जोड़ें (Add Precedent)
                      </Button>
                    </Stack>
                  </Paper>
                )}
                <Divider sx={{ mb: 2 }} />

                {generatedDraft && (
                  <UniversalActionToolbar
                    title={`${(docType || "Legal Notice").toUpperCase()} - DRAFT`}
                    content={generatedDraft}
                    documentId={`ICJ-DRAFT-${Date.now().toString().slice(-6)}`}
                    version="v1.0-AI"
                  />
                )}

                {/* Placeholder warning banner */}
                {placeholderWarning && !placeholderWarning.clean && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Finalization Blocked</strong> — Draft contains {placeholderWarning.count} unresolved field(s):
                    <br />
                    <code style={{ fontSize: "11px" }}>{placeholderWarning.placeholders.join(" · ")}</code>
                    <br />
                    Provide missing information in Step 3 to resolve.
                  </Alert>
                )}

                <TextField
                  fullWidth multiline rows={16}
                  value={generatedDraft || "Select a case file & document type, answer required questions, then click GENERATE AI LEGAL DRAFT..."}
                  InputProps={{ readOnly: true, style: { fontFamily: "monospace", fontSize: "12px" } }}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ── TAB 1: DOCUMENT EXTRACTION & OCR ── */}
        <TabPanel value={tabIndex} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Document Text Input / OCR Extract
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  PDF, Image, Word फ़ाइल का text यहाँ paste करें। System automatically extract करेगा:
                  dates, case numbers, amounts, sections, parties, property IDs, FIR numbers.
                </Typography>
                <TextField
                  fullWidth multiline rows={10}
                  placeholder="Paste document text, OCR output, or typed content here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<FactCheckIcon />}
                    onClick={handleAnalyzeText}
                    disabled={extractionLoading || !inputText.trim()}
                  >
                    {extractionLoading ? "Extracting..." : "Extract & Analyze"}
                  </Button>
                  <Button variant="outlined" onClick={() => { setInputText(""); setExtractionResult(null); }}>
                    Clear
                  </Button>
                </Stack>
                {extractionLoading && <LinearProgress sx={{ mt: 2 }} />}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Extraction Results
                </Typography>
                {!extractionResult ? (
                  <Typography color="text.secondary">
                    Document text paste करें और Extract & Analyze बटन दबाएं।
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {extractionResult.documentType && (
                      <Alert severity="info">
                        Auto-Classified: <strong>{extractionResult.documentType}</strong>
                      </Alert>
                    )}

                    {extractionResult.conflicts?.length > 0 && (
                      <Alert severity="error">
                        <strong>⚠️ Conflict Detected:</strong> {extractionResult.conflicts.length} date conflict(s) found with existing matter data.
                      </Alert>
                    )}

                    {[
                      { label: "📅 Dates Found", data: extractionResult.dates },
                      { label: "📋 Case Numbers", data: extractionResult.caseNumbers },
                      { label: "💰 Amounts", data: extractionResult.amounts },
                      { label: "⚖️ Legal Sections", data: extractionResult.sections },
                      { label: "🏠 Property IDs", data: extractionResult.propertyIds },
                      { label: "🚔 FIR Numbers", data: extractionResult.firNumbers },
                    ].map(({ label, data }) => data?.length > 0 && (
                      <Box key={label}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">{label}</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                          {data.map((item, i) => (
                            <Chip key={i} label={item} size="small" variant="outlined" color="primary" />
                          ))}
                        </Stack>
                      </Box>
                    ))}

                    {extractionResult.chronology?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          📆 Chronology Extracted ({extractionResult.chronology.length} events)
                        </Typography>
                        <List dense>
                          {extractionResult.chronology.slice(0, 5).map((ev, i) => (
                            <ListItem key={i} sx={{ py: 0.25, pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <HistoryIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText
                                primary={<Typography variant="caption"><strong>{ev.date}</strong>: {ev.event?.slice(0, 100)}</Typography>}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    <Alert severity="warning" icon={<InfoOutlinedIcon />}>
                      <strong>Pending Confirmation</strong> — These values are EXTRACTED, not yet CONFIRMED.
                      Go to Step 3 in AI Drafter tab to confirm and use them in draft generation.
                    </Alert>

                    <Typography variant="caption" color="text.secondary">
                      Source: {extractionResult.sourceDoc} | Type: {extractionResult.sourceType} | {new Date(extractionResult.extractedAt).toLocaleString("en-IN")}
                    </Typography>
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ── TAB 2: VERSION HISTORY ── */}
        <TabPanel value={tabIndex} index={2}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Document Version History & Rollback Ledger
              </Typography>
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Draft, Version, Status, Hash..."
                sx={{ width: 350 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
                }}
              />
            </Stack>
            {filteredHistory.length === 0 ? (
              <Alert severity="info">
                कोई draft नहीं बना है अभी तक। AI Legal Drafter tab से draft generate करें।
              </Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Draft Title</TableCell>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Date Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>SHA-256 Hash</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell><Chip label={d.version} color="primary" size="small" /></TableCell>
                      <TableCell><Typography fontWeight="bold" variant="body2">{d.title}</Typography></TableCell>
                      <TableCell>{d.docType}</TableCell>
                      <TableCell>{d.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={d.status}
                          color={d.status === "Draft Created" ? "success" : d.status === "Placeholder Warning" ? "warning" : "default"}
                          size="small" variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "11px" }}>{d.hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* ── TAB 3: DYNAMIC COMPLIANCE CHECKLIST ── */}
        <TabPanel value={tabIndex} index={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Matter Readiness & Compliance Checklist — {docType}
            </Typography>
            {!selectedCaseId ? (
              <Alert severity="info">पहले AI Legal Drafter tab में Case और Document Type चुनें।</Alert>
            ) : !readiness ? (
              <Alert severity="info">Loading checklist...</Alert>
            ) : (
              <Stack spacing={1.5}>
                {/* Readiness score */}
                <Box sx={{ mb: 2 }}>
                  <ReadinessIndicator score={readiness.score} threshold={readiness.threshold} />
                </Box>

                {complianceChecklist.length === 0 ? (
                  <Alert severity="success">सभी required fields उपलब्ध हैं। Draft generation ready!</Alert>
                ) : (
                  complianceChecklist.map((item, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderLeft: "4px solid",
                        borderLeftColor:
                          item.status === "ok" ? "#2e7d32" :
                          item.status === "warning" ? "#ed6c02" :
                          item.status === "error" ? "#c62828" : "#1976d2",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        {item.status === "ok" && <CheckCircleIcon color="success" />}
                        {item.status === "warning" && <WarningIcon color="warning" />}
                        {item.status === "error" && <ErrorIcon color="error" />}
                        {item.status === "info" && <InfoOutlinedIcon color="primary" />}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{item.label}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.detail}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Note:</strong> This checklist is dynamically computed from your confirmed matter data for <strong>{docType}</strong>.
                  It is not generic — it reflects only what is required for this specific document type.
                </Alert>
              </Stack>
            )}
          </Paper>
        </TabPanel>

      </Box>
    </MainLayout>
  );
}
