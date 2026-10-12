"use client";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GavelIcon from "@mui/icons-material/Gavel";
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

import SectionCard from "@/components/ui/SectionCard";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { professionalCasesService } from "@/services/professional/professionalCases.service";
import { Grid } from "@mui/material";

const STATUS_COLORS: Record<string, "primary" | "warning" | "success" | "error" | "default"> = {
  assigned: "primary",
  in_progress: "warning",
  closed: "success",
  cancelled: "error",
};

export default function MyCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await professionalCasesService.getMyCases({
        page_size: 50,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setCases(res.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Count by status
  const assignedCount = cases.filter((c) => c.status === "assigned").length;
  const inProgressCount = cases.filter((c) => c.status === "in_progress").length;
  const closedCount = cases.filter((c) => c.status === "closed").length;

  return (
    <PortalPageShell
      title="My Cases"
      subtitle="Cases you have accepted and are currently working on."
    >
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Total Cases"
            value={cases.length}
            icon={<GavelIcon />}
            color="#2563eb"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={<GavelIcon />}
            color="#d97706"
            bgColor="#fffbeb"
            valueColor="#d97706"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Closed"
            value={closedCount}
            icon={<AssignmentTurnedInIcon />}
            color="#16a34a"
            bgColor="#f0fdf4"
            valueColor="#16a34a"
          />
        </Grid>
      </Grid>

      {/* Filter + Table */}
      <SectionCard
        title="Case List"
        subtitle="Your accepted and active cases"
        icon={<GavelIcon sx={{ color: "#2563eb", fontSize: 18 }} />}
        action={
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        }
        noPadding
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<AssignmentTurnedInIcon sx={{ fontSize: 48 }} />}
            message="No cases found"
            description={
              statusFilter === "all"
                ? "You haven't accepted any cases yet. Go to Available Cases to accept one."
                : `No cases with status "${statusFilter.replace("_", " ")}".`
            }
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Case ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Problem</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Link
                        href={`/dashboard/professional/cases/${c.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <strong style={{ color: "#2563eb", cursor: "pointer" }}>
                          {c.case_id}
                        </strong>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                        {c.assistance_request_details?.full_name}
                      </Box>
                      <Box sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {c.assistance_request_details?.mobile}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", maxWidth: 200 }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.assistance_request_details?.problem_description?.substring(0, 60)}
                        ...
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>₹{c.budget}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status.replace("_", " ").toUpperCase()}
                        size="small"
                        color={STATUS_COLORS[c.status] || "default"}
                        sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ height: 16 }} />
      </SectionCard>
    </PortalPageShell>
  );
}
