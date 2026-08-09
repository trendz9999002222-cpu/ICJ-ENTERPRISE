import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { MemberService } from "../services/memberService";

export default function MemberHistory() {
  const [members, setMembers] = useState([]);

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
      });

    return () => {
      active = false;
    };
  }, []);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const first = new Date(a.registration_date || a.created_at || 0).getTime();
      const second = new Date(b.registration_date || b.created_at || 0).getTime();
      return second - first;
    });
  }, [members]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member History
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No member history available.
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member) => (
                <TableRow key={member.members || member.id || member.uuid}>
                  <TableCell>
                    {member.registration_date || member.created_at
                      ? new Date(member.registration_date || member.created_at).toLocaleString("en-IN")
                      : "-"}
                  </TableCell>
                  <TableCell>{member.name || "-"}</TableCell>
                  <TableCell>{member.member_id || member.members || "-"}</TableCell>
                  <TableCell>{member.verification_status || "Pending"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}