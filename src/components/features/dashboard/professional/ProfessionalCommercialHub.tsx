"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import Link from "next/link";
import SectionCard from "@/components/ui/SectionCard";

interface ProfessionalCommercialHubProps {
  walletBalanceInr?: number;
  leadCredits?: number;
}

export default function ProfessionalCommercialHub({
  walletBalanceInr,
  leadCredits,
}: ProfessionalCommercialHubProps) {
  const cards = [
    {
      title: "Lead Marketplace",
      description: "Browse verified litigant inquiries and advisory leads filtered by your category & state.",
      href: "/dashboard/professional/leads",
      badge: "Active Leads",
      icon: <StorefrontIcon sx={{ fontSize: 26 }} />,
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      title: "ICJ Digital Wallet",
      description: `Current balance ₹${(walletBalanceInr ?? 0).toLocaleString("en-IN")}. Instant top-up via Easebuzz payment gateway.`,
      href: "/dashboard/professional/wallet",
      badge: `₹${(walletBalanceInr ?? 0).toLocaleString("en-IN")}`,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />,
      color: "#16a34a",
      bgColor: "#f0fdf4",
    },
    {
      title: "Lead Credit Bundles",
      description: `Discounted credit packages with Easebuzz checkout. You currently hold ${leadCredits ?? 0} credits.`,
      href: "/dashboard/professional/plans",
      badge: `${leadCredits ?? 0} Cr Available`,
      icon: <LoyaltyIcon sx={{ fontSize: 26 }} />,
      color: "#d97706",
      bgColor: "#fffbeb",
    },
    {
      title: "Payments & Invoices",
      description: "Audit trail with Easebuzz transaction IDs, GST invoice downloads, and status receipts.",
      href: "/dashboard/professional/payments",
      badge: "Easebuzz Gateway",
      icon: <ReceiptLongIcon sx={{ fontSize: 26 }} />,
      color: "#475569",
      bgColor: "#f8fafc",
    },
  ];

  return (
    <SectionCard
      title="Commercial & Lead Monetization Suite"
      subtitle="Manage client leads, wallet balances, discounted credit bundles, and Easebuzz payments"
    >
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6 }} key={card.title}>
            <Card
              component={Link}
              href={card.href}
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: card.color,
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.04)",
                  "& .arrow-icon": {
                    transform: "translateX(4px)",
                    color: card.color,
                  },
                },
              }}
            >
              <Box>
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      bgcolor: card.bgColor,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.35,
                      borderRadius: "6px",
                      bgcolor: card.bgColor,
                      color: card.color,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    {card.badge}
                  </Box>
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                  {card.description}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                  mt: 2,
                  pt: 1.5,
                  borderTop: "1px solid #f1f5f9",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                <span>Access Suite</span>
                <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 16, transition: "transform 0.2s ease" }} />
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}
