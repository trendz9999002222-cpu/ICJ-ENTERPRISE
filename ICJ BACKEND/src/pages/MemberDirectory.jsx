import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Collapse,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";
import MasterDataService from "../services/masterDataService";
import useAuth from "../hooks/useAuth";

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN");
};

const REPORT_PRESETS = [
  { key: "ALL", label: "All Members Directory" },
  { key: "STATE_WISE", label: "State-wise Members Report" },
  { key: "DISTRICT_WISE", label: "District-wise Members Report" },
  { key: "TEHSIL_WISE", label: "Tehsil-wise Members Report" },
  { key: "CITY_WISE", label: "City-wise Members Report" },
  { key: "VILLAGE_WISE", label: "Village-wise Members Report" },
  { key: "PINCODE_WISE", label: "PIN Code-wise Members Report" },
  { key: "PROFESSION_WISE", label: "Profession-wise Members Report" },
  { key: "TYPE_WISE", label: "Member Type-wise Report" },
  { key: "STATUS_ACTIVE", label: "Active Members Report" },
  { key: "STATUS_PENDING", label: "Pending Members Report" },
  { key: "STATUS_SUSPENDED", label: "Suspended Members Report" },
  { key: "STATUS_EXPIRED", label: "Expired Members Report" },
  { key: "STATUS_REJECTED", label: "Rejected Members Report" },
];

const defaultFilters = {
  name: "",
  member_id: "",
  profession: "ALL",
  member_type: "ALL",
  status: "ALL",
  country: "ALL",
  state: "ALL",
  district: "ALL",
  tehsil: "ALL",
  city: "ALL",
  village: "ALL",
  pincode: "",
  mobile: "",
  whatsapp: "",
  email: "",
  regStartDate: "",
  regEndDate: "",
  approvalStartDate: "",
  approvalEndDate: "",
  reportPreset: "ALL",
};

export default function MemberDirectory() {
  const { profile, user } = useAuth();
  const currentUserRole = String(profile?.role || user?.role || "Admin").toUpperCase();
  const currentUserName = profile?.name || user?.name || "System Admin";

  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (presetKey) => {
    setFilters((prev) => {
      const reset = { ...prev, reportPreset: presetKey };
      if (presetKey === "STATUS_ACTIVE") reset.status = "Active";
      if (presetKey === "STATUS_PENDING") reset.status = "Pending Verification";
      if (presetKey === "STATUS_SUSPENDED") reset.status = "Suspended";
      if (presetKey === "STATUS_EXPIRED") reset.status = "Expired";
      if (presetKey === "STATUS_REJECTED") reset.status = "Rejected";
      return reset;
    });
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const professionsList = useMemo(() => {
    return MasterDataService.getProfessions();
  }, []);

  const uniqueCountries = useMemo(() => {
    return [...new Set(members.map((m) => m.country || "India").filter(Boolean))].sort();
  }, [members]);

  const uniqueStates = useMemo(() => {
    return [...new Set(members.map((m) => m.state).filter(Boolean))].sort();
  }, [members]);

  const uniqueDistricts = useMemo(() => {
    return [...new Set(members.map((m) => m.district).filter(Boolean))].sort();
  }, [members]);

  const uniqueTehsils = useMemo(() => {
    return [...new Set(members.map((m) => m.tehsil || m.sub_division).filter(Boolean))].sort();
  }, [members]);

  const uniqueCities = useMemo(() => {
    return [...new Set(members.map((m) => m.city).filter(Boolean))].sort();
  }, [members]);

  const uniqueVillages = useMemo(() => {
    return [...new Set(members.map((m) => m.locality || m.village).filter(Boolean))].sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (filters.name && !String(m.name || "").toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.member_id && !String(m.member_id || m.id || "").toLowerCase().includes(filters.member_id.toLowerCase())) return false;
      if (filters.profession !== "ALL" && String(m.profession || "") !== filters.profession) return false;
      if (filters.member_type !== "ALL" && String(m.member_type || "") !== filters.member_type) return false;
      if (filters.status !== "ALL" && String(m.status || "").toLowerCase() !== filters.status.toLowerCase()) return false;

      if (filters.country !== "ALL" && String(m.country || "India") !== filters.country) return false;
      if (filters.state !== "ALL" && String(m.state || "") !== filters.state) return false;
      if (filters.district !== "ALL" && String(m.district || "") !== filters.district) return false;
      if (filters.tehsil !== "ALL" && String(m.tehsil || m.sub_division || "") !== filters.tehsil) return false;
      if (filters.city !== "ALL" && String(m.city || "") !== filters.city) return false;
      if (filters.village !== "ALL" && String(m.locality || m.village || "") !== filters.village) return false;
      if (filters.pincode && !String(m.pincode || m.postal_code || "").includes(filters.pincode)) return false;

      if (filters.mobile && !String(m.mobile || "").includes(filters.mobile)) return false;
      if (filters.whatsapp && !String(m.whatsapp || "").includes(filters.whatsapp)) return false;
      if (filters.email && !String(m.email || "").toLowerCase().includes(filters.email.toLowerCase())) return false;

      if (filters.regStartDate) {
        const regDate = new Date(m.created_at || m.createdAt || m.registration_date).getTime();
        if (regDate < new Date(filters.regStartDate).getTime()) return false;
      }
      if (filters.regEndDate) {
        const regDate = new Date(m.created_at || m.createdAt || m.registration_date).getTime();
        if (regDate > new Date(filters.regEndDate).getTime() + 86400000 - 1) return false;
      }
      if (filters.approvalStartDate && m.approved_at) {
        const appDate = new Date(m.approved_at).getTime();
        if (appDate < new Date(filters.approvalStartDate).getTime()) return false;
      }
      if (filters.approvalEndDate && m.approved_at) {
        const appDate = new Date(m.approved_at).getTime();
        if (appDate > new Date(filters.approvalEndDate).getTime() + 86400000 - 1) return false;
      }

      return true;
    });
  }, [members, filters]);

  // Dashboard summary counts
  const summaryCounts = useMemo(() => {
    const total = filteredMembers.length;
    const statesCount = new Set(filteredMembers.map((m) => m.state).filter(Boolean)).size;
    const districtsCount = new Set(filteredMembers.map((m) => m.district).filter(Boolean)).size;
    const professionsCount = new Set(filteredMembers.map((m) => m.profession).filter(Boolean)).size;

    const activeCount = filteredMembers.filter((m) => String(m.status).toLowerCase() === "active" || String(m.status).toLowerCase() === "approved").length;
    const pendingCount = filteredMembers.filter((m) => String(m.status).toLowerCase().includes("pending")).length;
    const suspendedCount = filteredMembers.filter((m) => String(m.status).toLowerCase() === "suspended").length;
    const expiredCount = filteredMembers.filter((m) => String(m.status).toLowerCase() === "expired").length;
    const rejectedCount = filteredMembers.filter((m) => String(m.status).toLowerCase() === "rejected").length;

    return {
      total,
      statesCount,
      districtsCount,
      professionsCount,
      activeCount,
      pendingCount,
      suspendedCount,
      expiredCount,
      rejectedCount,
    };
  }, [filteredMembers]);

  const activePresetLabel = useMemo(() => {
    return REPORT_PRESETS.find((p) => p.key === filters.reportPreset)?.label || "Address Directory Report";
  }, [filters.reportPreset]);

  // Applied Filters Summary for Reports Header
  const appliedFiltersSummaryText = useMemo(() => {
    const activeList = [];
    if (filters.name) activeList.push(`Name: ${filters.name}`);
    if (filters.member_id) activeList.push(`Member ID: ${filters.member_id}`);
    if (filters.profession !== "ALL") activeList.push(`Profession: ${filters.profession}`);
    if (filters.member_type !== "ALL") activeList.push(`Type: ${filters.member_type}`);
    if (filters.status !== "ALL") activeList.push(`Status: ${filters.status}`);
    if (filters.state !== "ALL") activeList.push(`State: ${filters.state}`);
    if (filters.district !== "ALL") activeList.push(`District: ${filters.district}`);
    if (filters.city !== "ALL") activeList.push(`City: ${filters.city}`);
    if (filters.pincode) activeList.push(`PIN: ${filters.pincode}`);
    if (filters.regStartDate) activeList.push(`From: ${filters.regStartDate}`);
    if (filters.regEndDate) activeList.push(`To: ${filters.regEndDate}`);

    return activeList.length > 0 ? activeList.join(" | ") : "All Records (No Active Filters)";
  }, [filters]);

  // EXPORT HANDLERS
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return alert("Popup blocked. Please allow popups for printing.");

    const generatedTime = new Date().toLocaleString("en-IN");
    const tableRowsHtml = filteredMembers
      .map(
        (m, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${m.member_id || m.id || "-"}</td>
          <td>${m.name || "-"}</td>
          <td>${m.profession || "-"}</td>
          <td>${m.member_type || "-"}</td>
          <td>${m.mobile_country_code || "+91"} ${m.mobile || "-"}</td>
          <td>${m.whatsapp || "-"}</td>
          <td>${m.email || "-"}</td>
          <td>${m.country || "India"}</td>
          <td>${m.state || "-"}</td>
          <td>${m.district || "-"}</td>
          <td>${m.tehsil || m.sub_division || "-"}</td>
          <td>${m.city || "-"}</td>
          <td>${m.locality || m.village || "-"}</td>
          <td>${m.pincode || m.postal_code || "-"}</td>
          <td>${m.address || "-"}</td>
          <td>${m.status || "Pending"}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!doctype html>
      <html>
        <head>
          <title>${activePresetLabel} - ICJ Enterprise</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #111; font-size: 11px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003366; padding-bottom: 12px; margin-bottom: 16px; }
            .title-box h1 { margin: 0; font-size: 20px; color: #003366; }
            .title-box h3 { margin: 4px 0 0; font-weight: 500; color: #555; }
            .meta-box { font-size: 10px; text-align: right; color: #444; }
            .summary-bar { background: #f0f4f8; padding: 8px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 16px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background-color: #003366; color: #ffffff; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 9px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-box">
              <h1>ICJ Enterprise Platform</h1>
              <h3>${activePresetLabel}</h3>
            </div>
            <div class="meta-box">
              <div><strong>Generated By:</strong> ${currentUserName} (${currentUserRole})</div>
              <div><strong>Generated Date:</strong> ${generatedTime}</div>
              <div><strong>Total Records:</strong> ${filteredMembers.length}</div>
            </div>
          </div>

          <div class="summary-bar">
            <span><strong>Applied Filters:</strong> ${appliedFiltersSummaryText}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Profession</th>
                <th>Type</th>
                <th>Mobile</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Country</th>
                <th>State</th>
                <th>District</th>
                <th>Tehsil</th>
                <th>City</th>
                <th>Village</th>
                <th>PIN Code</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml || '<tr><td colspan="17" style="text-align:center">No member records found matching criteria.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <span>Official ICJ Enterprise Government Directory Report</span>
            <span>Page 1 of 1</span>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const generatedTime = new Date().toLocaleString("en-IN");
    const headers = [
      "#", "Member ID", "Full Name", "Profession", "Member Type", "Mobile Number", "WhatsApp Number",
      "Email Address", "Country", "State", "District", "Tehsil / Sub-District", "City / Town",
      "Village / Locality", "PIN Code", "Address", "Membership Status"
    ];

    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.member_id || m.id || "-",
      m.name || "-",
      m.profession || "-",
      m.member_type || "-",
      `${m.mobile_country_code || "+91"} ${m.mobile || "-"}`,
      `${m.whatsapp_country_code || "+91"} ${m.whatsapp || "-"}`,
      m.email || "-",
      m.country || "India",
      m.state || "-",
      m.district || "-",
      m.tehsil || m.sub_division || "-",
      m.city || "-",
      m.locality || m.village || "-",
      m.pincode || m.postal_code || "-",
      m.address || "-",
      m.status || "Pending",
    ]);

    const headerHtml = `<tr>${headers.map((h) => `<th style="background:#003366;color:#fff">${h}</th>`).join("")}</tr>`;
    const bodyHtml = rows.map((r) => `<tr>${r.map((c) => `<td>${String(c)}</td>`).join("")}</tr>`).join("");

    const excelTemplate = `<!doctype html>
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <h2>ICJ Enterprise Member Address Directory Report</h2>
          <p><strong>Report:</strong> ${activePresetLabel} | <strong>Total Records:</strong> ${filteredMembers.length}</p>
          <p><strong>Filters:</strong> ${appliedFiltersSummaryText}</p>
          <p><strong>Generated By:</strong> ${currentUserName} | <strong>Time:</strong> ${generatedTime}</p>
          <table border="1">
            <thead>${headerHtml}</thead>
            <tbody>${bodyHtml}</tbody>
          </table>
        </body>
      </html>`;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ICJ_Address_Directory_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = [
      "S.No", "Member ID", "Full Name", "Profession", "Member Type", "Mobile Number", "WhatsApp Number",
      "Email Address", "Country", "State", "District", "Tehsil", "City", "Village", "PIN Code", "Address", "Status"
    ];

    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.member_id || m.id || "-",
      m.name || "-",
      m.profession || "-",
      m.member_type || "-",
      m.mobile || "-",
      m.whatsapp || "-",
      m.email || "-",
      m.country || "India",
      m.state || "-",
      m.district || "-",
      m.tehsil || m.sub_division || "-",
      m.city || "-",
      m.locality || m.village || "-",
      m.pincode || m.postal_code || "-",
      m.address || "-",
      m.status || "Pending",
    ]);

    const csvContent = [
      escape(`ICJ Enterprise ${activePresetLabel}`),
      escape(`Applied Filters: ${appliedFiltersSummaryText}`),
      escape(`Generated By: ${currentUserName} | Date: ${new Date().toLocaleString("en-IN")} | Records: ${filteredMembers.length}`),
      "",
      headers.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ICJ_Address_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Member Address Directory & Advanced Reporting
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Official Government / NIC Standard Directory, Cascading Location Hierarchy, & Export Engine
        </Typography>

        {/* SUMMARY DASHBOARD COUNTS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined" sx={{ bgcolor: "#f8f9fa", borderColor: "#e0e0e0" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  TOTAL MEMBERS
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {summaryCounts.total.toLocaleString("en-IN")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined" sx={{ bgcolor: "#f8f9fa", borderColor: "#e0e0e0" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  STATES COVERED
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {summaryCounts.statesCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined" sx={{ bgcolor: "#f8f9fa", borderColor: "#e0e0e0" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  DISTRICTS COVERED
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {summaryCounts.districtsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined" sx={{ bgcolor: "#f8f9fa", borderColor: "#e0e0e0" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  PROFESSIONS
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {summaryCounts.professionsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined" sx={{ bgcolor: "#f8f9fa", borderColor: "#e0e0e0" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  ACTIVE / PENDING
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  <span style={{ color: "#2e7d32" }}>{summaryCounts.activeCount}</span> /{" "}
                  <span style={{ color: "#ed6c02" }}>{summaryCounts.pendingCount}</span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* QUICK REPORT PRESET SELECTOR & CONTROLS */}
        <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="600" mb={2}>
            Quick Report Presets & Export Options
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {REPORT_PRESETS.map((preset) => (
              <Chip
                key={preset.key}
                label={preset.label}
                color={filters.reportPreset === preset.key ? "primary" : "default"}
                onClick={() => handlePresetSelect(preset.key)}
                sx={{ cursor: "pointer", fontWeight: filters.reportPreset === preset.key ? 600 : 400 }}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" onClick={handlePrint}>
                Print Report
              </Button>
              <Button variant="outlined" color="primary" onClick={handlePrint}>
                Export PDF
              </Button>
              <Button variant="outlined" color="success" onClick={handleExportExcel}>
                Export Excel (XLSX)
              </Button>
              <Button variant="outlined" color="info" onClick={handleExportCsv}>
                Export CSV
              </Button>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
              >
                {showAdvancedFilters ? "Hide Advanced Search" : "Show Advanced Search & Filters"}
              </Button>
              <Button variant="text" color="error" onClick={clearAllFilters}>
                Reset Filters
              </Button>
            </Stack>
          </Stack>

          {/* ADVANCED MULTI-FIELD FILTERS */}
          <Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #eee" }}>
              <Typography variant="subtitle2" fontWeight="600" mb={2} color="primary">
                Advanced Multi-Field Combined Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Member Name" name="name" value={filters.name} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Member ID" name="member_id" value={filters.member_id} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Profession" name="profession" value={filters.profession} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Professions</MenuItem>
                    {professionsList.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Member Type" name="member_type" value={filters.member_type} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="Individual">Individual</MenuItem>
                    <MenuItem value="Institutional">Institutional</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Membership Status" name="status" value={filters.status} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending Profile Completion">Pending Profile Completion</MenuItem>
                    <MenuItem value="Pending Verification">Pending Verification</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Country" name="country" value={filters.country} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Countries</MenuItem>
                    {uniqueCountries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="State" name="state" value={filters.state} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All States</MenuItem>
                    {uniqueStates.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="District" name="district" value={filters.district} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Districts</MenuItem>
                    {uniqueDistricts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Tehsil / Sub-District" name="tehsil" value={filters.tehsil} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Tehsils</MenuItem>
                    {uniqueTehsils.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="City / Town" name="city" value={filters.city} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Cities</MenuItem>
                    {uniqueCities.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select size="small" label="Village / Locality" name="village" value={filters.village} onChange={handleFilterChange}>
                    <MenuItem value="ALL">All Villages</MenuItem>
                    {uniqueVillages.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="PIN Code" name="pincode" value={filters.pincode} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Mobile Number" name="mobile" value={filters.mobile} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="WhatsApp Number" name="whatsapp" value={filters.whatsapp} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Email Address" name="email" value={filters.email} onChange={handleFilterChange} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Reg Date From"
                    name="regStartDate"
                    value={filters.regStartDate}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Reg Date To"
                    name="regEndDate"
                    value={filters.regEndDate}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Approval Date From"
                    name="approvalStartDate"
                    value={filters.approvalStartDate}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Approval Date To"
                    name="approvalEndDate"
                    value={filters.approvalEndDate}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* MEMBER ADDRESS DIRECTORY TABLE (ALL 17 MANDATORY COLUMNS) */}
        <Paper sx={{ p: 2, overflowX: "auto" }} variant="outlined">
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            {activePresetLabel} ({filteredMembers.length} Records Found)
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>S.No</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Member ID</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Full Name</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Profession</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Member Type</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Mobile</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>WhatsApp</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Country</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>State</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tehsil</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>City / Town</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Village</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>PIN Code</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Reg. Date</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={18} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No members found matching the specified filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member, index) => (
                  <TableRow key={member.id || member.member_id || index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell fontWeight="600">{member.member_id || member.id || "-"}</TableCell>
                    <TableCell fontWeight="600">{member.name || "-"}</TableCell>
                    <TableCell>{member.profession || "-"}</TableCell>
                    <TableCell>{member.member_type || "Individual"}</TableCell>
                    <TableCell>{member.mobile_country_code || "+91"} {member.mobile || "-"}</TableCell>
                    <TableCell>{member.whatsapp_country_code || "+91"} {member.whatsapp || "-"}</TableCell>
                    <TableCell>{member.email || "-"}</TableCell>
                    <TableCell>{member.country || "India"}</TableCell>
                    <TableCell>{member.state || "-"}</TableCell>
                    <TableCell>{member.district || "-"}</TableCell>
                    <TableCell>{member.tehsil || member.sub_division || "-"}</TableCell>
                    <TableCell>{member.city || "-"}</TableCell>
                    <TableCell>{member.locality || member.village || "-"}</TableCell>
                    <TableCell>{member.pincode || member.postal_code || "-"}</TableCell>
                    <TableCell>{member.address || "-"}</TableCell>
                    <TableCell>{formatDate(member.created_at || member.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={member.status || "Pending"}
                        color={
                          String(member.status).toLowerCase() === "active" || String(member.status).toLowerCase() === "approved"
                            ? "success"
                            : String(member.status).toLowerCase().includes("pending")
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}
