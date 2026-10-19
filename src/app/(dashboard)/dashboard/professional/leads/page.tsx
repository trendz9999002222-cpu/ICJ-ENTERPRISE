"use client";

import { useEffect, useState } from "react";
import {
  Alert,
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
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TollIcon from "@mui/icons-material/Toll";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityIcon from "@mui/icons-material/Visibility";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { MarketplaceLeadPreview, ProfessionalWalletData } from "@/types/lead";

const URGENCY_COLOR_MAP: Record<string, "default" | "info" | "warning" | "error"> = {
  low: "default",
  medium: "info",
  high: "warning",
  critical: "error",
};

export default function ProfessionalLeadMarketplacePage() {
  const router = useRouter();

  // State
  const [leads, setLeads] = useState<MarketplaceLeadPreview[]>([]);
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // View Mode: Cards (grid) vs List (table)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
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

  const handleOpenAcceptModal = (lead: MarketplaceLeadPreview) => {
    setSelectedLead(lead);
    setAcceptError("");
    setAcceptSuccess("");
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedLead) return;
    setAccepting(true);
    setAcceptError("");
    setAcceptSuccess("");

    try {
      await leadMarketplaceService.acceptLead(selectedLead.id, "tokens");
      setAcceptSuccess("Lead successfully accepted! Tokens have been deducted from your wallet.");
      loadData();
      setTimeout(() => {
        setAcceptModalOpen(false);
        router.push(`/dashboard/professional/leads/${selectedLead.id}`);
      }, 1200);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to accept lead. Please verify your token balance.";
      setAcceptError(msg);
    } finally {
      setAccepting(false);
    }
  };

  const categories = Array.from(new Set(leads.map((l) => l.category).filter(Boolean)));
  const userTokens = (wallet?.token_balance ?? wallet?.available_lead_credits) ?? 0;
  const leadTokensRequired = selectedLead?.tokens_required || 1;
  const hasEnoughTokens = userTokens >= leadTokensRequired;

  return (
    <PortalPageShell
      title="Lead Marketplace"
      subtitle="Exclusive verified client legal inquiries. Review matter requirements and accept leads using your tokens."
      actions={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {/* Token balance indicator */}
          <Chip
            icon={<TollIcon sx={{ color: "#2563eb !important" }} />}
            label={`${userTokens} Token${userTokens === 1 ? "" : "s"} Available`}
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              bgcolor: "#eff6ff",
              borderColor: "#bfdbfe",
              color: "#1d4ed8",
              py: 2,
              px: 0.5,
            }}
          />
          <Button
            component={Link}
            href="/dashboard/professional/plans"
            variant="contained"
            size="small"
            startIcon={<ShoppingBagIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Buy Tokens
          </Button>
          <Button
            component={Link}
            href="/dashboard/professional/my-leads"
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            My Accepted Leads
          </Button>
        </Stack>
      }
    >
      {/* Search & Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between" }}
          >
            {/* Search form */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
              <TextField
                placeholder="Search matter details, category, city..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Filters & View Switcher */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Urgency</InputLabel>
                <Select value={urgency} label="Urgency" onChange={(e) => setUrgency(e.target.value)}>
                  <MenuItem value="all">All Urgency</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Availability</InputLabel>
                <Select value={availability} label="Availability" onChange={(e) => setAvailability(e.target.value as any)}>
                  <MenuItem value="available">Available Only</MenuItem>
                  <MenuItem value="all">All Leads</MenuItem>
                  <MenuItem value="taken">Already Taken</MenuItem>
                </Select>
              </FormControl>

              {/* View Mode Toggle: Grid vs List */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, next) => next && setViewMode(next)}
                size="small"
                sx={{ bgcolor: "#f8fafc" }}
              >
                <ToggleButton value="grid" aria-label="card grid view">
                  <Tooltip title="Card Grid View">
                    <GridViewIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list" aria-label="table list view">
                  <Tooltip title="Table List View">
                    <ViewListIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Card>
      </Box>

      {/* Leads Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={<FilterListIcon sx={{ fontSize: 48, color: "#94a3b8" }} />}
          message="No Leads Found"
          description={
            search || category !== "all" || urgency !== "all"
              ? "No marketplace inquiries match your current search or filters. Try adjusting your filters."
              : "There are currently no new published leads in the marketplace. Please check back shortly."
          }
        />
      ) : viewMode === "grid" ? (
        /* CARD GRID VIEW */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {leads.map((lead) => {
            const isTaken = lead.status === "accepted";
            const urgencyColor = URGENCY_COLOR_MAP[lead.urgency.toLowerCase()] || "default";
            const reqTokens = lead.tokens_required || 1;

            return (
              <Box key={lead.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    height: "100%",
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
                    {/* Header Row */}
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

                    {/* Metadata Row */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2, color: "#64748b", fontSize: "0.8rem" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                        <span>{lead.city_name || "Location"}, {lead.state_name}</span>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                        <span>{new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </Stack>
                    </Stack>

                    {/* Anonymized Matter Summary */}
                    <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #f1f5f9", mb: 2 }}>
                      <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.5 }}>
                        {lead.anonymized_summary}
                      </Typography>
                    </Box>

                    {/* Masked Confidential Banner */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#94a3b8", fontSize: "0.75rem", mb: 1 }}>
                      <LockOutlinedIcon sx={{ fontSize: 14 }} />
                      <span>Client identity & documents protected until accepted.</span>
                    </Stack>
                  </CardContent>

                  <Divider sx={{ borderColor: "#f1f5f9" }} />

                  {/* Footer Action Row */}
                  <Box sx={{ p: 2, bgcolor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block" }}>
                        TOKEN COST
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: "#1d4ed8" }}>
                        {reqTokens} Token{reqTokens === 1 ? "" : "s"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        component={Link}
                        href={`/dashboard/professional/leads/${lead.id}`}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Details
                      </Button>

                      {!isTaken && lead.status !== "reserved" && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenAcceptModal(lead)}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          Accept Lead
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>
      ) : (
        /* TABLE LIST VIEW */
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>LEAD ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>URGENCY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>LOCATION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>SUMMARY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "center" }}>TOKENS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => {
                  const isTaken = lead.status === "accepted";
                  const urgencyColor = URGENCY_COLOR_MAP[lead.urgency.toLowerCase()] || "default";
                  const reqTokens = lead.tokens_required || 1;

                  return (
                    <TableRow key={lead.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: "#2563eb", fontSize: "0.8rem" }}>
                        {lead.lead_id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        {lead.category}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.urgency}
                          size="small"
                          color={urgencyColor}
                          sx={{ fontWeight: 600, fontSize: "0.68rem", height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {lead.city_name}, {lead.state_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#334155", maxWidth: 280 }}>
                        <Typography variant="body2" noWrap sx={{ fontSize: "0.8rem" }}>
                          {lead.anonymized_summary}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", fontWeight: 800, color: "#1d4ed8", fontSize: "0.85rem" }}>
                        {reqTokens}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isTaken ? "Taken" : lead.status === "reserved" ? "In Checkout" : "Available"}
                          size="small"
                          color={isTaken ? "default" : lead.status === "reserved" ? "warning" : "success"}
                          variant={isTaken ? "outlined" : "filled"}
                          sx={{ fontWeight: 600, fontSize: "0.68rem", height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button
                            component={Link}
                            href={`/dashboard/professional/leads/${lead.id}`}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.3 }}
                          >
                            Details
                          </Button>
                          {!isTaken && lead.status !== "reserved" && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenAcceptModal(lead)}
                              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, py: 0.3 }}
                            >
                              Accept
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Lead Acceptance Modal */}
      <Dialog
        open={acceptModalOpen}
        onClose={() => !accepting && setAcceptModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
          Accept Client Lead Exclusively
        </DialogTitle>
        <DialogContent dividers>
          {selectedLead && (
            <Stack spacing={2.5}>
              {acceptError && (
                <Alert severity="error" onClose={() => setAcceptError("")}>
                  {acceptError}
                </Alert>
              )}
              {acceptSuccess && (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  {acceptSuccess}
                </Alert>
              )}

              {/* Lead Summary */}
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
                <Typography variant="body2" sx={{ color: "#334155" }}>
                  {selectedLead.anonymized_summary}
                </Typography>
              </Box>

              {/* Token Cost and Balance Comparison Box */}
              <Box sx={{ p: 2, bgcolor: hasEnoughTokens ? "#eff6ff" : "#fef2f2", borderRadius: 2, border: hasEnoughTokens ? "1.5px solid #bfdbfe" : "1.5px solid #fecaca" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    Lead Acceptance Token Cost:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1d4ed8" }}>
                    {leadTokensRequired} Token{leadTokensRequired === 1 ? "" : "s"}
                  </Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    Your Available Token Balance:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: hasEnoughTokens ? "#15803d" : "#dc2626" }}>
                    {userTokens} Token{userTokens === 1 ? "" : "s"}
                  </Typography>
                </Stack>

                {!hasEnoughTokens && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #fee2e2" }}>
                    <Typography variant="body2" color="error" sx={{ fontWeight: 700, mb: 1 }}>
                      Insufficient Tokens! You need {leadTokensRequired - userTokens} more token(s) to accept this lead.
                    </Typography>
                    <Button
                      component={Link}
                      href="/dashboard/professional/plans"
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<ShoppingBagIcon />}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Purchase Token Plan
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Information Notice */}
              {hasEnoughTokens && (
                <Alert severity="info">
                  Upon clicking confirm, <strong>{leadTokensRequired} token(s)</strong> will be deducted from your wallet.
                  The client&apos;s full name, phone number, email, and attached case documents will be immediately unlocked.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAcceptModalOpen(false)} disabled={accepting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAccept}
            disabled={accepting || !hasEnoughTokens || Boolean(acceptSuccess)}
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            {accepting ? "Accepting..." : `Confirm & Deduct ${leadTokensRequired} Token${leadTokensRequired === 1 ? "" : "s"}`}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
