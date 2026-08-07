import { useMemo, useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import useAuth from "../hooks/useAuth";

import { MemberService } from "../services/memberService";
import { hasPermission } from "../core/permissions";
import { resolveRoleCode } from "../core/roles";

import MemberStats from "../components/membership/MemberStats";
import MemberForm from "../components/membership/MemberForm";
import MemberSearch from "../components/membership/MemberSearch";
import MemberTable from "../components/membership/MemberTable";
import MemberProfileDialog from "../components/membership/MemberProfileDialog";
import MemberHistoryDialog from "../components/membership/MemberHistoryDialog";
import MemberDocumentsDialog from "../components/membership/MemberDocumentsDialog";

const baseForm = {
  name: "",
  email: "",
  mobile: "",
  whatsapp: "",
  dob: "",
  gender: "",
  aadhar: "",
  pan: "",
  gst: "",
  profession: "",
  organisation: "",
  address: "",
  city: "",
  district: "",
  state: "",
  post_office: "",
  pincode: "",
  need_services: "receive",
  provide_services: "no",
  service_category: "",
  designation: "",
  signature: "",
  registration_document: "",
  registration_document_name: "",
  registration_document_type: "",
  registration_document_size: 0,
  age: "",
  member_type: "",
  verification_status: "Not Verified",
  member_level: "BASIC",
  status: "Pending",
  remarks: "",
  experience: "",
};

export default function Membership() {
  const { profile, user } = useAuth();
  const roleCode = resolveRoleCode(profile, user);
  const canView = hasPermission(roleCode, "membership.view");
  const canCreate = hasPermission(roleCode, "membership.create");
  const canEdit = hasPermission(roleCode, "membership.update");
  const canDelete = hasPermission(roleCode, "membership.delete");
  const canApprove = hasPermission(roleCode, "membership.approve");
  const canReject = hasPermission(roleCode, "membership.reject");
  const canVerify = hasPermission(roleCode, "membership.verify");
  const canSuspend = hasPermission(roleCode, "membership.suspend");
  const canReactivate = hasPermission(roleCode, "membership.reactivate");

  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [documentRows, setDocumentRows] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingMembers: 0,
    approvedMembers: 0,
    rejectedMembers: 0,
    suspendedMembers: 0,
    expiredMembers: 0,
  });

  const loadMembers = useCallback(async () => {
    const data = await MemberService.getAll({ role: roleCode });
    setMembers(Array.isArray(data) ? data : []);
    const serviceStats = await MemberService.getStatistics();
    setStats(serviceStats);
  }, [roleCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers();
  }, [loadMembers]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "ALL",
    member_type: "ALL",
  });

  const [form, setForm] = useState(baseForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const dob = new Date(value);
      const now = new Date();
      let age = "";
      if (!Number.isNaN(dob.getTime())) {
        let years = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
          years -= 1;
        }
        age = String(Math.max(0, years));
      }
      setForm((prev) => ({
        ...prev,
        dob: value,
        age,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveMember = async () => {
    if (form.name.trim() === "") {
      alert("Please enter Member Name");
      return;
    }

    try {
      if (editingId) {
        if (!canEdit) {
          alert("You do not have permission to edit members.");
          return;
        }
        console.log("[Membership] Updating member:", editingId, form);
        await MemberService.update(editingId, { ...form, actorRole: roleCode, role: roleCode });
        await MemberService.addHistory(editingId, {
          action: "Profile Updated",
          message: "Member profile was updated from Membership module.",
          actorRole: roleCode,
        });
        alert("Member updated successfully!");
      } else {
        if (!canCreate) {
          alert("You do not have permission to create members.");
          return;
        }
        console.log("[Membership] Saving member:", form);
        await MemberService.create({ ...form, role: roleCode });
        alert("Member registered successfully!");
      }

      await loadMembers();
      setForm(baseForm);
      setEditingId(null);
    } catch (error) {
      console.error("[Membership] Error saving member:", error);
      alert("Error saving member: " + error.message);
    }

  };

  const editMember = (member) => {
    if (!canEdit) return;
    const id = member.id || member.members;
    setEditingId(id);
    setForm({
      ...baseForm,
      ...member,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProfile = (member) => {
    setSelectedMember(member);
    setProfileOpen(true);
  };

  const openHistory = async (member) => {
    const id = member.id || member.members;
    setSelectedMember(member);
    setHistoryRows(await MemberService.getHistory(id));
    setHistoryOpen(true);
  };

  const openDocuments = async (member) => {
    const id = member.id || member.members;
    setSelectedMember(member);
    setDocumentRows(await MemberService.getDocuments(id));
    setDocumentsOpen(true);
  };

  const addDocument = async (payload) => {
    if (!selectedMember) return;
    const id = selectedMember.id || selectedMember.members;
    const rows = await MemberService.addDocument(id, payload);
    setDocumentRows(rows);
  };

  const removeDocument = async (documentId) => {
    if (!selectedMember) return;
    if (!window.confirm("Delete this attached document?")) return;
    const id = selectedMember.id || selectedMember.members;
    const rows = await MemberService.removeDocument(id, documentId);
    setDocumentRows(rows);
  };

  const replaceDocument = async (documentId, payload) => {
    if (!selectedMember) return;
    const id = selectedMember.id || selectedMember.members;
    const rows = await MemberService.replaceDocument(id, documentId, payload);
    setDocumentRows(rows);
  };

  const deleteMember = async (id) => {
    if (!canDelete) {
      alert("You do not have permission to delete members.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }

    try {
      console.log("[Membership] Deleting member:", id);
      await MemberService.remove(id, { actorRole: roleCode, role: roleCode });
      console.log("[Membership] Member deleted successfully");

      await loadMembers();

      alert("Member deleted successfully!");
    } catch (error) {
      console.error("[Membership] Error deleting member:", error);
      alert("Error deleting member: " + error.message);
    }

  };

  const visibleMembers = useMemo(() => members, [members]);

  const filteredMembers = visibleMembers.filter((member) => {

    const keyword = search.toLowerCase();
    const normalizeType = (value) => {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw) return "";
      if (raw === "organisation" || raw === "organization" || raw === "institutional") return "Institutional";
      if (raw === "individual") return "Individual";
      return String(value || "").trim();
    };
    const normalizeStatus = (value) => {
      const raw = String(value || "").trim().toUpperCase();
      if (raw === "APPROVED" || raw === "ACTIVE") return "Approved";
      if (raw === "REJECTED") return "Rejected";
      if (raw === "SUSPENDED" || raw === "INACTIVE" || raw === "ARCHIVED") return "Suspended";
      if (raw === "EXPIRED") return "Expired";
      return "Pending";
    };

    const matchesStatus =
      filters.status === "ALL" ||
      normalizeStatus(member.status) === String(filters.status || "");
    const matchesType =
      filters.member_type === "ALL" ||
      normalizeType(member.member_type || member.membership_type) === normalizeType(filters.member_type);
    const matchesSearch =
      String(member.name || member.full_name || "").toLowerCase().includes(keyword) ||
      String(member.email || "").toLowerCase().includes(keyword) ||
      String(member.mobile || "").includes(search) ||
      String(member.member_id || member.membership_id || "").toLowerCase().includes(keyword);

    return matchesSearch && matchesStatus && matchesType;

  });

  const getMemberId = (member) => String(member.id || member.members || member.member_id || "");

  const onToggleSelectMember = (member) => {
    const id = getMemberId(member);
    if (!id) return;
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onToggleSelectAll = () => {
    if (filteredMembers.length === 0) {
      setSelectedMemberIds([]);
      return;
    }
    const visibleIds = filteredMembers.map((member) => getMemberId(member));
    const allSelected = visibleIds.every((id) => selectedMemberIds.includes(id));
    setSelectedMemberIds(allSelected ? [] : visibleIds);
  };

  const withContext = { actorRole: roleCode, role: roleCode };

  const onApproveMember = async (member) => {
    if (!canApprove) return;
    await MemberService.approveMember(getMemberId(member), withContext);
    await loadMembers();
  };

  const onRejectMember = async (member) => {
    if (!canReject) return;
    let reason;
    try {
      reason = window.prompt("Add rejection remarks (optional):", "") || "";
    } catch {
      reason = "";
    }
    await MemberService.rejectMember(getMemberId(member), reason, withContext);
    await loadMembers();
  };

  const onSuspendMember = async (member) => {
    if (!canSuspend) return;
    await MemberService.suspendMember(getMemberId(member), withContext);
    await loadMembers();
  };

  const onReactivateMember = async (member) => {
    if (!canReactivate) return;
    await MemberService.reactivateMember(getMemberId(member), withContext);
    await loadMembers();
  };

  const onVerifyMember = async (member) => {
    if (!canVerify) return;
    await MemberService.verifyMember(getMemberId(member), withContext);
    await loadMembers();
  };

  const onAddRemarks = async (member) => {
    const remarks = window.prompt("Add remarks:", member?.remarks || "");
    if (remarks === null) return;
    await MemberService.addRemarks(getMemberId(member), remarks, withContext);
    await loadMembers();
  };

  const runBulkAction = async (handler) => {
    if (!selectedMemberIds.length) return;
    for (const id of selectedMemberIds) {
      const member = members.find((row) => getMemberId(row) === id);
      if (member) {
        // Execute serially to keep state updates predictable.
        await handler(member);
      }
    }
    setSelectedMemberIds([]);
  };

  return (
    <Box sx={{ p: 3 }}>

      {!canView ? (
        <Typography color="error" sx={{ mb: 3 }}>
          You do not have permission to view membership data.
        </Typography>
      ) : null}

      {!canView ? null : (
        <>

          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
          >
            Membership Management
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            ICJ Enterprise Membership Platform
          </Typography>

          <MemberStats
            totalMembers={stats.totalMembers}
            pendingMembers={stats.pendingMembers}
            approvedMembers={stats.approvedMembers}
            rejectedMembers={stats.rejectedMembers}
            suspendedMembers={stats.suspendedMembers}
            expiredMembers={stats.expiredMembers}
          />

          {canCreate ? (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: 600 }}>
                {editingId ? "Edit Member" : "Register Member"}
              </Typography>
              <MemberForm
                form={form}
                handleChange={handleChange}
                saveMember={saveMember}
                submitLabel={editingId ? "UPDATE MEMBER" : "REGISTER MEMBER"}
              />
            </>
          ) : null}

          <MemberSearch
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
          />

          {canApprove || canReject || canSuspend || canReactivate ? (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
              {canApprove ? (
                <Button size="small" variant="outlined" disabled={!selectedMemberIds.length} onClick={() => runBulkAction(onApproveMember)}>
                  Bulk Approve
                </Button>
              ) : null}
              {canReject ? (
                <Button size="small" variant="outlined" disabled={!selectedMemberIds.length} onClick={() => runBulkAction(onRejectMember)}>
                  Bulk Reject
                </Button>
              ) : null}
              {canSuspend ? (
                <Button size="small" variant="outlined" disabled={!selectedMemberIds.length} onClick={() => runBulkAction(onSuspendMember)}>
                  Bulk Suspend
                </Button>
              ) : null}
              {canReactivate ? (
                <Button size="small" variant="outlined" disabled={!selectedMemberIds.length} onClick={() => runBulkAction(onReactivateMember)}>
                  Bulk Reactivate
                </Button>
              ) : null}
            </Stack>
          ) : null}

          <MemberTable
            filteredMembers={filteredMembers}
            selectedMemberIds={selectedMemberIds}
            onToggleSelectMember={onToggleSelectMember}
            onToggleSelectAll={onToggleSelectAll}
            onViewProfile={openProfile}
            onViewHistory={openHistory}
            onOpenDocuments={openDocuments}
            onEditMember={editMember}
            onApproveMember={onApproveMember}
            onRejectMember={onRejectMember}
            onSuspendMember={onSuspendMember}
            onReactivateMember={onReactivateMember}
            onVerifyMember={onVerifyMember}
            onAddRemarks={onAddRemarks}
            deleteMember={deleteMember}
            canEdit={canEdit}
            canDelete={canDelete}
            canApprove={canApprove}
            canReject={canReject}
            canSuspend={canSuspend}
            canReactivate={canReactivate}
            canVerify={canVerify}
          />

          <MemberProfileDialog
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            member={selectedMember}
          />

          <MemberHistoryDialog
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            member={selectedMember}
            history={historyRows}
          />

          <MemberDocumentsDialog
            open={documentsOpen}
            onClose={() => setDocumentsOpen(false)}
            member={selectedMember}
            documents={documentRows}
            canManage={canEdit}
            onAddDocument={addDocument}
            onReplaceDocument={replaceDocument}
            onDeleteDocument={removeDocument}
          />

        </>
      )}

    </Box>
  );
}
