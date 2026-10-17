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
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { loadEasebuzzCheckout } from "@/lib/easebuzz/loadEasebuzz";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { MarketplaceLeadPreview, ProfessionalWalletData, PaymentMethodType } from "@/types/lead";

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
  const [availableCredits, setAvailableCredits] = useState(0);
  const [metaInfo, setMetaInfo] = useState<{ paid_unlock_enabled?: boolean; compliance_notice?: string }>({});

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [availability, setAvailability] = useState<"available" | "all" | "taken">("available");

  // Acceptance Modal State
  const [selectedLead, setSelectedLead] = useState<MarketplaceLeadPreview | null>(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("wallet");
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
      if (leadsRes.meta) setMetaInfo(leadsRes.meta);

      if (walletRes) {
        setWallet(walletRes);
        setAvailableCredits(walletRes.available_lead_credits || 0);
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

    const isPaidEnabled = metaInfo.paid_unlock_enabled;
    if (!isPaidEnabled) {
      setPaymentMethod("non_commercial");
    } else if (availableCredits > 0) {
      setPaymentMethod("lead_credit");
    } else if (wallet && wallet.balance_paise >= lead.price_paise) {
      setPaymentMethod("wallet");
    } else {
      setPaymentMethod("direct_payment");
    }
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedLead) return;
    setAccepting(true);
    setAcceptError("");
    setAcceptSuccess("");

    try {
      const res = await leadMarketplaceService.acceptLead(selectedLead.id, paymentMethod);

      if (paymentMethod === "direct_payment" && res?.access_key) {
        // Load Easebuzz checkout script
        let easebuzzLoaded = false;
        try {
          await loadEasebuzzCheckout();
          easebuzzLoaded = typeof window !== "undefined" && Boolean(window.EasebuzzCheckout);
        } catch {
          easebuzzLoaded = false;
        }

        if (easebuzzLoaded) {
          await new Promise<void>((resolve, reject) => {
            try {
              const easebuzz = new window.EasebuzzCheckout(res.key || "P2OTPKQ5X", res.env || "test");
              const options = {
                access_key: res.access_key,
                onResponse: async (response: any) => {
                  try {
                    const statusStr = String(response?.status || "").toLowerCase();
                    if (statusStr === "success" || response?.status === 1) {
                      await leadMarketplaceService.verifyPayment({
                        txnid: response.txnid || res.gateway_order_id,
                        easepayid: response.easepayid || "",
                        status: "success",
                        hash: response.hash || "",
                        order_id: res.order_id,
                      });
                      resolve();
                    } else {
                      reject(new Error(response?.error_Message || response?.error_desc || "Payment was not successful."));
                    }
                  } catch (e) {
                    reject(e);
                  }
                },
              };
              easebuzz.initiatePayment(options);
            } catch (initErr) {
              if (res.payment_url) {
                window.location.href = res.payment_url;
              } else {
                reject(initErr);
              }
            }
          });
        } else if (res.payment_url) {
          window.location.href = res.payment_url;
        } else {
          throw new Error("Unable to initialize Easebuzz checkout. Please try again.");
        }
      }

      setAcceptSuccess("Lead accepted successfully! Client contact info unlocked.");
      setTimeout(() => {
        setAcceptModalOpen(false);
        router.push("/dashboard/professional/my-leads");
      }, 1200);
    } catch (err: any) {
      setAcceptError(err?.message || "Failed to accept lead. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <PortalPageShell
      title="ICJ Lead Marketplace"
      subtitle="Exclusive verified legal assistance inquiries. Review matter previews and accept leads to assist clients."
    >
      {/* Top Balances Bar */}
      <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2 }}>
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#f8fafc" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ICJ WALLET BALANCE
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  ₹{wallet ? wallet.available_inr.toLocaleString("en-IN") : "0.00"}
                </Typography>
              </Box>
            </Stack>
            <Button
              component={Link}
              href="/dashboard/professional/wallet"
              size="small"
              variant="text"
              sx={{ mt: 1, p: 0, fontSize: "0.75rem", textTransform: "none" }}
            >
              + Add Balance
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#f8fafc" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <LoyaltyIcon color="success" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  LEAD CREDITS REMAINING
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {availableCredits} {availableCredits === 1 ? "Credit" : "Credits"}
                </Typography>
              </Box>
            </Stack>
            <Button
              component={Link}
              href="/dashboard/professional/plans"
              size="small"
              variant="text"
              sx={{ mt: 1, p: 0, fontSize: "0.75rem", textTransform: "none" }}
            >
              Buy Credit Plan
            </Button>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            gridColumn: { xs: "span 1", sm: "span 2", md: "span 2" },
            borderRadius: 2,
            bgcolor: metaInfo.paid_unlock_enabled ? "#f0fdf4" : "#fffbeb",
            borderColor: metaInfo.paid_unlock_enabled ? "#bbf7d0" : "#fef08a",
            display: "flex",
            alignItems: "center",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <InfoOutlinedIcon
                sx={{ color: metaInfo.paid_unlock_enabled ? "#16a34a" : "#ca8a04", mt: 0.2 }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {metaInfo.paid_unlock_enabled
                    ? "Commercial Lead Acquisition Active"
                    : "Preview & Non-Commercial Allocation Mode"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {metaInfo.compliance_notice ||
                    "Sensitive client details remain confidential until formal acceptance. Only one verified professional can exclusively accept an individual lead."}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Filter and Search Bar */}
      <Box sx={{ mb: 3 }}>
        <SectionCard title="Marketplace Filters" noPadding>
          <Box sx={{ p: 2 }}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "2fr 1fr 1fr 1fr auto" }, gap: 2, alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search matter, category, location, or Lead ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Property Dispute">Property & Land</MenuItem>
                    <MenuItem value="Consumer Fraud">Consumer Fraud</MenuItem>
                    <MenuItem value="Civil Law">Civil Law</MenuItem>
                    <MenuItem value="Labour Law">Labour & Employment</MenuItem>
                    <MenuItem value="Cyber Crime">Cyber Crime</MenuItem>
                    <MenuItem value="Family Law">Family & Matrimonial</MenuItem>
                    <MenuItem value="Criminal Law">Criminal Law</MenuItem>
                  </Select>
                </FormControl>
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
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" size="medium">
                    Filter
                  </Button>
                  <IconButton onClick={() => { setSearch(""); setCategory("all"); setUrgency("all"); loadData(); }}>
                    <RefreshIcon />
                  </IconButton>
                </Stack>
              </Box>
            </form>
          </Box>
        </SectionCard>
      </Box>

      {/* Leads Grid */}
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
          description="Check back shortly or reset your filters. New citizen requests appear as soon as verified by the admin team."
        />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
          {leads.map((lead) => {
            const isAvailable = lead.status === "published" || lead.status === "reserved";
            const isTaken = lead.status === "accepted";
            const urgencyColor = URGENCY_COLOR_MAP[lead.urgency.toLowerCase()] || "default";

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
                      <span>Client identity & contact details protected until authorized acceptance.</span>
                    </Stack>
                  </CardContent>

                  {/* Card Footer */}
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#fbfcfd", borderTop: "1px solid #f1f5f9" }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
                          LEAD FEE
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          ₹{lead.price_inr.toLocaleString("en-IN")}
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
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!isAvailable}
                          onClick={() => handleOpenAcceptModal(lead)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: isAvailable ? "#2563eb" : undefined,
                          }}
                        >
                          {isTaken ? "Taken" : "Accept Lead"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Accept Lead Modal */}
      <Dialog
        open={acceptModalOpen}
        onClose={() => !accepting && setAcceptModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem", pb: 1 }}>
          Confirm Exclusive Lead Acceptance
        </DialogTitle>
        <DialogContent dividers>
          {selectedLead && (
            <Stack spacing={2.5}>
              {acceptError && <Alert severity="error">{acceptError}</Alert>}
              {acceptSuccess && <Alert severity="success">{acceptSuccess}</Alert>}

              {/* Lead Summary Info */}
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
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Lead Price:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    ₹{selectedLead.price_inr.toLocaleString("en-IN")}
                  </Typography>
                </Stack>
              </Box>

              {/* Compliance Notice if commercial flag is disabled */}
              {!metaInfo.paid_unlock_enabled && (
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                  <strong>Compliance Mode Active:</strong> Paid advocate lead unlocking is currently disabled pending
                  regulatory review. This lead will be accepted via platform non-commercial allocation without charging your wallet.
                </Alert>
              )}

              {/* Payment Method Selection if commercial is enabled */}
              {metaInfo.paid_unlock_enabled && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Select Payment Method:
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                    >
                      {/* Option A: Wallet */}
                      <FormControlLabel
                        value="wallet"
                        control={<Radio />}
                        disabled={(wallet?.balance_paise || 0) < selectedLead.price_paise}
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Pay from ICJ Wallet (Balance: ₹{wallet?.available_inr.toLocaleString("en-IN") || "0.00"})
                            </Typography>
                            {(wallet?.balance_paise || 0) < selectedLead.price_paise && (
                              <Typography variant="caption" color="error">
                                Insufficient balance. Please top up your wallet.
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ mb: 1, p: 1, border: "1px solid #e2e8f0", borderRadius: 1.5 }}
                      />

                      {/* Option B: Lead Credit */}
                      <FormControlLabel
                        value="lead_credit"
                        control={<Radio />}
                        disabled={availableCredits <= 0}
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Use 1 Lead Credit ({availableCredits} available)
                            </Typography>
                            {availableCredits <= 0 && (
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                No active prepaid lead credits available.
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ mb: 1, p: 1, border: "1px solid #e2e8f0", borderRadius: 1.5 }}
                      />

                      {/* Option C: Direct Payment */}
                      <FormControlLabel
                        value="direct_payment"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Pay Directly via Easebuzz Gateway (Cards, UPI, NetBanking)
                            </Typography>
                          </Box>
                        }
                        sx={{ p: 1, border: "1px solid #e2e8f0", borderRadius: 1.5 }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}

              {/* Terms Check */}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                By accepting this lead, you agree to contact the client promptly and maintain professional standards.
                Lead fee is non-refundable once confidential contact details are unlocked except in verified conflict-of-interest cases.
              </Typography>
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
            disabled={accepting || Boolean(acceptSuccess)}
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            {accepting ? <CircularProgress size={20} color="inherit" /> : "Confirm & Accept Lead"}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
