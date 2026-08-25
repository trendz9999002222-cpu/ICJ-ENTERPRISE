import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Grid,
  Divider,
  LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DownloadIcon from "@mui/icons-material/Download";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import VerifiedIcon from "@mui/icons-material/Verified";

export const MILESTONES = [
  {
    stage: 1,
    title: "1. केस इनटेक व वकील आवंटन",
    subtitle: "Case Intake & Senior Counsel Assigned",
    status: "COMPLETED",
    date: "2026-08-20",
    color: "#059669",
  },
  {
    stage: 2,
    title: "2. साक्ष्य जांच व याचिका ड्राफ्टिंग",
    subtitle: "Evidence Scrutiny & Petition Drafter",
    status: "COMPLETED",
    date: "2026-08-22",
    color: "#059669",
  },
  {
    stage: 3,
    title: "3. ई-फाइलिंग व CNR नंबर आवंटन",
    subtitle: "e-Filing Done • CNR: DLHC010089222026",
    status: "ACTIVE",
    date: "2026-08-24 (Active)",
    color: "#2563eb",
  },
  {
    stage: 4,
    title: "4. न्यायालय में प्रथम सुनवाई / बहस",
    subtitle: "Court Hearing Bench • Court No. 14",
    status: "UPCOMING",
    date: "28 Aug 2026",
    color: "#d97706",
  },
  {
    stage: 5,
    title: "5. अंतिम निर्णय / अंतरिम राहत",
    subtitle: "Final Order / Interim Injunction Relief",
    status: "UPCOMING",
    date: "Pending Hearing",
    color: "#64748b",
  },
];

export default function LiveCaseMilestoneTracker({
  caseId = "CASE-20260824-0001",
  cnrNumber = "DLHC010089222026",
  courtName = "Hon'ble High Court of Delhi (Court Room 14)",
  advocateName = "Adv. Vikramaditya Singh (Supreme Court & High Court Lead)",
  nextHearingDate = "28 Aug 2026 (10:30 AM)",
  currentStageIndex = 2, // 0-based: Stage 3 is active
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCaseReport = () => {
    setDownloading(true);
    setTimeout(() => {
      const content = `INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
OFFICIAL CERTIFIED COURT CASE SUMMARY REPORT
======================================================
CASE FILE ID     : ${caseId}
CNR NUMBER       : ${cnrNumber}
JURISDICTION     : ${courtName}
ASSIGNED COUNSEL : ${advocateName}
NEXT HEARING     : ${nextHearingDate}
LIVE STATUS      : STAGE 3 (e-Filing Verified & CNR Issued)
CURRENT PROGRESS : 65% (Active on Judicial Cause List)
======================================================
MILESTONE AUDIT TRAIL:
[✓] Stage 1: Case Intake & Counsel Assigned (Completed)
[✓] Stage 2: Evidence Scrutiny & Petition Drafted (Completed)
[●] Stage 3: e-Filing Verified & CNR Allocated (Active)
[ ] Stage 4: Court Hearing & Arguments (Scheduled: 28 Aug 2026)
[ ] Stage 5: Final Judgment / Relief Order (Pending)
======================================================
Report Generated on: ${new Date().toLocaleString()}
Official Digital Stamp: ICJ-VERIFIED-CASE-FILE`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ICJ_CERTIFIED_CASE_${caseId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloading(false);
    }, 500);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: "20px",
        bgcolor: "#ffffff",
        border: "2px solid #3b82f6",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.12)",
        mb: 4,
      }}
    >
      {/* 1. TOP HEADER STRIP WITH CNR & NEXT HEARING TIMER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Chip
              label="🔴 LIVE COURT TRACKER"
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#dc2626",
                fontWeight: 900,
                fontSize: "0.72rem",
                border: "1px solid #f87171",
              }}
            />
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              केस ट्रैकिंग आईडी: {caseId}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, mt: 0.5, display: "block" }}>
            CNR: <strong style={{ color: "#1e3a8a" }}>{cnrNumber}</strong> • {courtName}
          </Typography>
        </Box>

        {/* NEXT HEARING BADGE */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: "14px",
            bgcolor: "#eff6ff",
            border: "1.5px solid #60a5fa",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <EventAvailableIcon sx={{ color: "#2563eb", fontSize: 30 }} />
          <Box>
            <Typography variant="caption" fontWeight={800} color="#1e40af" display="block">
              अगली पेशी / सुनवाई (Next Hearing Date)
            </Typography>
            <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
              {nextHearingDate}
            </Typography>
          </Box>
        </Paper>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* 2. 5-STAGE VISUAL MILESTONE PROGRESS (UBER/AMAZON STYLE) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
          🚀 केस प्रगति के 5 चरण (Live 5-Milestone Journey):
        </Typography>

        <Grid container spacing={2}>
          {MILESTONES.map((m, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <Grid item xs={12} sm={6} md={2.4} key={m.stage}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: "100%",
                    borderRadius: "14px",
                    bgcolor: isActive ? "#eff6ff" : isCompleted ? "#f0fdf4" : "#f8fafc",
                    border: "2px solid",
                    borderColor: isActive ? "#2563eb" : isCompleted ? "#10b981" : "#e2e8f0",
                    position: "relative",
                    transition: "all 0.25s ease",
                    boxShadow: isActive ? "0 6px 20px rgba(37, 99, 235, 0.18)" : "none",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    {isCompleted && <CheckCircleIcon sx={{ color: "#059669", fontSize: 22 }} />}
                    {isActive && <RadioButtonCheckedIcon sx={{ color: "#2563eb", fontSize: 22 }} />}
                    {isUpcoming && <RadioButtonUncheckedIcon sx={{ color: "#94a3b8", fontSize: 22 }} />}

                    <Typography
                      variant="caption"
                      fontWeight={900}
                      sx={{
                        color: isActive ? "#1e40af" : isCompleted ? "#065f46" : "#64748b",
                        fontSize: "0.75rem",
                      }}
                    >
                      {isActive ? "प्रगति पर (ACTIVE)" : isCompleted ? "पूर्ण (DONE)" : "आगामी (UPCOMING)"}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block" }}>
                    {m.subtitle}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#3b82f6" sx={{ mt: 1, display: "block" }}>
                    {m.date}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* 3. 1-CLICK INSTANT ACTION BUTTONS */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadCaseReport}
          disabled={downloading}
          sx={{
            borderRadius: "24px",
            fontWeight: 800,
            textTransform: "none",
            borderColor: "#2563eb",
            color: "#2563eb",
            "&:hover": { bgcolor: "#eff6ff", borderColor: "#1d4ed8" },
          }}
        >
          {downloading ? "डाउनलोड हो रहा है..." : "📄 1-क्लिक केस समरी रिपोर्ट (PDF/Txt)"}
        </Button>

        <Button
          variant="contained"
          startIcon={<PhoneInTalkIcon />}
          sx={{
            borderRadius: "24px",
            fontWeight: 800,
            textTransform: "none",
            bgcolor: "#059669",
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          📞 वकील से सीधा संपर्क / परामर्श
        </Button>
      </Stack>
    </Paper>
  );
}
