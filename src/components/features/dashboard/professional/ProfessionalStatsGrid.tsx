"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Grid } from "@mui/material";
import StatCard from "@/components/ui/StatCard";
import type { UserProfessionInfo } from "@/types/api";

interface ProfessionalStatsGridProps {
  approved: boolean;
  statusLabel: string;
  primary: UserProfessionInfo | null;
  professionsCount: number;
  walletBalanceInr?: number;
  leadCredits?: number;
}

export default function ProfessionalStatsGrid({
  approved,
  statusLabel,
  primary,
  professionsCount,
  walletBalanceInr,
  leadCredits,
}: ProfessionalStatsGridProps) {
  if (approved) {
    return (
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Verification Status"
            value="Approved & Active"
            icon={<CheckCircleIcon />}
            color="#16a34a"
            bgColor="#f0fdf4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Registered Practices"
            value={`${professionsCount} Practice Area${professionsCount > 1 ? "s" : ""}`}
            icon={<WorkspacePremiumIcon />}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="ICJ Wallet Balance"
            value={walletBalanceInr !== undefined ? `₹${walletBalanceInr.toLocaleString("en-IN")}` : "₹0"}
            icon={<AccountBalanceWalletIcon />}
            color="#2563eb"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Available Lead Credits"
            value={leadCredits !== undefined ? `${leadCredits} Cr` : "0 Cr"}
            icon={<DescriptionIcon />}
            color="#0891b2"
            bgColor="#ecfeff"
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          label="Verification Status"
          value={statusLabel}
          icon={<HourglassTopIcon />}
          color="#d97706"
          bgColor="#fffbeb"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          label="Application Reference"
          value={primary?.reference_id ?? "—"}
          icon={<DescriptionIcon />}
          color="#2563eb"
          bgColor="#eff6ff"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          label="Category / Profession"
          value={primary?.profession_name ?? "—"}
          icon={<WorkspacePremiumIcon />}
          color="#64748b"
          bgColor="#f8fafc"
        />
      </Grid>
    </Grid>
  );
}
