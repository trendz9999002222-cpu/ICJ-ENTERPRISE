import React from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Stack,
  Chip,
  Button,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import useAuth from "../../hooks/useAuth";

// ─── 1. FROZEN DEDICATED BUTTON SIGNATURE COLORS ─────────────────────────────
export const ADVOCATE_TOP_NAV = [
  {
    id: "case-diary",
    label: "📂 मेरी केस डायरी (Case Diary)",
    subtext: "सक्रिय मुकदमे, आगामी तारीख-पेशी एवं कॉज लिस्ट",
    route: "/advocate-dashboard",
    icon: <FolderSpecialIcon sx={{ fontSize: 20 }} />,
    color: "#059669",      // Emerald Green (FROZEN)
    bg: "#ecfdf5",
    border: "#10b981",
    darkBg: "#064e3b",
  },
  {
    id: "ai-drafter",
    label: "🤖 AI ड्राफ्टर व रिसर्च (AI Drafter)",
    subtext: "1-क्लिक पिटीशन, बेल ड्राफ्टिंग एवं न्यायिक निर्णय खोज",
    route: "/ai-legal-hub",
    icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />,
    color: "#2563eb",      // Royal Blue (FROZEN)
    bg: "#eff6ff",
    border: "#3b82f6",
    darkBg: "#1e3a8a",
  },
  {
    id: "clients",
    label: "👥 मुवक्किल परामर्श (Client Desk)",
    subtext: "क्लाइंट डायरेक्टरी, संपर्क एवं वर्चुअल परामर्श कक्ष",
    route: "/legal-workspace?tab=client",
    icon: <GroupIcon sx={{ fontSize: 20 }} />,
    color: "#7c3aed",      // Regal Purple (FROZEN)
    bg: "#f5f3ff",
    border: "#8b5cf6",
    darkBg: "#4c1d95",
  },
  {
    id: "fees",
    label: "💳 मेरी फीस व बिलिंग (Fees & Invoices)",
    subtext: "क्लाइंट फीस चालान, GST इनवॉइसिंग एवं भुगतान लेजर",
    route: "/finance-hub?tab=billing",
    icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />,
    color: "#d97706",      // Amber Gold (FROZEN)
    bg: "#fffbeb",
    border: "#f59e0b",
    darkBg: "#78350f",
  },
  {
    id: "support",
    label: "🎧 हेल्पडेस्क व सपोर्ट (Helpdesk)",
    subtext: "बार काउंसिल तकनीकी सहायता एवं आपातकालीन हेल्पलाइन",
    route: "/support-hub",
    icon: <SupportAgentIcon sx={{ fontSize: 20 }} />,
    color: "#ea580c",      // Vibrant Orange (FROZEN)
    bg: "#fff7ed",
    border: "#f97316",
    darkBg: "#7c2d12",
  },
];

export const CLIENT_TOP_NAV = [
  {
    id: "my-case",
    label: "📋 मेरा केस व स्थिति (My Case & Status)",
    subtext: "लाइव केस स्टेज 0-4 ट्रैकिंग, CNR स्टेटस एवं तारीखें",
    route: "/client-portal",
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />,
    color: "#059669",      // Emerald Green (FROZEN)
    bg: "#ecfdf5",
    border: "#10b981",
    darkBg: "#064e3b",
  },
  {
    id: "my-advocate",
    label: "👨‍⚖️ मेरा वकील व परामर्श (My Advocate)",
    subtext: "नियुक्त सीनियर अधिवक्ता का विवरण, कॉल व चैट परामर्श",
    route: "/legal-workspace?tab=advocate",
    icon: <GavelIcon sx={{ fontSize: 20 }} />,
    color: "#2563eb",      // Royal Blue (FROZEN)
    bg: "#eff6ff",
    border: "#3b82f6",
    darkBg: "#1e3a8a",
  },
  {
    id: "my-docs",
    label: "📁 मेरे दस्तावेज़ (My Documents)",
    subtext: "साक्ष्य अपलोड, डिजिटल रसीदें एवं प्रमाणित ऑर्डर कॉपी",
    route: "/documents",
    icon: <FolderSharedIcon sx={{ fontSize: 20 }} />,
    color: "#7c3aed",      // Regal Purple (FROZEN)
    bg: "#f5f3ff",
    border: "#8b5cf6",
    darkBg: "#4c1d95",
  },
  {
    id: "payments",
    label: "💳 फीस भुगतान व रसीदें (Payments)",
    subtext: "डिजिटल वॉलेट बैलेंस, ऑनलाइन फीस भुगतान एवं टोकन",
    route: "/finance-hub?tab=wallet",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
    color: "#d97706",      // Amber Gold (FROZEN)
    bg: "#fffbeb",
    border: "#f59e0b",
    darkBg: "#78350f",
  },
  {
    id: "support",
    label: "🎧 24x7 नागरिक सहायता (Helpdesk)",
    subtext: "नागरिक शिकायत निवारण, त्वरित समाधान व 24x7 हेल्पलाइन",
    route: "/support-hub?tab=helpdesk",
    icon: <SupportAgentIcon sx={{ fontSize: 20 }} />,
    color: "#ea580c",      // Vibrant Orange (FROZEN)
    bg: "#fff7ed",
    border: "#f97316",
    darkBg: "#7c2d12",
  },
];

export default function RoleTopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width:899.95px)");

  const role = String(user?.role || "member").toLowerCase();
  const userType = String(user?.user_type || "").toLowerCase();

  const isAdvocate = role === "advocate" || userType === "advocate";
  const navItems = isAdvocate ? ADVOCATE_TOP_NAV : CLIENT_TOP_NAV;

  // Determine which module button is currently active
  const activeItem =
    navItems.find((item) => {
      const baseRoute = item.route.split("?")[0];
      return location.pathname === baseRoute;
    }) || navItems[0];

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#ffffff",
        borderBottom: `3px solid ${activeItem.color}`, // DYNAMIC COLOR BORDER THAT ADAPTS TO ACTIVE BUTTON!
        boxShadow: `0 4px 20px ${activeItem.color}18`,
        position: "sticky",
        top: { xs: 48, md: 42 },
        zIndex: 1050,
        transition: "all 0.3s ease",
      }}
    >
      {/* 1. BUTTONS ROW WITH DISTINCT FROZEN SIGNATURE COLORS */}
      <Box sx={{ py: 1.2, px: { xs: 1, sm: 2, md: 3 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
          sx={{
            overflowX: "auto",
            whiteSpace: "nowrap",
            pb: { xs: 0.5, md: 0 },
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 4 },
          }}
        >
          <Chip
            label={isAdvocate ? "⚖️ ADVOCATE DESK" : "👤 LITIGANT CLIENT"}
            size="small"
            sx={{
              bgcolor: isAdvocate ? "#0f172a" : "#064e3b",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "0.72rem",
              mr: 1,
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />

          {navItems.map((item) => {
            const isActive = item.id === activeItem.id;
            return (
              <Button
                key={item.id}
                component={RouterLink}
                to={item.route}
                size="small"
                startIcon={item.icon}
                sx={{
                  flexShrink: 0,
                  borderRadius: "20px",
                  px: 2.2,
                  py: 0.9,
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  // 🟢 FROZEN COLOR RULES:
                  // When Active: Solid Fill with Vibrant Glow
                  // When Inactive: Distinct Signature Border, Color Icon & Tinted Background
                  color: isActive ? "#ffffff" : item.color,
                  bgcolor: isActive ? item.color : item.bg,
                  border: `2px solid ${item.color}`, // FROZEN SIGNATURE BORDER ALWAYS VISIBLE!
                  boxShadow: isActive
                    ? `0 4px 14px ${item.color}50`
                    : `0 2px 6px ${item.color}15`,
                  transition: "all 0.25s ease-in-out",
                  "&:hover": {
                    bgcolor: isActive ? item.color : item.color + "25",
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 18px ${item.color}40`,
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* 2. DYNAMIC ACTIVE THEME STRIP (बटन दबाने पर पूरा मैटर उसी कलर का हो जाएगा) */}
      <Box
        sx={{
          bgcolor: activeItem.bg,
          borderTop: `1px solid ${activeItem.color}30`,
          py: 0.8,
          px: { xs: 1.5, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: activeItem.color,
              boxShadow: `0 0 10px ${activeItem.color}`,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: activeItem.color,
              fontSize: "0.82rem",
              letterSpacing: 0.2,
            }}
          >
            सक्रिय कार्यक्षेत्र: <strong>{activeItem.label}</strong> — {activeItem.subtext}
          </Typography>
        </Stack>

        <Chip
          label="Color-Matched Dynamic Workspace"
          size="small"
          sx={{
            bgcolor: activeItem.color,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.68rem",
            display: { xs: "none", md: "inline-flex" },
          }}
        />
      </Box>
    </Box>
  );
}
