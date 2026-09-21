"use client";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import InputIcon from "@mui/icons-material/Input";
import WorkIcon from "@mui/icons-material/Work";
import { Alert, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";

type HubCard = {
  label: string;
  href: string;
  countKey: keyof Awaited<ReturnType<typeof professionalOnboardingService.getDashboardCounts>>;
  icon: ReactNode;
  color: string;
  bg: string;
};

const CARDS: HubCard[] = [
  {
    label: "Categories",
    href: "/admin/practice-areas/categories",
    countKey: "categories",
    icon: <CategoryIcon />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    label: "Groups",
    href: "/admin/practice-areas/groups",
    countKey: "groups",
    icon: <GroupsIcon />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    label: "Professions",
    href: "/admin/practice-areas/professions",
    countKey: "professions",
    icon: <WorkIcon />,
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    label: "Common Fields",
    href: "/admin/practice-areas/common-fields",
    countKey: "commonFields",
    icon: <InputIcon />,
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    label: "Profession Fields",
    href: "/admin/practice-areas/profession-fields",
    countKey: "professionFields",
    icon: <AccountTreeIcon />,
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    label: "Documents",
    href: "/admin/practice-areas/documents",
    countKey: "documents",
    icon: <DescriptionIcon />,
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

const APPLICATION_LINKS = [
  {
    label: "Register as Professional",
    href: "/admin/practice-areas/registrations",
    description: "Review submitted join applications",
    color: "#0f766e",
    bg: "#ecfdf5",
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2.5}>
        {CARDS.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.href}>
            <Paper
              component={Link}
              href={card.href}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                textDecoration: "none",
                color: "inherit",
                display: "block",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: card.bg,
                    color: card.color,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                    {loading ? "—" : counts ? counts[card.countKey].toLocaleString("en-IN") : "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    {card.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {APPLICATION_LINKS.map((item) => (
          <Grid size={{ xs: 12, md: 6 }} key={item.href}>
            <Paper
              component={Link}
              href={item.href}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                textDecoration: "none",
                color: "inherit",
                bgcolor: item.bg,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: item.color }}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">{item.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        component={Link}
        href="/admin/practice-areas/preview"
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          textDecoration: "none",
          color: "inherit",
          bgcolor: "#f8fafc",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "#e0e7ff",
              color: "#4338ca",
              display: "grid",
              placeItems: "center",
            }}
          >
            <FactCheckIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Onboarding preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify common fields, profession-specific fields, and required documents for a
              selected profession.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
