import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

export default function CaseLinkDialog({
  open,
  onClose,
  caseItem,
  documents,
  selectedDocumentIds,
  setSelectedDocumentIds,
  onLinkDocuments,
  financeLinks,
  tokenLinks,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Case Links{caseItem?.caseNumber ? ` - ${caseItem.caseNumber}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          Document Linking
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={9}>
            <TextField
              fullWidth
              select
              SelectProps={{ multiple: true }}
              label="Documents"
              value={selectedDocumentIds}
              onChange={(event) => setSelectedDocumentIds(event.target.value)}
            >
              {documents.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.title || doc.documentNo || doc.id}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <Button variant="contained" fullWidth sx={{ height: 56 }} onClick={onLinkDocuments}>
              Link Documents
            </Button>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
          Linked Finance References
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!financeLinks?.length ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No matching finance links.</TableCell>
              </TableRow>
            ) : (
              financeLinks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</TableCell>
                  <TableCell>{item.type || "-"}</TableCell>
                  <TableCell>{item.reference || "-"}</TableCell>
                  <TableCell>{Number(item.amount || 0).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
          Linked Token References
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Token No</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!tokenLinks?.length ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No matching token links.</TableCell>
              </TableRow>
            ) : (
              tokenLinks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</TableCell>
                  <TableCell>{item.type || "-"}</TableCell>
                  <TableCell>{item.tokenNo || "-"}</TableCell>
                  <TableCell>{Number(item.amount || 0).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
