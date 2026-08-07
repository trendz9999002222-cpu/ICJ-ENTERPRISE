import {
  getLegalCases,
  addLegalCase,
  updateLegalCase,
  deleteLegalCase,
  getMembers,
  getDocuments,
} from "./database";
import { optionalString, requirePositiveNumber, requireString } from "../utils/validation";
import FinanceService from "./financeService";
import TokenService from "./tokenService";

const STORAGE_KEYS = {
  clients: "icj_legal_clients",
  courts: "icj_legal_courts",
  advocates: "icj_legal_advocates",
  notices: "icj_legal_notices",
  hearings: "icj_legal_hearings",
  timelines: "icj_legal_timelines",
  links: "icj_legal_case_links",
};

const DEFAULT_COURTS = [
  { id: "CRT-SC", name: "Supreme Court", type: "National", location: "New Delhi", status: "Active" },
  { id: "CRT-HC", name: "High Court", type: "State", location: "State HQ", status: "Active" },
  { id: "CRT-DC", name: "District Court", type: "District", location: "District HQ", status: "Active" },
];

const permissionMap = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageMasters: true,
    canManageNotices: true,
    canManageHearings: true,
    canExport: true,
  },
  employee: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageMasters: true,
    canManageNotices: true,
    canManageHearings: true,
    canExport: true,
  },
  member: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageMasters: false,
    canManageNotices: false,
    canManageHearings: false,
    canExport: false,
  },
};

const normalizeRole = (role) => String(role || "member").toLowerCase();

const readStore = (key, fallback = []) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const byDateDesc = (rows, field = "createdAt") =>
  [...rows].sort((a, b) => new Date(b[field] || 0).getTime() - new Date(a[field] || 0).getTime());

const byDateAsc = (rows, field = "date") =>
  [...rows].sort((a, b) => new Date(a[field] || 0).getTime() - new Date(b[field] || 0).getTime());

const ensureDefaultCourts = () => {
  const rows = readStore(STORAGE_KEYS.courts, []);
  if (rows.length) return rows;
  writeStore(STORAGE_KEYS.courts, DEFAULT_COURTS);
  return DEFAULT_COURTS;
};

const toCsv = (rows, columns) => {
  const head = columns.map((col) => col.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => `"${String(row[col.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return `${head}\n${body}`;
};

const LegalService = {
  getPermissions(role) {
    return permissionMap[normalizeRole(role)] || permissionMap.member;
  },

  async getAll() {
    const rows = await getLegalCases();
    return byDateDesc(Array.isArray(rows) ? rows : [], "updatedAt");
  },

  async getClients() {
    const memberRows = await getMembers();
    const members = (Array.isArray(memberRows) ? memberRows : []).map((item) => ({
      id: item.member_id || item.id,
      name: item.name || "",
      mobile: item.mobile || "",
      email: item.email || "",
      type: "Member",
      status: item.status || "Active",
      memberId: item.member_id || item.id,
    }));

    const custom = readStore(STORAGE_KEYS.clients, []);
    return byDateDesc([...custom, ...members], "createdAt");
  },

  async addClient(payload, role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canManageMasters) {
      throw new Error("You do not have permission to manage clients.");
    }

    const rows = readStore(STORAGE_KEYS.clients, []);
    const item = {
      id: nextId("CL"),
      name: requireString(payload?.name, "Client name"),
      mobile: optionalString(payload?.mobile),
      email: optionalString(payload?.email),
      type: optionalString(payload?.type) || "External",
      memberId: optionalString(payload?.memberId),
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.clients, [item, ...rows]);
    return item;
  },

  async getCourts() {
    return ensureDefaultCourts();
  },

  async addCourt(payload, role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canManageMasters) {
      throw new Error("You do not have permission to manage courts.");
    }

    const rows = ensureDefaultCourts();
    const item = {
      id: nextId("CRT"),
      name: requireString(payload?.name, "Court name"),
      type: optionalString(payload?.type) || "District",
      location: optionalString(payload?.location),
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.courts, [item, ...rows]);
    return item;
  },

  async getAdvocates() {
    return byDateDesc(readStore(STORAGE_KEYS.advocates, []), "createdAt");
  },

  async addAdvocate(payload, role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canManageMasters) {
      throw new Error("You do not have permission to manage advocates.");
    }

    const rows = readStore(STORAGE_KEYS.advocates, []);
    const item = {
      id: nextId("ADV"),
      name: requireString(payload?.name, "Advocate name"),
      barCouncilNo: optionalString(payload?.barCouncilNo),
      mobile: optionalString(payload?.mobile),
      specialization: optionalString(payload?.specialization),
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    writeStore(STORAGE_KEYS.advocates, [item, ...rows]);
    return item;
  },

  async getNotices() {
    return byDateDesc(readStore(STORAGE_KEYS.notices, []), "createdAt");
  },

  async addNotice(payload, role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canManageNotices) {
      throw new Error("You do not have permission to manage notices.");
    }

    const rows = readStore(STORAGE_KEYS.notices, []);
    const item = {
      id: nextId("NOC"),
      caseId: requireString(payload?.caseId, "Case"),
      title: requireString(payload?.title, "Notice title"),
      noticeType: optionalString(payload?.noticeType) || "Legal Notice",
      issuedTo: optionalString(payload?.issuedTo),
      issuedDate: optionalString(payload?.issuedDate) || new Date().toISOString().slice(0, 10),
      status: optionalString(payload?.status) || "Issued",
      createdAt: new Date().toISOString(),
    };

    writeStore(STORAGE_KEYS.notices, [item, ...rows]);
    await this.addTimelineEntry(item.caseId, {
      eventType: "Notice",
      title: item.title,
      detail: `${item.noticeType} issued to ${item.issuedTo || "-"}`,
      date: item.issuedDate,
    });
    return item;
  },

  async getHearings() {
    return byDateAsc(readStore(STORAGE_KEYS.hearings, []), "hearingDate");
  },

  async addHearing(payload, role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canManageHearings) {
      throw new Error("You do not have permission to manage hearings.");
    }

    const rows = readStore(STORAGE_KEYS.hearings, []);
    const item = {
      id: nextId("HR"),
      caseId: requireString(payload?.caseId, "Case"),
      hearingDate: requireString(payload?.hearingDate, "Hearing date"),
      courtName: optionalString(payload?.courtName),
      stage: optionalString(payload?.stage) || "Hearing",
      remarks: optionalString(payload?.remarks),
      status: optionalString(payload?.status) || "Scheduled",
      createdAt: new Date().toISOString(),
    };

    writeStore(STORAGE_KEYS.hearings, [item, ...rows]);
    await this.addTimelineEntry(item.caseId, {
      eventType: "Hearing",
      title: `${item.stage} scheduled`,
      detail: `Hearing on ${item.hearingDate}`,
      date: item.hearingDate,
    });
    return item;
  },

  async getCaseTimeline(caseId) {
    const rows = readStore(STORAGE_KEYS.timelines, []);
    return byDateAsc(
      rows.filter((item) => String(item.caseId) === String(caseId)),
      "date"
    );
  },

  async addTimelineEntry(caseId, payload) {
    const rows = readStore(STORAGE_KEYS.timelines, []);
    const item = {
      id: nextId("TL"),
      caseId,
      eventType: optionalString(payload?.eventType) || "Update",
      title: requireString(payload?.title, "Timeline title"),
      detail: optionalString(payload?.detail),
      date: optionalString(payload?.date) || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.timelines, [item, ...rows]);
    return item;
  },

  async getCaseLinks(caseId) {
    const rows = readStore(STORAGE_KEYS.links, []);
    return rows.filter((item) => String(item.caseId) === String(caseId));
  },

  async linkDocuments(caseId, documentIds = [], role = "member") {
    const permissions = this.getPermissions(role);
    if (!permissions.canEdit) {
      throw new Error("You do not have permission to link documents.");
    }

    const docs = Array.isArray(await getDocuments()) ? await getDocuments() : [];
    const rows = readStore(STORAGE_KEYS.links, []);
    const mapped = documentIds
      .map((id) => docs.find((doc) => String(doc.id) === String(id)))
      .filter(Boolean)
      .map((doc) => ({
        id: nextId("LNK"),
        caseId,
        linkType: "Document",
        documentId: doc.id,
        reference: doc.title || doc.documentNo || String(doc.id),
        createdAt: new Date().toISOString(),
      }));

    writeStore(STORAGE_KEYS.links, [...mapped, ...rows]);
    await this.addTimelineEntry(caseId, {
      eventType: "Document",
      title: "Documents linked",
      detail: `${mapped.length} document(s) linked to case`,
    });
    return mapped;
  },

  async createFinanceTokenLinks(caseId) {
    const [financeRows, tokenRows] = await Promise.all([
      FinanceService.getTransactionHistory(),
      TokenService.getTransactionHistory(),
    ]);

    const matchCase = (row) =>
      String(row.reference || row.referenceNo || "").toLowerCase().includes(String(caseId).toLowerCase());

    return {
      finance: (Array.isArray(financeRows) ? financeRows : []).filter(matchCase).slice(0, 20),
      token: (Array.isArray(tokenRows) ? tokenRows : []).filter(matchCase).slice(0, 20),
    };
  },

  async searchCases({ search = "", status = "ALL", court = "ALL", advocate = "ALL", client = "ALL" } = {}) {
    const rows = await this.getAll();
    const keyword = String(search || "").toLowerCase();

    return rows.filter((item) => {
      const matchesStatus = status === "ALL" || String(item.status) === status;
      const matchesCourt = court === "ALL" || String(item.courtName || "") === String(court);
      const matchesAdvocate = advocate === "ALL" || String(item.advocateName || "") === String(advocate);
      const matchesClient = client === "ALL" || String(item.clientName || "") === String(client);
      const matchesSearch =
        !keyword ||
        String(item.caseNumber || "").toLowerCase().includes(keyword) ||
        String(item.title || "").toLowerCase().includes(keyword) ||
        String(item.clientName || "").toLowerCase().includes(keyword) ||
        String(item.advocateName || "").toLowerCase().includes(keyword) ||
        String(item.courtName || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesCourt && matchesAdvocate && matchesClient && matchesSearch;
    });
  },

  async getDashboard() {
    const [cases, hearings, notices, clients, advocates] = await Promise.all([
      this.getAll(),
      this.getHearings(),
      this.getNotices(),
      this.getClients(),
      this.getAdvocates(),
    ]);

    const openCases = cases.filter((item) => String(item.status || "") !== "Closed").length;
    const closedCases = cases.filter((item) => String(item.status || "") === "Closed").length;
    const upcomingHearings = hearings.filter((item) => {
      const value = new Date(item.hearingDate || 0).getTime();
      return Number.isFinite(value) && value >= Date.now();
    }).length;

    return {
      totalCases: cases.length,
      openCases,
      closedCases,
      upcomingHearings,
      totalNotices: notices.length,
      totalClients: clients.length,
      totalAdvocates: advocates.length,
      recentCases: cases.slice(0, 10),
    };
  },

  async getReports() {
    const [dashboard, hearings, notices] = await Promise.all([
      this.getDashboard(),
      this.getHearings(),
      this.getNotices(),
    ]);

    const statusMap = dashboard.recentCases.reduce((map, item) => {
      const key = item.status || "Pending";
      map[key] = Number(map[key] || 0) + 1;
      return map;
    }, {});

    return {
      ...dashboard,
      statusMap,
      hearings,
      notices,
    };
  },

  buildCaseExport(rows) {
    const columns = [
      { key: "caseNumber", label: "Case Number" },
      { key: "title", label: "Title" },
      { key: "clientName", label: "Client" },
      { key: "advocateName", label: "Advocate" },
      { key: "courtName", label: "Court" },
      { key: "status", label: "Status" },
      { key: "nextHearing", label: "Next Hearing" },
      { key: "createdAt", label: "Created At" },
    ];

    return {
      fileName: `legal-cases-${new Date().toISOString().slice(0, 10)}.csv`,
      content: toCsv(rows, columns),
    };
  },

  async create(caseData = {}) {
    const role = caseData?.actorRole || "admin";
    const permissions = this.getPermissions(role);
    if (!permissions.canCreate) {
      throw new Error("You do not have permission to create legal cases.");
    }

    const title = requireString(caseData.title, "Case title");

    const legalCost = caseData.legalCost ? requirePositiveNumber(caseData.legalCost, "Legal cost") : 0;

    const legalCase = {
      id: Date.now(),
      caseNumber: "CASE-" + Date.now(),
      title,
      clientName: caseData.clientName || "",
      advocateName: caseData.advocateName || "",
      courtName: caseData.courtName || "",
      status: caseData.status || "Pending",
      nextHearing: caseData.nextHearing || "",
      noticeCount: 0,
      legalCost,
      linkedMemberId: caseData.linkedMemberId || "",
      linkedFinanceRef: caseData.linkedFinanceRef || "",
      linkedTokenRef: caseData.linkedTokenRef || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...caseData,
    };

    const created = await addLegalCase(legalCase);
    await this.addTimelineEntry(legalCase.id, {
      eventType: "Case",
      title: "Case created",
      detail: `Case ${legalCase.caseNumber} created`,
    });

    return created;
  },

  async update(id, values, role = "admin") {
    const permissions = this.getPermissions(role);
    if (!permissions.canEdit) {
      throw new Error("You do not have permission to update legal cases.");
    }

    await updateLegalCase(id, {
      ...values,
      updatedAt: new Date().toISOString(),
    });

    if (values?.status) {
      await this.addTimelineEntry(id, {
        eventType: "Status",
        title: `Status changed to ${values.status}`,
        detail: optionalString(values?.statusRemarks),
      });
    }
  },

  async remove(id, role = "admin") {
    const permissions = this.getPermissions(role);
    if (!permissions.canDelete) {
      throw new Error("You do not have permission to delete legal cases.");
    }

    await deleteLegalCase(id);
  },

};

export default LegalService;