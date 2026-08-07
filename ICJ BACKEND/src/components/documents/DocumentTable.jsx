import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Stack,
} from "@mui/material";

export default function DocumentTable({
  rows,
  onPreview,
  onDownload,
  onOpenVersions,
  onOpenAudit,
  onDelete,
  canDelete,
  canVersion,
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Stored Documents
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Document No</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No documents found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.documentNo || item.document_no || "-"}</TableCell>
                <TableCell>{item.title || "-"}</TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>{item.moduleType || "General"}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                    {(item.tags || []).slice(0, 3).map((tag) => (
                      <Chip key={`${item.id}-${tag}`} size="small" label={tag} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{item.currentVersion || 1}</TableCell>
                <TableCell>{item.owner || "-"}</TableCell>
                <TableCell>{item.status || "Active"}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button size="small" onClick={() => onPreview(item)}>Preview</Button>
                    <Button size="small" onClick={() => onDownload(item)}>Download</Button>
                    {canVersion ? <Button size="small" onClick={() => onOpenVersions(item)}>Versions</Button> : null}
                    <Button size="small" onClick={() => onOpenAudit(item)}>Audit</Button>
                    {canDelete ? <Button size="small" color="error" onClick={() => onDelete(item)}>Delete</Button> : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
