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
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";

export default function MemberKYC() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member KYC
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Aadhar</TableCell>
                <TableCell>PAN</TableCell>
                <TableCell>GST</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No KYC records available.</TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.members || member.id || member.member_id}>
                    <TableCell>{member.name || "-"}</TableCell>
                    <TableCell>{member.aadhar || "-"}</TableCell>
                    <TableCell>{member.pan || "-"}</TableCell>
                    <TableCell>{member.gst || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={member.verification_status || "Pending"}
                        color={member.verification_status === "Verified" ? "success" : "warning"}
                      />
                    </TableCell>
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
