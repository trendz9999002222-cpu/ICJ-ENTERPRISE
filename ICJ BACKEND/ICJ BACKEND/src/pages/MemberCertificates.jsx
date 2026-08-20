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
  Button,
  Stack,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { MemberService } from "../services/memberService";

const getMemberId = (m) => m.member_id || m.memberId || m.id || m.uuid;
const getMemberName = (m) => m.fullName || m.full_name || m.name || "—";

const printCertificate = (member) => {
  const name = getMemberName(member);
  const id = getMemberId(member);
  const type = member.member_type || "General";
  const regDate = member.registration_date
    ? new Date(member.registration_date).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");
  const today = new Date().toLocaleDateString("en-IN");

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head><title>ICJ Membership Certificate - ${name}</title></head>
    <body style="font-family:Georgia,serif;padding:60px;max-width:800px;margin:auto;border:8px double #1a237e">
      <div style="text-align:center">
        <h1 style="color:#1a237e;font-size:28px;margin-bottom:4px">International Consortium of Jurists</h1>
        <h2 style="color:#b71c1c;font-size:20px;margin-top:0">Certificate of Membership</h2>
        <hr style="border:2px solid #1a237e;margin:20px 0">
        <p style="font-size:16px;margin:24px 0">This is to certify that</p>
        <h2 style="font-size:26px;color:#1a237e;margin:8px 0">${name}</h2>
        <p style="font-size:16px;margin:12px 0">is a registered ${type} Member of the<br>International Consortium of Jurists</p>
        <p style="font-size:14px;margin:12px 0">Member ID: <b>${id}</b></p>
        <p style="font-size:14px;margin:4px 0">Registration Date: <b>${regDate}</b></p>
        <p style="font-size:14px;margin:4px 0">Issued On: <b>${today}</b></p>
        <hr style="border:2px solid #1a237e;margin:28px 0">
        <div style="display:flex;justify-content:space-between;margin-top:40px">
          <div><p style="border-top:1px solid #333;padding-top:4px;font-size:13px">Authorized Signatory</p></div>
          <div><p style="border-top:1px solid #333;padding-top:4px;font-size:13px">Secretary General, ICJ</p></div>
        </div>
      </div>
      <script>window.print();<\/script>
    </body>
    </html>
  `);
  w.document.close();
};

export default function MemberCertificates() {
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
    return () => { active = false; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Certificates
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Member Type</TableCell>
              <TableCell>Verification</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No members available for certificate generation.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isEligible = member.verification_status === "Verified";
                return (
                  <TableRow key={getMemberId(member)} hover>
                    <TableCell>{getMemberName(member)}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {getMemberId(member) || "—"}
                    </TableCell>
                    <TableCell>{member.member_type || "General"}</TableCell>
                    <TableCell>{member.verification_status || "Pending"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={isEligible ? "Eligible" : "Pending Verification"}
                        color={isEligible ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant={isEligible ? "contained" : "outlined"}
                          color={isEligible ? "success" : "inherit"}
                          startIcon={<PrintIcon />}
                          onClick={() => printCertificate(member)}
                          disabled={!isEligible}
                          title={isEligible ? "Print Certificate" : "Member must be verified first"}
                        >
                          {isEligible ? "Print Certificate" : "Not Eligible"}
                        </Button>
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