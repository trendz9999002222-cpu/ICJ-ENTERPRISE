import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import ZeroScrollPageShell from "../components/common/ZeroScrollPageShell.jsx";
import FullCanvasVoiceStudio from "../components/common/FullCanvasVoiceStudio.jsx";
import useAuth from "../hooks/useAuth.js";

const ADVOCATE_VIEWS = [
  { id: 0, title: "📋 आज की कॉज़-लिस्ट व प्राथमिकता केस", subtitle: "Court Cause-List, Daily Hearings & Urgent Actions" },
  { id: 1, title: "📂 सक्रिय केस फाइलें व मुवक्किल", subtitle: "Active Case Registry & Client Information" },
  { id: 2, title: "✍️ विधिक ड्राफ्टिंग व वॉइस अनुसंधान", subtitle: "Continuous Legal Drafting & Research Canvas" },
  { id: 3, title: "⚖️ वकालतनामा, ई-फाइलिंग व फीस स्टेटस", subtitle: "Vakalatnama Compliance, E-Filing & Escrow" },
];

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(0);
  const [draftContent, setDraftContent] = useState("");

  const advocateName = user?.fullName || user?.name || "Senior Advocate PAWAN GUPTA";
  const advocateId = user?.memberId || user?.id || "26ICJ08AA0002";

  const todayHearings = [
    { time: "10:30 AM", court: "Court No. 4, District & Sessions Court, Delhi", caseId: "CASE-2026-0001", client: "Ramvir Jatav", matter: "Bail Application / Arguments" },
    { time: "02:15 PM", court: "Court No. 12, High Court of Delhi", caseId: "CASE-2026-0042", client: "Suresh Sharma", matter: "Civil Revision Petition (Stay)" },
  ];

  const currentViewInfo = ADVOCATE_VIEWS[currentView];

  return (
    <ZeroScrollPageShell
      title={currentViewInfo.title}
      subtitle={currentViewInfo.subtitle}
      headerRightContent={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<GavelIcon sx={{ color: "#38bdf8 !important", fontSize: 16 }} />}
            label={`${advocateName} (${advocateId})`}
            sx={{ bgcolor: "#1e293b", color: "#f8fafc", fontWeight: 800, borderColor: "#334155" }}
            variant="outlined"
          />
          <Chip
            icon={<VerifiedIcon sx={{ color: "#10b981 !important", fontSize: 16 }} />}
            label="पैनल स्थिति: अधिकृत सीनियर काउंसल"
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
      {/* VIEW 0: TODAY'S CAUSE-LIST (2 STRICTLY EQUAL SYMMETRICAL BOXES)           */}
      {/* ========================================================================= */}
      {currentView === 0 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          {/* BOX 1: CAUSE LIST */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5}>
                  🏛️ आज की न्यायिक हियरिंग कॉज़-लिस्ट
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  सुप्रीम कोर्ट, दिल्ली हाई कोर्ट व ज़िला अदालत हियरिंग ट्रैकर
                </Typography>

                <Stack spacing={1.5}>
                  {todayHearings.map((h, i) => (
                    <Box key={i} sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2.5, border: "1px solid #bfdbfe" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Chip label={h.time} size="small" sx={{ bgcolor: "#1e40af", color: "#ffffff", fontWeight: 800 }} />
                        <Typography variant="caption" fontWeight={700} color="#1e40af">{h.caseId}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={800} color="#0f172a">{h.matter}</Typography>
                      <Typography variant="caption" color="#475569" display="block">{h.court}</Typography>
                      <Typography variant="caption" fontWeight={700} color="#2563eb">मुवक्किल: {h.client}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCurrentView(1)}
                sx={{ mt: 2, fontWeight: 800, borderRadius: 2, textTransform: "none" }}
              >
                📂 सभी सक्रिय केस फाइलें देखें →
              </Button>
            </Card>
          </Grid>

          {/* BOX 2: URGENT ACTIONS (STRICTLY EQUAL HEIGHT & SHAPE) */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#f8fafc" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5}>
                  ⚡ तत्काल विधिक ड्राफ्टिंग व एक्शन
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  आज तैयार किए जाने वाले नोटिस, पिटीशन व वकालतनामा
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                    <Typography variant="body2" fontWeight={800} color="#166534">
                      ✓ BNSS धारा 482 / 483 जमानत अर्जी ड्राफ्टिंग
                    </Typography>
                    <Typography variant="caption" color="#15803d">
                      केस: Ramvir Jatav • कोर्ट: जिला अदालत, दिल्ली
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#fff7ed", borderRadius: 2, border: "1px solid #fed7aa" }}>
                    <Typography variant="body2" fontWeight={800} color="#9a3412">
                      ⚠️ संपत्ति विवाद विधिक नोटिस (Section 80 CPC)
                    </Typography>
                    <Typography variant="caption" color="#c2410c">
                      केस: Suresh Sharma • अंतिम तिथि: 28-अगस्त-2026
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setCurrentView(2)}
                sx={{ mt: 2, bgcolor: "#1e40af", "&:hover": { bgcolor: "#1e3a8a" }, fontWeight: 800, borderRadius: 2, textTransform: "none" }}
              >
                ✍️ फुल-कैनवस विधिक ड्राफ्टर खोलें →
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: ACTIVE CASE FILES (100vh SYMMETRICAL TABLE)                        */}
      {/* ========================================================================= */}
      {currentView === 1 && (
        <Card variant="outlined" sx={{ height: "100%", borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5}>
              📂 सक्रिय केस फाइलें एवं मुवक्किल सूची
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              सभी न्यायालयी फोरम के लंबित एवं सक्रिय प्रकरण
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>केस ID / CNR</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>मुवक्किल (Client)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>विषय / श्रेणी</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>न्यायालय (Court)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>स्थिति</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: "#1e40af" }}>CASE-2026-0001</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ramvir Jatav</TableCell>
                  <TableCell>जमानत अर्जी (Bail)</TableCell>
                  <TableCell>District & Sessions Court, Delhi</TableCell>
                  <TableCell><Chip label="सक्रिय हियरिंग" color="success" size="small" sx={{ fontWeight: 700 }} /></TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: "#1e40af" }}>CASE-2026-0042</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Suresh Sharma</TableCell>
                  <TableCell>सिविल स्टे व टाइटल डीड</TableCell>
                  <TableCell>High Court of Delhi</TableCell>
                  <TableCell><Chip label="ड्राफ्टिंग स्टेज" color="primary" size="small" sx={{ fontWeight: 700 }} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FULL CANVAS LEGAL DRAFTER STUDIO (90% CLEAN WORKSPACE)             */}
      {/* ========================================================================= */}
      {currentView === 2 && (
        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <FullCanvasVoiceStudio
            title="✍️ अधिवक्ता विधिक ड्राफ्टिंग स्टूडियो (Advocate Legal Drafting Studio)"
            subtitle="असीमित कंटीन्यूअस वॉइस टाइपिंग • सुप्रीम कोर्ट / हाई कोर्ट विधिक फॉर्मेट्स"
            initialText={draftContent}
            onTextChange={setDraftContent}
          />
        </Box>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: VAKALATNAMA, E-FILING & ESCROW FEES                                */}
      {/* ========================================================================= */}
      {currentView === 3 && (
        <Grid container spacing={3} sx={{ height: "100%", alignItems: "stretch" }}>
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={1}>
                  📜 वकालतनामा एवं ई-फाइलिंग अनुपालन
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  डिजिटल हस्ताक्षर व eCourts पोर्टल सिंक स्थिति
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                    <Typography variant="body2" fontWeight={800} color="#166534">
                      ✓ ई-वकालतनामा डिजिटल हस्ताक्षरित
                    </Typography>
                    <Typography variant="caption" color="#15803d">
                      बार काउंसिल सत्यापन पूर्ण • 256-बिट सुरक्षित
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Chip icon={<CheckCircleIcon />} label="eCourts 4-Character CNR कम्प्लायंट" color="success" sx={{ fontWeight: 700 }} />
            </Card>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#eff6ff", borderColor: "#bfdbfe" }}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#1e40af" mb={1}>
                  💳 एस्क्रो फीस एवं संवितरण स्थिति
                </Typography>
                <Typography variant="caption" color="#1e3a8a" display="block" mb={2}>
                  ट्रस्ट एस्क्रो गेटवे द्वारा सुरक्षित अधिवक्ता फीस
                </Typography>

                <Typography variant="h4" fontWeight={900} color="#1e40af" my={2}>
                  ₹0.00
                </Typography>
                <Typography variant="caption" color="#1e3a8a">
                  ✓ कोई लंबित देयता नहीं (All Escrow Disbursed Cleanly)
                </Typography>
              </Box>

              <Button variant="contained" fullWidth sx={{ bgcolor: "#1e40af", fontWeight: 800, borderRadius: 2 }}>
                फीस व बैंक खाता विवरण प्रबंधित करें →
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </ZeroScrollPageShell>
  );
}
