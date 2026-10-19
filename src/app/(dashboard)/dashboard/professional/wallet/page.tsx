"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";

import TollIcon from "@mui/icons-material/Toll";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HistoryIcon from "@mui/icons-material/History";
import StorefrontIcon from "@mui/icons-material/Storefront";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { ProfessionalWalletData, WalletTransactionItem } from "@/types/lead";

export default function ProfessionalWalletPage() {
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await leadMarketplaceService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await leadMarketplaceService.getWalletTransactions({ page_size: 50 });
      setTransactions(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  return (
    <PortalPageShell
      title="ICJ Token Wallet"
      subtitle="Your token balance for unlocking client inquiries, case documents, and accepting exclusive leads."
      actions={
        <Button
          component={Link}
          href="/dashboard/professional/plans"
          variant="contained"
          size="medium"
          startIcon={<ShoppingBagIcon />}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
        >
          Buy Tokens / Plans
        </Button>
      }
    >
      {/* Token Balances Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5, mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1, border: "1.5px solid #bfdbfe" }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <TollIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}>
                  AVAILABLE TOKENS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1d4ed8" }}>
                  {wallet ? (wallet.token_balance ?? wallet.available_lead_credits ?? 0) : 0} <span style={{ fontSize: "1rem", fontWeight: 600 }}>Tokens</span>
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1.5 }}>
              Use your available tokens to immediately accept marketplace leads.
            </Typography>
            <Button
              component={Link}
              href="/dashboard/professional/plans"
              variant="contained"
              size="small"
              fullWidth
              startIcon={<ShoppingBagIcon />}
              sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
            >
              Get More Tokens
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowDownwardIcon sx={{ fontSize: 36, color: "#16a34a" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}>
                  TOTAL TOKENS PURCHASED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#15803d" }}>
                  {wallet ? wallet.total_tokens_purchased : 0} <span style={{ fontSize: "1rem", fontWeight: 600 }}>Tokens</span>
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1.5 }}>
              Cumulative tokens granted via purchased credit plans.
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowUpwardIcon sx={{ fontSize: 36, color: "#ea580c" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}>
                  TOTAL TOKENS SPENT
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#9a3412" }}>
                  {wallet ? wallet.total_tokens_spent : 0} <span style={{ fontSize: "1rem", fontWeight: 600 }}>Tokens</span>
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1.5 }}>
              Tokens deducted for accepted client leads.
            </Typography>
            <Button
              component={Link}
              href="/dashboard/professional/my-leads"
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<StorefrontIcon />}
              sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
            >
              View Accepted Leads
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Transaction History Section */}
      <SectionCard
        title="Token Ledger & Transaction History"
        subtitle="Complete immutable log of all tokens credited, spent on leads, or refunded by admin."
      >
        {txLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon sx={{ fontSize: 44, color: "#94a3b8" }} />}
            message="No Token Transactions Yet"
            description="When you purchase tokens or accept leads, your token transactions will appear here."
            action={
              <Button
                component={Link}
                href="/dashboard/professional/plans"
                variant="contained"
                size="small"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Browse Token Plans
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>DATE & TIME</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>REFERENCE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "right" }}>TOKENS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "right" }}>BALANCE AFTER</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.tx_type === "credit" || tx.tx_type === "refund" || (tx.tokens_delta ?? 0) > 0;
                  const tokensDelta = tx.tokens_delta ?? 1;

                  return (
                    <TableRow key={tx.id} hover>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(tx.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>
                        {tx.reference}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.tx_type.toUpperCase()}
                          size="small"
                          color={
                            tx.tx_type === "credit" || tx.tx_type === "refund"
                              ? "success"
                              : tx.tx_type === "debit"
                              ? "error"
                              : "default"
                          }
                          sx={{ fontSize: "0.68rem", height: 20, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#0f172a" }}>
                        {tx.description}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 700, fontSize: "0.85rem", color: isCredit ? "#16a34a" : "#dc2626" }}>
                        {isCredit ? `+${Math.abs(tokensDelta || 1)}` : `-${Math.abs(tokensDelta || 1)}`} Tokens
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600, fontSize: "0.8rem", color: "#334155" }}>
                        {tx.token_balance_after ?? wallet?.token_balance ?? 0} Tokens
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </PortalPageShell>
  );
}
