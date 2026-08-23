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
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MemberService } from "../services/memberService";
import CertificateService from "../services/certificateService";
import MasterCertificateModal from "../components/common/MasterCertificateModal";

const getMemberId = (m) => m.member_id || m.memberId || m.id || m.uuid;
const getMemberName = (m) => m.fullName || m.full_name || m.name || "—";

export default function MemberCertificates() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMembers = () => {
    setLoading(true);
    MemberService.getAll()
      .then((list) => {
        setMembers(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        console.error("Failed to load members", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleOpenCertificate = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleDirectPrint = (member) => {
    try {
      const cert = CertificateService.getOrCreateCertificate(member);
      CertificateService.printCertificate(cert);
    } catch (err) {
      alert("Certificate Generation Error: " + err.message);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    const name = getMemberName(m).toLowerCase();
    const id = String(getMemberId(m) || "").toLowerCase();
    const email = String(m.email || "").toLowerCase();
    return name.includes(q) || id.includes(q) || email.includes(q);
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header Banner */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <VerifiedUserIcon sx={{ fontSize: 32, color: "#d97706" }} />
            <Typography variant="h4" fontWeight={900} color="text.primary">
              Official Member Certificates
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Master Certificate Generation Engine • Official Verification Registry (icj.co.in)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadMembers}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Refresh List
        </Button>
      </Box>

      {/* Search Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Member Name, Permanent Member ID, or Email Address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Certificates Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0f172a" }}>
            <TableRow>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Applicant / Member Name</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Permanent Member ID</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Assigned Role</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Certificate Number</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading registered members ledger...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No registered members found matching your search.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const memberId = getMemberId(member);
                const name = getMemberName(member);
                let certNo = "—";
                try {
                  const cert = CertificateService.getOrCreateCertificate(member);
                  certNo = cert.certificate_number;
                } catch {
                  certNo = "Pending";
                }

                return (
                  <TableRow key={memberId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} color="text.primary">
                        {name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "#0284c7" }}>
                      {memberId || "—"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={member.role === "advocate" ? "Advocate / Counsel" : member.role === "franchise" ? "Franchise Node" : "Litigant Client"}
                        color={member.role === "advocate" ? "secondary" : member.role === "franchise" ? "warning" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 800, color: "#b45309" }}>
                      {certNo}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        icon={<VerifiedUserIcon />}
                        label={member.verification_status || "Approved"}
                        color="success"
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Visual Certificate Preview">
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenCertificate(member)}
                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                          >
                            Preview
                          </Button>
                        </Tooltip>

                        <Tooltip title="Direct Print & PDF Download">
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<PrintIcon />}
                            onClick={() => handleDirectPrint(member)}
                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                          >
                            Print
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Master Certificate Modal */}
      {selectedMember && (
        <MasterCertificateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          member={selectedMember}
        />
      )}
    </Box>
  );
}