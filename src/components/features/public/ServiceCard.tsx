"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BalanceIcon from "@mui/icons-material/Balance";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GavelIcon from "@mui/icons-material/Gavel";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SecurityIcon from "@mui/icons-material/Security";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

import type { JusticeService } from "@/types/public";

const ICON_MAP: Record<string, React.ReactNode> = {
  HomeWork: <HomeWorkIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  ShoppingBag: <ShoppingBagIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  FamilyRestroom: <FamilyRestroomIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  Balance: <BalanceIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  Security: <SecurityIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  Handshake: <HandshakeIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  CorporateFare: <CorporateFareIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  WorkspacePremium: <WorkspacePremiumIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  Gavel: <GavelIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
};

export default function ServiceCard({ service }: { service: JusticeService }) {
  const icon = ICON_MAP[service.iconName] ?? <GavelIcon sx={{ fontSize: 24, color: "#2563eb" }} />;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#bfdbfe",
          boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
          transform: "translateY(-3px)",
        },
      }}
    >
      <Box>
        {/* Top Icon + Category Tag */}
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
          <Chip
            label={service.categoryLabel}
            size="small"
            sx={{
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Stack>

        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.1rem",
            lineHeight: 1.35,
            mb: 1.25,
          }}
        >
          {service.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            fontSize: "0.875rem",
            lineHeight: 1.55,
            mb: 2,
          }}
        >
          {service.shortDescription}
        </Typography>
      </Box>

      {/* Bottom CTA Link */}
      <Box sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
        <Button
          component={Link}
          href={`/services/${service.slug}`}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: "#2563eb",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.825rem",
            p: 0,
            "&:hover": { bgcolor: "transparent", color: "#1d4ed8" },
          }}
        >
          View Service Details
        </Button>
      </Box>
    </Paper>
  );
}
