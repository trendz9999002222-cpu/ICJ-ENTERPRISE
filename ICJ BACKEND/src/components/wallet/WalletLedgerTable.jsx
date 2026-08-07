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

const inTypes = new Set(["CREDIT", "INCOME", "RECEIPT"]);

export default function WalletLedgerTable({ rows = [], onExport, canExport }) {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Wallet Ledger
      </Typography>

      {canExport ? (
        <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={onExport}>
          Export Ledger
        </Button>
      ) : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Wallet</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Voucher</TableCell>
            <TableCell>Mode</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No wallet ledger entries found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => {
              const isIn = item.direction === "IN" || inTypes.has(item.type);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.type || "-"}
                      color={isIn ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>{item.walletId || "-"}</TableCell>
                  <TableCell>{item.referenceNo || item.id}</TableCell>
                  <TableCell>{item.voucherNo || "-"}</TableCell>
                  <TableCell>{item.mode || "Wallet"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {`${isIn ? "+" : "-"}₹${Number(item.amount || 0).toLocaleString("en-IN")}`}
                  </TableCell>
                  <TableCell>{item.status || "Posted"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
