"use client";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { professionalCasesService } from "@/services/professional/professionalCases.service";

export default function AvailableCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await professionalCasesService.getAvailableCases({ page_size: 50 });
      setCases(res.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleTakeCase = async (caseId: string) => {
    setTakingId(caseId);
    try {
      await professionalCasesService.takeCase(caseId);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch {
      alert("Could not take case. It may have already been taken.");
    } finally {
      setTakingId(null);
    }
  };

  return (
    <PortalPageShell
      title="Available Cases"
      subtitle="Open cases assigned to your professional group that you can accept."
    >
      <SectionCard
        title="Cases Available"
        subtitle={`${cases.length} case${cases.length !== 1 ? "s" : ""} available for your group`}
        icon={<GavelIcon sx={{ color: "#2563eb", fontSize: 18 }} />}
        noPadding
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<FolderOpenIcon sx={{ fontSize: 48 }} />}
            message="No available cases right now"
            description="New cases will appear here when they are assigned to your professional group."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Case ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Urgency</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Action</TableCell>
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
                        {c.assistance_request_details?.category}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>
                      {c.assistance_request_details?.category || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>
                      {c.assistance_request_details?.urgency || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>₹{c.budget}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          takingId === c.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <AssignmentTurnedInIcon />
                          )
                        }
                        disabled={takingId === c.id}
                        onClick={() => handleTakeCase(c.id)}
                        sx={{
                          fontWeight: 700,
                          textTransform: "none",
                          fontSize: "0.78rem",
                          bgcolor: "#2563eb",
                          "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                      >
                        Accept Case
                      </Button>
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
