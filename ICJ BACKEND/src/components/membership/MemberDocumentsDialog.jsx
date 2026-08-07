import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function MemberDocumentsDialog({
  open,
  onClose,
  member,
  documents,
  canManage,
  onAddDocument,
  onReplaceDocument,
  onDeleteDocument,
}) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("General");
  const [file, setFile] = useState(null);

  const downloadFile = (item) => {
    if (!item?.fileDataUrl) return;
    const link = window.document.createElement("a");
    link.href = item.fileDataUrl;
    link.download = item.fileName || `${item.title || "document"}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const replaceDocument = (item) => {
    if (!canManage) return;
    const input = window.document.createElement("input");
    input.type = "file";
    input.onchange = async (event) => {
      const replacement = event.target.files?.[0] || null;
      if (!replacement) return;
      const fileDataUrl = await toDataUrl(replacement);
      const payload = {
        title: item.title || "Document",
        documentType: item.documentType || "General",
        status: item.status || "Active",
        verification_status: item.verification_status || "Pending",
        verification_remarks: item.verification_remarks || "",
        fileName: replacement.name,
        fileType: replacement.type,
        fileSize: replacement.size,
        fileDataUrl,
      };
      if (typeof onReplaceDocument === "function") {
        await onReplaceDocument(item.id, payload);
      } else {
        await onDeleteDocument(item.id);
        await onAddDocument(payload);
      }
    };
    input.click();
  };


  const onSubmit = async () => {
    if (!canManage) return;
    if (!title.trim() || !file) {
      alert("Document title and file are required.");
      return;
    }

    const fileDataUrl = await toDataUrl(file);
    await onAddDocument({
      title: title.trim(),
      documentType,
      status: "Active",
      verification_status: "Pending",
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileDataUrl,
    });

    setTitle("");
    setDocumentType("General");
    setFile(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Member Documents{member?.name ? ` - ${member.name}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {canManage ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                label="Document Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                label="Document Type"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <Button component="label" variant="outlined" fullWidth sx={{ height: 56 }}>
                {file ? file.name : "Choose File"}
                <input
                  hidden
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </Button>
            </Grid>
            <Grid xs={12} md={2}>
              <Button variant="contained" fullWidth sx={{ height: 56 }} onClick={onSubmit}>
                Attach Document
              </Button>
            </Grid>
          </Grid>
        ) : null}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verification</TableCell>
              <TableCell>History</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!documents?.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No attached documents.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title || "-"}</TableCell>
                  <TableCell>{item.fileName || "-"}</TableCell>
                  <TableCell>{item.documentType || item.fileType || "-"}</TableCell>
                  <TableCell>{item.status || "Active"}</TableCell>
                  <TableCell>{item.verification_status || "Pending"}</TableCell>
                  <TableCell>{Array.isArray(item.history) ? item.history.length : 0}</TableCell>
                  <TableCell>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => window.open(item.fileDataUrl, "_blank", "noopener,noreferrer")}
                    >
                      Preview
                    </Button>
                    <Button size="small" onClick={() => downloadFile(item)}>Download</Button>
                    {canManage ? (
                      <Button size="small" onClick={() => replaceDocument(item)}>Replace</Button>
                    ) : null}
                    {canManage ? (
                      <IconButton size="small" color="error" onClick={() => onDeleteDocument(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
