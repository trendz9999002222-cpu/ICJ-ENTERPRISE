import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import TokenService from "../services/tokenService";
import TokenDashboard from "../components/token/TokenDashboard";
import TokenTransactionTable from "../components/token/TokenTransactionTable";
import useAuth from "../hooks/useAuth";

export default function Tokens() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const permissions = TokenService.getPermissions(role);

  const [master, setMaster] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [reports, setReports] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    Promise.resolve().then(async () => {
      const [masterRow, tokenRows, reportRows, historyRows] = await Promise.all([
        TokenService.getMaster(),
        TokenService.getAll(),
        TokenService.getReports(),
        TokenService.getTransactionHistory({}, role, profile),
      ]);

      setMaster(masterRow || null);
      setTokens(Array.isArray(tokenRows) ? tokenRows : []);
      setReports(reportRows || null);
      setTransactions(Array.isArray(historyRows) ? historyRows : []);
    });
  }, [profile, role]);

  const filteredRows = useMemo(() => {
    const keyword = String(search || "").toLowerCase();
    return transactions.filter((item) => {
      const matchesType = typeFilter === "ALL" || String(item.type || "") === typeFilter;
      const matchesStatus = statusFilter === "ALL" || String(item.status || "") === statusFilter;
      const matchesSearch =
        !keyword ||
        String(item.tokenNo || "").toLowerCase().includes(keyword) ||
        String(item.referenceNo || "").toLowerCase().includes(keyword) ||
        String(item.narration || "").toLowerCase().includes(keyword);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const total = useMemo(() => Number(reports?.netSupply || 0), [reports]);

  const exportExcel = () => {
    if (!permissions.canExport) return;
    const payload = TokenService.buildExcelExport(filteredRows);
    const blob = new Blob([payload.content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = payload.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!permissions.canExport) return;
    const html = TokenService.buildPdfHtml(filteredRows, "Token Report");
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Token Reports
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Token dashboard, history, filters, and export.
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">Net Token Supply</Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {total.toLocaleString("en-IN")}
          </Typography>
        </Paper>

        <TokenDashboard tokens={tokens} reports={reports} master={master} />

        <Paper sx={{ p: 2, mt: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField fullWidth select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ISSUE">Issue</MenuItem>
                <MenuItem value="ALLOCATION">Allocation</MenuItem>
                <MenuItem value="TRANSFER">Transfer</MenuItem>
                <MenuItem value="REDEMPTION">Redemption</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField fullWidth select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="Posted">Posted</MenuItem>
                <MenuItem value="Allocated">Allocated</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={exportExcel} disabled={!permissions.canExport}>
              Export Excel
            </Button>
            <Button variant="outlined" onClick={exportPdf} disabled={!permissions.canExport}>
              Export PDF
            </Button>
          </Box>
        </Paper>

        <TokenTransactionTable title="Token Transaction History" rows={filteredRows} />
      </Box>
    </MainLayout>
  );
}

