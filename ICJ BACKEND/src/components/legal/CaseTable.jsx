import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

export default function CaseTable({
  rows,
  canEdit,
  canDelete,
  onChangeStatus,
  onViewTimeline,
  onOpenLinking,
  onDelete,
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Case Management
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Case No</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Court</TableCell>
            <TableCell>Advocate</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Next Hearing</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No legal cases found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.caseNumber || item.case_number || "-"}</TableCell>
                <TableCell>{item.title || "-"}</TableCell>
                <TableCell>{item.clientName || "-"}</TableCell>
                <TableCell>{item.courtName || "-"}</TableCell>
                <TableCell>{item.advocateName || "-"}</TableCell>
                <TableCell>
                  {canEdit ? (
                    <TextField
                      select
                      size="small"
                      value={item.status || "Pending"}
                      onChange={(event) => onChangeStatus(item, event.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="On Hold">On Hold</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </TextField>
                  ) : (
                    item.status || "Pending"
                  )}
                </TableCell>
                <TableCell>{item.nextHearing || "-"}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => onViewTimeline(item)}>
                      Timeline
                    </Button>
                    <Button size="small" onClick={() => onOpenLinking(item)}>
                      Links
                    </Button>
                    {canDelete ? (
                      <Button size="small" color="error" onClick={() => onDelete(item)}>
                        Delete
                      </Button>
                    ) : null}
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
