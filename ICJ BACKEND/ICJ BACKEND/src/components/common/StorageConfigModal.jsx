import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import StorageIcon from "@mui/icons-material/Storage";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import ShieldIcon from "@mui/icons-material/Shield";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";

import StorageAbstractionService, { STORAGE_PROVIDERS } from "../../services/storage/storageAbstractionService.js";

export default function StorageConfigModal({
  open = false,
  memberId = "default",
  onClose = () => {},
}) {
  const [config, setConfig] = useState({
    provider: STORAGE_PROVIDERS.ICJ_DEFAULT,
    bucketName: "icj-legal-sovereign-vault",
    region: "ap-south-1 (Mumbai)",
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      const active = StorageAbstractionService.getConfig(memberId);
      setConfig(active);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [open, memberId]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await StorageAbstractionService.testConnection(config);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    StorageAbstractionService.saveConfig(memberId, config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#0a192f", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.8 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <ShieldIcon sx={{ color: "#38bdf8", fontSize: 26 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing={0.3}>
            Client-Controlled Sovereign Storage (BYOS)
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2.5, fontWeight: 600, fontSize: "0.82rem" }}>
          <strong>Data Sovereignty Guarantee:</strong> Your confidential legal evidence, recordings, and pleadings remain strictly inside your designated storage repository. ICJ operates as a stateless processing & analysis layer.
        </Alert>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2, fontWeight: 700 }}>
            Storage Configuration Saved & Verified!
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* PROVIDER SELECTOR */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#ffffff" }}>
            <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
              SELECT STORAGE REPOSITORY (स्टोरेज प्रकार चुनें)
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={config.provider}
              onChange={(e) => setConfig((p) => ({ ...p, provider: e.target.value }))}
            >
              <MenuItem value={STORAGE_PROVIDERS.ICJ_DEFAULT}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShieldIcon color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>ICJ Default Sovereign Vault (AES-256 Encrypted)</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value={STORAGE_PROVIDERS.S3_COMPATIBLE}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CloudQueueIcon color="secondary" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>Custom Amazon S3 / Cloudflare R2 / MinIO (BYOS)</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value={STORAGE_PROVIDERS.GOOGLE_DRIVE}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AddToDriveIcon color="success" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>Google Drive / Cloud Drive (Auto-Folder Sync)</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value={STORAGE_PROVIDERS.LOCAL_VAULT}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StorageIcon color="warning" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>Local Air-Gapped Device Vault (Zero Cloud)</Typography>
                </Stack>
              </MenuItem>
            </TextField>
          </Paper>

          {/* S3 / R2 PARAMETERS */}
          {config.provider === STORAGE_PROVIDERS.S3_COMPATIBLE && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#1e3a8a" gutterBottom>
                S3 / R2 BUCKET CREDENTIALS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bucket Name *"
                    fullWidth
                    size="small"
                    value={config.bucketName || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, bucketName: e.target.value }))}
                    placeholder="e.g. client-legal-matters"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Region"
                    fullWidth
                    size="small"
                    value={config.region || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, region: e.target.value }))}
                    placeholder="e.g. ap-south-1"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="S3 Endpoint URL *"
                    fullWidth
                    size="small"
                    value={config.endpoint || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, endpoint: e.target.value }))}
                    placeholder="e.g. https://<account>.r2.cloudflarestorage.com"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Access Key ID"
                    fullWidth
                    size="small"
                    value={config.accessKeyId || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, accessKeyId: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Secret Access Key"
                    type="password"
                    fullWidth
                    size="small"
                    value={config.secretAccessKey || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, secretAccessKey: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* TEST CONNECTION BUTTON & RESULT */}
          <Box>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={testing ? <CircularProgress size={16} /> : <SyncIcon />}
              onClick={handleTestConnection}
              disabled={testing}
              sx={{ fontWeight: 800, py: 1 }}
            >
              Test Storage Connection & Validate Permissions
            </Button>

            {testResult && (
              <Alert severity={testResult.success ? "success" : "error"} sx={{ mt: 1.5, fontWeight: 600 }}>
                {testResult.message}
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f1f5f9" }}>
        <Button variant="outlined" onClick={onClose} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontWeight: 900, px: 3 }}>
          Save & Activate Sovereign Storage ➔
        </Button>
      </DialogActions>
    </Dialog>
  );
}
