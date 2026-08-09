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
  Chip,
} from "@mui/material";
import { MemberService } from "../services/memberService";

export default function MemberKYC() {
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
        setMembers([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const getMemberName = (m) => m.fullName || m.full_name || m.name || "—";
  const getMemberId = (m) => m.member_id || m.memberId || m.id || m.uuid;

  const getKycStatus = (member) => {
    const hasAadhaar = Boolean(member.aadhar || member.aadhaar);
    const hasPan = Boolean(member.pan);

    if (hasAadhaar && hasPan) return "Complete";
    if (hasAadhaar || hasPan) return "Partial";
    return "Missing";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member KYC
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Aadhaar</TableCell>
              <TableCell>PAN</TableCell>
              <TableCell>KYC Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No members available.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const status = getKycStatus(member);
                return (
                  <TableRow key={getMemberId(member)}>
                    <TableCell>{getMemberName(member)}</TableCell>
                    <TableCell>{member.aadhar || member.aadhaar || "-"}</TableCell>
                    <TableCell>{member.pan || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={status}
                        color={status === "Complete" ? "success" : status === "Partial" ? "warning" : "default"}
                      />
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