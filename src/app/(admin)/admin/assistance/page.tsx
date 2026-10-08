"use client";

import { Box, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminServicesService } from "@/services/admin/adminServices.service";
import { professionalOnboardingService } from "@/services/admin/professionalOnboarding.service";

export default function AdminAssistanceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  const [budget, setBudget] = useState("0");
  const [groupType, setGroupType] = useState("");
  const [groups, setGroups] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, groupsRes] = await Promise.all([
        adminServicesService.listAssistanceRequests({
          page: page + 1,
          page_size: pageSize,
          search: search || undefined,
          status: statusFilter,
        }),
        professionalOnboardingService.listGroups({ page_size: 100 }),
      ]);
      setRequests(res.results || []);
      setTotal(res.count || 0);
      setGroups(groupsRes.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, statusFilter]);

  const handleCloseRequest = async (id: string) => {
    if (confirm("Are you sure you want to close this inquiry?")) {
      await adminServicesService.updateAssistanceRequestStatus(id, "closed");
      loadData();
    }
  };

  const handleAssign = async () => {
    if (!selectedReq) return;
    try {
      await adminServicesService.assignProfessionalToRequest(selectedReq.id, parseFloat(budget), groupType);
      setAssignDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Error assigning professional. Case might already be created.");
    }
  };

  const columns: AdminTableColumn<any>[] = [
    {
      key: "reference_id",
      label: "Ref ID",
      render: (row) => <strong>{row.reference_id}</strong>,
    },
    {
      key: "full_name",
      label: "Client",
      render: (row) => (
        <Box>
          <Box>{row.full_name}</Box>
          <Box sx={{ fontSize: "0.8rem", color: "#64748b" }}>{row.mobile}</Box>
        </Box>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => row.category,
    },
    {
      key: "urgency",
      label: "Urgency",
      render: (row) => row.urgency,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        let color = "default";
        if (row.status === "pending") color = "warning";
        if (row.status === "in_progress") color = "info";
        if (row.status === "case_created") color = "success";
        return <Chip label={row.status.toUpperCase()} size="small" color={color as any} />;
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={() => { setSelectedReq(row); setViewDialogOpen(true); }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {row.status !== "case_created" && row.status !== "closed" && (
            <>
              <IconButton size="small" color="primary" onClick={() => { setSelectedReq(row); setAssignDialogOpen(true); }}>
                <AssignmentTurnedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleCloseRequest(row.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <AdminPageShell 
      title="Assistance Requests" 
      subtitle="Client assistance and legal aid requests"
      actions={
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="case_created">Case Created</MenuItem>
          </Select>
        </FormControl>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={requests}
        loading={loading}
        getRowKey={(r) => r.id}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        pagination={{
          page,
          totalCount: total,
          rowsPerPage: pageSize,
          onPageChange: (p) => setPage(p),
          onRowsPerPageChange: (s) => { setPageSize(s); setPage(0); }
        }}
      />

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Details: {selectedReq?.reference_id}</DialogTitle>
        <DialogContent dividers>
          {selectedReq && (
            <Stack spacing={2}>
              <Typography><strong>Name:</strong> {selectedReq.full_name}</Typography>
              <Typography><strong>Email:</strong> {selectedReq.email}</Typography>
              <Typography><strong>Mobile:</strong> {selectedReq.mobile} ({selectedReq.preferred_contact})</Typography>
              <Typography><strong>Location:</strong> {selectedReq.city_name}, {selectedReq.state_name}</Typography>
              <Typography><strong>Category:</strong> {selectedReq.category}</Typography>
              <Typography><strong>Urgency:</strong> {selectedReq.urgency}</Typography>
              <Box>
                <Typography variant="subtitle2"><strong>Problem Description:</strong></Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", p: 2, bgcolor: "#f1f5f9", borderRadius: 1 }}>
                  {selectedReq.problem_description}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Professional & Create Case</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Convert this request ({selectedReq?.reference_id}) into an official case by putting it in a group with a budget.
            </Typography>
            <TextField 
              label="Budget (₹)" 
              type="number" 
              fullWidth 
              size="small" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
            />
            <FormControl fullWidth size="small">
              <InputLabel>Professional Group</InputLabel>
              <Select 
                label="Professional Group" 
                value={groupType} 
                onChange={(e) => setGroupType(e.target.value)}
              >
                {groups.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">Create Case</Button>
        </DialogActions>
      </Dialog>

    </AdminPageShell>
  );
}
