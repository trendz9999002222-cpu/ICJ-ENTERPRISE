import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

const positive = new Set(["ISSUE", "ALLOCATION", "TRANSFER_IN"]);

export default function TokenTransactionTable({ title, rows = [] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Token No</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Member</TableCell>
            <TableCell>To Member</TableCell>
            <TableCell>Wallet</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No token transactions found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => {
              const type = String(item.type || "").toUpperCase();
              const isPositive = positive.has(type) || (type === "TRANSFER" && !item.toMemberId);
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}</TableCell>
                  <TableCell>{item.tokenNo || "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={type || "-"} color={isPositive ? "success" : "warning"} />
                  </TableCell>
                  <TableCell>{item.memberId || "-"}</TableCell>
                  <TableCell>{item.toMemberId || "-"}</TableCell>
                  <TableCell>{item.walletId || "-"}</TableCell>
                  <TableCell>{item.referenceNo || "-"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {`${isPositive ? "+" : "-"}${Number(item.amount || 0).toLocaleString("en-IN")}`}
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
