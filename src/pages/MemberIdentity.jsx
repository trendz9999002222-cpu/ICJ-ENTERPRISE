import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import { MemberService } from "../services/memberService";

const getMemberId = (m) => m.member_id || m.memberId || m.id || m.uuid || "N/A";
const getMemberName = (m) => m.fullName || m.full_name || m.name || "Unnamed Member";

const printIdentity = (member) => {
  const name = getMemberName(member);
  const id = getMemberId(member);
  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head><title>Digital Identity - ${name}</title></head>
    <body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
      <div style="border:3px solid #1a237e;border-radius:12px;padding:28px;text-align:center">
        <h2 style="color:#1a237e;margin:0">ICJ Digital Identity</h2>
        <h3 style="color:#b71c1c;margin:4px 0">International Consortium of Jurists</h3>
        <hr style="border:1px solid #1a237e;margin:16px 0">
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0">
          <h2 style="margin:4px 0;font-size:22px">${name}</h2>
          <p style="margin:4px 0;font-size:14px;color:#555">Member Type: ${member.member_type || "General"}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;text-align:left">
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">Digital ID</td><td style="padding:6px 8px;font-weight:bold;font-size:13px">${id}</td></tr>
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">Mobile</td><td style="padding:6px 8px;font-size:13px">${member.mobile || "—"}</td></tr>
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">Email</td><td style="padding:6px 8px;font-size:13px">${member.email || "—"}</td></tr>
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">City</td><td style="padding:6px 8px;font-size:13px">${member.city || "—"}</td></tr>
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">Verification</td><td style="padding:6px 8px;font-size:13px;font-weight:bold;color:${member.verification_status === "Verified" ? "green" : "orange"}">${member.verification_status || "Pending"}</td></tr>
          <tr><td style="padding:6px 8px;color:#555;font-size:13px">Valid Till</td><td style="padding:6px 8px;font-size:13px">${member.valid_till || "Lifetime"}</td></tr>
        </table>
        <hr style="border:1px solid #ccc;margin:16px 0">
        <p style="font-size:11px;color:#888">Issued by ICJ Enterprise Platform — ${new Date().toLocaleDateString("en-IN")}</p>
      </div>
      <script>window.print();<\/script>
    </body>
    </html>
  `);
  w.document.close();
};

export default function MemberIdentity() {
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
        Digital Identity
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        View and print digital identity cards for all ICJ members.
      </Typography>

      <Grid container spacing={2}>
        {members.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">
                No member identities available. Register members first.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          members.map((member) => (
            <Grid item xs={12} md={6} lg={4} key={getMemberId(member)}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: member.verification_status === "Verified" ? "success.main" : "divider",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BadgeIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {getMemberName(member)}
                    </Typography>
                  </Stack>

                  <Chip
                    size="small"
                    label={member.verification_status || "Pending"}
                    color={member.verification_status === "Verified" ? "success" : "warning"}
                    sx={{ width: "fit-content" }}
                  />

                  <Divider />

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      <FingerprintIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      Digital ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {getMemberId(member)}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    <Typography variant="body2">{member.member_type || "General"}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Mobile</Typography>
                    <Typography variant="body2">{member.mobile || "—"}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">City</Typography>
                    <Typography variant="body2">{member.city || "—"}</Typography>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => printIdentity(member)}
                    fullWidth
                  >
                    Print Identity Card
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}