import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GavelIcon from "@mui/icons-material/Gavel";
import BusinessIcon from "@mui/icons-material/Business";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BalanceIcon from "@mui/icons-material/Balance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

export const JUDICIAL_TIERS = [
  {
    id: "supreme-court",
    level: "Tier 1: Apex Court",
    hindiName: "🏛️ सुप्रीम कोर्ट (Supreme Court)",
    matters: "Art. 32 Writs, SLP, Transfers & Constitution Benches",
    scope: "सर्वोच्च न्यायालय (New Delhi)",
    coverage: "Pan-India Apex Jurisdiction",
    color: "#b91c1c", // Deep Crimson
    bg: "#fef2f2",
    border: "#f87171",
    icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: "high-courts",
    level: "Tier 2: State Judiciary",
    hindiName: "⚖️ 25 हाई कोर्ट्स (High Courts)",
    matters: "Writs, Criminal Bail, 482 Quashing & Regular Appeals",
    scope: "25 उच्च न्यायालय एवं सभी खंडपीठ",
    coverage: "All States & Union Territories",
    color: "#1e40af", // Royal Blue
    bg: "#eff6ff",
    border: "#60a5fa",
    icon: <GavelIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: "district-courts",
    level: "Tier 3: District & Sessions",
    hindiName: "🏢 780+ ज़िला अदालतें (Districts)",
    matters: "District & Sessions, Commercial, Family, POCSO & CJM",
    scope: "780+ ज़िला न्यायालय परिसर",
    coverage: "100% District Level Reach",
    color: "#047857", // Emerald Green
    bg: "#ecfdf5",
    border: "#34d399",
    icon: <BusinessIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: "revenue-courts",
    level: "Tier 4: Land & Revenue",
    hindiName: "📜 तहसील व राजस्व (Tehsil & Revenue)",
    matters: "दाखिल-खारिज (Mutation), पैमाइश, चकबंदी व SDM कोर्ट",
    scope: "नायब तहसीलदार, तहसीलदार, SDM व DM कोर्ट",
    coverage: "Ground Level Land Records",
    color: "#b45309", // Amber Brown
    bg: "#fffbeb",
    border: "#fbbf24",
    icon: <MenuBookIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: "tribunals",
    level: "Tier 5: Specialized Tribunals",
    hindiName: "💼 8 वैधानिक अधिकरण (Tribunals)",
    matters: "NCLT, DRT, NGT, CAT, Consumer, ITAT, RERA & AFT",
    scope: "कंपनी, लोन, पर्यावरण, सर्विस व उपभोक्ता आयोग",
    coverage: "Specialized Statutory Benches",
    color: "#6d28d9", // Regal Purple
    bg: "#f5f3ff",
    border: "#a78bfa",
    icon: <BalanceIcon sx={{ fontSize: 28 }} />,
  },
];

export default function JudicialForumsNetworkCard({ onSelectForum = null }) {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(null);

  const handleForumClick = (tier) => {
    setSelectedTier(tier.id);
    if (onSelectForum) {
      onSelectForum(tier);
    } else {
      navigate(`/legal-workspace?forum=${tier.id}`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: "24px",
        bgcolor: "#ffffff",
        border: "2px solid #e2e8f0",
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.06)",
        mb: 4,
      }}
    >
      {/* 1. HEADER SECTION */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 0.5 }}>
            <Chip
              label="🏛️ OFFICIAL JUDICIAL COVERAGE"
              size="small"
              sx={{
                bgcolor: "#0f172a",
                color: "#f8fafc",
                fontWeight: 900,
                fontSize: "0.72rem",
              }}
            />
            <Chip
              label="100% Pan-India Network"
              size="small"
              sx={{
                bgcolor: "#ecfdf5",
                color: "#065f46",
                fontWeight: 800,
                fontSize: "0.72rem",
                border: "1px solid #a7f3d0",
              }}
            />
          </Stack>
          <Typography variant="h5" fontWeight={900} color="#0f172a">
            🏛️ 5-स्तरीय अखिल भारतीय न्यायपालिका एवं अधिकरण नेटवर्क
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600, mt: 0.4 }}>
            All-India Judicial Forums Covered by ICJ Legal Protection Network • INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/join?role=problem")}
          sx={{
            bgcolor: "#064e3b",
            color: "#ffffff",
            fontWeight: 800,
            borderRadius: "20px",
            px: 2.5,
            py: 1,
            textTransform: "none",
            "&:hover": { bgcolor: "#04392b" },
          }}
        >
          केस दर्ज करें (File Case)
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* 2. 5-TIER JUDICIAL GRID */}
      <Grid container spacing={2.5}>
        {JUDICIAL_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={tier.id}>
              <Paper
                elevation={0}
                onClick={() => handleForumClick(tier)}
                sx={{
                  p: 2.2,
                  height: "100%",
                  borderRadius: "18px",
                  bgcolor: tier.bg,
                  border: "2px solid",
                  borderColor: isSelected ? tier.color : tier.border,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease-in-out",
                  boxShadow: isSelected ? `0 8px 24px ${tier.color}40` : "none",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: tier.color,
                    boxShadow: `0 10px 24px ${tier.color}25`,
                  },
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: tier.color,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${tier.color}40`,
                      }}
                    >
                      {tier.icon}
                    </Box>

                    <Chip
                      label={tier.level.split(":")[0]}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.68rem",
                        bgcolor: "#ffffff",
                        color: tier.color,
                        border: `1px solid ${tier.border}`,
                      }}
                    />
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a" sx={{ lineHeight: 1.3, mb: 0.8 }}>
                    {tier.hindiName}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#334155",
                      fontWeight: 700,
                      display: "block",
                      lineHeight: 1.35,
                      mb: 1.2,
                      bgcolor: "rgba(255,255,255,0.7)",
                      p: 0.8,
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    {tier.matters}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${tier.border}` }}>
                  <Stack direction="row" alignItems="center" spacing={0.6}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: tier.color }} />
                    <Typography variant="caption" fontWeight={800} color={tier.color} sx={{ fontSize: "0.7rem" }}>
                      {tier.coverage}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* 3. BOTTOM SUMMARY STATS STRIP */}
      <Box
        sx={{
          mt: 3,
          p: 1.5,
          borderRadius: "14px",
          bgcolor: "#0f172a",
          color: "#f8fafc",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography variant="caption" fontWeight={800} sx={{ color: "#38bdf8" }}>
          🏛️ 1 Supreme Court
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>•</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color: "#60a5fa" }}>
          ⚖️ 25 High Courts & Benches
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>•</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color: "#34d399" }}>
          🏢 780+ District Courts
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>•</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color: "#fbbf24" }}>
          📜 3,500+ Tehsil & SDM Courts
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>•</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color: "#c084fc" }}>
          💼 8 National Tribunals (NCLT, DRT, NGT, RERA, etc.)
        </Typography>
      </Box>
    </Paper>
  );
}
