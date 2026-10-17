"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GavelIcon from "@mui/icons-material/Gavel";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import SectionCard from "@/components/ui/SectionCard";

interface ProfessionalQuickActionsProps {
  approved: boolean;
}

export default function ProfessionalQuickActions({
  approved,
}: ProfessionalQuickActionsProps) {
  const actions = [
    {
      label: "View & Edit My Profile",
      href: "/dashboard/profile",
      icon: <PersonIcon fontSize="small" />,
    },
    {
      label: "Register New Practice Area",
      href: "/dashboard/professional/register",
      icon: <WorkspacePremiumIcon fontSize="small" />,
    },
    {
      label: "Change Account Password",
      href: "/dashboard/change-password",
      icon: <LockOutlinedIcon fontSize="small" />,
    },
  ];

  if (approved) {
    actions.unshift(
      {
        label: "Lead Marketplace",
        href: "/dashboard/professional/leads",
        icon: <StorefrontIcon fontSize="small" />,
      },
      {
        label: "Available Cases",
        href: "/dashboard/professional/cases",
        icon: <GavelIcon fontSize="small" />,
      },
      {
        label: "ICJ Digital Wallet",
        href: "/dashboard/professional/wallet",
        icon: <AccountBalanceWalletIcon fontSize="small" />,
      },
      {
        label: "Browse Public Directory",
        href: "/directory",
        icon: <SearchIcon fontSize="small" />,
      },
    );
  }

  return (
    <SectionCard title="Quick Actions" subtitle="Fast shortcuts to your most common workflows">
      <Stack spacing={1.25}>
        {actions.map((a) => (
          <Button
            key={a.label}
            component={Link}
            href={a.href}
            variant="outlined"
            startIcon={a.icon}
            endIcon={<ArrowForwardIcon fontSize="small" />}
            fullWidth
            sx={{
              justifyContent: "space-between",
              borderColor: "#e2e8f0",
              color: "#0f172a",
              fontWeight: 600,
              borderRadius: "8px",
              py: 1.1,
              px: 2,
              textTransform: "none",
              fontSize: "0.84rem",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "#2563eb",
                color: "#2563eb",
                bgcolor: "#eff6ff",
              },
            }}
          >
            {a.label}
          </Button>
        ))}
      </Stack>
    </SectionCard>
  );
}
