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
  Button,
  Stack,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";

const toDateString = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

const resolveIssueDate = (member) => member.created_at || member.registration_date || new Date().toISOString();

const resolveExpiryDate = (member) => {
  if (member.valid_till) return member.valid_till;
  const issue = new Date(resolveIssueDate(member));
  issue.setFullYear(issue.getFullYear() + 1);
  return issue.toISOString();
};

const getCertificateNumber = (member) => {
  const memberId = String(member.member_id || member.membership_id || "NA").replace(/[^a-zA-Z0-9-]/g, "");
  const dateToken = new Date(resolveIssueDate(member)).toISOString().slice(0, 10).replace(/-/g, "");
  return `CERT-${memberId}-${dateToken}`;
};

const escapePdfText = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildSimplePdf = (lines) => {
  const lineCommands = lines
    .map((line, index) => `${index === 0 ? "72 770 Td" : "T*"} (${escapePdfText(line)}) Tj`)
    .join("\n");
  const stream = `BT\n/F1 12 Tf\n${lineCommands}\nET`;
  const objects = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
  objects.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
};

export default function MemberCertificates() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const issueCertificate = (member) => {
    const certificateNumber = getCertificateNumber(member);
    const issueDate = toDateString(resolveIssueDate(member));
    const expiryDate = toDateString(resolveExpiryDate(member));
    const status = String(member.status || "Pending");
    const watermark = status.toLowerCase() === "suspended" ? "SUSPENDED" : "ACTIVE";

    const lines = [
      "ICJ Enterprise Platform - Membership Certificate",
      "",
      `Certificate Number: ${certificateNumber}`,
      `Name: ${member.name || "N/A"}`,
      `Member ID: ${member.member_id || member.membership_id || "N/A"}`,
      `Type: ${member.member_type || "Individual"}`,
      `Status: ${status}`,
      `Watermark: ${watermark}`,
      `Issue Date: ${issueDate}`,
      `Expiry Date: ${expiryDate}`,
      `Validity: ${issueDate} to ${expiryDate}`,
    ];

    const blob = buildSimplePdf(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${member.member_id || member.membership_id || "member"}-certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const printCertificate = (member) => {
    const certificateNumber = getCertificateNumber(member);
    const issueDate = toDateString(resolveIssueDate(member));
    const expiryDate = toDateString(resolveExpiryDate(member));
    const status = String(member.status || "Pending");
    const watermark = status.toLowerCase() === "suspended" ? "SUSPENDED" : "ACTIVE";

    const html = `
      <html>
        <head><title>Membership Certificate</title></head>
        <body style="font-family:Arial,sans-serif;padding:24px;position:relative;">
          <div style="position:absolute;inset:0;display:flex;justify-content:center;align-items:center;font-size:96px;color:${watermark === "SUSPENDED" ? "#ef4444" : "#22c55e"};opacity:0.14;transform:rotate(-25deg);font-weight:700;">${watermark}</div>
          <h2>ICJ Enterprise Platform - Membership Certificate</h2>
          <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
          <p><strong>Name:</strong> ${member.name || "N/A"}</p>
          <p><strong>Member ID:</strong> ${member.member_id || member.membership_id || "N/A"}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Issue Date:</strong> ${issueDate}</p>
          <p><strong>Expiry Date:</strong> ${expiryDate}</p>
          <p><strong>Validity:</strong> ${issueDate} to ${expiryDate}</p>
        </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Certificates
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Certificate No</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Validity</TableCell>
                <TableCell>Watermark</TableCell>
                <TableCell>Certificate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No members available.</TableCell>
                </TableRow>
              ) : (
                members.map((member, index) => (
                  <TableRow key={`${member.id || member.member_id || member.membership_id || 'member'}-${index}`}>
                    <TableCell>{member.member_id || "-"}</TableCell>
                    <TableCell>{member.name || "-"}</TableCell>
                    <TableCell>{member.verification_status || "Pending"}</TableCell>
                    <TableCell>{getCertificateNumber(member)}</TableCell>
                    <TableCell>{toDateString(resolveIssueDate(member))}</TableCell>
                    <TableCell>{toDateString(resolveExpiryDate(member))}</TableCell>
                    <TableCell>{toDateString(resolveIssueDate(member))} to {toDateString(resolveExpiryDate(member))}</TableCell>
                    <TableCell>{String(member.status || "").toLowerCase() === "suspended" ? "SUSPENDED" : "ACTIVE"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={member.verification_status !== "Verified"}
                          onClick={() => issueCertificate(member)}
                        >
                          Download PDF
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={member.verification_status !== "Verified"}
                          onClick={() => printCertificate(member)}
                        >
                          Print
                        </Button>
                      </Stack>
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
