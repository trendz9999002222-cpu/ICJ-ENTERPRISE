import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DescriptionIcon from "@mui/icons-material/Description";

export default function LitigationFundingApply({ clientUser, onApplySuccess }) {
  const [expectedRecovery, setExpectedRecovery] = useState(500000);
  const [initialCapacity, setInitialCapacity] = useState(5000);
  const [successFeePercent, setSuccessFeePercent] = useState(15);
  
  // States for eSign
  const [esignOpen, setEsignOpen] = useState(false);
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [signing, setSigning] = useState(false);
  const [esignSuccess, setEsignSuccess] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleOpenEsign = () => {
    if (initialCapacity < 0 || expectedRecovery <= 0) {
      setMsg({ type: "error", text: "कृपया मान्य राशि दर्ज करें।" });
      return;
    }
    setEsignOpen(true);
  };

  const handleSendOtp = () => {
    if (aadhaar.length !== 12 || isNaN(Number(aadhaar))) {
      alert("कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।");
      return;
    }
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setOtpSent(true);
    }, 1500);
  };

  const handleVerifyOtpAndSign = () => {
    if (!otp) {
      alert("कृपया ओटीपी दर्ज करें।");
      return;
    }
    setSigning(true);
    // Simulate Aadhaar eSign verification
    setTimeout(() => {
      setSigning(false);
      setEsignSuccess(true);
      setEsignOpen(false);
      setMsg({ type: "success", text: "त्रिपक्षीय ई-समझौते पर आधार ओटीपी के माध्यम से डिजिटल हस्ताक्षर सफलतापूर्वक कर दिए गए हैं!" });
      if (onApplySuccess) {
        onApplySuccess({
          isFundingRequested: true,
          fundingStatus: "ACTIVE_FUNDING",
          initialCapacityAmount: initialCapacity,
          successFeePercent: successFeePercent,
          eSignStatus: "FULLY_EXECUTED",
          eSignDocumentUrl: "https://icj-agreements.s3.amazonaws.com/fully-signed-9901.pdf"
        });
      }
    }, 2000);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 3, maxWidth: 600, margin: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            डिफर्ड फीस एवं लीगल फंडिंग आवेदन (Deferred Payout Application)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            गरीब/असमर्थ मुवक्किलों के लिए आईसीजे ट्रस्ट की तरफ से केस फंडिंग और ऑनलाइन ई-अग्रीमेंट।
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2.5, borderRadius: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          type="number"
          label="अपेक्षित रिकवरी/हर्जाना राशि (Expected Recovery Amount ₹)"
          value={expectedRecovery}
          onChange={(e) => setExpectedRecovery(Number(e.target.value))}
        />

        <TextField
          fullWidth
          type="number"
          label="तत्काल शुरुआती भुगतान क्षमता (Initial Capacity Payment ₹)"
          value={initialCapacity}
          onChange={(e) => setInitialCapacity(Number(e.target.value))}
          placeholder="आप अभी कितना भुगतान कर सकते हैं"
        />

        <TextField
          fullWidth
          type="number"
          label="सफलता शुल्क हिस्सा (Success Fee Percentage %)"
          value={successFeePercent}
          disabled
          helperText="सफलता मिलने पर हर्जाने का 15% हिस्सा ट्रस्ट और वकील के एस्क्रो में जाएगा"
        />

        <Button
          variant="contained"
          onClick={handleOpenEsign}
          disabled={esignSuccess}
          startIcon={<BorderColorIcon />}
          sx={{
            fontWeight: "bold",
            py: 1.2,
            bgcolor: "#7c3aed",
            "&:hover": { bgcolor: "#6d28d9" },
            borderRadius: 2,
          }}
        >
          {esignSuccess ? "आवेदन हस्ताक्षरित है (Signed)" : "अनुबंध की समीक्षा करें और ई-साइन करें"}
        </Button>
      </Stack>

      {/* Tripartite Agreement & Aadhaar eSign Dialog */}
      <Dialog open={esignOpen} onClose={() => !signing && setEsignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <VerifiedUserIcon color="primary" /> त्रिपक्षीय ई-समझौता (Tripartite e-Agreement)
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ maxHeight: 200, overflowY: "auto", bgcolor: "#f8fafc", p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold">त्रिपक्षीय कानूनी समझौता (tripartite Legal Deed)</Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1, whiteSpace: "pre-line" }}>
              यह समझौता आज दिनांक को मुवक्किल ({clientUser?.name || "Client"}), आईसीजे प्रमाणित वकील और आईसीजे ट्रस्ट (कंपनी ऑपरेटर) के बीच निष्पादित किया जा रहा है:
              
              1. **प्रारंभिक देयता**: मुवक्किल अपनी वर्तमान आर्थिक क्षमता के अनुसार ₹{initialCapacity} का प्रारंभिक भुगतान करेगा।
              2. **डिफर्ड फीस**: वकील की शेष फ़ीस को स्थगित (Defer) रखा जाएगा जो केस जीतने पर ही देय होगी।
              3. **सफलता कमीशन**: केस का निर्णय मुवक्किल के पक्ष में होने पर, कुल वसूल की गई राशि का {successFeePercent}% हिस्सा स्वचालित रूप से ट्रस्ट के पूल्ड एस्क्रो खाते में जमा होगा, जिसे एस्क्रो लियन नियमों के अनुसार रिलीज किया जाएगा।
              4. **मध्यस्थता**: विवाद की स्थिति में, ट्रस्ट की ग्रीवांस कमेटी का निर्णय सर्वोपरि व दोनों पक्षों पर कानूनी रूप से बाध्यकारी होगा।
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">आधार ई-साइन (Aadhaar eSign Verification):</Typography>
            <TextField
              fullWidth
              label="12-अंकों का आधार नंबर"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              disabled={otpSent || signing}
              placeholder="0000 0000 0000"
              inputProps={{ maxLength: 12 }}
            />

            {otpSent && (
              <TextField
                fullWidth
                label="आधार ओटीपी दर्ज करें (Enter OTP)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={signing}
                placeholder="6-digit OTP code"
                inputProps={{ maxLength: 6 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEsignOpen(false)} disabled={signing} color="inherit">
            रद्द करें
          </Button>
          {!otpSent ? (
            <Button variant="contained" onClick={handleSendOtp} disabled={signing}>
              {signing ? <CircularProgress size={20} color="inherit" /> : "ओटीपी भेजें (Send OTP)"}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleVerifyOtpAndSign} disabled={signing}>
              {signing ? <CircularProgress size={20} color="inherit" /> : "सत्यापित करें और हस्ताक्षर करें"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
