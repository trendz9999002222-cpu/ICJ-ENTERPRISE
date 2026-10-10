"use client";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import InputIcon from "@mui/icons-material/Input";
import WorkIcon from "@mui/icons-material/Work";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";

type HubCard = {
  label: string;
  description: string;
  href: string;
  countKey: keyof Awaited<ReturnType<typeof professionalOnboardingService.getDashboardCounts>>;
  icon: ReactNode;
  color: string;
  bg: string;
};

const CARDS: HubCard[] = [
  {
    label: "Categories",
    description: "Main professional legal & allied domains",
    href: "/admin/professional-onboarding/categories",
    countKey: "categories",
    icon: <CategoryIcon fontSize="medium" />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    label: "Groups",
    description: "Professional sub-groups under categories",
    href: "/admin/professional-onboarding/groups",
    countKey: "groups",
    icon: <GroupsIcon fontSize="medium" />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    label: "Professions",
    description: "Individual professional designations",
    href: "/admin/professional-onboarding/professions",
    countKey: "professions",
    icon: <WorkIcon fontSize="medium" />,
    color: "#0891b2",
    bg: "#ecfeff",
  },

  {
    label: "Profession Fields",
    description: "Role-specific dynamic form fields",
    href: "/admin/professional-onboarding/profession-fields",
    countKey: "professionFields",
    icon: <AccountTreeIcon fontSize="medium" />,
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    label: "Documents",
    description: "Verification document catalog",
    href: "/admin/professional-onboarding/documents",
    countKey: "documents",
    icon: <DescriptionIcon fontSize="medium" />,
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

export default function OnboardingHubDashboard() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await professionalOnboardingService.getDashboardCounts();
        if (!cancelled) setCounts(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            getOnboardingApiErrorMessage(err, "Unable to load configuration counts."),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, pb: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Main Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {CARDS.map((card) => (
          <Paper
            key={card.href}
            component={Link}
            href={card.href}
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              textDecoration: "none",
              color: "inherit",
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                transform: "translateY(-3px)",
                borderColor: card.color,
                "& .arrow-icon": {
                  transform: "translateX(4px)",
                  color: card.color,
                },
              },
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", minWidth: 0 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  bgcolor: card.bg,
                  color: card.color,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.1, mb: 0.5 }}
                >
                  {loading ? "—" : counts ? counts[card.countKey].toLocaleString("en-IN") : "—"}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#334155", fontWeight: 700 }}>
                  {card.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </Stack>
            <ArrowForwardIcon
              className="arrow-icon"
              sx={{ color: "#cbd5e1", fontSize: 20, transition: "transform 0.2s ease, color 0.2s ease", flexShrink: 0, ml: 1 }}
            />
          </Paper>
        ))}
      </Box>

      {/* Action / Management Banner Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2.5,
        }}
      >
        {/* Applications / Registrations Card */}
        <Paper
          component={Link}
          href="/admin/professionals"
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #bbf7d0",
            borderRadius: 3,
            textDecoration: "none",
            color: "inherit",
            bgcolor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.15)",
              transform: "translateY(-2px)",
              borderColor: "#16a34a",
            },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2.5,
                bgcolor: "#dcfce7",
                color: "#15803d",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <AssignmentTurnedInIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#166534", mb: 0.25 }}>
                Professional Applications
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151" }}>
                Review, approve, block, and manage registered professional profiles & KYC documents.
              </Typography>
            </Box>
          </Stack>
          <ArrowForwardIcon sx={{ color: "#16a34a", ml: 1, flexShrink: 0 }} />
        </Paper>

        {/* Onboarding Form Preview Card */}
        <Paper
          component={Link}
          href="/admin/professional-onboarding/preview"
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #c7d2fe",
            borderRadius: 3,
            textDecoration: "none",
            color: "inherit",
            bgcolor: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.15)",
              transform: "translateY(-2px)",
              borderColor: "#4f46e5",
            },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2.5,
                bgcolor: "#e0e7ff",
                color: "#4338ca",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FactCheckIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#3730a3", mb: 0.25 }}>
                Onboarding Live Preview
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151" }}>
                Verify form fields, document upload rules, and color themes for any profession.
              </Typography>
            </Box>
          </Stack>
          <ArrowForwardIcon sx={{ color: "#4f46e5", ml: 1, flexShrink: 0 }} />
        </Paper>
      </Box>
    </Box>
  );
}
