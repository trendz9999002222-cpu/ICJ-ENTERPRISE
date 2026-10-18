"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import TollIcon from "@mui/icons-material/Toll";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { MarketplaceLeadPreview, ProfessionalWalletData } from "@/types/lead";

const URGENCY_COLOR_MAP: Record<string, "error" | "warning" | "info" | "default"> = {
  critical: "error",
  high: "error",
  urgent: "warning",
  medium: "warning",
  low: "default",
};

export default function LeadMarketplacePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<MarketplaceLeadPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);

  // View Mode: 'list' or 'grid' (default list per user request)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [availability, setAvailability] = useState<"available" | "all" | "taken">("available");

  // Acceptance Modal State
  const [selectedLead, setSelectedLead] = useState<MarketplaceLeadPreview | null>(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [acceptSuccess, setAcceptSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, walletRes] = await Promise.all([
        leadMarketplaceService.listMarketplaceLeads({
          search: search || undefined,
          category: category !== "all" ? category : undefined,
          urgency: urgency !== "all" ? urgency : undefined,
          availability: availability,
          page_size: 50,
        }),
        leadMarketplaceService.getWallet().catch(() => null),
      ]);

      setLeads(leadsRes.results || []);
      setTotalCount(leadsRes.count || 0);

      if (walletRes) {
        setWallet(walletRes);
      }
    } catch (err: any) {
      console.error("Error loading marketplace leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, urgency, availability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const currentTokens = wallet?.token_balance ?? 0;

  const handleOpenAcceptModal = (lead: MarketplaceLeadPreview) => {
    setSelectedLead(lead);
    setAcceptError("");
    setAcceptSuccess("");
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedLead) return;
    const requiredTokens = selectedLead.tokens_required || 1;

    // Strict frontend token check
    if (currentTokens < requiredTokens) {
      setAcceptError(`Insufficient Tokens! You need ${requiredTokens} token(s) to accept this lead, but your balance is ${currentTokens}. Please purchase tokens.`);
      return;
    }

    setAccepting(true);
    setAcceptError("");
    setAcceptSuccess("");

    try {
      await leadMarketplaceService.acceptLead(selectedLead.id, "tokens");
      setAcceptSuccess("Lead accepted successfully! Client contact info and case documents are now unlocked.");
      setTimeout(() => {
        setAcceptModalOpen(false);
        router.push("/dashboard/professional/my-leads");
      }, 1200);
    } catch (err: any) {
      setAcceptError(err?.message || "Failed to accept lead. Please ensure you have sufficient tokens.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <PortalPageShell
      title="ICJ Lead Marketplace"
      subtitle="Exclusive verified legal assistance inquiries. Review matter previews and accept leads using your tokens to assist clients."
    >
      {/* Top Token Balance Card */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #bfdbfe",
          background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          p: 2.5,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              }}
            >
              <TollIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Your Available Lead Tokens
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {currentTokens} <span style={{ fontSize: "1rem", fontWeight: 600, color: "#64748b" }}>Token{currentTokens === 1 ? "" : "s"}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: "#475569" }}>
                Each lead requires tokens to unlock full client contact information and attached documents.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Button
              component={Link}
              href="/dashboard/professional/plans"
              variant="contained"
              color="primary"
              startIcon={<LoyaltyIcon />}
              sx={{ fontWeight: 700, textTransform: "none", px: 2.5, py: 1 }}
            >
              Buy Lead Tokens
            </Button>
            <Button
              component={Link}
              href="/dashboard/professional/wallet"
              variant="outlined"
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              Token Wallet
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Filter and View Toggle Bar */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <form onSubmit={handleSearchSubmit}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(12, 1fr)" }, gap: 2, alignItems: "center" }}>
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search matter, category, location, or Lead ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: "span 6", sm: "span 2.5" } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Specialized Law">Specialized Law</MenuItem>
                    <MenuItem value="Citizen Assistance">Citizen Assistance</MenuItem>
                    <MenuItem value="Property Dispute">Property & Real Estate</MenuItem>
                    <MenuItem value="Consumer Fraud">Consumer Fraud</MenuItem>
                    <MenuItem value="Civil Law">Civil Law</MenuItem>
                    <MenuItem value="Family Law">Family & Matrimonial</MenuItem>
                    <MenuItem value="Criminal Law">Criminal Defense</MenuItem>
                    <MenuItem value="Labour Law">Labour & Employment</MenuItem>
                    <MenuItem value="Corporate Law">Corporate Law</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ gridColumn: { xs: "span 6", sm: "span 2" } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Urgency</InputLabel>
                  <Select value={urgency} label="Urgency" onChange={(e) => setUrgency(e.target.value)}>
                    <MenuItem value="all">All Urgencies</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ gridColumn: { xs: "span 6", sm: "span 2" } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={availability}
                    label="Availability"
                    onChange={(e) => setAvailability(e.target.value as any)}
                  >
                    <MenuItem value="available">Available Now</MenuItem>
                    <MenuItem value="taken">Already Taken</MenuItem>
                    <MenuItem value="all">All Leads</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* View Switcher Toggle */}
              <Box sx={{ gridColumn: { xs: "span 6", sm: "span 1.5" }, display: "flex", justifyContent: "flex-end" }}>
                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  aria-label="view mode"
                >
                  <Tooltip title="List View (Table)">
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon fontSize="small" />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title="Card View (Grid)">
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Main Leads Presentation */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading available marketplace leads...
          </Typography>
        </Box>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={<StorefrontIcon sx={{ fontSize: 56, color: "#94a3b8" }} />}
          message="No matching leads in the marketplace"
          description="Check back shortly or reset your filters. New inquiries appear as soon as verified by the admin team."
        />
      ) : viewMode === "list" ? (
        /* LIST VIEW TABLE (Per User Request) */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Table size="medium">
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Lead ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Matter Category</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Anonymized Summary</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Token Cost</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", textAlign: "right" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => {
                const isAvailable = lead.status === "published" || lead.status === "reserved";
                const isTaken = lead.status === "accepted";
                const urgencyColor = URGENCY_COLOR_MAP[lead.urgency?.toLowerCase() || ""] || "default";
                const reqTokens = lead.tokens_required || 1;
                const hasEnoughTokens = currentTokens >= reqTokens;

                return (
                  <TableRow key={lead.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb" }}>
                        {lead.lead_id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lead.category}
                      </Typography>
                      <Chip
                        label={lead.urgency}
                        size="small"
                        color={urgencyColor}
                        sx={{ fontSize: "0.68rem", height: 18, mt: 0.3 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography variant="body2" sx={{ color: "#334155" }}>
                          {lead.city_name ? `${lead.city_name}, ` : ""}{lead.state_name || "—"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.82rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {lead.anonymized_summary}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, color: "#94a3b8", alignItems: "center" }}>
                        <LockOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                          Client contact masked until accepted
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <TollIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {reqTokens} Token{reqTokens > 1 ? "s" : ""}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={isTaken ? "Already Taken" : lead.status === "reserved" ? "In Checkout" : "Available"}
                        size="small"
                        color={isTaken ? "default" : lead.status === "reserved" ? "warning" : "success"}
                        variant={isTaken ? "outlined" : "filled"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                      />
                    </TableCell>

                    <TableCell sx={{ textAlign: "right" }}>
                      <Button
                        variant={hasEnoughTokens && isAvailable ? "contained" : "outlined"}
                        size="small"
                        disabled={!isAvailable}
                        onClick={() => handleOpenAcceptModal(lead)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isTaken ? "Taken" : "Accept Lead"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* CARD VIEW (GRID) */
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
          {leads.map((lead) => {
            const isAvailable = lead.status === "published" || lead.status === "reserved";
            const isTaken = lead.status === "accepted";
            const urgencyColor = URGENCY_COLOR_MAP[lead.urgency?.toLowerCase() || ""] || "default";
            const reqTokens = lead.tokens_required || 1;

            return (
              <Card
                key={lead.id}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.08)",
                    borderColor: "#93c5fd",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, letterSpacing: 0.5 }}>
                        {lead.lead_id}
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", mt: 0.3 }}>
                        {lead.category}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Chip
                        label={lead.urgency}
                        size="small"
                        color={urgencyColor}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                      />
                      <Chip
                        label={isTaken ? "Already Taken" : lead.status === "reserved" ? "In Checkout" : "Available"}
                        size="small"
                        color={isTaken ? "default" : lead.status === "reserved" ? "warning" : "success"}
                        variant={isTaken ? "outlined" : "filled"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mb: 2, color: "#64748b", fontSize: "0.8rem" }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                      <span>{lead.city_name ? `${lead.city_name}, ` : ""}{lead.state_name}</span>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                      <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                    </Stack>
                  </Stack>

                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #f1f5f9", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.5 }}>
                      {lead.anonymized_summary}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                    <span>Client identity & contact details protected until authorized acceptance.</span>
                  </Stack>
                </CardContent>

                <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#fbfcfd", borderTop: "1px solid #f1f5f9" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <TollIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {reqTokens} Token{reqTokens > 1 ? "s" : ""}
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={!isAvailable}
                      onClick={() => handleOpenAcceptModal(lead)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {isTaken ? "Taken" : "Accept Lead"}
                    </Button>
                  </Stack>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Accept Lead Modal (Token Validation Enforced) */}
      <Dialog
        open={acceptModalOpen}
        onClose={() => !accepting && setAcceptModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem", pb: 1 }}>
          Confirm Lead Acceptance
        </DialogTitle>
        <DialogContent dividers>
          {selectedLead && (() => {
            const reqTokens = selectedLead.tokens_required || 1;
            const hasTokens = currentTokens >= reqTokens;

            return (
              <Stack spacing={2.5}>
                {acceptError && <Alert severity="error">{acceptError}</Alert>}
                {acceptSuccess && <Alert severity="success">{acceptSuccess}</Alert>}

                {/* Lead Info */}
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700 }}>
                    {selectedLead.lead_id}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedLead.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    {selectedLead.city_name}, {selectedLead.state_name} • Urgency: {selectedLead.urgency}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Required Tokens:</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <TollIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {reqTokens} Token{reqTokens > 1 ? "s" : ""}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Token Balance Check Banner */}
                {hasTokens ? (
                  <Alert severity="success">
                    <strong>Token Balance Verified:</strong> You have <strong>{currentTokens} tokens</strong> available. Accepting this lead will deduct <strong>{reqTokens} token(s)</strong> and unlock full client contact details and case documents immediately.
                  </Alert>
                ) : (
                  <Alert severity="warning">
                    <strong>Insufficient Tokens:</strong> You currently have <strong>{currentTokens} tokens</strong>, but this lead requires <strong>{reqTokens} token(s)</strong>. Please purchase lead tokens to accept this inquiry.
                  </Alert>
                )}

                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  By accepting this matter, you agree to contact the client promptly and provide diligent professional legal assistance. All case progress notes will be maintained under your portal.
                </Typography>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAcceptModalOpen(false)} disabled={accepting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>

          {selectedLead && currentTokens >= (selectedLead.tokens_required || 1) ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmAccept}
              disabled={accepting || Boolean(acceptSuccess)}
              sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
            >
              {accepting ? <CircularProgress size={20} color="inherit" /> : `Accept Lead (${selectedLead.tokens_required || 1} Token)`}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              component={Link}
              href="/dashboard/professional/plans"
              sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
            >
              Purchase Tokens to Accept
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
