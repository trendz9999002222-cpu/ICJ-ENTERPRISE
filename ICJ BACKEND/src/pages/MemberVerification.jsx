import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";
import AdminService from "../services/adminService";
import useAuth from "../hooks/useAuth";
import { resolveRoleCode } from "../core/roles";

export default function MemberVerification() {
  const { profile, user } = useAuth();
  const roleCode = resolveRoleCode(profile, user);
  const [members, setMembers] = useState([]);

  const loadMembers = async () => {
    const rows = await MemberService.getAll();
    setMembers(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const normalizeVerificationValue = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "approved") return "Verified";
    if (raw === "rejected") return "Rejected";
    if (raw === "suspended") return "Suspended";
    return "Pending";
  };

  const onVerificationChange = async (member, verification_status) => {
    const id = member.members || member.id;
    if (!id) return;
    const remarks = window.prompt("Verification remarks (optional)", member.remarks || "");
    if (remarks === null) return;
    await AdminService.setMemberVerificationStatus(id, verification_status, remarks);
    await loadMembers();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Verification
        </Typography>

        {roleCode !== "system_admin" ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Verification actions are restricted to System Admin.
          </Typography>
        ) : null}

        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Verification Date</TableCell>
                <TableCell>Verified By</TableCell>
                <TableCell>History</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No members available.</TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.members || member.id || member.member_id}>
                    <TableCell>{member.member_id || "-"}</TableCell>
                    <TableCell>{member.name || "-"}</TableCell>
                    <TableCell>{member.email || "-"}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={normalizeVerificationValue(member.verification_status)}
                        onChange={(event) => onVerificationChange(member, event.target.value)}
                        disabled={roleCode !== "system_admin"}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Verified">Verified</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Suspended">Suspended</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>{member.remarks || "-"}</TableCell>
                    <TableCell>{member.verification_date ? new Date(member.verification_date).toLocaleString("en-IN") : "-"}</TableCell>
                    <TableCell>{member.verified_by || "-"}</TableCell>
                    <TableCell>{Array.isArray(member.verification_history) ? member.verification_history.length : 0}</TableCell>
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
