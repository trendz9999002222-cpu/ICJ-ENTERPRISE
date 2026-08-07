import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Stack,
  Checkbox,
  Chip,
  Box,
  useTheme,
} from "@mui/material";

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN");
};

const displayValue = (value) => {
  const text = String(value ?? "").trim();
  return text ? text : "-";
};

const normalizeMemberType = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "-";
  if (raw === "organisation" || raw === "organization" || raw === "institutional") return "Institutional";
  if (raw === "individual") return "Individual";
  return String(value || "").trim();
};

const normalizeVerificationStatus = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "Not Verified";
  if (raw === "verified" || raw === "true" || raw === "yes") return "Verified";
  return "Not Verified";
};

const getStatusChip = (statusStr) => {
  const status = String(statusStr || "Pending").trim().toUpperCase();
  if (status === "APPROVED" || status === "ACTIVE") {
    return <Chip size="small" label="Approved / Active" color="success" sx={{ fontWeight: 600 }} />;
  }
  if (status === "SUSPENDED") {
    return <Chip size="small" label="Suspended" color="info" sx={{ fontWeight: 600 }} />;
  }
  if (status === "EXPIRED") {
    return <Chip size="small" label="Expired" color="secondary" sx={{ fontWeight: 600 }} />;
  }
  if (status === "REJECTED") {
    return <Chip size="small" label="Rejected" color="error" sx={{ fontWeight: 600 }} />;
  }
  return <Chip size="small" label="Pending" color="warning" sx={{ fontWeight: 600 }} />;
};

export default function MemberTable({
  filteredMembers,
  selectedMemberIds,
  onToggleSelectMember,
  onToggleSelectAll,
  onViewProfile,
  onViewHistory,
  onOpenDocuments,
  onEditMember,
  onApproveMember,
  onRejectMember,
  onSuspendMember,
  onReactivateMember,
  onVerifyMember,
  onAddRemarks,
  deleteMember,
  canEdit,
  canDelete,
  canApprove,
  canReject,
  canSuspend,
  canReactivate,
  canVerify,
}) {
  const theme = useTheme();

  const selectedCount = filteredMembers.filter((member) => {
    const id = String(member.id || member.members || member.member_id || "");
    return selectedMemberIds?.includes(id);
  }).length;
  const allSelected = filteredMembers.length > 0 && selectedCount === filteredMembers.length;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          Member Registry Directory
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Showing {filteredMembers.length} records {selectedCount > 0 ? `(${selectedCount} selected)` : ""}
        </Typography>
      </Box>

      <TableContainer sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
        <Table aria-label="Member Directory List Table">
          <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all members on this page"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Member ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>KYC Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reg. Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    No Members Found Matching Current Filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const memberIdKey = String(member.id || member.members || member.member_id || "");
                const isSelected = selectedMemberIds?.includes(memberIdKey);
                const verificationStatus = normalizeVerificationStatus(member.verification_status);

                return (
                  <TableRow
                    key={memberIdKey}
                    hover
                    selected={isSelected}
                    sx={{ transition: "background-color 0.15s ease" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelectMember(member)}
                        aria-label={`Select member ${member.name || member.full_name || memberIdKey}`}
                      />
                    </TableCell>
                    <TableCell fontWeight="600" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {displayValue(member.member_id || member.membership_id || member.id || member.members)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{displayValue(member.name || member.full_name)}</TableCell>
                    <TableCell>{displayValue(member.mobile)}</TableCell>
                    <TableCell>{displayValue(member.email)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={normalizeMemberType(member.member_type || member.membership_type)}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(member.status)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant={verificationStatus === "Verified" ? "filled" : "outlined"}
                        color={verificationStatus === "Verified" ? "success" : "default"}
                        label={verificationStatus}
                      />
                    </TableCell>
                    <TableCell>{formatDate(member.registration_date || member.created_at || member.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        <Button size="small" variant="text" onClick={() => onViewProfile(member)} aria-label="View member profile">
                          View
                        </Button>
                        <Button size="small" variant="text" onClick={() => onViewHistory(member)} aria-label="View member history">
                          History
                        </Button>
                        <Button size="small" variant="text" onClick={() => onOpenDocuments(member)} aria-label="Manage member documents">
                          Docs
                        </Button>
                        {canEdit ? (
                          <Button size="small" variant="outlined" color="primary" onClick={() => onEditMember(member)} aria-label="Edit member profile">
                            Edit
                          </Button>
                        ) : null}
                        {canApprove && (member.status === "Pending" || member.status === "Draft") ? (
                          <Button size="small" variant="contained" color="success" onClick={() => onApproveMember(member)} aria-label="Approve member">
                            Approve
                          </Button>
                        ) : null}
                        {canReject && member.status === "Pending" ? (
                          <Button size="small" variant="outlined" color="error" onClick={() => onRejectMember(member)} aria-label="Reject member">
                            Reject
                          </Button>
                        ) : null}
                        {canSuspend && (member.status === "Approved" || member.status === "Active") ? (
                          <Button size="small" variant="outlined" color="warning" onClick={() => onSuspendMember(member)} aria-label="Suspend member">
                            Suspend
                          </Button>
                        ) : null}
                        {canReactivate && (member.status === "Suspended" || member.status === "Rejected") ? (
                          <Button size="small" variant="outlined" color="info" onClick={() => onReactivateMember(member)} aria-label="Reactivate member">
                            Reactivate
                          </Button>
                        ) : null}
                        {canVerify && verificationStatus !== "Verified" ? (
                          <Button size="small" variant="contained" color="secondary" onClick={() => onVerifyMember(member)} aria-label="Verify member identity">
                            Verify
                          </Button>
                        ) : null}
                        {canEdit ? (
                          <Button size="small" variant="text" onClick={() => onAddRemarks(member)} aria-label="Add remarks to member">
                            Remarks
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => deleteMember(member.id || member.members)}
                            aria-label="Delete member"
                          >
                            Delete
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

