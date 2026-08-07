import DashboardService from "./dashboardService";
import { MemberService } from "./memberService";
import FinanceService from "./financeService";
import WalletService from "./walletService";
import TokenService from "./tokenService";
import LegalService from "./legalService";
import DocumentService from "./documentService";
import { hasPermission } from "../core/permissions";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "membership", label: "Membership" },
  { key: "finance", label: "Finance" },
  { key: "wallet", label: "Wallet" },
  { key: "token", label: "Token" },
  { key: "legal", label: "Legal" },
  { key: "documents", label: "Documents" },
];

const permissionMap = {
  super_admin: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: true,
    canExportExcel: true,
    canPrint: true,
  },
  system_admin: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: true,
    canExportExcel: true,
    canPrint: true,
  },
  organization_admin: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: true,
    canExportExcel: true,
    canPrint: true,
  },
  admin: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: true,
    canExportExcel: true,
    canPrint: true,
  },
  reviewer: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: false,
    canExportExcel: false,
    canPrint: true,
  },
  viewer: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: false,
    canExportExcel: false,
    canPrint: true,
  },
  employee: {
    modules: MODULES.map((item) => item.key),
    canExportPdf: true,
    canExportExcel: true,
    canPrint: true,
  },
  member: {
    modules: ["dashboard", "membership", "wallet", "documents"],
    canExportPdf: false,
    canExportExcel: false,
    canPrint: true,
  },
};

const normalizeRole = (role) => String(role || "member").toLowerCase();

const toTimestamp = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

const toNumber = (value) => Number(value || 0);

const toCsv = (rows, columns) => {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.map((column) => escape(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escape(row?.[column.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
};

const byDateDesc = (rows, dateField = "date") =>
  [...rows].sort(
    (a, b) => (toTimestamp(b?.[dateField]) || 0) - (toTimestamp(a?.[dateField]) || 0)
  );

const aggregate = (rows, key, mode = "count") => {
  const map = rows.reduce((acc, row) => {
    const group = String(row?.[key] || "Unknown");
    if (mode === "sum") {
      acc[group] = toNumber(acc[group]) + toNumber(row?.amount);
    } else {
      acc[group] = toNumber(acc[group]) + 1;
    }
    return acc;
  }, {});

  return Object.entries(map)
    .map(([label, value]) => ({ label, value: toNumber(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

const buildFilterOptions = (rows) => {
  const statuses = [...new Set(rows.map((row) => String(row.status || "")).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const types = [...new Set(rows.map((row) => String(row.type || "")).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return { statuses, types };
};

const applyFilters = (rows, filters = {}) => {
  const keyword = String(filters.search || "").toLowerCase();
  const status = String(filters.status || "ALL");
  const type = String(filters.type || "ALL");
  const start = toTimestamp(filters.startDate);
  const end = toTimestamp(filters.endDate);

  return rows.filter((row) => {
    const dateValue = toTimestamp(row.date);
    const matchesSearch =
      !keyword ||
      [row.refNo, row.title, row.status, row.type, row.category, row.owner]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(keyword));

    const matchesStatus = status === "ALL" || String(row.status || "") === status;
    const matchesType = type === "ALL" || String(row.type || "") === type;
    const matchesStart = !start || (dateValue !== null && dateValue >= start);
    const matchesEnd = !end || (dateValue !== null && dateValue <= end + 86400000 - 1);

    return matchesSearch && matchesStatus && matchesType && matchesStart && matchesEnd;
  });
};

const reportColumns = [
  { key: "date", label: "Date" },
  { key: "refNo", label: "Reference" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "type", label: "Type" },
  { key: "category", label: "Category" },
  { key: "owner", label: "Owner" },
  { key: "amount", label: "Amount" },
];

const toDateString = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const toRow = (payload) => ({
  id: payload.id,
  module: payload.module,
  date: toDateString(payload.date),
  refNo: payload.refNo || "-",
  title: payload.title || "-",
  status: payload.status || "-",
  type: payload.type || "-",
  category: payload.category || "-",
  owner: payload.owner || "-",
  amount: toNumber(payload.amount),
  raw: payload.raw || null,
});

const ReportingService = {
  getAccess(role) {
    const normalizedRole = normalizeRole(role);
    const base = permissionMap[normalizedRole] || permissionMap.member;

    const canViewReports = hasPermission(normalizedRole, "reports.view");
    const canExportReports = hasPermission(normalizedRole, "reports.export");

    return {
      ...base,
      modules: canViewReports ? base.modules : [],
      canExportPdf: canExportReports,
      canExportExcel: canExportReports,
      canPrint: base.canPrint,
    };
  },

  getModuleOptions(role) {
    const access = this.getAccess(role);
    return MODULES.filter((module) => access.modules.includes(module.key));
  },

  getModuleLabel(moduleKey) {
    return MODULES.find((module) => module.key === moduleKey)?.label || "Report";
  },

  async getDashboardRows() {
    const stats = await DashboardService.getStatistics();
    const date = new Date().toISOString();

    return [
      toRow({
        id: "dash-members",
        module: "dashboard",
        date,
        refNo: "KPI-MEMBERS",
        title: "Total Members",
        status: "Snapshot",
        type: "Count",
        category: "Membership",
        owner: "System",
        amount: stats.totalMembers,
        raw: stats,
      }),
      toRow({
        id: "dash-wallets",
        module: "dashboard",
        date,
        refNo: "KPI-WALLETS",
        title: "Total Wallets",
        status: "Snapshot",
        type: "Count",
        category: "Wallet",
        owner: "System",
        amount: stats.totalWallets,
        raw: stats,
      }),
      toRow({
        id: "dash-tokens",
        module: "dashboard",
        date,
        refNo: "KPI-TOKENS",
        title: "Total Tokens",
        status: "Snapshot",
        type: "Count",
        category: "Token",
        owner: "System",
        amount: stats.totalTokens,
        raw: stats,
      }),
      toRow({
        id: "dash-legal",
        module: "dashboard",
        date,
        refNo: "KPI-LEGAL",
        title: "Total Legal Cases",
        status: "Snapshot",
        type: "Count",
        category: "Legal",
        owner: "System",
        amount: stats.totalLegalCases,
        raw: stats,
      }),
      toRow({
        id: "dash-documents",
        module: "dashboard",
        date,
        refNo: "KPI-DOCS",
        title: "Total Documents",
        status: "Snapshot",
        type: "Count",
        category: "Documents",
        owner: "System",
        amount: stats.totalDocuments,
        raw: stats,
      }),
      toRow({
        id: "dash-donations",
        module: "dashboard",
        date,
        refNo: "KPI-DONATIONS",
        title: "Donation Amount",
        status: "Snapshot",
        type: "Amount",
        category: "Finance",
        owner: "System",
        amount: stats.donationAmount,
        raw: stats,
      }),
    ];
  },

  async getMembershipRows() {
    const rows = await MemberService.getAll();
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id || item.member_id,
        module: "membership",
        date: item.registration_date || item.createdAt || item.created_at,
        refNo: item.member_id || item.id,
        title: item.name,
        status: item.status || "Pending",
        type: item.member_type || "Member",
        category: item.member_level || "BASIC",
        owner: item.mobile || item.email,
        amount: item.wallet_balance || 0,
        raw: item,
      })
    );
  },

  async getFinanceRows() {
    const rows = await FinanceService.getTransactionHistory();
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id,
        module: "finance",
        date: item.createdAt,
        refNo: item.reference || item.voucherNo || item.id,
        title: item.source || "Finance",
        status: item.status || "Posted",
        type: item.type || "ENTRY",
        category: item.mode || "General",
        owner: item.accountHeadName || "-",
        amount: item.amount,
        raw: item,
      })
    );
  },

  async getWalletRows() {
    const rows = await WalletService.getAll();
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id,
        module: "wallet",
        date: item.createdAt || item.created_at,
        refNo: item.id,
        title: "Member Wallet",
        status: item.status || "Active",
        type: item.currency || "INR",
        category: "Wallet",
        owner: item.memberId || item.member_id || "-",
        amount: item.balance,
        raw: item,
      })
    );
  },

  async getTokenRows(role = "member", actorProfile = null) {
    const rows = await TokenService.getTransactionHistory({}, role, actorProfile);
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id,
        module: "token",
        date: item.createdAt,
        refNo: item.tokenNo || item.referenceNo || item.id,
        title: "Token Transaction",
        status: item.status || "Posted",
        type: item.type || "TOKEN",
        category: item.batchNo || item.walletId || "Token",
        owner: item.memberId || item.toMemberId || "-",
        amount: item.amount,
        raw: item,
      })
    );
  },

  async getLegalRows() {
    const rows = await LegalService.getAll();
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id,
        module: "legal",
        date: item.updatedAt || item.createdAt || item.created_at,
        refNo: item.caseNumber || item.case_number || item.id,
        title: item.title || "Legal Case",
        status: item.status || "Open",
        type: item.caseType || "Case",
        category: item.courtName || item.court_name || "Court",
        owner: item.clientName || item.client_name || "-",
        amount: item.claimAmount || 0,
        raw: item,
      })
    );
  },

  async getDocumentRows() {
    const rows = await DocumentService.getAll();
    return (Array.isArray(rows) ? rows : []).map((item) =>
      toRow({
        id: item.id,
        module: "documents",
        date: item.createdAt || item.created_at,
        refNo: item.documentNo || item.document_no || item.id,
        title: item.title || "Document",
        status: item.status || "Active",
        type: item.moduleType || "General",
        category: item.category || "General",
        owner: item.owner || "-",
        amount: item.fileSize || 0,
        raw: item,
      })
    );
  },

  async loadModuleRows(moduleKey, role = "member", actorProfile = null) {
    if (moduleKey === "dashboard") return this.getDashboardRows();
    if (moduleKey === "membership") return this.getMembershipRows();
    if (moduleKey === "finance") return this.getFinanceRows();
    if (moduleKey === "wallet") return this.getWalletRows();
    if (moduleKey === "token") return this.getTokenRows(role, actorProfile);
    if (moduleKey === "legal") return this.getLegalRows();
    if (moduleKey === "documents") return this.getDocumentRows();
    return [];
  },

  summarize(moduleKey, rows) {
    const totalRecords = rows.length;
    const totalAmount = rows.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const activeCount = rows.filter((item) => String(item.status || "").toLowerCase() === "active").length;

    if (moduleKey === "finance") {
      const income = rows
        .filter((item) => String(item.type || "").toUpperCase() === "INCOME")
        .reduce((sum, item) => sum + toNumber(item.amount), 0);
      const expenses = rows
        .filter((item) => String(item.type || "").toUpperCase() === "EXPENSE")
        .reduce((sum, item) => sum + toNumber(item.amount), 0);

      return [
        { label: "Records", value: totalRecords },
        { label: "Total Amount", value: totalAmount },
        { label: "Income", value: income },
        { label: "Expenses", value: expenses },
      ];
    }

    if (moduleKey === "token") {
      const issued = rows
        .filter((item) => String(item.type || "").toUpperCase() === "ISSUE")
        .reduce((sum, item) => sum + toNumber(item.amount), 0);
      const redeemed = rows
        .filter((item) => String(item.type || "").toUpperCase() === "REDEMPTION")
        .reduce((sum, item) => sum + toNumber(item.amount), 0);

      return [
        { label: "Records", value: totalRecords },
        { label: "Total Tokens", value: totalAmount },
        { label: "Issued", value: issued },
        { label: "Redeemed", value: redeemed },
      ];
    }

    if (moduleKey === "wallet") {
      return [
        { label: "Wallets", value: totalRecords },
        { label: "Active", value: activeCount },
        { label: "Total Balance", value: totalAmount },
        { label: "Average Balance", value: totalRecords ? Math.round(totalAmount / totalRecords) : 0 },
      ];
    }

    if (moduleKey === "dashboard") {
      return [
        { label: "KPIs", value: totalRecords },
        { label: "Total KPI Value", value: totalAmount },
        { label: "Snapshots", value: rows.filter((item) => item.status === "Snapshot").length },
        { label: "Last Refresh", value: totalRecords ? rows[0].date : "-" },
      ];
    }

    return [
      { label: "Records", value: totalRecords },
      { label: "Active", value: activeCount },
      { label: "Total Amount", value: totalAmount },
      { label: "Types", value: new Set(rows.map((item) => item.type)).size },
    ];
  },

  buildChart(moduleKey, rows) {
    if (moduleKey === "finance" || moduleKey === "token") {
      return aggregate(rows, "type", "sum");
    }
    if (moduleKey === "documents") {
      return aggregate(rows, "category", "count");
    }
    return aggregate(rows, "status", "count");
  },

  async getModuleReport(moduleKey, filters = {}, role = "member", actorProfile = null) {
    const access = this.getAccess(role);
    if (!access.modules.includes(moduleKey)) {
      throw new Error("You do not have access to this report module.");
    }

    const sourceRows = await this.loadModuleRows(moduleKey, role, actorProfile);
    const sorted = byDateDesc(sourceRows, "date");
    const filtered = applyFilters(sorted, filters);

    return {
      moduleKey,
      moduleLabel: this.getModuleLabel(moduleKey),
      generatedAt: new Date().toISOString(),
      columns: reportColumns,
      filterOptions: buildFilterOptions(sorted),
      rows: filtered,
      summary: this.summarize(moduleKey, filtered),
      chart: this.buildChart(moduleKey, filtered),
    };
  },

  async getSummaryDashboard(filters = {}, role = "member", actorProfile = null) {
    const modules = this.getModuleOptions(role);
    const reports = await Promise.all(
      modules.map((module) => this.getModuleReport(module.key, filters, role, actorProfile))
    );

    return reports.map((report) => ({
      moduleKey: report.moduleKey,
      moduleLabel: report.moduleLabel,
      records: report.rows.length,
      amount: report.rows.reduce((sum, row) => sum + toNumber(row.amount), 0),
      updatedAt: report.generatedAt,
    }));
  },

  buildExcelPayload(report) {
    const headers = report.columns.map((column) => `<th>${column.label}</th>`).join("");
    const rows = report.rows
      .map((row) => `<tr>${report.columns.map((column) => `<td>${String(row?.[column.key] ?? "")}</td>`).join("")}</tr>`)
      .join("");

    return {
      fileName: `${report.moduleKey}-report-${new Date().toISOString().slice(0, 10)}.xls`,
      html: `<!doctype html><html><head><meta charset="UTF-8" /></head><body><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`,
    };
  },

  exportExcel(report) {
    const payload = this.buildExcelPayload(report);
    const blob = new Blob([payload.html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = payload.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportCsv(report) {
    const fileName = `${report.moduleKey}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    const csv = toCsv(report.rows, report.columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  buildPrintHtml(report, mode = "print") {
    const summaryRows = report.summary
      .map((item) => `<tr><td>${item.label}</td><td>${item.value}</td></tr>`)
      .join("");

    const tableHead = report.columns.map((column) => `<th>${column.label}</th>`).join("");
    const tableBody = report.rows
      .map((row) =>
        `<tr>${report.columns
          .map((column) => `<td>${String(row?.[column.key] ?? "")}</td>`)
          .join("")}</tr>`
      )
      .join("");

    const chartRows = report.chart
      .map((point) => `<tr><td>${point.label}</td><td>${point.value}</td></tr>`)
      .join("");

    return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${report.moduleLabel} Report</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
      h1 { margin: 0 0 8px; }
      .muted { color: #666; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f5f5f5; }
      .note { padding: 10px; border: 1px solid #e0e0e0; background: #fafafa; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <h1>ICJ ${report.moduleLabel} Report</h1>
    <div class="muted">Generated at: ${new Date(report.generatedAt).toLocaleString()}</div>
    ${mode === "pdf" ? '<div class="note">Use "Save as PDF" in the print dialog to export PDF.</div>' : ""}
    <h3>Summary</h3>
    <table>
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>${summaryRows}</tbody>
    </table>
    <h3>Chart Data</h3>
    <table>
      <thead><tr><th>Label</th><th>Value</th></tr></thead>
      <tbody>${chartRows}</tbody>
    </table>
    <h3>Detailed Rows</h3>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableBody}</tbody>
    </table>
  </body>
</html>`;
  },

  openPrintWindow(report, mode = "print") {
    const popup = window.open("", "_blank", "width=1200,height=900");
    if (!popup) {
      throw new Error("Popup blocked. Please allow popups for printing and PDF export.");
    }

    popup.document.write(this.buildPrintHtml(report, mode));
    popup.document.close();
    popup.focus();
    popup.print();
  },

  exportPdf(report) {
    this.openPrintWindow(report, "pdf");
  },

  print(report) {
    this.openPrintWindow(report, "print");
  },
};

export default ReportingService;
