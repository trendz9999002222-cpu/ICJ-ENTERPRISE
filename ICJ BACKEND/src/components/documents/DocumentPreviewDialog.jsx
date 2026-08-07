import { Dialog, DialogTitle, DialogContent, Box, Typography } from "@mui/material";

export default function DocumentPreviewDialog({ open, onClose, documentItem, previewUrl }) {
  const fileType = String(documentItem?.fileType || "").toLowerCase();
  const canEmbed =
    fileType.includes("pdf") ||
    fileType.includes("image") ||
    previewUrl.startsWith("data:image") ||
    previewUrl.startsWith("data:application/pdf");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Document Preview{documentItem?.documentNo ? ` - ${documentItem.documentNo}` : ""}
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 500 }}>
        {!previewUrl ? (
          <Typography color="text.secondary">Preview is not available for this document.</Typography>
        ) : canEmbed ? (
          <Box
            component="iframe"
            title="Document Preview"
            src={previewUrl}
            sx={{ width: "100%", minHeight: 460, border: 0 }}
          />
        ) : (
          <Typography color="text.secondary">
            This file type cannot be embedded. Please use download.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
