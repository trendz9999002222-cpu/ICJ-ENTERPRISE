import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MemberService } from "../services/memberService";
import ActivityService from "../services/activityService";

const getMemberId = (member) =>
  member.member_id || member.memberId || member.id || member.uuid || "";

const getMemberName = (member) =>
  member.fullName || member.full_name || member.name || "—";

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
    case "verified": return "success";
    case "pending": return "warning";
    case "rejected": return "error";
    case "suspended": return "default";
    default: return "warning";
  }
};

export default function MemberVerification() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const loadMembers = async () => {
    try {
      const list = await MemberService.getAll();
      setMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load members", error);
      setMembers([]);
    }
  };

  useEffect(() => {
    let active = true;
    MemberService.getAll()
      .then((list) => {
        if (!active) return;
        setMembers(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load members", error);
        setMembers([]);
      });
    return () => { active = false; };
  }, []);

  const updateStatus = async (member, newStatus) => {
    const id = getMemberId(member);
    if (!id) {
      alert("Cannot update: member ID is missing.");
      return;
    }
    try {
      await MemberService.update(id, { verification_status: newStatus });
      ActivityService.create({
        title: `"${getMemberName(member)}" marked as ${newStatus}`,
        type: "membership",
      });
      await loadMembers();
    } catch (error) {
      console.error("Failed to update verification status", error);
      alert(`Unable to update: ${error.message || "Unknown error"}`);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) =>
      [getMemberName(m), m.email, m.mobile, getMemberId(m)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [members, search]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Verification
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <TextField
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, mobile or member ID"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {filtered.length} of {members.length} members shown
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Verification</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => {
                const status = member.verification_status || "Pending";
                const id = getMemberId(member);
                return (
                  <TableRow key={id || getMemberName(member)} hover>
                    <TableCell>{getMemberName(member)}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {id || "—"}
                    </TableCell>
                    <TableCell>{member.mobile || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        size="small"
                        color={statusColor(status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {status !== "Approved" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => updateStatus(member, "Approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {status !== "Rejected" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => updateStatus(member, "Rejected")}
                          >
                            Reject
                          </Button>
                        )}
                        {status !== "Suspended" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => updateStatus(member, "Suspended")}
                          >
                            Suspend
                          </Button>
                        )}
                        {status !== "Pending" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => updateStatus(member, "Pending")}
                          >
                            Reset
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}