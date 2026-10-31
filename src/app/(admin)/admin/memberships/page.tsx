"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import GavelIcon from "@mui/icons-material/Gavel";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CardMembershipIcon from "@mui/icons-material/CardMembership";

import AdminDataTable, {
  type AdminPaginationConfig,
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { membershipOnboardingAdminService } from "@/services/admin/membershipOnboarding.service";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { env } from "@/config/env";
import type { AdminMembershipApplication } from "@/services/admin/membershipOnboarding.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "general" | "legal_professional" | "other_professional" | "volunteer";

interface ProfessionalAppItem {
  id: string;
  application_reference: string;
  pathway: "legal_professional" | "other_professional" | "volunteer";
  category: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "info_requested";
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_photo?: string | null;
  personal_data?: Record<string, any>;
  professional_data?: Record<string, any>;
  category_data?: Record<string, any>;
  rejection_reason?: string;
  info_request_note?: string;
  documents?: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_url: string;
    uploaded_at?: string;
  }>;
  review_history?: Array<{
    id: string;
    action: string;
    actor_name: string;
    note: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at?: string;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "info",
  info_requested: "warning",
  draft: "default",
};

const PAGE_SIZE = 10;

function readAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|;\s*)icj_access_token=([^;]+)/)?.[1] || null;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminMembershipsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // General memberships state
  const [generalRows, setGeneralRows] = useState<AdminMembershipApplication[]>([]);
  const [generalTotalCount, setGeneralTotalCount] = useState(0);

  // Professional applications state (Legal, Other, Volunteer)
  const [profRows, setProfRows] = useState<ProfessionalAppItem[]>([]);
  const [profTotalCount, setProfTotalCount] = useState(0);

  // Tab badge counts
  const [tabCounts, setTabCounts] = useState({
    general: 0,
    legal_professional: 0,
    other_professional: 0,
    volunteer: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // -------------------------------------------------------------------------
  // Fetch Tab Counts on mount
  // -------------------------------------------------------------------------

  const fetchTabCounts = useCallback(async () => {
    try {
      const token = readAccessToken();
      const headers = { Authorization: `Bearer ${token || ""}`, Accept: "application/json" };

      // General count
      const genRes = await membershipOnboardingAdminService.listApplications({ page: 1, page_size: 1 });
      const genCount = genRes?.count ?? 0;

      // Professional applications count
      const profRes = await fetch(`${env.apiUrl}/admin/applications/`, { headers });
      const profData = await profRes.json().catch(() => null);
      const allApps: ProfessionalAppItem[] = Array.isArray(profData?.data)
        ? profData.data
        : Array.isArray(profData)
        ? profData
        : [];

      let legalCount = 0;
      let otherCount = 0;
      let volCount = 0;

      allApps.forEach((item) => {
        if (item.pathway === "legal_professional") legalCount++;
        else if (item.pathway === "other_professional") otherCount++;
        else if (item.pathway === "volunteer") volCount++;
      });

      setTabCounts({
        general: genCount,
        legal_professional: legalCount,
        other_professional: otherCount,
        volunteer: volCount,
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  // -------------------------------------------------------------------------
  // Load data for active tab
  // -------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "general") {
        const res = await membershipOnboardingAdminService.listApplications({
          page: page + 1,
          page_size: rowsPerPage,
        });
        setGeneralRows(res?.results ?? []);
        setGeneralTotalCount(res?.count ?? 0);
      } else {
        const token = readAccessToken();
        const res = await fetch(`${env.apiUrl}/admin/applications/?pathway=${activeTab}`, {
          headers: { Authorization: `Bearer ${token || ""}`, Accept: "application/json" },
        });
        const data = await res.json().catch(() => null);
        const list: ProfessionalAppItem[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setProfRows(list);
        setProfTotalCount(list.length);
      }
    } catch {
      setError("Failed to load records. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------------------
  // Tab Switch Handler
  // -------------------------------------------------------------------------

  const handleTabChange = (_: React.SyntheticEvent, newTab: TabKey) => {
    setActiveTab(newTab);
    setPage(0);
  };

  // -------------------------------------------------------------------------
  // Table Columns - General Memberships
  // -------------------------------------------------------------------------

  const generalColumns: AdminTableColumn<AdminMembershipApplication>[] = [
    {
      key: "name",
      label: "Applicant",
      minWidth: 240,
      render: (a) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={resolveMediaUrl((a as any).photo_url || (a as any).profile_picture_url) || undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#eff6ff",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#1d4ed8",
              boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
              border: "2px solid #dbeafe",
            }}
          >
            {a.person_name
              ? a.person_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              : "?"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {a.person_name || "Unknown"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {a.email || "No email"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (a) => (
        <Chip
          label={a.membership_type_name || "Membership"}
          size="small"
          sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: "6px" }}
        />
      ),
    },
    {
      key: "reference_id",
      label: "Reference ID",
      render: (a) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: "#2563eb",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {a.reference_id || "-"}
        </Typography>
      ),
    },
    {
      key: "mobile",
      label: "Phone",
      render: (a) => (
        <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.825rem" }}>
          {a.mobile || "-"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => (
        <Chip
          label={a.status.replace("_", " ").toUpperCase()}
          size="small"
          color={STATUS_COLOR[a.status] || "default"}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            px: 0.5,
            height: 22,
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (a) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View General Application">
            <IconButton
              component={Link}
              href={`/admin/memberships/${a.id}`}
              size="small"
              sx={{ color: "#3b82f6", bgcolor: "#eff6ff" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // -------------------------------------------------------------------------
  // Table Columns - Professional Wings (Legal, Other, Volunteer)
  // -------------------------------------------------------------------------

  const professionalColumns: AdminTableColumn<ProfessionalAppItem>[] = [
    {
      key: "applicant_name",
      label: "Candidate",
      minWidth: 240,
      render: (row) => {
        const name = row.applicant_name || row.personal_data?.full_name || "Candidate";
        const email = row.applicant_email || row.personal_data?.email || "No email";
        const photo = row.applicant_photo;
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              src={photo ? resolveMediaUrl(photo) || undefined : undefined}
              sx={{
                width: 40,
                height: 40,
                bgcolor:
                  row.pathway === "legal_professional"
                    ? "#eff6ff"
                    : row.pathway === "other_professional"
                    ? "#ecfdf5"
                    : "#fff7ed",
                fontSize: "0.85rem",
                fontWeight: 800,
                color:
                  row.pathway === "legal_professional"
                    ? "#1d4ed8"
                    : row.pathway === "other_professional"
                    ? "#065f46"
                    : "#c2410c",
                border: "2px solid",
                borderColor:
                  row.pathway === "legal_professional"
                    ? "#bfdbfe"
                    : row.pathway === "other_professional"
                    ? "#a7f3d0"
                    : "#fed7aa",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 220,
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 220,
                }}
              >
                {email}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      key: "category",
      label: "Discipline / Cadre",
      render: (row) => {
        const cat = row.category?.replace(/_/g, " ").toUpperCase() || "GENERAL";
        const enrollment = row.professional_data?.enrollment_number;
        return (
          <Box>
            <Chip
              label={cat}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                borderRadius: "6px",
                bgcolor: "#f1f5f9",
                color: "#1e293b",
              }}
            />
            {enrollment && (
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace", mt: 0.3 }}>
                Enroll: {enrollment}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "application_reference",
      label: "Reference ID",
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 800,
            color: "#1e3a8a",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {row.application_reference || "-"}
        </Typography>
      ),
    },
    {
      key: "phone",
      label: "Contact & City",
      render: (row) => {
        const phone = row.applicant_phone || row.personal_data?.mobile || "-";
        const city = row.personal_data?.city;
        const state = row.personal_data?.state;
        const loc = [city, state].filter(Boolean).join(", ");
        return (
          <Box>
            <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.825rem", fontWeight: 600 }}>
              {phone}
            </Typography>
            {loc && (
              <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                {loc}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.status.replace("_", " ").toUpperCase()}
          size="small"
          color={STATUS_COLOR[row.status] || "default"}
          sx={{
            fontWeight: 800,
            fontSize: "0.7rem",
            px: 0.5,
            height: 22,
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View Professional Application">
            <IconButton
              component={Link}
              href={`/admin/memberships/applications/${row.id}`}
              size="small"
              sx={{ color: "#3b82f6", bgcolor: "#eff6ff", "&:hover": { bgcolor: "#dbeafe" } }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  const pagination: AdminPaginationConfig = {
    page,
    rowsPerPage,
    totalCount: activeTab === "general" ? generalTotalCount : profTotalCount,
    onPageChange: (newPage) => setPage(newPage),
    onRowsPerPageChange: (newSize) => {
      setRowsPerPage(newSize);
      setPage(0);
    },
  };

  return (
    <AdminPageShell
      title="Memberships & Professional Roster"
      subtitle="Unified registry intake covering General Memberships and the 3 specialized wings (Legal, Other Professional, and Volunteer)"
    >
      {/* ─── TABS HEADER (MATCHING PAYMENTS HUB UI) ─── */}
      <Box sx={{ borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              minHeight: 44,
              px: 2.5,
              color: "#475569",
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": {
                color: "#1e293b",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "primary.main",
            },
          }}
        >
          <Tab
            value="general"
            icon={<CardMembershipIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>General Memberships</span>
                {tabCounts.general > 0 && (
                  <Chip
                    size="small"
                    label={tabCounts.general}
                    sx={{
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: activeTab === "general" ? "#eff6ff" : "#f1f5f9",
                      color: activeTab === "general" ? "#2563eb" : "#64748b",
                    }}
                  />
                )}
              </Stack>
            }
          />

          <Tab
            value="legal_professional"
            icon={<GavelIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Legal Professionals</span>
                {tabCounts.legal_professional > 0 && (
                  <Chip
                    size="small"
                    label={tabCounts.legal_professional}
                    sx={{
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: activeTab === "legal_professional" ? "#eff6ff" : "#f1f5f9",
                      color: activeTab === "legal_professional" ? "#2563eb" : "#64748b",
                    }}
                  />
                )}
              </Stack>
            }
          />

          <Tab
            value="other_professional"
            icon={<BusinessCenterIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Other Professionals</span>
                {tabCounts.other_professional > 0 && (
                  <Chip
                    size="small"
                    label={tabCounts.other_professional}
                    sx={{
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: activeTab === "other_professional" ? "#eff6ff" : "#f1f5f9",
                      color: activeTab === "other_professional" ? "#2563eb" : "#64748b",
                    }}
                  />
                )}
              </Stack>
            }
          />

          <Tab
            value="volunteer"
            icon={<VolunteerActivismIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Volunteers &amp; Fellows</span>
                {tabCounts.volunteer > 0 && (
                  <Chip
                    size="small"
                    label={tabCounts.volunteer}
                    sx={{
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: activeTab === "volunteer" ? "#eff6ff" : "#f1f5f9",
                      color: activeTab === "volunteer" ? "#2563eb" : "#64748b",
                    }}
                  />
                )}
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* ─── TABLE VIEW ─── */}
      {activeTab === "general" ? (
        <AdminDataTable
          rows={generalRows}
          columns={generalColumns}
          loading={loading}
          error={error}
          pagination={pagination}
          getRowKey={(row) => row.id}
          showSerialNumber
        />
      ) : (
        <AdminDataTable
          rows={profRows}
          columns={professionalColumns}
          loading={loading}
          error={error}
          pagination={pagination}
          getRowKey={(row) => row.id}
          showSerialNumber
        />
      )}

    </AdminPageShell>
  );
}
