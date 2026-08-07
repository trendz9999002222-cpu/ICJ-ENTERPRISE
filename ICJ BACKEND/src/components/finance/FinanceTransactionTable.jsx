import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
} from "@mui/material";

const positiveTypes = new Set(["INCOME", "RECEIPT", "CREDIT", "TOKEN", "DONATION"]);

export default function FinanceTransactionTable({
  title,
  rows = [],
  showExport = false,
  onExport,
  exportLabel = "Export",
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      {showExport ? (
        <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={onExport}>
          {exportLabel}
        </Button>
      ) : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Voucher</TableCell>
            <TableCell>Head</TableCell>
            <TableCell>Mode</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const positive =
                row.direction === "IN" || positiveTypes.has(String(row.type || "").toUpperCase());
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "-"}
                  </TableCell>
                  <TableCell>{row.source || "Finance"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.type || "-"}
                      color={positive ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>{row.reference || "-"}</TableCell>
                  <TableCell>{row.voucherNo || "-"}</TableCell>
                  <TableCell>{row.accountHeadName || "-"}</TableCell>
                  <TableCell>{row.mode || "-"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {`${positive ? "+" : "-"}₹${Number(row.amount || 0).toLocaleString("en-IN")}`}
                  </TableCell>
                  <TableCell>{row.status || "Posted"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
