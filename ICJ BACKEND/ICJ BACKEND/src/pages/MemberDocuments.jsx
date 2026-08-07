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

export default function MemberDocuments() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const list = await MemberService.getAll();
        setMembers(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to load members", error);
      }
    };

    loadMembers();
  }, []);

  const getStatus = (member) =>
    member.verification_status === "Verified" ? "Verified" : "Pending";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Documents
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member Name</TableCell>
              <TableCell>Aadhaar</TableCell>
              <TableCell>PAN</TableCell>
              <TableCell>KYC Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No member records available.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.members || member.id || member.uuid}>
                  <TableCell>{member.name || "-"}</TableCell>
                  <TableCell>{member.aadhar || member.aadhaar || "-"}</TableCell>
                  <TableCell>{member.pan || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatus(member)}
                      color={getStatus(member) === "Verified" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}