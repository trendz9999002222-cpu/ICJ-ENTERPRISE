import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CertificateService from "../../services/certificateService";

export default function MasterCertificateModal({ open, onClose, member }) {
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  let certData = null;
  let validationError = null;

  try {
    certData = CertificateService.getOrCreateCertificate(member);
  } catch (err) {
    validationError = err.message;
  }

  const handlePrint = () => {
    if (certData) {
      CertificateService.printCertificate(certData);
    }
  };

  const handleOpenFull = () => {
    if (certData) {
      CertificateService.openCertificatePreview(certData);
    }
  };

  const handleCopyLink = () => {
    if (certData?.verification_qr) {
      navigator.clipboard.writeText(certData.verification_qr);
      setCopied(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#0f172a",
          color: "#ffffff",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", py: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <VerifiedUserIcon sx={{ color: "#f59e0b" }} />
          <Typography variant="h6" fontWeight={800} color="#f8fafc">
            Official Member Registration Certificate Preview
          </Typography>
          {certData && (
            <Chip
              label={certData.certificate_number}
              size="small"
              sx={{ bgcolor: "#1e293b", color: "#f59e0b", fontFamily: "monospace", fontWeight: 700 }}
            />
          )}
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 3 }, bgcolor: "#0b1120", display: "flex", justifyContent: "center" }}>
        {validationError ? (
          <Alert severity="error" sx={{ width: "100%", my: 4 }}>
            {validationError}
          </Alert>
        ) : (
          <Box
            sx={{
              width: "100%",
              maxWidth: "980px",
              height: "620px",
              bgcolor: "#ffffff",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
            }}
          >
            <iframe
              title="Certificate Preview"
              srcDoc={CertificateService.renderMasterCertificateHTML(certData)}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #334155", p: 2.5, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Copy Official Verification URL">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{ color: "#94a3b8", borderColor: "#475569" }}
            >
              Copy Verify Link
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenFull}
            sx={{ color: "#38bdf8", borderColor: "#0284c7" }}
          >
            Open in Full Window
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose} sx={{ color: "#94a3b8" }}>
            Close
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ fontWeight: 800, px: 3, bgcolor: "#d97706", "&:hover": { bgcolor: "#b45309" } }}
          >
            Print & Export PDF
          </Button>
        </Stack>
      </DialogActions>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Verification Link copied to clipboard!"
      />
    </Dialog>
  );
}
