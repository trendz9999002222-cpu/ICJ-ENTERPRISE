import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Chip,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

// Direct sub-modules
import BillingInvoicing from "../BillingInvoicing.jsx";
import PaymentManagement from "../PaymentManagement.jsx";
import Wallet from "../Wallet.jsx";
import TokenExchange from "../TokenExchange.jsx";
import TokenGovernanceManual from "../TokenGovernanceManual.jsx";
import Donations from "../Donations.jsx";
import Campaigns from "../Campaigns.jsx";
import Transactions from "../Transactions.jsx";

// ─── TABS WITH DISTINCT FROZEN SIGNATURE COLORS ─────────────────────────────
const TABS = [
  {
    id: "billing",
    label: "🧾 बिलिंग व इनवॉइस (Invoicing)",
    icon: <ReceiptLongIcon />,
    color: "#7c3aed", // Regal Purple
    bg: "#f5f3ff",
    border: "#8b5cf6",
    desc: "क्लाइंट एवं अधिवक्ता बिलिंग, GST चालान एवं आधिकारिक इनवॉइस",
  },
  {
    id: "payments",
    label: "💳 भुगतान प्रबंधन (Payments)",
    icon: <PaidIcon />,
    color: "#059669", // Emerald Green
    bg: "#ecfdf5",
    border: "#10b981",
    desc: "ऑनलाइन पेमेंट गेटवे, सेटलमेंट ट्रैकिंग एवं एस्क्रो खाते",
  },
  {
    id: "wallet",
    label: "💰 डिजिटल वॉलेट (Wallet)",
    icon: <AccountBalanceWalletIcon />,
    color: "#2563eb", // Royal Blue
    bg: "#eff6ff",
    border: "#3b82f6",
    desc: "मेंबर एवं क्लाइंट मास्टर वॉलेट, बैलेंस व रिचार्ज",
  },
  {
    id: "token",
    label: "🪙 ICJ टोकन व नियम (Tokens)",
    icon: <CurrencyExchangeIcon />,
    color: "#d97706", // Amber Gold
    bg: "#fffbeb",
    border: "#f59e0b",
    desc: "ICJ गवर्नेंस टोकन एक्सचेंज, वैल्यूएशन एवं नियमावली",
  },
  {
    id: "donations",
    label: "🤝 दान व अभियान (Donations)",
    icon: <VolunteerActivismIcon />,
    color: "#db2777", // Rose Pink
    bg: "#fdf2f8",
    border: "#f472b6",
    desc: "विधिक सहायता क्राउडफंडिंग, जनहित याचिका दान एवं अभियान",
  },
  {
    id: "transactions",
    label: "📊 खाता बही (Ledger)",
    icon: <SwapHorizIcon />,
    color: "#0d9488", // Deep Teal
    bg: "#f0fdfa",
    border: "#14b8a6",
    desc: "संपूर्ण ऑडिट लेन-देन बही एवं वित्तीय रिकॉर्ड्स",
  },
];

export default function FinanceBillingHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "billing";

  const tabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === initialTab)
  );

  const [activeTab, setActiveTab] = useState(tabIndex);

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === searchParams.get("tab"));
    if (idx !== -1) setActiveTab(idx);
  }, [searchParams]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: TABS[newValue].id });
  };

  const activeTabConfig = TABS[activeTab] || TABS[0];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 6 }}>
      {/* 1. DYNAMIC COLOR-MATCHED HUB BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          bgcolor: activeTabConfig.color,
          color: "#ffffff",
          borderRadius: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          boxShadow: `0 8px 24px ${activeTabConfig.color}40`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              {activeTabConfig.icon}
            </Box>
            <Typography variant="h5" fontWeight={900}>
              {activeTabConfig.label}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600 }}>
            {activeTabConfig.desc}
          </Typography>
        </Box>

        <Chip
          label="Unified Finance & Token Master"
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontWeight: 900,
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        />
      </Paper>

      {/* 2. TABS BAR WITH DISTINCT FROZEN SIGNATURE COLORS */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: `2px solid ${activeTabConfig.color}`,
          mb: 3,
          bgcolor: "#ffffff",
          p: 1,
          boxShadow: `0 4px 16px ${activeTabConfig.color}15`,
          transition: "all 0.3s ease",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: { xs: 0.5, md: 0 },
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 4 },
          }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <Button
                key={tab.id}
                onClick={() => handleTabChange(null, idx)}
                size="small"
                startIcon={tab.icon}
                sx={{
                  flexShrink: 0,
                  borderRadius: "12px",
                  px: 2,
                  py: 1,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  // 🟢 FROZEN COLOR RULES:
                  color: isActive ? "#ffffff" : tab.color,
                  bgcolor: isActive ? tab.color : tab.bg,
                  border: `1.5px solid ${tab.color}`,
                  boxShadow: isActive ? `0 4px 12px ${tab.color}45` : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isActive ? tab.color : tab.color + "20",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
      </Paper>

      {/* 3. TAB CONTENT PANELS */}
      <Box sx={{ borderTop: `2px dashed ${activeTabConfig.color}40`, pt: 2 }}>
        {activeTab === 0 && <BillingInvoicing />}

        {activeTab === 1 && <PaymentManagement />}

        {activeTab === 2 && <Wallet />}

        {activeTab === 3 && (
          <Stack spacing={3}>
            <TokenExchange />
            <Divider sx={{ my: 2 }} />
            <TokenGovernanceManual />
          </Stack>
        )}

        {activeTab === 4 && (
          <Stack spacing={3}>
            <Donations />
            <Divider sx={{ my: 2 }} />
            <Campaigns />
          </Stack>
        )}

        {activeTab === 5 && <Transactions />}
      </Box>
    </Box>
  );
}
