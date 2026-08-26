import { useEffect, useState, useMemo } from "react";
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
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import { MemberService } from "../services/memberService";
import ActivityService from "../services/activityService";
import CertificateService from "../services/certificateService";
import MasterCertificateModal from "../components/common/MasterCertificateModal";
import AdvocateAssignmentModal from "../components/legal/AdvocateAssignmentModal";

const getMemberId = (member) =>
  member?.member_id || member?.memberId || member?.id || member?.uuid || "";

const getMemberName = (member) =>
  member?.fullName || member?.full_name || member?.name || "—";

const isAdvocate = (m) =>
  String(m?.role || m?.user_type || "").toLowerCase() === "advocate" ||
  String(m?.purposeCode || m?.purpose || "").includes("SERVICES") ||
  Boolean(m?.professionalRegNo || m?.practiceCourts);

const isFranchise = (m) =>
  String(m?.role || m?.user_type || "").toLowerCase() === "franchise" ||
  String(m?.purposeCode || m?.purpose || "").includes("FRANCHISE");

const isClient = (m) => !isAdvocate(m) && !isFranchise(m);

export default function MemberVerification() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState(0); // 0: Advocates, 1: Franchisees, 2: Clients, 3: All
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [assignmentMember, setAssignmentMember] = useState(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const loadMembers = async () => {
    try {
      const list = await MemberService.getAll();
      setMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load members", error);
      setMembers([]);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const updateStatus = async (member, newStatus, newActiveStatus = null) => {
    const id = getMemberId(member);
    if (!id) {
      alert("Cannot update: member ID is missing.");
      return;
    }
    try {
      const updatePayload = {
        verification_status: newStatus,
        status: newActiveStatus || (newStatus === "Approved" ? "Active" : "Under Review"),
      };

      await MemberService.update(id, updatePayload);

      // If approved, trigger certificate generation in audit ledger
      if (newStatus === "Approved") {
        try {
          CertificateService.getOrCreateCertificate({ ...member, ...updatePayload });
        } catch (e) {
          console.warn("Certificate ledger sync notice:", e);
        }
      }

      ActivityService.create({
        title: `Member "${getMemberName(member)}" (ID: ${id}) marked as ${newStatus}`,
        type: "membership",
      });

      setActionSuccessMsg(`Applicant "${getMemberName(member)}" successfully updated to "${newStatus}"!`);
      setTimeout(() => setActionSuccessMsg(""), 5000);

      await loadMembers();
      if (selectedMember && getMemberId(selectedMember) === id) {
        setSelectedMember((prev) => ({ ...prev, ...updatePayload }));
      }
    } catch (error) {
      console.error("Failed to update verification status", error);
      alert(`Unable to update: ${error.message || "Unknown error"}`);
    }
  };

  // Categorized lists
  const advocatesList = useMemo(() => members.filter(isAdvocate), [members]);
  const franchiseList = useMemo(() => members.filter(isFranchise), [members]);
  const clientList = useMemo(() => members.filter(isClient), [members]);

  // Pending counts
  const pendingAdvocates = useMemo(
    () => advocatesList.filter((m) => (m.verification_status || "Pending").toLowerCase().includes("pending")).length,
    [advocatesList]
  );
  const pendingFranchise = useMemo(
    () => franchiseList.filter((m) => (m.verification_status || "Pending").toLowerCase().includes("pending")).length,
    [franchiseList]
  );
  const pendingClients = useMemo(
    () => clientList.filter((m) => (m.verification_status || "Pending").toLowerCase().includes("pending")).length,
    [clientList]
  );

  // Active list based on selected Tab
  const currentList = useMemo(() => {
    switch (currentTab) {
      case 0: return advocatesList;
      case 1: return franchiseList;
      case 2: return clientList;
      case 3: return members;
      default: return members;
    }
  }, [currentTab, advocatesList, franchiseList, clientList, members]);

  // Filtered by Search Term
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return currentList;
    return currentList.filter((m) =>
      [
        getMemberName(m),
        m.email,
        m.mobile,
        getMemberId(m),
        m.professionalRegNo,
        m.practiceDistrict,
        m.practiceState,
        m.franchiseDistrict,
        m.problemDistrict,
        m.city,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [currentList, search]);

  const handleOpenDetail = (member) => {
    setSelectedMember(member);
    setDetailModalOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: "auto" }}>
      {/* Header Banner */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)",
          color: "#ffffff",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VerifiedUserIcon sx={{ fontSize: 36, color: "#38bdf8" }} />
              <Typography variant="h5" fontWeight={900} letterSpacing={0.5}>
                ICJ Master Member Verification Center
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
              Review legal bar credentials, jurisdictional nodes, and approve official membership certificates with dual-signature authorization.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`⚖️ ${pendingAdvocates} Advocates Pending`} color={pendingAdvocates > 0 ? "warning" : "default"} sx={{ fontWeight: 800 }} />
            <Chip label={`🏢 ${pendingFranchise} Franchise Pending`} color={pendingFranchise > 0 ? "warning" : "default"} sx={{ fontWeight: 800 }} />
            <Chip label={`👤 ${pendingClients} Clients Pending`} color={pendingClients > 0 ? "warning" : "default"} sx={{ fontWeight: 800 }} />
          </Stack>
        </Stack>
      </Paper>

      {actionSuccessMsg && (
        <Alert severity="success" sx={{ mb: 2, fontWeight: 700 }}>
          {actionSuccessMsg}
        </Alert>
      )}

      {/* Categorized Tabs */}
      <Paper elevation={1} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": { fontWeight: 800, minHeight: 52, fontSize: "0.85rem" },
          }}
        >
          <Tab
            icon={<GavelIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendingAdvocates} color="warning" sx={{ pr: 1 }}>
                Advocate Verification (अधिवक्ता)
              </Badge>
            }
          />
          <Tab
            icon={<HandshakeIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendingFranchise} color="warning" sx={{ pr: 1 }}>
                Franchise Partner Verification (फ़्रैंचाइज़ी)
              </Badge>
            }
          />
          <Tab
            icon={<PersonIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendingClients} color="warning" sx={{ pr: 1 }}>
                Litigant Client Verification (क्लाइंट/नागरिक)
              </Badge>
            }
          />
          <Tab
            icon={<VerifiedUserIcon fontSize="small" />}
            iconPosition="start"
            label={`All Applications (${members.length})`}
          />
        </Tabs>
      </Paper>

      {/* Search & Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Applicant Name, Member ID, Bar Reg No, District, Mobile, or Email..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Main Verification Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0f172a" }}>
            <TableRow>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Member ID</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Applicant Name</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Category & Bar / Node</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Jurisdiction / Location</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Contact Details</TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Verification Status</TableCell>
              <TableCell align="center" sx={{ color: "#ffffff", fontWeight: 800 }}>Executive Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={700}>
                    No verification records found in this category.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => {
                const status = member.verification_status || "Pending Admin Verification";
                const isApproved = status === "Approved" || status === "Verified";
                const isRejected = status === "Rejected";
                const isPending = !isApproved && !isRejected;
                const id = getMemberId(member);

                return (
                  <TableRow key={id || member.email} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 800, color: "#1e3a8a", fontSize: "0.82rem" }}>
                      {id || "—"}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={800} color="#0f172a">
                        {getMemberName(member)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.gender || ""} {member.birthYear ? `(${member.birthYear})` : ""}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {isAdvocate(member) ? (
                        <Box>
                          <Chip label="⚖️ Advocate & Counsel" size="small" sx={{ fontWeight: 800, bgcolor: "#fee2e2", color: "#991b1b", height: 20, fontSize: "0.68rem" }} />
                          <Typography variant="caption" display="block" fontWeight={700} color="#0f172a" sx={{ mt: 0.3 }}>
                            Bar No: {member.professionalRegNo || "Under Verification"}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {member.professionalCategory || member.specializations || "Legal Practice"}
                          </Typography>
                        </Box>
                      ) : isFranchise(member) ? (
                        <Box>
                          <Chip label="🏢 District Franchise Node" size="small" sx={{ fontWeight: 800, bgcolor: "#fef3c7", color: "#92400e", height: 20, fontSize: "0.68rem" }} />
                          <Typography variant="caption" display="block" fontWeight={700} color="#0f172a" sx={{ mt: 0.3 }}>
                            Node: {member.franchiseDistrict || member.district || "HQ District"}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Chip label="👤 Litigant Citizen / Client" size="small" sx={{ fontWeight: 800, bgcolor: "#e0f2fe", color: "#075985", height: 20, fontSize: "0.68rem" }} />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {member.purpose || "Citizen Legal Assistance"}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#334155">
                        {member.practiceDistrict || member.franchiseDistrict || member.problemDistrict || member.district || member.city || "Pan-India"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        State: {member.practiceState || member.franchiseState || member.problemState || member.state || "Delhi"}
                      </Typography>
                      {(member.practicePoliceStation || member.franchisePoliceStation || member.problemPoliceStation) && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Thana: {member.practicePoliceStation || member.franchisePoliceStation || member.problemPoliceStation}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" display="block" fontWeight={700} color="#0f172a">
                        📱 {member.mobile || "—"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        ✉️ {member.email || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={isApproved ? "🟢 Approved & Active" : isRejected ? "🔴 Rejected" : "⏳ Pending Admin Review"}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          bgcolor: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
                          color: isApproved ? "#15803d" : isRejected ? "#991b1b" : "#b45309",
                          border: isApproved ? "1px solid #86efac" : isRejected ? "1px solid #fca5a5" : "1px solid #fde047",
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="🎧 / ⚖️ Assign Customer Care Officer or Legal Counsel">
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<SupportAgentIcon sx={{ fontSize: "0.85rem" }} />}
                            onClick={() => {
                              setAssignmentMember(member);
                              setAssignmentModalOpen(true);
                            }}
                            sx={{ fontWeight: 800, fontSize: "0.72rem", py: 0.3 }}
                          >
                            Assign Officer
                          </Button>
                        </Tooltip>

                        <Tooltip title="View Complete Application Details">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenDetail(member)}
                            sx={{ fontWeight: 800, fontSize: "0.72rem", py: 0.3 }}
                          >
                            Review
                          </Button>
                        </Tooltip>

                        {isPending && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => updateStatus(member, "Approved", "Active")}
                            sx={{ fontWeight: 800, fontSize: "0.72rem", py: 0.3 }}
                          >
                            Approve
                          </Button>
                        )}

                        {isPending && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => updateStatus(member, "Rejected", "Rejected")}
                            sx={{ fontWeight: 800, fontSize: "0.72rem", py: 0.3 }}
                          >
                            Reject
                          </Button>
                        )}

                        {isApproved && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<PrintIcon />}
                            onClick={() => {
                              setSelectedMember(member);
                              setCertModalOpen(true);
                            }}
                            sx={{ fontWeight: 800, fontSize: "0.72rem", py: 0.3, bgcolor: "#d97706", "&:hover": { bgcolor: "#b45309" } }}
                          >
                            Certificate
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Complete Applicant Review Modal */}
      {selectedMember && (
        <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: "#0a192f", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VerifiedUserIcon sx={{ color: "#38bdf8" }} />
              <Typography variant="h6" fontWeight={800}>
                Executive Application Dossier: {getMemberName(selectedMember)}
              </Typography>
            </Stack>
            <IconButton onClick={() => setDetailModalOpen(false)} sx={{ color: "#94a3b8" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">PERMANENT MEMBER ID</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="primary.main" sx={{ fontFamily: "monospace" }}>
                    {getMemberId(selectedMember)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">APPLICANT TYPE / ROLE</Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="secondary.main">
                    {isAdvocate(selectedMember) ? "⚖️ Empaneled Advocate & Legal Counsel" : isFranchise(selectedMember) ? "🏢 Authorized District Franchise Partner" : "👤 Litigant Citizen / Client"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">CURRENT VERIFICATION STATUS</Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="warning.main">
                    {selectedMember.verification_status || "Pending Admin Verification"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Advocate / Professional Specific Details */}
            {isAdvocate(selectedMember) && (
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: "#fff" }}>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                  ⚖️ BAR COUNCIL & LEGAL PRACTICE PARTICULARS
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">BAR REGISTRATION NUMBER</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedMember.professionalRegNo || "Verified Council Member"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">PROFESSIONAL CATEGORY</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedMember.professionalCategory || "Legal Profession"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">PRACTICE COURTS</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedMember.practiceCourts || "Supreme Court of India & High Courts"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">SPECIALIZATIONS</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedMember.specializations || "Civil, Criminal, Constitutional"}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Pan-India Jurisdiction Details */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: "#fff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                📍 PAN-INDIA JURISDICTION & CONTACT PARTICULARS
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">STATE / UT</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.practiceState || selectedMember.franchiseState || selectedMember.problemState || selectedMember.state || "Delhi"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">DISTRICT</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.practiceDistrict || selectedMember.franchiseDistrict || selectedMember.problemDistrict || selectedMember.district || "New Delhi"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">TEHSIL / CITY</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.practiceCity || selectedMember.franchiseCity || selectedMember.problemCity || selectedMember.city || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">POLICE STATION (THANA)</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.practicePoliceStation || selectedMember.franchisePoliceStation || selectedMember.problemPoliceStation || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">PINCODE</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.practicePincode || selectedMember.franchisePincode || selectedMember.problemPincode || selectedMember.pincode || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">PRIMARY CONTACT</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedMember.mobile} | {selectedMember.email}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: "#f1f5f9" }}>
            <Button variant="outlined" onClick={() => setDetailModalOpen(false)} sx={{ fontWeight: 700 }}>
              Close Dossier
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SupportAgentIcon />}
              onClick={() => {
                setAssignmentMember(selectedMember);
                setAssignmentModalOpen(true);
              }}
              sx={{ fontWeight: 800 }}
            >
              Assign Care Officer / Advocate
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                updateStatus(selectedMember, "Rejected", "Rejected");
                setDetailModalOpen(false);
              }}
              sx={{ fontWeight: 800 }}
            >
              Reject Application
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                updateStatus(selectedMember, "Approved", "Active");
                setDetailModalOpen(false);
              }}
              sx={{ fontWeight: 900, px: 3 }}
            >
              Approve & Issue Certificate
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 🎧 / ⚖️ Advocate & Customer Care Officer Allocation Modal */}
      {assignmentMember && (
        <AdvocateAssignmentModal
          open={assignmentModalOpen}
          member={assignmentMember}
          onClose={() => setAssignmentModalOpen(false)}
          onAssigned={() => loadMembers()}
        />
      )}

      {/* Master Certificate Modal */}
      {selectedMember && (
        <MasterCertificateModal
          open={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          member={selectedMember}
        />
      )}
    </Box>
  );
}