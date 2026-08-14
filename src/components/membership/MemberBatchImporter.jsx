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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import MemberBatchService from "../../services/memberBatchService.js";

function MemberBatchImporter({ open = false, onClose = () => {}, onImportSuccess = () => {} }) {
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const shareableUrl = typeof window !== "undefined" ? `${window.location.origin}/register/member?ref=HQ` : "https://icj.law/register/member";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = MemberBatchService.parseCSVText(text);
      setParsedRows(rows);
      setStatusMsg(`Parsed ${rows.length} member records from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    const res = await MemberBatchService.importBatch(parsedRows);
    setStatusMsg(`✅ Successfully imported ${res.count} member profiles into Database!`);
    setTimeout(() => {
      onImportSuccess();
      onClose();
    }, 1500);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <FileUploadIcon sx={{ color: "#fcd34d", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              Excel / CSV Batch Auto-Importer & Shareable Self-Registration Links
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Zero-typing onboarding studio for bulk member loading and digital shareable links
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {statusMsg && <Alert severity="success" sx={{ mb: 2, bgcolor: "#064e3b", color: "#6ee7b7" }}>{statusMsg}</Alert>}

        {/* 1. SHAREABLE LINK SECTION */}
        <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkIcon /> 1. Shareable Public Self-Registration Web Link (डिजिटल ऑनलाइन फॉर्म लिंक)
          </Typography>
          <Typography variant="caption" color="#cbd5e1" sx={{ display: "block", mb: 1.5 }}>
            Send this link via WhatsApp/Email to Members or Advocates. Data lands directly in Admin Pending Queue!
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Paper sx={{ p: 1, px: 2, bgcolor: "#0f172a", border: "1px solid #475569", flexGrow: 1, borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={700} color="#38bdf8">
                {shareableUrl}
              </Typography>
            </Paper>
            <Button variant="contained" color={copiedLink ? "success" : "primary"} onClick={handleCopyLink} sx={{ fontWeight: 800 }}>
              {copiedLink ? "Copied! 📋" : "Copy Link 📋"}
            </Button>
          </Stack>
        </Paper>

        {/* 2. EXCEL BATCH UPLOAD SECTION */}
        <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileUploadIcon /> 2. Upload Excel / CSV File (एक्सेल फाइल से डायरेक्ट लोड करें)
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Button variant="outlined" color="warning" startIcon={<DownloadIcon />} onClick={() => MemberBatchService.downloadTemplate()} sx={{ fontWeight: 800 }}>
              Download Standard Excel Template (.csv)
            </Button>

            <Button variant="contained" color="success" component="label" startIcon={<FileUploadIcon />} sx={{ fontWeight: 800 }}>
              Upload Excel / CSV File
              <input type="file" accept=".csv, .xlsx" hidden onChange={handleFileUpload} />
            </Button>
          </Stack>

          {parsedRows.length > 0 && (
            <Box>
              <Typography variant="caption" color="#6ee7b7" mb={1} sx={{ display: "block", fontWeight: 700 }}>
                Parsed {parsedRows.length} Rows from {fileName}:
              </Typography>
              <Paper sx={{ maxHeight: 200, overflowY: "auto", bgcolor: "#0f172a" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { color: "#fcd34d", fontWeight: 800 } }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Profession</TableCell>
                      <TableCell>Court</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>District</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedRows.slice(0, 5).map((row) => (
                      <TableRow key={row.id} sx={{ "& td": { color: "#ffffff" } }}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.profession}</TableCell>
                        <TableCell>{row.courtName}</TableCell>
                        <TableCell>{row.casteCategory}</TableCell>
                        <TableCell>{row.district}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ color: "#94a3b8" }}>
          Close
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={parsedRows.length === 0}
          startIcon={<CheckCircleIcon />}
          onClick={handleExecuteImport}
          sx={{ fontWeight: 800, px: 3 }}
        >
          Confirm & Import {parsedRows.length} Members
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MemberBatchImporter;
