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
  Typography,
} from "@mui/material";

export default function DocumentVersionDialog({
  open,
  onClose,
  documentItem,
  versions,
  canUploadVersion,
  onUploadVersion,
}) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);

  const submit = async () => {
    if (!file) {
      alert("Please choose a file for version upload.");
      return;
    }
    await onUploadVersion({ file, note });
    setFile(null);
    setNote("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Version History{documentItem?.documentNo ? ` - ${documentItem.documentNo}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {canUploadVersion ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} md={5}>
              <Button variant="outlined" component="label" fullWidth sx={{ height: 56 }}>
                {file ? file.name : "Choose New Version File"}
                <input hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </Button>
            </Grid>
            <Grid xs={12} md={5}>
              <TextField
                fullWidth
                label="Version Note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Grid>
            <Grid xs={12} md={2}>
              <Button variant="contained" fullWidth sx={{ height: 56 }} onClick={submit}>
                Upload
              </Button>
            </Grid>
          </Grid>
        ) : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Uploaded At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No versions available.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              versions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.version || "-"}</TableCell>
                  <TableCell>{item.fileName || "-"}</TableCell>
                  <TableCell>{item.fileType || "-"}</TableCell>
                  <TableCell>{Number(item.fileSize || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{item.note || "-"}</TableCell>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
