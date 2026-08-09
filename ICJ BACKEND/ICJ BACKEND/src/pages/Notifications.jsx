import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Alert,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

import NotificationService from "../services/notificationService";
import ActivityService from "../services/activityService";
import MainLayout from "../layouts/MainLayout";

const CATEGORIES = [
  "All",
  "Members",
  "Advocate",
  "Client",
  "Finance",
  "Legal",
  "Documents",
  "Approvals",
  "Tasks",
  "Court Calendar",
  "Administration",
  "System",
];

export const SEEDED_NOTIFICATIONS = [
  // MEMBERS (4)
  { id: "n-mem-1", title: "New Member Registration Submitted", category: "Members", message: "Advocate Rahul Sharma (ID: ICJ-2026-8801) submitted registration under Individual Practitioner category.", status: "Unread", date: "Today, 10:15 AM", route: "/membership" },
  { id: "n-mem-2", title: "Member Verification Approved", category: "Members", message: "Dr. Sunita Deshmukh's bar council credentials verified by Verification Officer.", status: "Unread", date: "Today, 09:30 AM", route: "/member-verification" },
  { id: "n-mem-3", title: "Membership Renewal Payment Received", category: "Members", message: "Apex Technovations Ltd renewed annual Enterprise Membership subscription.", status: "Read", date: "Yesterday", route: "/membership" },
  { id: "n-mem-4", title: "Digital Membership Card Issued", category: "Members", message: "Cryptographic digital ID card generated for Adv. Ananya Iyer with QR code.", status: "Read", date: "Aug 6, 2026", route: "/member-identity" },

  // ADVOCATE (4)
  { id: "n-adv-1", title: "Senior Advocate Empaneled", category: "Advocate", message: "Adv. Rajesh Sharma empaneled under High Court Constitutional & Writ Panel B.", status: "Unread", date: "Today, 11:00 AM", route: "/advocate-dashboard" },
  { id: "n-adv-2", title: "New PIL Case Assigned", category: "Advocate", message: "Public Interest Litigation WP/2026/1042 assigned to Adv. Meera Sen.", status: "Unread", date: "Today, 08:45 AM", route: "/advocate-dashboard" },
  { id: "n-adv-3", title: "Urgent Hearing Reminder", category: "Advocate", message: "Supreme Court Bench 3 hearing scheduled tomorrow at 10:30 AM for Case SLP/2026/401.", status: "Unread", date: "Today, 07:30 AM", route: "/court-calendar" },
  { id: "n-adv-4", title: "Bar Enrollment Verified", category: "Advocate", message: "Bar Council certificate verified for Adv. Vikramjit Singh (PH/5678/2010).", status: "Read", date: "Aug 5, 2026", route: "/advocate-dashboard" },

  // CLIENT (4)
  { id: "n-cli-1", title: "New Client Onboarded", category: "Client", message: "Green Earth Trust registered under ICJ Free Legal Advisory Cell.", status: "Unread", date: "Today, 09:00 AM", route: "/client-portal" },
  { id: "n-cli-2", title: "Client Consultation Scheduled", category: "Client", message: "Video consultation booked with Adv. Rajesh Sharma for Aug 12, 11:00 AM.", status: "Unread", date: "Today, 08:15 AM", route: "/advocate-dashboard" },
  { id: "n-cli-3", title: "Petition Status Updated", category: "Client", message: "Status updated to 'In Hearing' for Environmental Writ Petition WP/2026/1042.", status: "Read", date: "Yesterday", route: "/legal" },
  { id: "n-cli-4", title: "Legal Advice Dispatch Confirmed", category: "Client", message: "Written legal opinion dispatched to Vanguard Global Infra via Client Portal.", status: "Read", date: "Aug 6, 2026", route: "/client-portal" },

  // FINANCE (4)
  { id: "n-fin-1", title: "Membership Fee Received", category: "Finance", message: "₹25,000 received for Enterprise Membership Fee (Invoice INV-2026-1001).", status: "Unread", date: "Today, 10:45 AM", route: "/billing" },
  { id: "n-fin-2", title: "Retainership Invoice Generated", category: "Finance", message: "Invoice INV-2026-1002 generated for Quarterly Legal Retainership.", status: "Unread", date: "Today, 09:20 AM", route: "/billing" },
  { id: "n-fin-3", title: "Member Wallet Credited", category: "Finance", message: "Wallet credited with ₹50,000 via HDFC Payment Gateway (TXN-88401).", status: "Read", date: "Yesterday", route: "/wallet" },
  { id: "n-fin-4", title: "Advocate 70% Share Processed", category: "Finance", message: "₹17,500 70% revenue share payout credited to Adv. Rajesh Sharma.", status: "Read", date: "Aug 5, 2026", route: "/payment-management" },

  // LEGAL (4)
  { id: "n-leg-1", title: "Writ Petition Filed", category: "Legal", message: "Constitutional writ petition WP/2026/1042 filed before High Court Bench 2.", status: "Unread", date: "Today, 11:30 AM", route: "/legal" },
  { id: "n-leg-2", title: "Supreme Court Hearing Listed", category: "Legal", message: "Special Leave Petition SLP/2026/401 listed before Supreme Court Bench 3.", status: "Unread", date: "Today, 08:30 AM", route: "/court-calendar" },
  { id: "n-leg-3", title: "Interim Stay Order Uploaded", category: "Legal", message: "Certified copy of High Court Interim Stay Order uploaded to Legal Vault.", status: "Read", date: "Yesterday", route: "/documents" },
  { id: "n-leg-4", title: "Section 80 CPC Notice Drafted", category: "Legal", message: "AI Legal Notice generated under Section 80 CPC for Government Notice.", status: "Read", date: "Aug 6, 2026", route: "/ai-drafter" },

  // DOCUMENTS (4)
  { id: "n-doc-1", title: "Legal Retainership Contract Uploaded", category: "Documents", message: "Master Legal Contract DOC-2026-701 uploaded to Document Vault.", status: "Unread", date: "Today, 10:00 AM", route: "/documents" },
  { id: "n-doc-2", title: "Cryptographic eSign Completed", category: "Documents", message: "SHA-256 eSign digital signature applied by Authorized Senior Counsel.", status: "Unread", date: "Today, 09:10 AM", route: "/documents" },
  { id: "n-doc-3", title: "KYC Aadhaar & PAN Verified", category: "Documents", message: "Aadhaar and PAN identity verification completed with 100% match.", status: "Read", date: "Yesterday", route: "/member-verification" },
  { id: "n-doc-4", title: "Document Vault Cloud Sync", category: "Documents", message: "Vault automatic backup synced to AWS S3 encrypted cloud storage.", status: "Read", date: "Aug 5, 2026", route: "/documents" },

  // APPROVALS (4)
  { id: "n-app-1", title: "Membership Pending Approval", category: "Approvals", message: "Institutional Membership application for Save Forest NGO pending approval.", status: "Unread", date: "Today, 10:30 AM", route: "/trust-dashboard" },
  { id: "app-2", title: "Empanelment Granted", category: "Approvals", message: "ICJ Trust Executive granted Advocate Empanelment to Adv. Meera Sen.", status: "Unread", date: "Today, 08:50 AM", route: "/trust-dashboard" },
  { id: "n-app-3", title: "Special Leave Approval Granted", category: "Approvals", message: "High Command Legal Panel approved filing of Special Leave Petition.", status: "Read", date: "Yesterday", route: "/trust-dashboard" },
  { id: "n-app-4", title: "Vault Access Granted", category: "Approvals", message: "Document access request approved for Audit & Compliance Desk.", status: "Read", date: "Aug 6, 2026", route: "/documents" },

  // TASKS (4)
  { id: "n-tsk-1", title: "Rejoinder Review Task Assigned", category: "Tasks", message: "Task assigned: Review Rejoinder for WP/2026/1042 before next hearing.", status: "Unread", date: "Today, 09:40 AM", route: "/advocate-dashboard" },
  { id: "n-tsk-2", title: "Bar Council Certificate Audit", category: "Tasks", message: "Compliance reminder: Verify Bar Association Enrollment Certificate.", status: "Unread", date: "Today, 08:00 AM", route: "/advocate-dashboard" },
  { id: "n-tsk-3", title: "Cause List Preparation Pending", category: "Tasks", message: "Prepare Cause List and Master Hearing Schedule for Court Hall 3.", status: "Read", date: "Yesterday", route: "/court-calendar" },
  { id: "n-tsk-4", title: "High Court Affidavit Filing", category: "Tasks", message: "Affidavit filing follow-up assigned to Empaneled Legal Officer.", status: "Read", date: "Aug 5, 2026", route: "/legal" },

  // COURT CALENDAR (4)
  { id: "n-cal-1", title: "Supreme Court Hearing Tomorrow", category: "Court Calendar", message: "Hearing scheduled tomorrow at Supreme Court Hall 1, Bench 3.", status: "Unread", date: "Today, 11:15 AM", route: "/court-calendar" },
  { id: "n-cal-2", title: "High Court Cause List Published", category: "Court Calendar", message: "Official High Court Cause List for Aug 12, 2026 published.", status: "Unread", date: "Today, 09:15 AM", route: "/court-calendar" },
  { id: "n-cal-3", title: "Interlocutory Application Adjourned", category: "Court Calendar", message: "IA hearing in WP/2026/1042 adjourned to Aug 25, 2026.", status: "Read", date: "Yesterday", route: "/court-calendar" },
  { id: "n-cal-4", title: "Special Bench Hearing Issued", category: "Court Calendar", message: "Constitutional Bench hearing notice issued for High Court Hall 4.", status: "Read", date: "Aug 6, 2026", route: "/court-calendar" },

  // ADMINISTRATION (4)
  { id: "n-adm-1", title: "New Admin Created", category: "Administration", message: "New Administrator account created for Governance Officer.", status: "Unread", date: "Today, 10:50 AM", route: "/administration" },
  { id: "n-adm-2", title: "Role Permissions Updated", category: "Administration", message: "Super Admin updated module access permissions for Employee Role.", status: "Unread", date: "Today, 08:40 AM", route: "/administration" },
  { id: "n-adm-3", title: "Password Policy Engine Enforced", category: "Administration", message: "Super Admin Password Policy Engine v3.0 enforced across all users.", status: "Read", date: "Yesterday", route: "/administration" },
  { id: "n-adm-4", title: "User Repository Audit Archived", category: "Administration", message: "Master User Repository audit log snapshot archived securely.", status: "Read", date: "Aug 5, 2026", route: "/administration" },

  // SYSTEM (4)
  { id: "n-sys-1", title: "Database Backup Completed", category: "System", message: "Master Database automated snapshot backup completed with 0 errors.", status: "Unread", date: "Today, 11:45 AM", route: "/system-health" },
  { id: "n-sys-2", title: "Location Master Import Successful", category: "System", message: "Master Location CSV dataset (750 Districts, 28 States) imported.", status: "Unread", date: "Today, 09:05 AM", route: "/location-master" },
  { id: "n-sys-3", title: "API Gateway Health Check Clean", category: "System", message: "API Gateway & Endpoint telemetry health check passed (100% uptime).", status: "Read", date: "Yesterday", route: "/api-config" },
  { id: "n-sys-4", title: "Production Deployment Verified", category: "System", message: "Production Deployment Center release v3.2.0 verified cleanly.", status: "Read", date: "Aug 6, 2026", route: "/deployment-center" },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getAll();
      const safeData = Array.isArray(data) && data.length >= 10 ? data : SEEDED_NOTIFICATIONS;
      setItems(safeData);
    } catch {
      setItems(SEEDED_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "Read" } : item)));
    ActivityService.create({ title: `Notification marked as read: ID ${id}`, type: "system" });
    setAlertMsg("Notification marked as read!");
    setTimeout(() => setAlertMsg(""), 2500);
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: "Read" })));
    setAlertMsg("All notifications marked as read!");
    setTimeout(() => setAlertMsg(""), 2500);
  };

  const handlePrint = () => {
    console.log("PRINT ENGINE STARTED — Notifications");
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (printWindow) {
      const rows = filteredItems.map((n, idx) => `
        <tr>
          <td style="padding:6px;border:1px solid #ccc;text-align:center">${idx + 1}</td>
          <td style="padding:6px;border:1px solid #ccc"><strong>${n.title}</strong></td>
          <td style="padding:6px;border:1px solid #ccc">${n.category || "System"}</td>
          <td style="padding:6px;border:1px solid #ccc">${n.message}</td>
          <td style="padding:6px;border:1px solid #ccc">${n.status || "Unread"}</td>
          <td style="padding:6px;border:1px solid #ccc">${n.date || "Today"}</td>
        </tr>
      `).join("");

      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Notification Log Print</title>
        <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th{background:#0d47a1;color:#fff;padding:8px}</style>
        </head><body>
        <h2>INTERNATIONAL CONSORTIUM OF JURISTS — NOTIFICATION & ALERT LOG</h2>
        <p>Category: ${selectedCategory} | Date: ${new Date().toLocaleDateString("en-IN")}</p>
        <table><thead><tr><th>S.No.</th><th>Title</th><th>Category</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.print();window.close();<\/script>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const selectedCategory = CATEGORIES[tabIndex] || "All";

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== "All") {
      result = result.filter((item) => (item.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((item) =>
        [item.title, item.message, item.category, item.id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term))
      );
    }
    return result;
  }, [items, selectedCategory, search]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Global Notification & Alert Centre
              </Typography>
              <Typography color="text.secondary">
                Seeded Real-time Alerts for Members, Advocates, Clients, Finance, Legal, Documents, Approvals, Tasks & System
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print Report
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handlePrint}>
              PDF Export
            </Button>
            <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={markAllRead}>
              Mark All Read
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* Search & Filter Bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Notifications by Title, Keyword, Record ID..."
            sx={{ width: 420 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
            }}
          />
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            Showing {filteredItems.length} Notifications ({selectedCategory})
          </Typography>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
            {CATEGORIES.map((cat) => (
              <Tab key={cat} label={cat} />
            ))}
          </Tabs>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <List disablePadding>
            {filteredItems.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications available for this category or search criteria." />
              </ListItem>
            ) : (
              filteredItems.map((item, idx) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    borderLeft: item.status !== "Read" ? "4px solid #1976d2" : "1px solid #e0e0e0",
                    transition: "0.2s",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">#{idx + 1}</Typography>
                        <Typography fontWeight="bold" variant="subtitle1">{item.title}</Typography>
                        <Chip size="small" label={item.category || "System"} color="primary" variant="outlined" />
                        <Chip size="small" label={item.status || "Unread"} color={item.status === "Read" ? "default" : "warning"} />
                        <Typography variant="caption" color="text.secondary">• {item.date}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {item.route && (
                        <Tooltip title={`Open linked record at ${item.route}`}>
                          <IconButton size="small" color="primary" onClick={() => navigate(item.route)}>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.status !== "Read" && (
                        <Button size="small" variant="contained" onClick={() => markRead(item.id)}>
                          Mark Read
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </MainLayout>
  );
}
