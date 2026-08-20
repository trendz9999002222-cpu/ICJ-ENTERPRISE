import { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import MailIcon from "@mui/icons-material/Mail";
import GroupsIcon from "@mui/icons-material/Groups";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import {
  getCommunicationHistory,
  addCommunicationRecord,
  deleteCommunicationRecord,
} from "../../services/database";

const INTERACTION_TYPES = [
  { label: "Phone Call", value: "Phone", icon: <PhoneIcon fontSize="small" color="primary" /> },
  { label: "WhatsApp Chat", value: "WhatsApp", icon: <WhatsAppIcon fontSize="small" color="success" /> },
  { label: "Email Correspondence", value: "Email", icon: <EmailIcon fontSize="small" color="info" /> },
  { label: "Letter / Postal Document", value: "Letter", icon: <MailIcon fontSize="small" color="secondary" /> },
  { label: "In-Person Meeting", value: "Meeting", icon: <GroupsIcon fontSize="small" color="action" /> },
  { label: "Legal Discussion", value: "Legal Discussion", icon: <GavelIcon fontSize="small" color="warning" /> },
  { label: "Follow-up", value: "Follow-up", icon: <AccessTimeIcon fontSize="small" color="error" /> },
  { label: "Internal Note", value: "Internal Note", icon: <NoteAltIcon fontSize="small" color="action" /> },
];

export default function CommunicationHistoryCard({ profile, currentUserRole = "admin" }) {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "Phone",
    subject: "",
    description: "",
    followUpDate: "",
    followUpStatus: "N/A",
    caseId: "",
    docId: "",
  });
  const [loading, setLoading] = useState(false);

  const memberIdStr = String(profile?.id || profile?.memberId || "").toLowerCase();

  const loadHistory = useCallback(async () => {
    if (!memberIdStr) return;
    try {
      const all = await getCommunicationHistory();
      const filtered = (all || [])
        .filter((r) => String(r.memberId || r.member_id).toLowerCase() === memberIdStr)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setRecords(filtered);
    } catch {
      setRecords([]);
    }
  }, [memberIdStr]);

  useEffect(() => {
    let active = true;
    if (!memberIdStr) return;

    getCommunicationHistory().then((all) => {
      if (!active) return;
      const filtered = (all || [])
        .filter((r) => String(r.memberId || r.member_id).toLowerCase() === memberIdStr)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setRecords(filtered);
    }).catch(() => {
      if (!active) return;
      setRecords([]);
    });

    return () => {
      active = false;
    };
  }, [memberIdStr]);

  const handleOpen = () => {
    setForm({
      type: "Phone",
      subject: "",
      description: "",
      followUpDate: "",
      followUpStatus: "N/A",
      caseId: "",
      docId: "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setLoading(true);
    try {
      const now = new Date();
      const newRecord = {
        id: `COMM-${Date.now()}`,
        memberId: profile.id || profile.memberId,
        type: form.type,
        subject: form.subject.trim(),
        description: form.description.trim(),
        interactionDate: now.toISOString().split("T")[0],
        interactionTime: now.toTimeString().split(" ")[0].slice(0, 5),
        followUpDate: form.followUpDate || null,
        followUpStatus: form.followUpDate ? (form.followUpStatus !== "N/A" ? form.followUpStatus : "Pending") : "N/A",
        caseId: form.caseId.trim() || null,
        docId: form.docId.trim() || null,
        createdBy: currentUserRole === "admin" ? "Super Admin" : "Authorized User",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await addCommunicationRecord(newRecord);
      await loadHistory();
      handleClose();
    } catch (err) {
      console.error("Failed to save communication record", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommunicationRecord(id);
      await loadHistory();
    } catch (err) {
      console.error("Failed to delete communication record", err);
    }
  };

  const getTypeIcon = (typeVal) => {
    const matched = INTERACTION_TYPES.find((t) => t.value === typeVal);
    return matched ? matched.icon : <ForumIcon fontSize="small" color="primary" />;
  };

  if (!profile) return null;

  return (
    <Paper sx={{ p: 3, height: "100%", borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ForumIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" color="primary">
            💬 Communication & Interaction History
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ borderRadius: 1.5, fontWeight: "bold" }}
        >
          Add Interaction Log
        </Button>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />

      {records.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          No communication history
        </Alert>
      ) : (
        <Stack spacing={2}>
          {records.map((rec) => (
            <Paper key={rec.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fafafa" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    {getTypeIcon(rec.type)}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {rec.subject}
                    </Typography>
                    <Chip
                      label={rec.type}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: "bold", height: 20, fontSize: "0.7rem" }}
                    />
                    {rec.followUpDate && (
                      <Chip
                        label={`Follow-up: ${rec.followUpDate} (${rec.followUpStatus || "Pending"})`}
                        color={rec.followUpStatus === "Completed" ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: "bold", height: 20, fontSize: "0.68rem" }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                    {rec.description}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    <span>Logged By: <strong>{rec.createdBy || "Admin"}</strong></span>
                    <span>Timestamp: {new Date(rec.createdAt).toLocaleString()}</span>
                    {rec.caseId && <span>Linked Case: <strong>{rec.caseId}</strong></span>}
                    {rec.docId && <span>Linked Document: <strong>{rec.docId}</strong></span>}
                  </Stack>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleDelete(rec.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ADD INTERACTION DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>💬 Log Interaction / Discussion</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Interaction Type *"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {INTERACTION_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {t.icon}
                    <span>{t.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Subject / Discussion Topic *"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Phone Discussion regarding Case Status"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Discussion / Interaction Details *"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Record summary of conversation, key points, or agreed actions..."
            />

            <TextField
              type="date"
              fullWidth
              label="Follow-up Date (Optional)"
              InputLabelProps={{ shrink: true }}
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            />

            {form.followUpDate && (
              <TextField
                select
                fullWidth
                label="Follow-up Status"
                value={form.followUpStatus}
                onChange={(e) => setForm({ ...form, followUpStatus: e.target.value })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            )}

            <TextField
              fullWidth
              label="Related Case Reference (Optional)"
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              placeholder="e.g. CASE-QA-2001"
            />

            <TextField
              fullWidth
              label="Related Document Reference (Optional)"
              value={form.docId}
              onChange={(e) => setForm({ ...form, docId: e.target.value })}
              placeholder="e.g. DOC-QA-101"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !form.subject.trim() || !form.description.trim()}
          >
            Save Interaction Log
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
