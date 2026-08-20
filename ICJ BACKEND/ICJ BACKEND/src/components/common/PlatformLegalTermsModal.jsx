import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";

import LegalGovernanceService from "../../services/legalGovernanceService.js";

function PlatformLegalTermsModal({
  open = false,
  onClose = () => {},
  onAccept = () => {},
  mode = "litigant", // 'litigant' or 'advocate'
  userId = "USER-001",
  userName = "User",
}) {
  const [agreed, setAgreed] = useState(false);

  const publicPolicy = LegalGovernanceService.getPublicLitigantTerms();
  const commercialPolicy = LegalGovernanceService.getAdvocateCommercialTerms();

  const handleAcceptSubmit = () => {
    if (!agreed) return;
    LegalGovernanceService.logConsent({
      userId,
      userName,
      role: mode,
      consentType: mode === "advocate" ? "ADVOCATE_COMMERCIAL_TERMS" : "PUBLIC_LITIGANT_TERMS",
    });
    onAccept();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <GavelIcon sx={{ color: "#fcd34d", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              {mode === "advocate" ? commercialPolicy.title : publicPolicy.title}
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Statutory Compliance under IT Act 2000, DPDP Act 2023 & ICJ Enterprise Governance
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, maxHeight: 420, overflowY: "auto", pr: 1.5 }}>
        {/* PUBLIC LITIGANT CLAUSES */}
        <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon fontSize="small" /> 1. Public Terms & IT Act Intermediary Immunity
        </Typography>

        {publicPolicy.clauses.map((clause) => (
          <Paper key={clause.id} sx={{ p: 2, mb: 1.5, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={800} color="#38bdf8" mb={0.5}>
              {clause.title}
            </Typography>
            <Typography variant="caption" color="#cbd5e1" sx={{ lineHeight: 1.5, display: "block" }}>
              {clause.text}
            </Typography>
          </Paper>
        ))}

        {/* ADVOCATE & FRANCHISEE COMMERCIAL CLAUSES (ONLY FOR ADVOCATES) */}
        {mode === "advocate" && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ borderColor: "#334155", my: 2 }} />
            <Typography variant="subtitle2" fontWeight={800} color="#6ee7b7" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VerifiedUserIcon fontSize="small" /> 2. Empaneled Advocate & Franchisee 70:20:10 Settlement Terms
            </Typography>

            {commercialPolicy.clauses.map((clause) => (
              <Paper key={clause.id} sx={{ p: 2, mb: 1.5, bgcolor: "#064e3b", border: "1px solid #059669", borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={800} color="#a7f3d0" mb={0.5}>
                  {clause.title}
                </Typography>
                <Typography variant="caption" color="#ecfdf5" sx={{ lineHeight: 1.5, display: "block" }}>
                  {clause.text}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#1e293b", borderTop: "1px solid #334155", flexDirection: "column", alignItems: "flex-start", gap: 1.5 }}>
        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{ color: "#fcd34d", "&.Mui-checked": { color: "#10b981" } }} />}
          label={
            <Typography variant="body2" fontWeight={800} color={agreed ? "#6ee7b7" : "#fca5a5"}>
              I have read, understood, and explicitly accept all Legal Disclaimers, Push Alert Authorizations & Governance Terms.
            </Typography>
          }
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ color: "#94a3b8" }}>
            Close / Review Later
          </Button>
          <Button variant="contained" color="success" disabled={!agreed} onClick={handleAcceptSubmit} sx={{ fontWeight: 800, px: 3 }}>
            Accept & Record Digital Consent
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default PlatformLegalTermsModal;
