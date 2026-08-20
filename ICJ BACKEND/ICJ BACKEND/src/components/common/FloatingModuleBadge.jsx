import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, Chip, Stack } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HandshakeIcon from "@mui/icons-material/Handshake";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import useAuth from "../../hooks/useAuth";

const MODULE_THEME_MAP = {
  "/advocate-dashboard": {
    name: "ADVOCATE DESK & CHAMBERS",
    partyRole: "Empaneled Senior Counsel",
    icon: <GavelIcon sx={{ fontSize: "0.85rem", color: "#fef08a" }} />,
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    borderColor: "#3b82f6",
  },
  "/client-portal": {
    name: "LITIGANT CLIENT PORTAL",
    partyRole: "Litigant Client",
    icon: <ShieldIcon sx={{ fontSize: "0.85rem", color: "#6ee7b7" }} />,
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
    borderColor: "#10b981",
  },
  "/dashboard": {
    name: "SUPER ADMIN DASHBOARD",
    partyRole: "Tier-0 Root Admin",
    icon: <SecurityIcon sx={{ fontSize: "0.85rem", color: "#ddd6fe" }} />,
    bgGradient: "linear-gradient(135deg, #4c1d95 0%, #6b21a8 100%)",
    borderColor: "#a855f7",
  },
  "/admin": {
    name: "SUPER ADMIN DASHBOARD",
    partyRole: "Tier-0 Root Admin",
    icon: <SecurityIcon sx={{ fontSize: "0.85rem", color: "#ddd6fe" }} />,
    bgGradient: "linear-gradient(135deg, #4c1d95 0%, #6b21a8 100%)",
    borderColor: "#a855f7",
  },
  "/personal-dashboard": {
    name: "MEMBER PERSONAL DASHBOARD",
    partyRole: "Registered ICJ Member",
    icon: <PersonIcon sx={{ fontSize: "0.85rem", color: "#bae6fd" }} />,
    bgGradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
    borderColor: "#38bdf8",
  },
  "/franchise-dashboard": {
    name: "DISTRICT FRANCHISEE DESK",
    partyRole: "Branch Director",
    icon: <HandshakeIcon sx={{ fontSize: "0.85rem", color: "#fde68a" }} />,
    bgGradient: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
    borderColor: "#f59e0b",
  },
  "/legal": {
    name: "MASTER LEGAL CASE REGISTRY",
    partyRole: "Legal Registry Officer",
    icon: <GavelIcon sx={{ fontSize: "0.85rem", color: "#c7d2fe" }} />,
    bgGradient: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
    borderColor: "#6366f1",
  },
  "/legal-drafter": {
    name: "AI LEGAL DRAFTER STUDIO",
    partyRole: "Legal Drafter",
    icon: <EditNoteIcon sx={{ fontSize: "0.85rem", color: "#99f6e4" }} />,
    bgGradient: "linear-gradient(135deg, #115e59 0%, #0f766e 100%)",
    borderColor: "#14b8a6",
  },
  "/documents": {
    name: "DIGITAL VAULT & DRM REGISTRY",
    partyRole: "Vault Custodian",
    icon: <FolderIcon sx={{ fontSize: "0.85rem", color: "#cbd5e1" }} />,
    bgGradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    borderColor: "#64748b",
  },
  "/virtual-office": {
    name: "VIRTUAL COURT CHAMBER",
    partyRole: "Presiding Counsel",
    icon: <AccountBalanceIcon sx={{ fontSize: "0.85rem", color: "#bbf7d0" }} />,
    bgGradient: "linear-gradient(135deg, #14532d 0%, #15803d 100%)",
    borderColor: "#22c55e",
  },
  "/court-calendar": {
    name: "COURT CAUSE LIST & CALENDAR",
    partyRole: "Judicial Registrar",
    icon: <CalendarMonthIcon sx={{ fontSize: "0.85rem", color: "#ffedd5" }} />,
    bgGradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)",
    borderColor: "#f97316",
  },
  "/finance": {
    name: "ESCROW FINANCIAL LEDGER",
    partyRole: "Treasury Officer",
    icon: <AttachMoneyIcon sx={{ fontSize: "0.85rem", color: "#a7f3d0" }} />,
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    borderColor: "#10b981",
  },
  "/payments": {
    name: "ESCROW FINANCIAL LEDGER",
    partyRole: "Treasury Officer",
    icon: <AttachMoneyIcon sx={{ fontSize: "0.85rem", color: "#a7f3d0" }} />,
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    borderColor: "#10b981",
  },
  "/governance": {
    name: "STATUTORY BSA COMPLIANCE",
    partyRole: "Compliance Auditor",
    icon: <SecurityIcon sx={{ fontSize: "0.85rem", color: "#fecaca" }} />,
    bgGradient: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
    borderColor: "#ef4444",
  },
  "/helpdesk": {
    name: "HELPDESK & SUPPORT DESK",
    partyRole: "Customer Care Desk",
    icon: <SupportAgentIcon sx={{ fontSize: "0.85rem", color: "#f0abfc" }} />,
    bgGradient: "linear-gradient(135deg, #581c87 0%, #7e22ce 100%)",
    borderColor: "#c084fc",
  },
};

export default function FloatingModuleBadge() {
  const location = useLocation();
  const { user } = useAuth();

  const activeModule = useMemo(() => {
    const path = location.pathname;
    // Direct match
    if (MODULE_THEME_MAP[path]) return MODULE_THEME_MAP[path];

    // Subpath match
    const matchedKey = Object.keys(MODULE_THEME_MAP).find((key) => path.startsWith(key));
    if (matchedKey) return MODULE_THEME_MAP[matchedKey];

    // Generic Fallback
    const userRole = user?.role || user?.user_type || "member";
    const roleLabel =
      userRole === "super_admin" || user?.username === "ICJSuperAdmin1234"
        ? "Tier-0 Root Admin"
        : userRole === "advocate"
        ? "Empaneled Advocate"
        : userRole === "client"
        ? "Litigant Client"
        : "ICJ Registered Member";

    return {
      name: "ICJ ENTERPRISE GOVERNANCE",
      partyRole: roleLabel,
      icon: <PushPinIcon sx={{ fontSize: "0.85rem", color: "#f59e0b" }} />,
      bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      borderColor: "#3b82f6",
    };
  }, [location.pathname, user]);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1050,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1.5, sm: 2.5 },
        py: 0.6,
        background: activeModule.bgGradient,
        borderBottom: `2px solid ${activeModule.borderColor}`,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
        color: "#ffffff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {activeModule.icon}
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "0.72rem", sm: "0.82rem" },
            letterSpacing: 0.5,
            color: "#ffffff",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          📌 MODULE: {activeModule.name}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip
          label={`PARTY / ROLE: ${activeModule.partyRole}`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "0.62rem", sm: "0.72rem" },
            height: 20,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.68rem",
            color: "rgba(255, 255, 255, 0.8)",
            display: { xs: "none", md: "inline" },
          }}
        >
          ICJ Enterprise Legal Governance System (2026)
        </Typography>
      </Stack>
    </Box>
  );
}
