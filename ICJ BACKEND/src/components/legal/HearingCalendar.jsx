import { Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";

export default function HearingCalendar({ rows = [] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Hearing Calendar
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Case</TableCell>
            <TableCell>Court</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No hearings scheduled.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.hearingDate || "-"}</TableCell>
                <TableCell>{item.caseId || "-"}</TableCell>
                <TableCell>{item.courtName || "-"}</TableCell>
                <TableCell>{item.stage || "Hearing"}</TableCell>
                <TableCell>{item.status || "Scheduled"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
