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
import PushPinIcon from "@mui/icons-material/PushPin";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getPinnedNotes,
  addPinnedNote,
  deletePinnedNote,
} from "../../services/database";

export default function PinnedNotesCard({ profile, currentUserRole = "admin" }) {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "Normal",
    caseId: "",
    docId: "",
  });
  const [loading, setLoading] = useState(false);

  const memberIdStr = String(profile?.id || profile?.memberId || "").toLowerCase();

  const loadNotes = useCallback(async () => {
    if (!memberIdStr) return;
    try {
      const all = await getPinnedNotes();
      const filtered = (all || []).filter(
        (n) => String(n.memberId || n.member_id).toLowerCase() === memberIdStr
      );
      setNotes(filtered);
    } catch {
      setNotes([]);
    }
  }, [memberIdStr]);

  useEffect(() => {
    let active = true;
    if (!memberIdStr) return;

    getPinnedNotes().then((all) => {
      if (!active) return;
      const filtered = (all || []).filter(
        (n) => String(n.memberId || n.member_id).toLowerCase() === memberIdStr
      );
      setNotes(filtered);
    }).catch(() => {
      if (!active) return;
      setNotes([]);
    });

    return () => {
      active = false;
    };
  }, [memberIdStr]);

  const handleOpen = () => {
    setForm({
      title: "",
      content: "",
      priority: "Normal",
      caseId: "",
      docId: "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      const newNote = {
        id: `NOTE-${Date.now()}`,
        memberId: profile.id || profile.memberId,
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        pinned: true,
        caseId: form.caseId.trim() || null,
        docId: form.docId.trim() || null,
        createdBy: currentUserRole === "admin" ? "Super Admin" : "Authorized Admin User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addPinnedNote(newNote);
      await loadNotes();
      handleClose();
    } catch (err) {
      console.error("Failed to save pinned note", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePinnedNote(id);
      await loadNotes();
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Urgent") return "error";
    if (priority === "Important") return "warning";
    return "info";
  };

  if (!profile) return null;

  return (
    <Paper sx={{ p: 3, height: "100%", borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PushPinIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" color="primary">
            📌 Pinned & Sticky Notes
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ borderRadius: 1.5, fontWeight: "bold" }}
        >
          Add Note
        </Button>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />

      {notes.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          No pinned notes
        </Alert>
      ) : (
        <Stack spacing={2}>
          {notes.map((note) => (
            <Paper
              key={note.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: note.priority === "Urgent" ? "#fff8f8" : note.priority === "Important" ? "#fffbf0" : "#fafafa",
                borderColor: note.priority === "Urgent" ? "error.light" : note.priority === "Important" ? "warning.light" : "divider",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {note.title}
                    </Typography>
                    <Chip
                      label={note.priority || "Normal"}
                      color={getPriorityColor(note.priority)}
                      size="small"
                      sx={{ fontWeight: "bold", height: 20, fontSize: "0.7rem" }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                    {note.content}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    <span>By: <strong>{note.createdBy || "Admin"}</strong></span>
                    <span>Date: {new Date(note.createdAt).toLocaleString()}</span>
                    {note.caseId && <span>Case Link: <strong>{note.caseId}</strong></span>}
                    {note.docId && <span>Doc Link: <strong>{note.docId}</strong></span>}
                  </Stack>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleDelete(note.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ADD NOTE DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>📌 Add Pinned / Sticky Note</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Note Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Important Verification Instruction"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Note Content *"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write detailed notes, instructions, or follow-up details..."
            />
            <TextField
              select
              fullWidth
              label="Priority Level"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Important">Important</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Related Case Reference (Optional)"
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              placeholder="e.g. CASE-2026-1001"
            />
            <TextField
              fullWidth
              label="Related Document Reference (Optional)"
              value={form.docId}
              onChange={(e) => setForm({ ...form, docId: e.target.value })}
              placeholder="e.g. DOC-2026-99"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !form.title.trim() || !form.content.trim()}
          >
            Save Pinned Note
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
