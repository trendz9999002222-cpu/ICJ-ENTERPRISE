import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

const displayValue = (value) => {
  const text = String(value ?? "").trim();
  return text ? text : "-";
};

const normalizeMemberType = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "-";
  if (raw === "organisation" || raw === "organization" || raw === "institutional") return "Institutional";
  if (raw === "individual") return "Individual";
  return String(value || "").trim();
};

const normalizeVerificationStatus = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "Not Verified";
  if (raw === "verified" || raw === "true" || raw === "yes") return "Verified";
  return "Not Verified";
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN");
};

const Row = ({ label, value }) => (
  <Grid xs={12} md={6}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.5 }}>
      {displayValue(value)}
    </Typography>
  </Grid>
);

export default function MemberProfileDialog({ open, onClose, member }) {
  if (!member) return null;

  const isInternational = Boolean(member.country && member.country !== "India");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Member Profile & Identity Details</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 0.5 }}>
          <Chip size="small" label={normalizeMemberType(member.member_type || member.membership_type)} />
          <Chip size="small" label={displayValue(member.member_level || "BASIC")} color="primary" />
          <Chip size="small" label={displayValue(member.role_code || member.role || "member")} color="secondary" />
          <Chip
            size="small"
            label={normalizeVerificationStatus(member.verification_status)}
            color={normalizeVerificationStatus(member.verification_status) === "Verified" ? "success" : "warning"}
          />
          {isInternational ? (
            <Chip size="small" label="International Jurisdiction" color="info" />
          ) : (
            <Chip size="small" label="India Jurisdiction" color="default" />
          )}
        </Stack>

        <Grid container spacing={2}>
          <Row label="Member ID" value={member.member_id || member.membership_id} />
          <Row label="Name" value={member.name || member.full_name} />
          <Row label="Email" value={member.email} />
          <Row label="Mobile" value={member.mobile} />
          <Row label="WhatsApp" value={member.whatsapp} />
          <Row label="Date Of Birth" value={formatDate(member.dob)} />
          <Row label="Gender" value={member.gender} />
          <Row label="Profession" value={member.profession} />
          <Row label="Organisation" value={member.organisation} />
          <Row label="Designation" value={member.designation} />
          
          {/* Address Section */}
          <Grid xs={12} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" fontWeight="600" color="primary">
              Address & Jurisdiction Hierarchy
            </Typography>
          </Grid>

          <Row label="Country" value={member.country || "India"} />
          <Row label={isInternational ? "State / Province / Region" : "State"} value={member.state} />
          
          {!isInternational ? (
            <>
              <Row label="District" value={member.district} />
              <Row label="Sub-District / Tehsil" value={member.tehsil || member.sub_division} />
              <Row label="City / Town / Village" value={member.city} />
              <Row label="Post Office" value={member.post_office} />
              <Row label="PIN Code" value={member.pincode || member.postal_code} />
            </>
          ) : (
            <>
              <Row label="City / Town / Municipality" value={member.city} />
              <Row label="Postal Code / ZIP Code" value={member.postal_code || member.pincode} />
            </>
          )}

          <Row label="Address Line 1" value={member.address} />
          <Row label="Address Line 2" value={member.address_line2} />
          <Row label="Landmark" value={member.landmark} />

          {/* Status & Audit Section */}
          <Grid xs={12} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" fontWeight="600" color="primary">
              Status & Registration Metadata
            </Typography>
          </Grid>
          <Row label="Status" value={member.status} />
          <Row label="Verification" value={normalizeVerificationStatus(member.verification_status)} />
          <Row label="Registration Date" value={formatDate(member.registration_date || member.created_at || member.createdAt)} />
          <Row label="Remarks" value={member.remarks} />
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
