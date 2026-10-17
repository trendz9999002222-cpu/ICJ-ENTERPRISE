"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";

export default function ProfessionalPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadMarketplaceService
      .getPayments()
      .then((res) => setPayments(res?.results || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPageShell
      title="Payment History"
      subtitle="View all direct gateway checkout orders and invoice records."
    >
      <SectionCard
        title="Gateway Orders"
        subtitle={`${payments.length} orders recorded`}
        icon={<ReceiptLongIcon sx={{ color: "#2563eb", fontSize: 20 }} />}
        noPadding
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress size={30} />
          </Box>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<ReceiptLongIcon sx={{ fontSize: 44, color: "#94a3b8" }} />}
            message="No payment transactions recorded"
            description="When you top up your wallet or purchase plans via the payment gateway, your invoices will show here."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Order Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {new Date(p.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#2563eb" }}>
                      {p.order_id}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", textTransform: "capitalize" }}>
                      {p.order_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      ₹{p.amount_inr?.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={p.status.toUpperCase()}
                        size="small"
                        color={p.status === "success" ? "success" : p.status === "pending" ? "warning" : "default"}
                        sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </PortalPageShell>
  );
}
