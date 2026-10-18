"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import TollIcon from "@mui/icons-material/Toll";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { DetailedLead, ProfessionalWalletData } from "@/types/lead";

const CASE_STAGES = [
  "New Matter",
  "Contacted Client",
  "Consultation Scheduled",
  "Documents Gathered",
  "Legal Drafting",
  "Filed in Court",
  "Hearing Scheduled",
  "Settlement / Negotiation",
  "Matter Resolved",
  "Closed",
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<DetailedLead | null>(null);
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Case Progress Editing
  const [selectedStage, setSelectedStage] = useState("");
  const [newProgressNote, setNewProgressNote] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  // Accept Lead Modal
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const loadData = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const [leadData, walletData] = await Promise.all([
        leadMarketplaceService.getLeadDetail(leadId),
        leadMarketplaceService.getWallet().catch(() => null),
      ]);
      setLead(leadData);
      setSelectedStage(leadData.case_stage || "New Matter");
      setWallet(walletData);
    } catch (err: any) {
      setError(err?.message || "Failed to load lead details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [leadId]);

  const handleSaveProgress = async () => {
    if (!lead) return;
    setSavingProgress(true);
    setProgressMsg("");

    try {
      let combinedNotes = lead.case_notes || "";
      if (newProgressNote.trim()) {
        const timestamp = new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const noteEntry = `[${timestamp}] ${newProgressNote.trim()}`;
        combinedNotes = combinedNotes ? `${combinedNotes}\n\n${noteEntry}` : noteEntry;
      }

      const updated = await leadMarketplaceService.updateCaseProgress(lead.id, {
        case_stage: selectedStage,
        case_notes: combinedNotes,
      });

      setLead((prev) => (prev ? { ...prev, ...updated } : null));
      setNewProgressNote("");
      setProgressMsg("Case progress updated successfully!");
      setTimeout(() => setProgressMsg(""), 3000);
    } catch (err: any) {
      setProgressMsg(err?.message || "Failed to update case progress.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!lead) return;
    const requiredTokens = lead.tokens_required ?? 1;
    const currentTokens = wallet?.token_balance ?? 0;

    if (currentTokens < requiredTokens) {
      setAcceptError(`Insufficient tokens. You have ${currentTokens} token(s), but this matter requires ${requiredTokens} token(s). Please purchase a token pack first.`);
      return;
    }

    setAccepting(true);
    setAcceptError("");
    try {
      await leadMarketplaceService.acceptLead(lead.id, "wallet");
      setAcceptModalOpen(false);
      // Reload lead details now unmasked
      await loadData();
    } catch (err: any) {
      setAcceptError(err?.message || "Failed to accept lead. Please verify token balance.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <PortalPageShell title="Lead Matter Details" subtitle="Loading inquiry...">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      </PortalPageShell>
    );
  }

  if (error || !lead) {
    return (
      <PortalPageShell title="Lead Matter Details" subtitle="Error loading lead">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Lead not found."}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/dashboard/professional/leads">
          Back to Marketplace
        </Button>
      </PortalPageShell>
    );
  }

  const isAccepted = Boolean(lead.client_name);
  const tokensRequired = lead.tokens_required ?? 1;
  const tokenBalance = wallet?.token_balance ?? 0;
  const hasSufficientTokens = tokenBalance >= tokensRequired;

  return (
    <PortalPageShell
      title={`Matter: ${lead.lead_id}`}
      subtitle={`${lead.category} • ${lead.city_name}, ${lead.state_name}`}
    >
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/dashboard/professional/leads"
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Back to Lead Marketplace
        </Button>

        {isAccepted && (
          <Button
            component={Link}
            href="/dashboard/professional/my-leads"
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            ← View All My Accepted Leads
          </Button>
        )}
      </Box>

      {/* Reassignment Notice if this matter was handed over */}
      {lead.reassignment_notes && (
        <Alert
          severity="info"
          icon={<SyncAltIcon fontSize="inherit" />}
          sx={{
            mb: 3,
            bgcolor: "#f0fdf4",
            borderColor: "#86efac",
            border: "1px solid",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#15803d" }}>
            Reassigned Matter - Preserved Case History
          </Typography>
          <Typography variant="body2" sx={{ color: "#166534", fontSize: "0.82rem", mt: 0.3 }}>
            This matter was handed over to you with all prior case milestones, notes, and documents intact.
          </Typography>
          <Box sx={{ mt: 1, p: 1.5, bgcolor: "#fff", borderRadius: 1.5, border: "1px solid #bbf7d0" }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", display: "block" }}>
              HANDOVER TRANSITION NOTES:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "#1e293b", whiteSpace: "pre-wrap" }}>
              {lead.reassignment_notes}
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3, alignItems: "start" }}>
        {/* Left Column: Client Details, Problem Statement, Documents & Progress */}
        <Stack spacing={3}>
          {/* Client Contact Details (Unlocked if accepted, Masked if not) */}
          {isAccepted ? (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                bgcolor: "#f0fdf4",
                borderColor: "#86efac",
                p: 1,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                  <LockOpenIcon sx={{ color: "#16a34a" }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#15803d" }}>
                      Client Contact Information (Unlocked & Verified)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Authorized contact channels for this matter representation.
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <PersonIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">FULL NAME</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{lead.client_name}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <PhoneIcon sx={{ color: "#16a34a", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">PHONE NUMBER</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          <a href={`tel:${lead.client_mobile}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {lead.client_mobile || "Not Provided"}
                          </a>
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <EmailIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          <a href={`mailto:${lead.client_email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                            {lead.client_email || "Not Provided"}
                          </a>
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <ContactPhoneIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">PREFERRED CONTACT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{lead.client_preferred_contact || "Phone"}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                bgcolor: "#f8fafc",
                borderColor: "#e2e8f0",
                p: 2.5,
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>
                    Client Contact Details Protected
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5, lineHeight: 1.6 }}>
                    Client name, mobile number, email, and attached intake documents are shielded under ICJ confidentiality rules.
                    They become immediately accessible the moment you accept this lead with <strong>{tokensRequired} Token{tokensRequired > 1 ? "s" : ""}</strong>.
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Matter Description */}
          <SectionCard title="Legal Matter Description" subtitle="Problem statement submitted by citizen">
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#1e293b", whiteSpace: "pre-line" }}>
              {lead.full_description || lead.anonymized_summary}
            </Typography>
          </SectionCard>

          {/* Client Documents Section */}
          <SectionCard
            title="Matter Documents"
            subtitle={isAccepted ? "Case attachments and evidentiary filings uploaded by client" : "Locked pending matter acceptance"}
            icon={<DescriptionIcon sx={{ color: isAccepted ? "#2563eb" : "#94a3b8", fontSize: 20 }} />}
          >
            {isAccepted ? (
              Array.isArray(lead.client_documents) && lead.client_documents.length > 0 ? (
                <Stack spacing={1.5}>
                  {lead.client_documents.map((doc: any, idx: number) => {
                    const docName = typeof doc === "string" ? doc : doc.name || doc.title || `Document_${idx + 1}`;
                    const docUrl = typeof doc === "string" ? doc : doc.url || doc.file || "#";

                    return (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 1.5 }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <DescriptionIcon sx={{ color: "#2563eb" }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{docName}</Typography>
                        </Stack>
                        {docUrl && docUrl !== "#" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Download / View
                          </Button>
                        ) : (
                          <Chip label="Stored in ICJ Vault" size="small" variant="outlined" />
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No separate document files were uploaded by the client during initial intake.
                </Typography>
              )
            ) : (
              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, textAlign: "center" }}>
                <LockOutlinedIcon sx={{ fontSize: 32, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Document attachments are locked. Accept this matter to unlock and inspect all client files.
                </Typography>
              </Box>
            )}
          </SectionCard>

          {/* If accepted: Case Milestone & Progress Notes Manager */}
          {isAccepted && (
            <SectionCard
              title="Case Progress & Stage Management"
              subtitle="Update the status of this matter and keep an immutable chronological timeline of actions taken."
              icon={<EditNoteIcon sx={{ color: "#2563eb", fontSize: 22 }} />}
            >
              <Stack spacing={2.5}>
                {progressMsg && (
                  <Alert severity={progressMsg.includes("success") ? "success" : "error"}>
                    {progressMsg}
                  </Alert>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Case Stage</InputLabel>
                    <Select
                      value={selectedStage}
                      label="Case Stage"
                      onChange={(e) => setSelectedStage(e.target.value)}
                    >
                      {CASE_STAGES.map((stg) => (
                        <MenuItem key={stg} value={stg}>{stg}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="caption" sx={{ color: "text.secondary", alignSelf: "center" }}>
                    Select the active milestone for this case to keep your dashboard organized.
                  </Typography>
                </Box>

                {lead.case_notes && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748b", display: "block", mb: 0.5 }}>
                      CURRENT CASE NOTES LOG:
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: "#f8fafc",
                        maxHeight: 180,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.84rem",
                        color: "#1e293b",
                      }}
                    >
                      {lead.case_notes}
                    </Paper>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Add Progress Note:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={newProgressNote}
                    onChange={(e) => setNewProgressNote(e.target.value)}
                    placeholder="Enter summary of meeting, court hearing date, draft prepared, etc..."
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSaveProgress}
                  disabled={savingProgress}
                  sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, px: 3 }}
                >
                  {savingProgress ? <CircularProgress size={20} color="inherit" /> : "Save Milestone & Note"}
                </Button>
              </Stack>
            </SectionCard>
          )}
        </Stack>

        {/* Right Column: Lead Summary & Actions */}
        <SectionCard title="Matter Overview" noPadding>
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  LEAD IDENTIFIER
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2563eb" }}>
                  {lead.lead_id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  CATEGORY / DOMAIN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {lead.category}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  URGENCY LEVEL
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={lead.urgency.toUpperCase()}
                    size="small"
                    color={lead.urgency.toLowerCase() === "high" || lead.urgency.toLowerCase() === "critical" ? "error" : "warning"}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  JURISDICTION
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
                  {lead.city_name}, {lead.state_name}
                </Typography>
              </Box>

              <Divider />

              {/* Token Pricing Info */}
              <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe" }}>
                <Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700, display: "block" }}>
                  TOKEN COST TO UNLOCK
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                  <TollIcon sx={{ color: "#2563eb", fontSize: 28 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#1e3a8a" }}>
                    {tokensRequired}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e3a8a" }}>
                    Token{tokensRequired > 1 ? "s" : ""}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: "#3b82f6", display: "block", mt: 0.5 }}>
                  Your Token Balance: <strong>{tokenBalance} Token{tokenBalance !== 1 ? "s" : ""}</strong>
                </Typography>
              </Box>

              <Divider />

              {isAccepted ? (
                <Alert severity="success" sx={{ fontSize: "0.82rem" }}>
                  You have accepted this lead. Receipt: <strong>{lead.acceptance_info?.receipt_reference || "Direct Token Unlock"}</strong>
                </Alert>
              ) : (
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!hasSufficientTokens}
                    onClick={() => { setAcceptError(""); setAcceptModalOpen(true); }}
                    startIcon={<TollIcon />}
                    sx={{ textTransform: "none", fontWeight: 800, py: 1.4 }}
                  >
                    Accept Matter ({tokensRequired} Token{tokensRequired > 1 ? "s" : ""})
                  </Button>

                  {!hasSufficientTokens && (
                    <Alert severity="warning" sx={{ fontSize: "0.78rem" }}>
                      You need {tokensRequired - tokenBalance} more token(s) to accept this matter.
                    </Alert>
                  )}

                  <Button
                    component={Link}
                    href="/dashboard/professional/plans"
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Get More Tokens →
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        </SectionCard>
      </Box>

      {/* Accept Lead Confirmation Modal */}
      <Dialog
        open={acceptModalOpen}
        onClose={() => !accepting && setAcceptModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
          Accept Legal Lead
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {acceptError && <Alert severity="error">{acceptError}</Alert>}
            <Typography variant="body2" sx={{ color: "#334155" }}>
              Accepting <strong>{lead.lead_id}</strong> ({lead.category}) will deduct:
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe", textAlign: "center" }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                <TollIcon sx={{ color: "#2563eb", fontSize: 26 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
                  {tokensRequired} Token{tokensRequired > 1 ? "s" : ""}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "#1d4ed8", mt: 0.5, display: "block" }}>
                Balance after unlock: {tokenBalance - tokensRequired} Token(s)
              </Typography>
            </Paper>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Once accepted, client contact information and all case documents will be immediately unlocked and assigned exclusively to you.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAcceptModalOpen(false)} disabled={accepting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAccept}
            disabled={accepting}
            sx={{ textTransform: "none", fontWeight: 800, px: 3 }}
          >
            {accepting ? <CircularProgress size={20} color="inherit" /> : `Confirm & Deduct ${tokensRequired} Token${tokensRequired > 1 ? "s" : ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
