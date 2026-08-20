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
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import JudiciaryMasterService from "../../services/judiciaryMasterService.js";
import SpecialtyMonetizationService from "../../services/specialtyMonetizationService.js";

function SpecialtyUpgradeModal({
  open = false,
  onClose = () => {},
  onSuccess = () => {},
  memberId = "ICJ-2026-MEM-0001",
  memberName = "Advocate Pawan Kumar",
  initialSpecialties = ["CRIMINAL_BAIL"],
}) {
  const [selectedSpecialties, setSelectedSpecialties] = useState(initialSpecialties);
  const [statusMsg, setStatusMsg] = useState("");

  const allSpecialties = JudiciaryMasterService.getSpecialties();
  const feeInfo = SpecialtyMonetizationService.calculateFee(selectedSpecialties.length);

  const handleToggleSpecialty = (id) => {
    if (selectedSpecialties.includes(id)) {
      if (selectedSpecialties.length === 1) {
        alert("At least 1 Primary Specialty must remain selected.");
        return;
      }
      setSelectedSpecialties(selectedSpecialties.filter((item) => item !== id));
    } else {
      setSelectedSpecialties([...selectedSpecialties, id]);
    }
  };

  const handleConfirmPurchase = async () => {
    const res = await SpecialtyMonetizationService.purchaseSpecialties({
      memberId,
      selectedSpecialtiesArray: selectedSpecialties,
    });

    setStatusMsg(`🎉 Successfully unlocked ${res.unlockedCount} Core Specialty Badges! Fee Charged: ₹${res.feeCharged}`);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WorkspacePremiumIcon sx={{ color: "#fcd34d", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              Multi-Specialty Core Badge Unlock Studio — {memberName}
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Category (General/OBC/SC/ST) = FREE | 1st Specialty = FREE | Additional Specialties = +₹500 / 500 Tokens each
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, maxHeight: 420, overflowY: "auto" }}>
        {statusMsg && <Alert severity="success" sx={{ mb: 2, bgcolor: "#064e3b", color: "#6ee7b7" }}>{statusMsg}</Alert>}

        {/* PRICE SUMMARY CARD */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#1e293b", border: "1px solid #3b82f6", borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#fcd34d">
                Selected Specialties: {selectedSpecialties.length} / 12
              </Typography>
              <Typography variant="caption" color="#6ee7b7" sx={{ fontWeight: 700, display: "block" }}>
                {feeInfo.breakdownText}
              </Typography>
            </Box>

            <Chip
              label={`TOTAL PAYABLE: ₹${feeInfo.totalFee} / ${feeInfo.totalFee} Tokens`}
              color={feeInfo.totalFee === 0 ? "success" : "warning"}
              sx={{ fontWeight: 800, fontSize: "0.85rem", px: 1, py: 2 }}
            />
          </Stack>
        </Paper>

        {/* SPECIALTY SELECTION GRID */}
        <Grid container spacing={1.5}>
          {allSpecialties.map((item) => {
            const isChecked = selectedSpecialties.includes(item.id);
            return (
              <Grid item xs={12} sm={6} key={item.id}>
                <Paper
                  onClick={() => handleToggleSpecialty(item.id)}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    bgcolor: isChecked ? "#064e3b" : "#1e293b",
                    border: isChecked ? "2px solid #10b981" : "1px solid #334155",
                    borderRadius: 2,
                    transition: "0.2s",
                    "&:hover": { borderColor: "#fcd34d" },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox checked={isChecked} sx={{ color: "#10b981", "&.Mui-checked": { color: "#10b981" } }} />
                    <Box>
                      <Typography variant="body2" fontWeight={800} color={isChecked ? "#a7f3d0" : "#ffffff"}>
                        {item.rankIcon} {item.name}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleConfirmPurchase} sx={{ fontWeight: 800, px: 3 }}>
          Unlock Selected ({selectedSpecialties.length}) Badges — Pay ₹{feeInfo.totalFee}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SpecialtyUpgradeModal;
