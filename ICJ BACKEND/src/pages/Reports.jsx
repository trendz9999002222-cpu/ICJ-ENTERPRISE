import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ReportingService from "../services/reportingService";
import useAuth from "../hooks/useAuth";

export default function Reports() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const access = ReportingService.getAccess(role);
  const moduleOptions = ReportingService.getModuleOptions(role);

  const [summaryRows, setSummaryRows] = useState([]);
  const [selectedModule, setSelectedModule] = useState(moduleOptions[0]?.key || "dashboard");
  const [report, setReport] = useState({
    rows: [],
    columns: [],
    summary: [],
    chart: [],
    filterOptions: { statuses: [], types: [] },
    moduleLabel: "Report",
    moduleKey: "dashboard",
    generatedAt: new Date().toISOString(),
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    type: "ALL",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  const effectiveModule = useMemo(() => {
    const exists = moduleOptions.some((option) => option.key === selectedModule);
    if (exists) return selectedModule;
    return moduleOptions[0]?.key || "dashboard";
  }, [moduleOptions, selectedModule]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, moduleReport] = await Promise.all([
        ReportingService.getSummaryDashboard(filters, role, profile),
        ReportingService.getModuleReport(effectiveModule, filters, role, profile),
      ]);

      setSummaryRows(Array.isArray(summary) ? summary : []);
      setReport(
        moduleReport || {
          rows: [],
          columns: [],
          summary: [],
          chart: [],
          filterOptions: { statuses: [], types: [] },
          moduleLabel: "Report",
          moduleKey: "dashboard",
          generatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("[Reports] Failed to load report data:", error);
      alert(error?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [effectiveModule, filters, profile, role]);

  useEffect(() => {
    Promise.resolve().then(loadReports);
  }, [loadReports]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      type: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  const onExportExcel = () => {
    if (!access.canExportExcel) {
      alert("You do not have permission to export Excel reports.");
      return;
    }
    ReportingService.exportExcel(report);
  };

  const onExportCsv = () => {
    if (!access.canExportExcel) {
      alert("You do not have permission to export CSV reports.");
      return;
    }
    ReportingService.exportCsv(report);
  };

  const onExportPdf = () => {
    if (!access.canExportPdf) {
      alert("You do not have permission to export PDF reports.");
      return;
    }
    ReportingService.exportPdf(report);
  };

  const onPrint = () => {
    if (!access.canPrint) {
      alert("You do not have permission to print reports.");
      return;
    }
    ReportingService.print(report);
  };

  const maxChartValue = useMemo(
    () => report.chart.reduce((max, item) => Math.max(max, Number(item.value || 0)), 0),
    [report.chart]
  );

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString("en-IN");
    }
    return String(value ?? "-");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reports and Analytics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Role: {role.toUpperCase()} | Accessible Reports: {moduleOptions.map((item) => item.label).join(", ")}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryRows.map((item) => (
          <Grid xs={12} sm={6} md={3} key={item.moduleKey}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {item.moduleLabel}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                {Number(item.records || 0).toLocaleString("en-IN")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Amount: {Number(item.amount || 0).toLocaleString("en-IN")}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} md={2}>
          <TextField
            fullWidth
            select
            label="Module"
            value={effectiveModule}
            onChange={(event) => setSelectedModule(event.target.value)}
          >
            {moduleOptions.map((item) => (
              <MenuItem key={item.key} value={item.key}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={2}>
          <TextField fullWidth label="Search" name="search" value={filters.search} onChange={onChange} />
        </Grid>
        <Grid xs={12} md={2}>
          <TextField fullWidth select label="Status" name="status" value={filters.status} onChange={onChange}>
            <MenuItem value="ALL">All</MenuItem>
            {report.filterOptions.statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={2}>
          <TextField fullWidth select label="Type" name="type" value={filters.type} onChange={onChange}>
            <MenuItem value="ALL">All</MenuItem>
            {report.filterOptions.types.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={2}>
          <TextField
            fullWidth
            type="date"
            label="From"
            name="startDate"
            value={filters.startDate}
            onChange={onChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid xs={12} md={2}>
          <TextField
            fullWidth
            type="date"
            label="To"
            name="endDate"
            value={filters.endDate}
            onChange={onChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12}>
          <Button variant="contained" onClick={loadReports} disabled={loading} sx={{ mr: 1 }}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outlined" onClick={clearFilters} sx={{ mr: 1 }}>
            Clear Filters
          </Button>
          <Button variant="outlined" onClick={onExportExcel} disabled={!access.canExportExcel} sx={{ mr: 1 }}>
            Excel Export
          </Button>
          <Button variant="outlined" onClick={onExportCsv} disabled={!access.canExportExcel} sx={{ mr: 1 }}>
            CSV Export
          </Button>
          <Button variant="outlined" onClick={onExportPdf} disabled={!access.canExportPdf} sx={{ mr: 1 }}>
            PDF Export
          </Button>
          <Button variant="outlined" onClick={onPrint} disabled={!access.canPrint}>
            Print
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {report.moduleLabel} Summary
            </Typography>
            {report.summary.map((item) => (
              <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography color="text.secondary">{item.label}</Typography>
                <Typography fontWeight="bold">{formatValue(item.value)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generated at: {new Date(report.generatedAt).toLocaleString()}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Chart ({report.moduleLabel})
            </Typography>
            {report.chart.length === 0 ? (
              <Typography color="text.secondary">No chart data available.</Typography>
            ) : (
              report.chart.map((item) => {
                const width = maxChartValue > 0 ? Math.max(8, (Number(item.value || 0) / maxChartValue) * 100) : 0;
                return (
                  <Box key={item.label} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" fontWeight="bold">{formatValue(item.value)}</Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 10, borderRadius: 999, backgroundColor: "#E9ECEF" }}>
                      <Box sx={{ width: `${width}%`, height: 10, borderRadius: 999, backgroundColor: "#0B5ED7" }} />
                    </Box>
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {report.moduleLabel} Details
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  {report.columns.map((column) => (
                    <TableCell key={column.key}>{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={report.columns.length || 1} align="center">
                      No records found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.rows.map((item) => (
                    <TableRow key={item.id}>
                      {report.columns.map((column) => (
                        <TableCell key={`${item.id}-${column.key}`}>
                          {formatValue(item[column.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

