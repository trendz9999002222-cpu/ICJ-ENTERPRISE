import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import LegalService from "../services/legalService";
import { useAuth } from "../hooks/useAuth";
import LegalDashboard from "../components/legal/LegalDashboard";
import LegalEntityManager from "../components/legal/LegalEntityManager";
import CaseTable from "../components/legal/CaseTable";
import HearingCalendar from "../components/legal/HearingCalendar";
import CaseTimelineDialog from "../components/legal/CaseTimelineDialog";
import CaseLinkDialog from "../components/legal/CaseLinkDialog";
import { getDocuments } from "../services/database";

const caseDefaults = {
  title: "",
  clientName: "",
  advocateName: "",
  courtName: "",
  status: "Pending",
  nextHearing: "",
  legalCost: "",
  linkedMemberId: "",
  linkedFinanceRef: "",
  linkedTokenRef: "",
};

export default function LegalCases() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const permissions = LegalService.getPermissions(role);

  const [dashboard, setDashboard] = useState(null);
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState(null);
  const [clients, setClients] = useState([]);
  const [courts, setCourts] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [notices, setNotices] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState(caseDefaults);
  const [clientForm, setClientForm] = useState({ name: "", mobile: "", email: "" });
  const [courtForm, setCourtForm] = useState({ name: "", type: "District", location: "" });
  const [advocateForm, setAdvocateForm] = useState({ name: "", barCouncilNo: "", mobile: "" });
  const [noticeForm, setNoticeForm] = useState({ caseId: "", title: "", noticeType: "Legal Notice", issuedTo: "", issuedDate: "" });
  const [hearingForm, setHearingForm] = useState({ caseId: "", hearingDate: "", courtName: "", stage: "Hearing", remarks: "" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courtFilter, setCourtFilter] = useState("ALL");
  const [advocateFilter, setAdvocateFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineRows, setTimelineRows] = useState([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [financeLinks, setFinanceLinks] = useState([]);
  const [tokenLinks, setTokenLinks] = useState([]);

  const loadModule = useCallback(async () => {
    const [
      dashboardData,
      caseRows,
      reportRows,
      clientRows,
      courtRows,
      advocateRows,
      noticeRows,
      hearingRows,
      docRows,
    ] = await Promise.all([
      LegalService.getDashboard(),
      LegalService.getAll(),
      LegalService.getReports(),
      LegalService.getClients(),
      LegalService.getCourts(),
      LegalService.getAdvocates(),
      LegalService.getNotices(),
      LegalService.getHearings(),
      getDocuments(),
    ]);

    setDashboard(dashboardData || null);
    setCases(Array.isArray(caseRows) ? caseRows : []);
    setReports(reportRows || null);
    setClients(Array.isArray(clientRows) ? clientRows : []);
    setCourts(Array.isArray(courtRows) ? courtRows : []);
    setAdvocates(Array.isArray(advocateRows) ? advocateRows : []);
    setNotices(Array.isArray(noticeRows) ? noticeRows : []);
    setHearings(Array.isArray(hearingRows) ? hearingRows : []);
    setDocuments(Array.isArray(docRows) ? docRows : []);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadModule);
  }, [loadModule]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCreate = async () => {
    await LegalService.create({ ...form, actorRole: role });
    setForm(caseDefaults);
    await loadModule();
  };

  const changeStatus = async (item, status) => {
    await LegalService.update(item.id, { status }, role);
    await loadModule();
  };

  const onDelete = async (item) => {
    if (!window.confirm("Delete this legal case?")) return;
    await LegalService.remove(item.id, role);
    await loadModule();
  };

  const onAddClient = async () => {
    await LegalService.addClient(clientForm, role);
    setClientForm({ name: "", mobile: "", email: "" });
    await loadModule();
  };

  const onAddCourt = async () => {
    await LegalService.addCourt(courtForm, role);
    setCourtForm({ name: "", type: "District", location: "" });
    await loadModule();
  };

  const onAddAdvocate = async () => {
    await LegalService.addAdvocate(advocateForm, role);
    setAdvocateForm({ name: "", barCouncilNo: "", mobile: "" });
    await loadModule();
  };

  const onAddNotice = async () => {
    await LegalService.addNotice(noticeForm, role);
    setNoticeForm({ caseId: "", title: "", noticeType: "Legal Notice", issuedTo: "", issuedDate: "" });
    await loadModule();
  };

  const onAddHearing = async () => {
    await LegalService.addHearing(hearingForm, role);
    setHearingForm({ caseId: "", hearingDate: "", courtName: "", stage: "Hearing", remarks: "" });
    await loadModule();
  };

  const onViewTimeline = async (item) => {
    setSelectedCase(item);
    setTimelineRows(await LegalService.getCaseTimeline(item.id));
    setTimelineOpen(true);
  };

  const onOpenLinking = async (item) => {
    setSelectedCase(item);
    setSelectedDocumentIds([]);
    const refs = await LegalService.createFinanceTokenLinks(item.caseNumber || item.id);
    setFinanceLinks(refs.finance || []);
    setTokenLinks(refs.token || []);
    setLinkOpen(true);
  };

  const onLinkDocuments = async () => {
    if (!selectedCase) return;
    await LegalService.linkDocuments(selectedCase.id, selectedDocumentIds, role);
    setSelectedDocumentIds([]);
    await loadModule();
  };

  const exportCases = () => {
    if (!permissions.canExport) return;
    const payload = LegalService.buildCaseExport(filteredCases);
    const blob = new Blob([payload.content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = payload.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const keyword = search.toLowerCase();
  const filteredCases = cases.filter((item) => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesCourt = courtFilter === "ALL" || item.courtName === courtFilter;
    const matchesAdvocate = advocateFilter === "ALL" || item.advocateName === advocateFilter;
    const matchesClient = clientFilter === "ALL" || item.clientName === clientFilter;
    const matchesSearch =
      !keyword ||
      String(item.caseNumber || "").toLowerCase().includes(keyword) ||
      String(item.title || "").toLowerCase().includes(keyword) ||
      String(item.clientName || "").toLowerCase().includes(keyword) ||
      String(item.advocateName || "").toLowerCase().includes(keyword);
    return matchesStatus && matchesCourt && matchesAdvocate && matchesClient && matchesSearch;
  });

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Legal Management
        </Typography>

        <LegalDashboard data={dashboard} />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Case Management
              </Typography>
              <TextField fullWidth label="Case Title" name="title" value={form.title} onChange={onChange} sx={{ mb: 2 }} />
              <TextField fullWidth select label="Client" name="clientName" value={form.clientName} onChange={onChange} sx={{ mb: 2 }}>
                {clients.map((item) => (
                  <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth select label="Advocate" name="advocateName" value={form.advocateName} onChange={onChange} sx={{ mb: 2 }}>
                {advocates.map((item) => (
                  <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth select label="Court" name="courtName" value={form.courtName} onChange={onChange} sx={{ mb: 2 }}>
                {courts.map((item) => (
                  <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth type="date" name="nextHearing" value={form.nextHearing} onChange={onChange} slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} />
              <TextField fullWidth type="number" label="Legal Cost" name="legalCost" value={form.legalCost} onChange={onChange} sx={{ mb: 2 }} />
              <TextField fullWidth label="Finance Ref" name="linkedFinanceRef" value={form.linkedFinanceRef} onChange={onChange} sx={{ mb: 2 }} />
              <TextField fullWidth label="Token Ref" name="linkedTokenRef" value={form.linkedTokenRef} onChange={onChange} sx={{ mb: 2 }} />
              <Button variant="contained" onClick={onCreate} disabled={!permissions.canCreate}>Create Case</Button>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notice Management
              </Typography>
              <TextField fullWidth select label="Case" value={noticeForm.caseId} onChange={(event) => setNoticeForm((prev) => ({ ...prev, caseId: event.target.value }))} sx={{ mb: 2 }}>
                {cases.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.caseNumber || item.title}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Notice Title" value={noticeForm.title} onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Notice Type" value={noticeForm.noticeType} onChange={(event) => setNoticeForm((prev) => ({ ...prev, noticeType: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Issued To" value={noticeForm.issuedTo} onChange={(event) => setNoticeForm((prev) => ({ ...prev, issuedTo: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth type="date" value={noticeForm.issuedDate} onChange={(event) => setNoticeForm((prev) => ({ ...prev, issuedDate: event.target.value }))} sx={{ mb: 2 }} />
              <Button variant="outlined" onClick={onAddNotice} disabled={!permissions.canManageNotices}>Add Notice</Button>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hearing Calendar Entry
              </Typography>
              <TextField fullWidth select label="Case" value={hearingForm.caseId} onChange={(event) => setHearingForm((prev) => ({ ...prev, caseId: event.target.value }))} sx={{ mb: 2 }}>
                {cases.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.caseNumber || item.title}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth type="date" value={hearingForm.hearingDate} onChange={(event) => setHearingForm((prev) => ({ ...prev, hearingDate: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Court" value={hearingForm.courtName} onChange={(event) => setHearingForm((prev) => ({ ...prev, courtName: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Stage" value={hearingForm.stage} onChange={(event) => setHearingForm((prev) => ({ ...prev, stage: event.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Remarks" value={hearingForm.remarks} onChange={(event) => setHearingForm((prev) => ({ ...prev, remarks: event.target.value }))} sx={{ mb: 2 }} />
              <Button variant="outlined" onClick={onAddHearing} disabled={!permissions.canManageHearings}>Schedule Hearing</Button>
            </Paper>
          </Grid>

          <Grid xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Search and Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={3}>
                  <TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField fullWidth select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                </Grid>
                <Grid xs={12} md={2}>
                  <TextField fullWidth select label="Court" value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)}>
                    <MenuItem value="ALL">All</MenuItem>
                    {courts.map((item) => (
                      <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} md={2}>
                  <TextField fullWidth select label="Advocate" value={advocateFilter} onChange={(event) => setAdvocateFilter(event.target.value)}>
                    <MenuItem value="ALL">All</MenuItem>
                    {advocates.map((item) => (
                      <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} md={2}>
                  <TextField fullWidth select label="Client" value={clientFilter} onChange={(event) => setClientFilter(event.target.value)}>
                    <MenuItem value="ALL">All</MenuItem>
                    {clients.map((item) => (
                      <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={exportCases} disabled={!permissions.canExport}>
                Export Case Report
              </Button>
            </Paper>

            <CaseTable
              rows={filteredCases}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              onChangeStatus={changeStatus}
              onViewTimeline={onViewTimeline}
              onOpenLinking={onOpenLinking}
              onDelete={onDelete}
            />

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid xs={12} md={4}>
                <LegalEntityManager
                  title="Client Management"
                  fields={[
                    { name: "name", label: "Client Name", md: 12 },
                    { name: "mobile", label: "Mobile", md: 6 },
                    { name: "email", label: "Email", md: 6 },
                  ]}
                  values={clientForm}
                  onChange={(name, value) => setClientForm((prev) => ({ ...prev, [name]: value }))}
                  onSubmit={onAddClient}
                  submitLabel="Add Client"
                  disabled={!permissions.canManageMasters}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <LegalEntityManager
                  title="Court Management"
                  fields={[
                    { name: "name", label: "Court Name", md: 12 },
                    { name: "type", label: "Type", md: 6 },
                    { name: "location", label: "Location", md: 6 },
                  ]}
                  values={courtForm}
                  onChange={(name, value) => setCourtForm((prev) => ({ ...prev, [name]: value }))}
                  onSubmit={onAddCourt}
                  submitLabel="Add Court"
                  disabled={!permissions.canManageMasters}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <LegalEntityManager
                  title="Advocate Management"
                  fields={[
                    { name: "name", label: "Advocate Name", md: 12 },
                    { name: "barCouncilNo", label: "Bar Council No", md: 6 },
                    { name: "mobile", label: "Mobile", md: 6 },
                  ]}
                  values={advocateForm}
                  onChange={(name, value) => setAdvocateForm((prev) => ({ ...prev, [name]: value }))}
                  onSubmit={onAddAdvocate}
                  submitLabel="Add Advocate"
                  disabled={!permissions.canManageMasters}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid xs={12} md={7}>
                <HearingCalendar rows={hearings} />
              </Grid>
              <Grid xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Legal Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {`Total Notices: ${Number(reports?.totalNotices || notices.length).toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {`Total Hearings: ${Number(reports?.hearings?.length || hearings.length).toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Case Status Mix
                  </Typography>
                  {Object.entries(reports?.statusMap || {}).map(([status, count]) => (
                    <Typography key={status} variant="body2" sx={{ mb: 0.5 }}>
                      {`${status}: ${Number(count).toLocaleString("en-IN")}`}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <CaseTimelineDialog
          open={timelineOpen}
          onClose={() => setTimelineOpen(false)}
          caseItem={selectedCase}
          timeline={timelineRows}
        />

        <CaseLinkDialog
          open={linkOpen}
          onClose={() => setLinkOpen(false)}
          caseItem={selectedCase}
          documents={documents}
          selectedDocumentIds={selectedDocumentIds}
          setSelectedDocumentIds={setSelectedDocumentIds}
          onLinkDocuments={onLinkDocuments}
          financeLinks={financeLinks}
          tokenLinks={tokenLinks}
        />
      </Box>
    </MainLayout>
  );
}


