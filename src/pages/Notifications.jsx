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
import useAuth from "../hooks/useAuth";

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


export const SEEDED_NOTIFICATIONS = [];

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getForUser(user?.id || user?.member_id, user?.role);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      await loadNotifications();
      ActivityService.create({ title: `Notification marked as read: ID ${id}`, type: "system" });
      setAlertMsg("Notification marked as read!");
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setAlertMsg(""), 2500);
  };

  const markAllRead = async () => {
    try {
      const unread = items.filter(item => item.status !== "Read");
      await Promise.all(unread.map(item => NotificationService.markAsRead(item.id)));
      await loadNotifications();
      setAlertMsg("All notifications marked as read!");
    } catch (e) {
      console.error(e);
    }
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
                <ListItemText primary="No notifications available." />
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
