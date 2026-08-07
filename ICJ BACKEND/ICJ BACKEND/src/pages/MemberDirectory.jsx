import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { MemberService } from "../services/memberService";
import ActivityService from "../services/activityService";

const STATUS_FILTERS = ["All", "Verified", "Pending", "Rejected", "Suspended"];

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "verified": return "success";
    case "pending": return "warning";
    case "rejected": return "error";
    case "suspended": return "default";
    default: return "warning";
  }
};

const getMemberId = (member) =>
  member.member_id || member.memberId || member.id || member.uuid || "—";

const getMemberName = (member) =>
  member.fullName || member.full_name || member.name || "—";

export default function MemberDirectory() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editOpen, setEditOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadMembers = async () => {
    try {
      const list = await MemberService.getAll();
      setMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load members", error);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !term ||
        [getMemberName(member), member.email, member.mobile, member.city]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" ||
        (member.verification_status || "Pending").toLowerCase().includes(statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const openEdit = (member) => {
    setEditMember(member);
    setEditForm({
      name: getMemberName(member),
      email: member.email || "",
      mobile: member.mobile || "",
      city: member.city || "",
      state: member.state || "",
      verification_status: member.verification_status || "Pending",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const id = getMemberId(editMember);
      await MemberService.update(id, {
        ...editForm,
        fullName: editForm.name,
        name: editForm.name,
      });
      ActivityService.create({
        title: `Member "${editForm.name}" profile updated`,
        type: "membership",
      });
      await loadMembers();
    } catch (err) {
      alert(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setEditOpen(false);
      setEditMember(null);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete member "${getMemberName(member)}"?`)) return;
    try {
      await MemberService.remove(getMemberId(member));
      ActivityService.create({
        title: `Member "${getMemberName(member)}" deleted`,
        type: "membership",
      });
      await loadMembers();
    } catch (err) {
      alert(`Failed to delete: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Directory
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        {/* Search + filter row */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }} alignItems="center">
          <TextField
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, mobile or city"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} flexShrink={0}>
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f}
                label={f}
                clickable
                color={statusFilter === f ? "primary" : "default"}
                onClick={() => setStatusFilter(f)}
                variant={statusFilter === f ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Showing {filteredMembers.length} of {members.length} members
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No matching members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={getMemberId(member)} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {getMemberId(member)}
                  </TableCell>
                  <TableCell>{getMemberName(member)}</TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>{member.mobile || "—"}</TableCell>
                  <TableCell>{member.city || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.verification_status || "Pending"}
                      size="small"
                      color={statusColor(member.verification_status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEdit(member)}
                        >
                          Edit
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(member)}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {[
              { label: "Full Name", name: "name" },
              { label: "Email", name: "email" },
              { label: "Mobile", name: "mobile" },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
            ].map(({ label, name }) => (
              <TextField
                key={name}
                fullWidth
                label={label}
                value={editForm[name] || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, [name]: e.target.value }))
                }
              />
            ))}
            <TextField
              select
              fullWidth
              label="Verification Status"
              value={editForm.verification_status || "Pending"}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  verification_status: e.target.value,
                }))
              }
            >
              {["Pending", "Verified", "Rejected", "Suspended"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}