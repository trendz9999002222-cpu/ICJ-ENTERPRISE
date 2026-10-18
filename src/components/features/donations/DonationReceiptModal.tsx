"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { OfficialReceiptData } from "@/services/dashboard/donations.service";

interface Props {
  open: boolean;
  onClose: () => void;
  receipt: OfficialReceiptData | null;
}

export default function DonationReceiptModal({ open, onClose, receipt }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        },
      }}
    >
      {/* Modal Actions Bar (hidden when printing) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 1.5,
          bgcolor: "#0f172a",
          color: "#fff",
          "@media print": { display: "none" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldIcon sx={{ color: "#38bdf8", fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            Official 80G Tax Exemption Donation Receipt
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Print / Save PDF
          </Button>
          <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Printable Receipt Paper Container */}
      <DialogContent
        ref={printRef}
        sx={{
          p: { xs: 2.5, sm: 5 },
          bgcolor: "#ffffff",
          color: "#1e293b",
          fontFamily: "'Inter', sans-serif",
          "@media print": {
            p: 2,
            m: 0,
            boxShadow: "none",
          },
        }}
      >
        <Box
          sx={{
            border: "2px solid #0f172a",
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            position: "relative",
            bgcolor: "#fff",
          }}
        >
          {/* Top Trust Header */}
          <Box sx={{ textAlign: "center", pb: 2, borderBottom: "2px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: -0.5,
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                {receipt.trust.name}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontWeight: 600 }}>
              Regd. Public Charitable Trust under Indian Trusts Act, 1882 | Regn No: {receipt.trust.registration_no}
            </Typography>
            <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.5 }}>
              {receipt.trust.office_address} | Email: {receipt.trust.email} | Phone: {receipt.trust.phone}
            </Typography>

            {/* 80G Exemption Badge */}
            <Box sx={{ mt: 1.5, display: "inline-block" }}>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 16, color: "#166534 !important" }} />}
                label={`80G Approved • Unique Registration No: ${receipt.trust["80g_reg_no"]} • Validity: ${receipt.trust["80g_validity"]}`}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "1px solid #86efac",
                }}
              />
            </Box>
          </Box>

          {/* Receipt Title & Number */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
              px: 1,
              bgcolor: "#f8fafc",
              my: 2,
              borderRadius: 1,
              border: "1px dashed #cbd5e1",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Receipt Serial Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>
                {receipt.receipt_number}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Date & Financial Year
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                {receipt.date} (FY {receipt.financial_year})
              </Typography>
            </Box>
          </Box>

          {/* Donor & Payment Grid */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {/* Donor Particulars */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#fdfefe", border: "1px solid #e2e8f0", borderRadius: 1.5, height: "100%" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>
                  Donor Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {receipt.donor.name}
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1, fontSize: "0.85rem" }}>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>Donor PAN:</strong>{" "}
                    <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: 700 }}>
                      {receipt.donor.pan}
                    </span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>Email:</strong> {receipt.donor.email}
                  </Typography>
                  {receipt.donor.phone && (
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      <strong>Mobile:</strong> {receipt.donor.phone}
                    </Typography>
                  )}
                  {receipt.donor.address && (
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      <strong>Address:</strong> {receipt.donor.address}
                      {receipt.donor.state ? `, ${receipt.donor.state}` : ""}
                      {receipt.donor.pincode ? ` - ${receipt.donor.pincode}` : ""}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>

            {/* Payment & Earmarking */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#fdfefe", border: "1px solid #e2e8f0", borderRadius: 1.5, height: "100%" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>
                  Payment & Fund Particulars
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.8} sx={{ fontSize: "0.85rem" }}>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>Earmarked Fund:</strong>
                    <br />
                    <span style={{ color: "#1e40af", fontWeight: 700 }}>{receipt.purpose.label}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>Transaction ID:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>{receipt.payment.transaction_id}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    <strong>Payment Gateway:</strong> Easebuzz Checkout ({receipt.payment.mode})
                  </Typography>
                  {receipt.payment.bank_ref && (
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      <strong>Bank Ref:</strong> {receipt.payment.bank_ref}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label="Payment Settled & Confirmed"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* Amount Box */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "#f0fdf4",
              border: "2px solid #bbf7d0",
              borderRadius: 2,
              mb: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
              Donation Amount Received
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#15803d", my: 0.5 }}>
              {receipt.amount_formatted}
            </Typography>
            <Typography variant="body2" sx={{ color: "#166534", fontWeight: 600, fontStyle: "italic" }}>
              ({receipt.amount_in_words})
            </Typography>
          </Box>

          {/* Statutory Tax Exemption Note */}
          <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0", mb: 3 }}>
            <Typography variant="caption" sx={{ color: "#334155", display: "block", lineHeight: 1.5 }}>
              <strong>Statutory Tax Declaration:</strong> Donations to {receipt.trust.name} are exempt from income tax
              under Section 80G of the Income Tax Act, 1961. Unique Registration Number:{" "}
              <strong>{receipt.trust["80g_reg_no"]}</strong>, Trust PAN: <strong>{receipt.trust.pan}</strong>. The donor
              is entitled to claim tax deduction under Sec 80G on the basis of this receipt and subsequent Form 10BD statement.
            </Typography>
          </Box>

          {/* Footer Signature & Seal */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", pt: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                Public Audit Verification:
              </Typography>
              <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, fontFamily: "monospace" }}>
                https://icj.org.in{receipt.verification_url}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "2px dashed #0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1,
                  bgcolor: "#f0f9ff",
                }}
              >
                <Typography variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#0284c7", textAlign: "center" }}>
                  ICJ TRUST
                  <br />
                  OFFICIAL
                  <br />
                  SEAL
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                Authorized Trustee & Treasurer
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                {receipt.trust.name}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
