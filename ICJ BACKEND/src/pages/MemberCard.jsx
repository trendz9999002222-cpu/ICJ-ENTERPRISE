import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Chip, Stack, Button, Avatar } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";

const toDateString = (value) => {
  if (!value) return "-";
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

const buildQrData = (member) => {
  const payload = {
    memberId: member.member_id || member.membership_id || "",
    name: member.name || "",
    mobile: member.mobile || "",
    verificationStatus: member.verification_status || "Pending",
  };
  return JSON.stringify(payload);
};

const getQrUrl = (member) => {
  const data = encodeURIComponent(buildQrData(member));
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${data}`;
};

const buildIdCardSvg = (member) => {
  const memberName = String(member.name || "Member").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const memberId = String(member.member_id || member.membership_id || "-").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const mobile = String(member.mobile || "-").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const verification = String(member.verification_status || "Pending").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const memberStatus = String(member.status || "Pending").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const issueDate = toDateString(resolveIssueDate(member));
  const expiryDate = toDateString(resolveExpiryDate(member));
  const qrUrl = getQrUrl(member).replace(/&/g, "&amp;");
  const photo = String(member.profile_photo || "").replace(/&/g, "&amp;");
  const watermark = String(member.status || "").toLowerCase() === "suspended" ? "SUSPENDED" : "ACTIVE";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="700" height="420" viewBox="0 0 700 420">
  <rect x="0" y="0" width="700" height="420" rx="24" ry="24" fill="#f4f7ff"/>
  <rect x="20" y="20" width="660" height="380" rx="20" ry="20" fill="#ffffff" stroke="#c7d2fe" stroke-width="2"/>
  <text x="40" y="70" font-size="28" font-family="Segoe UI, Arial" font-weight="700" fill="#1e293b">ICJ Digital ID Card</text>
  <text x="40" y="115" font-size="18" font-family="Segoe UI, Arial" fill="#334155">${memberName}</text>
  <text x="40" y="150" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Member ID: ${memberId}</text>
  <text x="40" y="180" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Mobile: ${mobile}</text>
  <text x="40" y="210" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Status: ${verification}</text>
  <text x="40" y="240" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Membership: ${memberStatus}</text>
  <text x="40" y="270" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Issued: ${issueDate}</text>
  <text x="40" y="300" font-size="16" font-family="Segoe UI, Arial" fill="#475569">Valid Till: ${expiryDate}</text>
  <text x="350" y="350" text-anchor="middle" font-size="58" font-family="Segoe UI, Arial" font-weight="700" fill="${watermark === "SUSPENDED" ? "#ef4444" : "#22c55e"}" fill-opacity="0.12" transform="rotate(-25 350 350)">${watermark}</text>
  ${photo ? `<image href="${photo}" x="500" y="60" width="140" height="140" preserveAspectRatio="xMidYMid slice"/>` : ""}
  <image href="${qrUrl}" x="500" y="230" width="140" height="140"/>
</svg>`;
};

const downloadIdCard = (member) => {
  const svg = buildIdCardSvg(member);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `${member.member_id || member.membership_id || "member"}-digital-id.svg`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printIdCard = (member) => {
  const svg = buildIdCardSvg(member);
  const printWindow = window.open("", "_blank", "width=820,height=620");
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>Print ID Card</title></head><body style="margin:0;padding:12px;">${svg}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export default function MemberCard() {
  const [members, setMembers] = useState([]);
  const [verificationResults, setVerificationResults] = useState({});

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const applyVerificationResult = (memberKey, result) => {
    setVerificationResults((prev) => ({ ...prev, [memberKey]: result }));
  };

  const verifyDecodedPayload = async (member, payload) => {
    const result = await MemberService.verifyDigitalIdentity(payload || {});
    const memberKey = String(member.members || member.id || member.member_id || "");
    applyVerificationResult(memberKey, result);
    window.alert(result.reason || (result.valid ? "QR Verification Success" : "QR Verification Failed"));
  };

  const scanQrFromImage = async (member, file) => {
    if (!file) return;
    if (typeof BarcodeDetector === "undefined") {
      window.alert("QR image scan is not supported in this browser. Use manual Verify QR.");
      return;
    }

    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      const rawValue = codes?.[0]?.rawValue || "";
      if (!rawValue) {
        window.alert("No QR code detected in selected image.");
        return;
      }
      await verifyDecodedPayload(member, JSON.parse(rawValue));
    } catch {
      window.alert("Unable to scan QR image.");
    }
  };

  const openQrScanner = (member) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = async (event) => {
      const file = event.target.files?.[0] || null;
      await scanQrFromImage(member, file);
    };
    input.click();
  };

  const verifyQrPayload = (member) => {
    const raw = window.prompt("Paste scanned QR payload JSON");
    if (!raw) return;
    try {
      void verifyDecodedPayload(member, JSON.parse(raw));
    } catch {
      window.alert("Invalid QR payload");
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Cards
        </Typography>

        <Grid container spacing={2}>
          {members.length === 0 ? (
            <Grid xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary">No members available.</Typography>
              </Paper>
            </Grid>
          ) : (
            members.map((member, index) => {
              const memberKey = `${member.id || member.member_id || member.membership_id || "member"}-${index}`;
              const verificationKey = String(member.members || member.id || member.member_id || member.membership_id || memberKey);
              return (
                <Grid xs={12} md={6} lg={4} key={memberKey}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    {verificationResults[verificationKey] ? (
                      <Chip
                        size="small"
                        sx={{ mb: 1 }}
                        color={verificationResults[verificationKey].valid ? "success" : "error"}
                        label={`QR ${verificationResults[verificationKey].status}`}
                      />
                    ) : null}
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                      <Avatar src={member.profile_photo || ""}>
                        {String(member.name || "M").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{member.name || "Member"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.member_id || member.membership_id || "No Member ID"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {member.email || "-"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {member.mobile || "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Validity: {toDateString(resolveIssueDate(member))} to {toDateString(resolveExpiryDate(member))}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 1 }}>
                      <img src={getQrUrl(member)} alt="Member QR Code" width={108} height={108} />
                    </Box>
                    <Chip size="small" label={member.member_level || "BASIC"} color="primary" sx={{ mr: 1 }} />
                    <Chip size="small" label={member.verification_status || "Pending"} color={member.verification_status === "Verified" ? "success" : "warning"} />
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Button size="small" variant="outlined" onClick={() => downloadIdCard(member)}>
                        Download ID Card
                      </Button>
                      <Button size="small" variant="contained" onClick={() => printIdCard(member)}>
                        Print ID Card
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => openQrScanner(member)}>
                        Scan QR
                      </Button>
                      <Button size="small" onClick={() => verifyQrPayload(member)}>
                        Verify QR
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
    </MainLayout>
  );
}
