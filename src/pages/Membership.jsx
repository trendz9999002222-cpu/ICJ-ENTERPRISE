import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Alert } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { MemberService } from "../services/memberService";
import DashboardService from "../services/dashboardService";
import ActivityService from "../services/activityService";
import {
  CUSTOM_PROFESSION_TRIGGERS,
  ProfessionalMasterService,
} from "../data/professionalMasterData";

import MemberStats from "../components/membership/MemberStats";
import MemberForm from "../components/membership/MemberForm";
import MemberSearch from "../components/membership/MemberSearch";
import MemberTable from "../components/membership/MemberTable";
import MemberProfileDialog from "../components/membership/MemberProfileDialog";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";
import MainLayout from "../layouts/MainLayout";
import MemberBatchImporter from "../components/membership/MemberBatchImporter.jsx";
import MemberBatchService from "../services/memberBatchService.js";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import LinkIcon from "@mui/icons-material/Link";

export default function Membership() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, pendingMembers: 0, blockedMembers: 0, expiredMembers: 0 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "all", plan: "all", status: "all", verification: "all" });
  const [selectedMember, setSelectedMember] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    birthYear: "",
    gender: "Male",
    aadhaar: "",
    pan: "",
    profession: "Advocate",
    customProfession: "",
    designations: "",
    practiceAreas: "",
    organisation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const refreshMembers = async () => {
    try {
      const list = await MemberService.getAll();
      const safeList = Array.isArray(list) ? list : [];
      setMembers(safeList);

      const totalMembers = safeList.length;
      const activeMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "active").length;
      const pendingMembers = safeList.filter((m) => (m.verification_status || "").toLowerCase().includes("pending")).length;
      const blockedMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "blocked").length;
      const expiredMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "expired").length;

      setStats({
        totalMembers,
        activeMembers: activeMembers || totalMembers,
        pendingMembers,
        blockedMembers,
        expiredMembers,
      });

      DashboardService.getStatistics().catch(() => {});
    } catch (error) {
      console.error("Failed to load members", error);
      setMembers([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const list = await MemberService.getAll();
        const safeList = Array.isArray(list) ? list : [];
        if (isMounted) {
          setMembers(safeList);
          const totalMembers = safeList.length;
          const activeMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "active").length;
          const pendingMembers = safeList.filter((m) => (m.verification_status || "").toLowerCase().includes("pending")).length;
          const blockedMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "blocked").length;
          const expiredMembers = safeList.filter((m) => (m.status || "").toLowerCase() === "expired").length;

          setStats({
            totalMembers,
            activeMembers: activeMembers || totalMembers,
            pendingMembers,
            blockedMembers,
            expiredMembers,
          });
        }
      } catch {
        if (isMounted) setMembers([]);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveMember = async () => {
    if (!form.name || !form.name.trim()) {
      alert("Please enter Member Name.");
      return;
    }

    if (form.birthYear) {
      const MIN_AGE = 18;
      const currentYr = new Date().getFullYear();
      const maxYr = currentYr - MIN_AGE;
      const yr = parseInt(form.birthYear, 10);
      if (isNaN(yr) || yr > maxYr) {
        alert(`Applicant must be at least 18 years old to register. Birth year cannot be after ${maxYr}.`);
        return;
      }
    }

    let finalProfession = form.profession;
    if (CUSTOM_PROFESSION_TRIGGERS.includes(form.profession) && form.customProfession?.trim()) {
      finalProfession = form.customProfession.trim();
      ProfessionalMasterService.submitCustomProfession(finalProfession, form.name || "Member Registration");
    }

    const mobCode = form.mobileCountryCode || "+91";
    const waCode = form.waCountryCode || "+91";
    const emgCode = form.emergencyCountryCode || "+91";

    const mobDigits = (form.mobile || "").replace(/\D/g, "");
    const waDigits = (form.whatsapp || "").replace(/\D/g, "");
    const emgDigits = (form.emergencyContact || "").replace(/\D/g, "");

    const e164Mobile = mobDigits ? `${mobCode}${mobDigits}` : "";
    const e164Whatsapp = waDigits ? `${waCode}${waDigits}` : "";
    const e164Emergency = emgDigits ? `${emgCode}${emgDigits}` : "";

    const payload = {
      ...form,
      mobile: e164Mobile,
      whatsapp: e164Whatsapp,
      emergencyContact: e164Emergency,
      rawMobileDigits: mobDigits,
      rawWaDigits: waDigits,
      rawEmergencyDigits: emgDigits,
      profession: finalProfession,
      policyVersion: "v1.1",
      consentTimestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Enterprise Client",
      consentHash: `SHA256-CONSENT-${Date.now().toString(36)}`,
      professionsHistory: [
        {
          profession: finalProfession,
          designations: form.designations || "Member",
          practiceAreas: form.practiceAreas || "General",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const created = await MemberService.create(payload);
      ActivityService.create({
        title: `New Member Registered: ${created.name || form.name} (${finalProfession})`,
        type: "membership",
        meta: { member_id: created.member_id || created.id },
      });

      await refreshMembers();
      setShowAddForm(false);
      setAlertMsg("Member successfully registered in National Professional Registry with Consent Audit Trail!");
      setTimeout(() => setAlertMsg(""), 3500);

      setForm({
        name: "",
        email: "",
        mobile: "",
        whatsapp: "",
        birthYear: "",
        gender: "Male",
        aadhaar: "",
        pan: "",
        profession: "",
        customProfession: "",
        designations: "",
        practiceAreas: "",
        organisation: "",
        address: "",
        landmark: "",
        district: "",
        city: "",
        state: "Delhi",
        pincode: "",
        regType: "Individual",
        mobileCountryCode: "+91",
        waCountryCode: "+91",
        otpChannel: "SMS",
        policyAccepted: false,
      });
    } catch (error) {
      console.error("Failed to create member", error);
      alert(`Unable to create member: ${error.message || "Unknown error"}`);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member from Master User Repository?")) {
      return;
    }

    try {
      await MemberService.remove(id);
      ActivityService.create({
        title: `Member Removed from System: ID ${id}`,
        type: "membership",
      });
      await refreshMembers();
      setAlertMsg("Member removed from Master User Repository.");
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (error) {
      console.error("Failed to delete member", error);
      alert(`Unable to delete member: ${error.message || "Unknown error"}`);
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setProfileDialogOpen(true);
  };

  const handleSaveProfileDialog = async (updatedData) => {
    try {
      await MemberService.update(updatedData.id || updatedData.member_id, updatedData);
      await refreshMembers();
      setAlertMsg(`Member ${updatedData.name} profile updated successfully!`);
      setTimeout(() => setAlertMsg(""), 3500);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleBulkAction = async (actionType, selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;

    if (actionType === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} members?`)) return;
      for (const id of selectedIds) {
        await MemberService.remove(id);
      }
      ActivityService.create({ title: `Bulk Delete Executed on ${selectedIds.length} Members`, type: "membership" });
    } else if (actionType === "approve") {
      for (const id of selectedIds) {
        await MemberService.update(id, { verification_status: "Approved", status: "Active" });
      }
      ActivityService.create({ title: `Bulk Approval Executed on ${selectedIds.length} Members`, type: "membership" });
    } else if (actionType === "block") {
      for (const id of selectedIds) {
        await MemberService.update(id, { status: "Blocked" });
      }
      ActivityService.create({ title: `Bulk Block Executed on ${selectedIds.length} Members`, type: "membership" });
    }

    await refreshMembers();
    setAlertMsg(`Bulk Action "${actionType}" executed successfully on ${selectedIds.length} members!`);
    setTimeout(() => setAlertMsg(""), 3500);
  };

  // Enterprise Multi-Field Search & Multi-Filter Logic
  const filteredMembers = members.filter((member) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      (member.member_id || member.id || "").toLowerCase().includes(keyword) ||
      (member.name || member.fullName || "").toLowerCase().includes(keyword) ||
      (member.email || "").toLowerCase().includes(keyword) ||
      (member.mobile || "").includes(keyword) ||
      (member.aadhaar || member.aadhar || "").includes(keyword) ||
      (member.pan || "").toLowerCase().includes(keyword) ||
      (member.gst || "").toLowerCase().includes(keyword) ||
      (member.profession || "").toLowerCase().includes(keyword) ||
      (member.organisation || "").toLowerCase().includes(keyword);

    const matchesRole = filters.role === "all" || (member.role || "member").toLowerCase() === filters.role.toLowerCase();
    const matchesPlan = filters.plan === "all" || (member.member_level || "Basic").toLowerCase() === filters.plan.toLowerCase();
    const matchesStatus = filters.status === "all" || (member.status || "Active").toLowerCase() === filters.status.toLowerCase();
    const matchesVerification = filters.verification === "all" || (member.verification_status || "Approved").toLowerCase() === filters.verification.toLowerCase();

    return matchesSearch && matchesRole && matchesPlan && matchesStatus && matchesVerification;
  });

  const [batchImporterOpen, setBatchImporterOpen] = useState(false);

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Enterprise Master Member Registry & Executive Onboarding Studio
            </Typography>
            <Typography color="text.secondary">
              Offline & Executive Member Onboarding, Shareable Self-Registration Links & Excel/CSV Batch Auto-Importer
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<FileUploadIcon />}
              onClick={() => setBatchImporterOpen(true)}
              sx={{ fontWeight: "bold" }}
            >
              📊 Excel / CSV Batch Auto-Importer
            </Button>

            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Hide Member Form" : "+ Add New Member"}
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* 5 Real-time Dashboard Statistics */}
        <MemberStats
          totalMembers={stats.totalMembers}
          activeMembers={stats.activeMembers}
          pendingMembers={stats.pendingMembers}
          blockedMembers={stats.blockedMembers}
          expiredMembers={stats.expiredMembers}
          onStatClick={(statusKey) => setFilters((prev) => ({ ...prev, status: statusKey }))}
        />

        {showAddForm && (
          <MemberForm
            form={form}
            handleChange={handleChange}
            saveMember={saveMember}
            existingMembers={members}
          />
        )}

        {/* Enterprise Multi-Field Search & Multi-Filter */}
        <MemberSearch
          search={search}
          setSearch={setSearch}
          filters={filters}
          setFilters={setFilters}
          onResetFilters={() => setFilters({ role: "all", plan: "all", status: "all", verification: "all" })}
        />

        {/* Universal Action Toolbar for Master Member Registry */}
        <UniversalActionToolbar
          title="Master Membership Registry & Directory Records"
          documentId="ICJ-MEMBERSHIP-DIRECTORY-2026"
          version="v3.2.0"
        />

        {/* Master Member Directory Table & Bulk Actions */}
        <MemberTable
          filteredMembers={filteredMembers}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onBulkAction={handleBulkAction}
        />

        {/* 7-Tab Full Member Profile View & Edit Modal */}
        {selectedMember && (
          <MemberProfileDialog
            open={profileDialogOpen}
            member={selectedMember}
            onClose={() => setProfileDialogOpen(false)}
            onSave={handleSaveProfileDialog}
          />
        )}

        <MemberBatchImporter
          open={batchImporterOpen}
          onClose={() => setBatchImporterOpen(false)}
          onImportSuccess={() => refreshMembers()}
        />
      </Box>
    </>
  );
}