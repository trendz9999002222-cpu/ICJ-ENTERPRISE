import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import MemberService from "../../services/memberService";

export default function MyAdvocateSettings({ clientUser, onUpdate }) {
  const [advocateId, setAdvocateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  
  // Payment Dialog state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [waived, setWaived] = useState(false);
  const [validatedAdvocate, setValidatedAdvocate] = useState(null);

  // Check if admin has already waived the transfer fee for this client
  useEffect(() => {
    if (clientUser && (clientUser.waiveSwitchFee || clientUser.waive_switch_fee)) {
      setWaived(true);
    }
  }, [clientUser]);

  const handleValidateAndInitiate = async () => {
    if (!advocateId.trim()) {
      setMsg({ type: "error", text: "कृपया वकील की यूनिक मेंबर आईडी दर्ज करें।" });
      return;
    }

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const allMembers = await MemberService.getAll();
      const advocate = allMembers.find(
        (m) =>
          (m.memberId === advocateId.trim() || m.id === advocateId.trim()) &&
          (m.role === "lawyer" || m.profession?.toLowerCase().includes("advocate") || m.profession?.toLowerCase().includes("lawyer"))
      );

      if (!advocate) {
        setMsg({ type: "error", text: "वकील आईडी अमान्य है या इस आईडी का कोई वकील पंजीकृत नहीं है।" });
        setLoading(false);
        return;
      }

      if (advocate.id === clientUser.parentMemberId) {
        setMsg({ type: "warning", text: "यह वकील पहले से ही आपके अकाउंट से लिंक है।" });
        setLoading(false);
        return;
      }

      setValidatedAdvocate(advocate);

      // If fee is waived by admin, skip payment
      if (waived) {
        handleCompleteTransfer(advocate.id, true);
      } else {
        setPaymentOpen(true);
      }
    } catch (err) {
      setMsg({ type: "error", text: "सत्यापन विफल रहा। कृपया पुनः प्रयास करें।" });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransfer = async (newParentId, isWaived = false) => {
    setLoading(true);
    try {
      await MemberService.update(clientUser.id, { parentMemberId: newParentId });
      
      const updatedUser = {
        ...clientUser,
        parentMemberId: newParentId,
      };

      setMsg({ type: "success", text: "वकील सफलता पूर्वक बदल दिया गया है!" });
      setPaymentOpen(false);
      if (onUpdate) onUpdate(updatedUser);
    } catch (err) {
      setMsg({ type: "error", text: "वकील बदलने में असमर्थ। सर्वर त्रुटि।" });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = () => {
    setPaying(true);
    // Simulate Razorpay/Gateway integration checkout flow
    setTimeout(() => {
      setPaying(false);
      handleCompleteTransfer(validatedAdvocate.id, false);
    }, 2000);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 3, maxWidth: 500, margin: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <HandshakeIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            वकील बदलें (Change Advocate Partner)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            अपने नए वकील की यूनिक आईडी डालें और सीधे संपर्क स्थापित करें।
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2.5, borderRadius: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          fullWidth
          label="वकील की यूनिक आईडी (Advocate Member ID)"
          variant="outlined"
          placeholder="उदा. 26ICJ08AA0025"
          value={advocateId}
          onChange={(e) => setAdvocateId(e.target.value)}
          disabled={loading}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleValidateAndInitiate}
          disabled={loading}
          sx={{
            fontWeight: "bold",
            py: 1.2,
            bgcolor: "#7c3aed",
            "&:hover": { bgcolor: "#6d28d9" },
            borderRadius: 2,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "सत्यापन करें और फीस भुगतान करें"}
        </Button>
      </Stack>

      {/* Switching Fee Payment Checkout Dialog */}
      <Dialog open={paymentOpen} onClose={() => !paying && setPaymentOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentIcon color="primary" /> वकील ट्रांसफर फीस भुगतान
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            नए वकील <strong>{validatedAdvocate?.name}</strong> को लिंक करने के लिए सरकारी नियमों के तहत ट्रांसफर फीस लागू है:
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">ट्रांसफर बेस फीस:</Typography>
              <Typography variant="body2" fontWeight="bold">₹1,000.00</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">जीएसटी (18%):</Typography>
              <Typography variant="body2" fontWeight="bold">₹180.00</Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight="bold">कुल देय राशि:</Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">₹1,180.00</Typography>
            </Stack>
          </Paper>

          <Alert severity="info" icon={<VerifiedUserIcon />} sx={{ borderRadius: 2 }}>
            सफल भुगतान के बाद आपका पिछला केस रिकॉर्ड नए वकील के खाते में ट्रांसफर कर दिया जाएगा।
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPaymentOpen(false)} disabled={paying} color="inherit">
            रद्द करें
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            color="success"
            disabled={paying}
            sx={{ fontWeight: "bold", borderRadius: 2 }}
          >
            {paying ? <CircularProgress size={20} color="inherit" /> : "Pay ₹1,180 with Razorpay"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
