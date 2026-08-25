import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const QUICK_COMMANDS = [
  {
    id: "case-diary",
    title: "📂 मेरी केस डायरी (Case Diary)",
    subtitle: "सक्रिय मुकदमे, आगामी तारीख-पेशी एवं कॉज लिस्ट",
    category: "Legal Operations",
    route: "/advocate-dashboard",
    icon: <FolderSpecialIcon sx={{ color: "#059669" }} />,
    chip: "वकील डेस्क",
    chipColor: "#059669",
  },
  {
    id: "client-portal",
    title: "📋 मेरा केस व स्थिति (My Case Status)",
    subtitle: "मुवक्किल केस स्टेज (0-4), CNR स्टेटस व ऑर्डर कॉपी",
    category: "Citizen Desk",
    route: "/client-portal",
    icon: <GavelIcon sx={{ color: "#059669" }} />,
    chip: "मुवक्किल",
    chipColor: "#059669",
  },
  {
    id: "ai-drafter",
    title: "✨ AI कानूनी ड्राफ्टर (AI Legal Drafter)",
    subtitle: "1-क्लिक पिटीशन, बेल, रिट व नोटिस जनरेटर",
    category: "AI Intelligence",
    route: "/ai-legal-hub?tab=drafter",
    icon: <AutoAwesomeIcon sx={{ color: "#2563eb" }} />,
    chip: "AI लीगल",
    chipColor: "#2563eb",
  },
  {
    id: "research",
    title: "🔬 न्यायिक निर्णय खोज (Judicial Research)",
    subtitle: "सुप्रीम कोर्ट व हाई कोर्ट्स के नज़ीर व कानून निर्णय",
    category: "AI Intelligence",
    route: "/ai-legal-hub?tab=research",
    icon: <SearchIcon sx={{ color: "#0891b2" }} />,
    chip: "रिसर्च",
    chipColor: "#0891b2",
  },
  {
    id: "members",
    title: "👥 सदस्य डायरेक्टरी व KYC (Member Operations)",
    subtitle: "अखिल भारतीय अधिवक्ता व सदस्य सूची, ई-केवाईसी सत्यापन",
    category: "Member Hub",
    route: "/membership-hub",
    icon: <PeopleIcon sx={{ color: "#7c3aed" }} />,
    chip: "सदस्यता",
    chipColor: "#7c3aed",
  },
  {
    id: "billing",
    title: "💳 फीस बिलिंग व वॉलेट (Finance & Invoicing)",
    subtitle: "क्लाइंट इनवॉइस, पेमेंट गेटवे एवं डिजिटल वॉलेट",
    category: "Finance",
    route: "/finance-hub",
    icon: <AccountBalanceWalletIcon sx={{ color: "#d97706" }} />,
    chip: "वित्त",
    chipColor: "#d97706",
  },
  {
    id: "helpdesk",
    title: "🎧 24x7 सहायता व हेल्पडेस्क (Helpdesk)",
    subtitle: "नागरिक शिकायत निवारण, सपोर्ट टिकट्स व कम्युनिटी",
    category: "Support",
    route: "/support-hub",
    icon: <SupportAgentIcon sx={{ color: "#ea580c" }} />,
    chip: "सहायता",
    chipColor: "#ea580c",
  },
  {
    id: "admin-control",
    title: "🛡️ सुपर एडमिन नियंत्रण कक्ष (Admin Control)",
    subtitle: "RBAC सुरक्षा, सिस्टम सेटिंग्स, API गेटवे व हेल्थ",
    category: "Administration",
    route: "/admin-control-hub",
    icon: <SecurityIcon sx={{ color: "#dc2626" }} />,
    chip: "प्रशासन",
    chipColor: "#dc2626",
  },
  {
    id: "track-case",
    title: "🔍 सार्वजनिक केस ट्रैकर (Public Case Tracker)",
    subtitle: "CNR नंबर या केस ID दर्ज करके केस की स्थिति जांचें",
    category: "Public Utility",
    route: "/track-case",
    icon: <SearchIcon sx={{ color: "#059669" }} />,
    chip: "पब्लिक",
    chipColor: "#059669",
  },
];

export default function GlobalCommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else if (window.toggleCommandPalette) window.toggleCommandPalette();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return QUICK_COMMANDS;
    const q = query.toLowerCase().trim();
    return QUICK_COMMANDS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.chip.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (route) => {
    onClose();
    setQuery("");
    navigate(route);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
          border: "1.5px solid #e2e8f0",
          bgcolor: "#ffffff",
          top: { xs: 40, md: 80 },
          position: "absolute",
        },
      }}
    >
      {/* 🔍 SPOTLIGHT SEARCH BAR */}
      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Type a command, case number, or module (e.g. AI Drafter, Diary, Billing)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#1a73e8", fontSize: 28, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Chip
                  label="ESC to close"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    bgcolor: "#e2e8f0",
                    color: "#475569",
                  }}
                />
              </InputAdornment>
            ),
            sx: { fontSize: "1.05rem", fontWeight: 700 },
          }}
        />
      </Box>

      {/* 📋 COMMANDS LIST */}
      <DialogContent sx={{ p: 1, maxHeight: 420 }}>
        <List sx={{ py: 0 }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <ListItemButton
                key={cmd.id}
                onClick={() => handleSelect(cmd.route)}
                sx={{
                  borderRadius: "12px",
                  mb: 0.5,
                  py: 1.2,
                  px: 1.5,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>{cmd.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={800} color="#0f172a">
                        {cmd.title}
                      </Typography>
                      <Chip
                        label={cmd.chip}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          bgcolor: cmd.chipColor + "15",
                          color: cmd.chipColor,
                          border: `1px solid ${cmd.chipColor}40`,
                        }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.78rem" }}>
                      {cmd.subtitle}
                    </Typography>
                  }
                />
                <ArrowForwardIosIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
              </ListItemButton>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>
              <Typography variant="body2" fontWeight={700}>
                कोई परिणाम नहीं मिला (No matching commands found for "{query}")
              </Typography>
              <Typography variant="caption" color="text.secondary">
                कृपया केस नंबर, वकील नाम या मॉड्यूल सर्च करें।
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>

      {/* FOOTER SHORTCUTS HELP */}
      <Box
        sx={{
          py: 1,
          px: 2,
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
          💡 Tip: प्रेस <strong>Ctrl + K</strong> किसी भी समय खोलने के लिए
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
          Google Spotlight Grade Fast Search
        </Typography>
      </Box>
    </Dialog>
  );
}
