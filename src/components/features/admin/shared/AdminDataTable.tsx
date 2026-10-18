"use client";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

// =============================================================================
// AdminDataTable — generic, reusable table for all admin list views.
// Features: loading skeleton, empty state, search, horizontal scroll,
//           global pagination with automatic client-side fallback.
// =============================================================================

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  minWidth?: number;
  width?: number | string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
};

export type AdminPaginationConfig = {
  /** 0-indexed current page (MUI TablePagination convention) */
  page: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
};

type Props<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  /** Optional filter chips/selects rendered next to search */
  filterSlot?: ReactNode;
  /** Key extractor for React list keys (optional, defaults to row.id) */
  getRowKey?: (row: T) => string | number;
  /** If provided, renders MUI TablePagination below the table. If undefined, built-in client pagination is used. Pass false to disable. */
  pagination?: AdminPaginationConfig | false;
  /** Prepends a serial number column (respects pagination offset) */
  showSerialNumber?: boolean;
  serialLabel?: string;
};

// ---------------------------------------------------------------------------
// Loading skeleton rows
// ---------------------------------------------------------------------------

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j} sx={{ py: 1.5 }}>
              <Box
                sx={{
                  height: 14,
                  borderRadius: 1,
                  bgcolor: "#f1f5f9",
                  width: j === 0 ? "60%" : j === cols - 1 ? "40%" : "80%",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.4 },
                  },
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------

export default function AdminDataTable<T>({
  columns,
  rows = [],
  loading = false,
  error,
  emptyMessage = "No records found.",
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filterSlot,
  getRowKey = (row: any) => row?.id || row?.key || row?._id || Math.random().toString(),
  pagination,
  showSerialNumber = false,
  serialLabel = "S.No.",
}: Props<T>) {
  const isControlled = typeof pagination === "object" && pagination !== null;
  const isPaginationEnabled = pagination !== false;

  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);

  // Reset internal page when rows length changes or search changes
  useEffect(() => {
    if (!isControlled) {
      setInternalPage(0);
    }
  }, [rows?.length, searchValue, isControlled]);

  const activePage = isControlled ? pagination.page : internalPage;
  const activeRowsPerPage = isControlled ? pagination.rowsPerPage : internalRowsPerPage;
  const totalCount = isControlled ? pagination.totalCount : (rows?.length ?? 0);
  const rowsPerPageOptions = isControlled
    ? (pagination.rowsPerPageOptions ?? [10, 25, 50])
    : [10, 25, 50];

  const handlePageChange = (newPage: number) => {
    if (isControlled) {
      pagination.onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if (isControlled) {
      pagination.onRowsPerPageChange?.(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  // If uncontrolled (client-side), slice rows according to internal pagination.
  // If controlled, rows are already handled or controlled by parent.
  const displayedRows =
    isControlled || !isPaginationEnabled
      ? (rows || [])
      : (rows || []).slice(
          activePage * activeRowsPerPage,
          activePage * activeRowsPerPage + activeRowsPerPage
        );

  const colCount = columns.length + (showSerialNumber ? 1 : 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Search + filters bar */}
      {(onSearchChange || filterSlot) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
        >
          {onSearchChange && (
            <TextField
              size="small"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                minWidth: 280,
                bgcolor: "#fff",
                borderRadius: 1.5,
                "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
              }}
            />
          )}
          {filterSlot}
        </Stack>
      )}

      {/* Error state */}
      {error && (
        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderColor: "#fca5a5", bgcolor: "#fef2f2", borderRadius: 2 }}
        >
          <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
      )}

      {/* Table with horizontal scroll */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}
      >
        <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
          <Table size="small" sx={{ minWidth: columns.reduce((a, c) => a + (c.minWidth ?? 120), 0) }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {showSerialNumber && (
                  <TableCell
                    align="center"
                    sx={{
                      minWidth: 72,
                      width: 72,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.7rem",
                      letterSpacing: 0.6,
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #e2e8f0",
                      py: 1.5,
                      bgcolor: "#f8fafc",
                    }}
                  >
                    {serialLabel}
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    width={col.width}
                    sx={{
                      minWidth: col.minWidth ?? 120,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      borderBottom: "1px solid #e2e8f0",
                      py: 1.5,
                      whiteSpace: "nowrap",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <SkeletonRows cols={colCount} />
              ) : (!displayedRows || displayedRows.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={colCount} sx={{ py: 6, textAlign: "center", borderBottom: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (displayedRows || []).map((row, rowIndex) => (
                  <TableRow
                    key={typeof getRowKey === "function" ? getRowKey(row) : ((row as any)?.id || rowIndex)}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background 0.1s ease",
                    }}
                  >
                    {showSerialNumber && (
                      <TableCell
                        align="center"
                        sx={{
                          py: 1.25,
                          color: "#64748b",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          minWidth: 72,
                          width: 72,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {(activePage * activeRowsPerPage) + rowIndex + 1}
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align ?? "left"}
                        sx={{
                          py: 1.25,
                          color: "#334155",
                          fontSize: "0.8125rem",
                          whiteSpace: "nowrap",
                          minWidth: col.minWidth ?? 120,
                        }}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Global Table Pagination */}
        {isPaginationEnabled && (
          <Box sx={{ borderTop: "1px solid #e2e8f0" }}>
            <TablePagination
              component="div"
              count={totalCount}
              page={
                totalCount <= 0
                  ? 0
                  : Math.min(activePage, Math.max(0, Math.ceil(totalCount / activeRowsPerPage) - 1))
              }
              rowsPerPage={activeRowsPerPage}
              onPageChange={(_, newPage) => handlePageChange(newPage)}
              onRowsPerPageChange={(e) =>
                handleRowsPerPageChange(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={rowsPerPageOptions}
              sx={{
                ".MuiTablePagination-toolbar": { minHeight: 48 },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                  fontSize: "0.8rem",
                  color: "#64748b",
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
