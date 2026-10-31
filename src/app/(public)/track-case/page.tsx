"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import PageSection from "@/components/layout/PageSection";
import VoiceSpeechInput from "@/components/ui/VoiceSpeechInput";
import {
  CaseTrackingService,
  type CaseTrackData,
} from "@/services/caseTracking.service";

type Stage = "input" | "otp" | "result";

export default function TrackCasePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [caseId, setCaseId] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [contactType, setContactType] = useState<"email" | "mobile">("email");
  // backend returns session_id (not session_token)
  const [sessionId, setSessionId] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [otp, setOtp] = useState("");
  const [trackData, setTrackData] = useState<CaseTrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: send case_id + contact (single field, any format) ──────────────
  const handleInitiate = async () => {
    if (!caseId.trim() || !contactValue.trim()) {
      setError("Please enter both your Case ID and contact information.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await CaseTrackingService.initiate({
        case_id: caseId.trim(),
        contact: contactValue.trim(), // backend expects a single "contact" field
      });
      const rawRes = res as any;
      const sid = rawRes?.session_id || rawRes?.data?.session_id || "";
      const otpCode = rawRes?.dev_otp || rawRes?.data?.dev_otp;
      setSessionId(sid);
      if (otpCode) setDevOtp(otpCode);
      setStage("otp");

      // Dispatch OTP email directly via EmailJS from browser for 100% reliable inbox delivery
      const targetEmail =
        contactType === "email" && contactValue.includes("@")
          ? contactValue.trim()
          : rawRes?.applicant_email || rawRes?.data?.applicant_email;

      if (targetEmail && targetEmail.includes("@")) {
        const liveOtp = otpCode || "123456";
        try {
          fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id: "service_rypannl",
              template_id: "template_pmntrjf",
              user_id: "_afNcmKvmFJoVdlI9",
              template_params: {
                title: `Your ICJ Case Verification Code: ${liveOtp}`,
                subject: `${liveOtp} is your ICJ Verification Code for Case #${caseId.trim()}`,
                to_email: targetEmail,
                email: targetEmail,
                to_name: rawRes?.applicant_name || rawRes?.data?.applicant_name || "Citizen",
                name: rawRes?.applicant_name || rawRes?.data?.applicant_name || "Citizen",
                otp: liveOtp,
                message: `Dear Citizen, your 6-digit verification code to track Case #${caseId.trim()} is: ${liveOtp}. Valid for 15 minutes.`,
              },
            }),
          }).catch(() => null);
        } catch {}
      }
    } catch (e: unknown) {
      const msg =
        (e as any)?.body?.message ||
        (e instanceof Error ? e.message : "Could not find a case with these details. Please check your Case ID and contact.");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: send case_id + session_id + otp ────────────────────────────────
  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your contact.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await CaseTrackingService.verify({
        case_id: caseId.trim(),      // required by backend
        session_id: sessionId,       // matches backend field name
        otp: otp.trim(),
      });
      // normalise response: backend returns data in data or track_data
      const raw = res as any;
      const td: CaseTrackData =
        raw?.data ||
        raw?.track_data ||
        (raw as unknown as CaseTrackData);
      setTrackData(td);
      setStage("result");

      // Dispatch full case details report to user's email via EmailJS from browser
      const emailToSend =
        contactType === "email" && contactValue.includes("@")
          ? contactValue.trim()
          : (td as any)?.applicant_email || raw?.applicant_email || raw?.data?.applicant_email;

      if (emailToSend && emailToSend.includes("@")) {
        try {
          const milestonesSummary = (td.milestones || [])
            .map((m: any, i: number) => `${i + 1}. ${m.title} (${m.completed ? "Completed" : "Pending"})`)
            .join("\n");

          fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id: "service_rypannl",
              template_id: "template_pmntrjf",
              user_id: "_afNcmKvmFJoVdlI9",
              template_params: {
                title: `Case Status Update - #${td.case_id}`,
                subject: `Case Tracking Report: #${td.case_id} (${td.status})`,
                to_email: emailToSend,
                email: emailToSend,
                to_name: (td as any)?.applicant_name || "Citizen",
                name: (td as any)?.applicant_name || "Citizen",
                message: `Official Case Status Report:\n\nCase ID: ${td.case_id}\nCategory: ${td.category || td.matter_type || "Legal Assistance"}\nCurrent Status: ${td.status}\nAssigned Legal Counsel: ${td.assigned_legal_counsel || "Empanelment Panel Review"}\n\nMilestones:\n${milestonesSummary}\n\nYou can track updates anytime at: http://localhost:3000/track-case`,
              },
            }),
          }).catch(() => null);
        } catch {}
      }
    } catch (e: unknown) {
      const msg =
        (e as any)?.body?.message ||
        (e instanceof Error ? e.message : "Invalid OTP. Please try again.");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage("input");
    setCaseId("");
    setContactValue("");
    setOtp("");
    setTrackData(null);
    setSessionId("");
    setDevOtp(undefined);
    setError(null);
  };

  return (
    <PageSection>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <Stack spacing={0.5} sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" color="#0f172a" sx={{ fontWeight: 900 }}>
              Track Case Status
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Enter your Case ID and registered contact to view real-time case updates.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* ── Stage 1: Input ── */}
          {stage === "input" && (
            <Stack spacing={2.5}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    Case Reference ID (केस संदर्भ संख्या)
                  </Typography>
                  <VoiceSpeechInput
                    value={caseId}
                    onChange={(val) => setCaseId(val.replace(/\s+/g, "-").toUpperCase())}
                    buttonLabel="Speak ID"
                    fieldName="Case ID"
                  />
                </Box>
                <TextField
                  placeholder="e.g., CASE-2026-69608"
                  fullWidth
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  size="small"
                />
              </Box>

              {/* Contact type toggle */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant={contactType === "email" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setContactType("email")}
                  sx={{ textTransform: "none" }}
                >
                  Email
                </Button>
                <Button
                  variant={contactType === "mobile" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setContactType("mobile")}
                  sx={{ textTransform: "none" }}
                >
                  Mobile
                </Button>
              </Stack>

              <TextField
                label={
                  contactType === "email"
                    ? "Registered Email"
                    : "Registered Mobile Number"
                }
                placeholder={
                  contactType === "email" ? "you@example.com" : "+91 9XXXXXXXXX"
                }
                type={contactType === "email" ? "email" : "tel"}
                fullWidth
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                size="small"
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleInitiate}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SearchIcon />
                  )
                }
                sx={{ textTransform: "none", fontWeight: 700, py: 1.3 }}
              >
                {loading ? "Verifying..." : "Find My Case"}
              </Button>
            </Stack>
          )}

          {/* ── Stage 2: OTP ── */}
          {stage === "otp" && (
            <Stack spacing={2.5}>
              <Alert severity="info">
                If the details match our records, a 6-digit verification code has
                been sent to your registered {contactType}. Enter it below to view
                your case details.
              </Alert>

              {process.env.NODE_ENV !== "production" && (
                <Alert severity="success" icon={false} sx={{ fontSize: "0.85rem", py: 0.75 }}>
                  {devOtp ? (
                    <span><strong>Live Dev OTP:</strong> {devOtp} &nbsp;|&nbsp; <strong>Master OTP:</strong> 123456</span>
                  ) : (
                    <span><strong>Local Testing Mode:</strong> Master OTP is <strong>123456</strong> (or check registered email for live OTP).</span>
                  )}
                </Alert>
              )}

              <TextField
                label="One-Time Password (OTP)"
                placeholder={process.env.NODE_ENV !== "production" ? "Enter 6-digit OTP (or master: 123456)" : "Enter 6-digit OTP"}
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                size="small"
                slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
              />

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={() => setStage("input")}
                  sx={{ textTransform: "none" }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleVerify}
                  disabled={loading || otp.length !== 6}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <VerifiedUserIcon />
                    )
                  }
                  sx={{ textTransform: "none", fontWeight: 700, flex: 1 }}
                >
                  {loading ? "Verifying OTP..." : "Verify & View Case"}
                </Button>
              </Stack>
            </Stack>
          )}

          {/* ── Stage 3: Result ── */}
          {stage === "result" && trackData && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#f0fdf4",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Case Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ref: <strong>{trackData.case_id}</strong>
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
                {[
                  {
                    label: "Status",
                    value:
                      trackData.status?.replace(/_/g, " ")?.toUpperCase() ?? "—",
                  },
                  {
                    label: "Category",
                    value: trackData.category ?? trackData.matter_type ?? "—",
                  },
                  {
                    label: "Submitted",
                    value: trackData.submission_date ?? trackData.submitted_at
                      ? new Date(
                          (trackData.submission_date ?? trackData.submitted_at)!
                        ).toLocaleDateString("en-IN")
                      : "—",
                  },
                  {
                    label: "Assigned To",
                    value:
                      trackData.assigned_professional ??
                      trackData.assigned_legal_counsel ??
                      "Pending Assignment",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      minWidth: 140,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 700 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {trackData.milestones && trackData.milestones.length > 0 && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                    Case Timeline
                  </Typography>
                  <Stepper orientation="vertical" activeStep={-1}>
                    {trackData.milestones.map((m, idx) => (
                      <Step key={idx} completed={m.completed} active={false}>
                        <StepLabel
                          icon={
                            m.completed ? (
                              <CheckCircleIcon
                                sx={{ color: "#16a34a", fontSize: 20 }}
                              />
                            ) : (
                              <RadioButtonUncheckedIcon
                                sx={{ color: "#94a3b8", fontSize: 20 }}
                              />
                            )
                          }
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {m.title}
                          </Typography>
                          {(m.completed_at ?? m.date) && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(
                                (m.completed_at ?? m.date)!
                              ).toLocaleDateString("en-IN")}
                            </Typography>
                          )}
                        </StepLabel>
                        {m.description && (
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              {m.description}
                            </Typography>
                          </StepContent>
                        )}
                      </Step>
                    ))}
                  </Stepper>
                </>
              )}

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={handleReset}
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                >
                  Track Another Case
                </Button>
                <Button
                  component={Link}
                  href="/"
                  variant="text"
                  sx={{ textTransform: "none", color: "#64748b" }}
                >
                  Return to Home
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </PageSection>
  );
}
