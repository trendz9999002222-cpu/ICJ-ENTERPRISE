"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import SummarizeIcon from "@mui/icons-material/Summarize";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import type { LeadReportsData } from "@/types/lead";

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2.5,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: color,
          borderRadius: "10px 10px 0 0",
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5, lineHeight: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>{subtitle}</Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

export default function AdminLeadReportsPage() {
  const [data, setData] = useState<LeadReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminLeadsService.getReports();
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  return (
    <AdminPageShell
      title="Marketplace Reports"
      subtitle="Key performance indicators and financial overview for the Lead Marketplace."
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={loadReports}
          disabled={loading}
        >
          Refresh
        </Button>
      }
    >
      {loading && (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>Loading reports...</Typography>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && data && (
        <>
          {/* Primary KPIs */}
          <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1.5 }}>
            Lead Performance
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 4 }}>
            <StatCard
              label="Total Leads"
              value={data.total_leads ?? 0}
              icon={<StorefrontIcon />}
              color="#2563eb"
            />
            <StatCard
              label="Published"
              value={data.published_leads ?? 0}
              icon={<TrendingUpIcon />}
              color="#7c3aed"
              subtitle="Active in marketplace"
            />
            <StatCard
              label="Accepted"
              value={data.accepted_leads ?? 0}
              icon={<CheckCircleIcon />}
              color="#16a34a"
              subtitle="Successfully converted"
            />
            <StatCard
              label="Pending Review"
              value={data.pending_review ?? 0}
              icon={<PendingIcon />}
              color="#d97706"
              subtitle="Awaiting admin approval"
            />
          </Box>

          <Divider sx={{ mb: 3, borderColor: "#e2e8f0" }} />

          {/* Conversion & Revenue */}
          <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1.5 }}>
            Conversion & Revenue
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5, mb: 4 }}>
            <StatCard
              label="Conversion Rate"
              value={`${(data.conversion_rate_percent ?? 0).toFixed(1)}%`}
              icon={<TrendingUpIcon />}
              color="#0891b2"
              subtitle={`${data.accepted_leads ?? 0} of ${data.published_leads ?? 0} published leads accepted`}
            />
            <StatCard
              label="Total Revenue"
              value={`₹${(data.total_revenue_inr ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={<CurrencyRupeeIcon />}
              color="#16a34a"
              subtitle="From lead acceptances"
            />
            <StatCard
              label="Wallet Balances"
              value={`₹${(data.total_wallet_balance_inr ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={<AccountBalanceWalletIcon />}
              color="#2563eb"
              subtitle={`₹${(data.total_wallet_topups_inr ?? 0).toFixed(2)} total topped up`}
            />
          </Box>

          {/* Summary Box */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", mb: 2 }} spacing={1}>
              <SummarizeIcon sx={{ color: "#2563eb", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Summary Insights</Typography>
            </Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 3 }}>
              {[
                {
                  label: "Leads awaiting admin review",
                  value: data.pending_review ?? 0,
                  highlight: (data.pending_review ?? 0) > 0,
                },
                {
                  label: "Lead acceptance rate",
                  value: `${(data.conversion_rate_percent ?? 0).toFixed(1)}%`,
                  highlight: false,
                },
                {
                  label: "Average revenue per accepted lead",
                  value: data.accepted_leads
                    ? `₹${((data.total_revenue_inr ?? 0) / data.accepted_leads).toFixed(2)}`
                    : "N/A",
                  highlight: false,
                },
                {
                  label: "Total wallet top-up volume",
                  value: `₹${(data.total_wallet_topups_inr ?? 0).toFixed(2)}`,
                  highlight: false,
                },
              ].map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.label}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: item.highlight ? "error.main" : "#0f172a",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mt: 1, borderColor: "#e2e8f0" }} />
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </AdminPageShell>
  );
}
