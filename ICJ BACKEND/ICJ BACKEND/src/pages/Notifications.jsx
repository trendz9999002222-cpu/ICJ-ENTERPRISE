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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningIcon from "@mui/icons-material/Warning";

import NotificationService from "../services/notificationService";
import ActivityService from "../services/activityService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

const MODULE_CATEGORIES = ["All", "Member", "Advocate", "Client", "Finance", "Legal", "Documents", "Approvals", "Tasks", "Calendar", "Wallet", "Reports"];

export default function Notifications() {
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");

  const defaultNotifications = [
    { id: "n1", title: "Master Database Backup Verified", category: "System", message: "Automated snapshot backup verified on Aug 7, 2026.", status: "Unread", date: "Today" },
    { id: "n2", title: "Legal Case WP/2026/1042 Listed", category: "Legal", message: "Case listed in Supreme Court Bench 3 for Aug 20, 2026.", status: "Unread", date: "Today" },
    { id: "n3", title: "New Member Registration Submitted", category: "Member", message: "New member registration received and added to Master Repository.", status: "Unread", date: "Yesterday" },
    { id: "n4", title: "Wallet Transfer Completed", category: "Wallet", message: "₹5,000 transferred to Member Wallet with SHA-256 hash.", status: "Read", date: "2 Days Ago" },
    { id: "n5", title: "New Client Appointment Requested", category: "Advocate", message: "Green Earth Trust requested appointment with Adv. Rajesh Sharma.", status: "Unread", date: "Today" },
  ];

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getAll();
      const safeData = Array.isArray(data) && data.length > 0 ? data : defaultNotifications;
      setItems(safeData);
    } catch {
      setItems(defaultNotifications);
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

  const selectedCategory = MODULE_CATEGORIES[tabIndex] || "All";

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => (item.category || "").toLowerCase() === selectedCategory.toLowerCase());
  }, [items, selectedCategory]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <NotificationsIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Global Notification & Alert Centre
            </Typography>
            <Typography color="text.secondary">
              Real-time Notifications for Members, Advocates, Clients, Legal, Finance & Documents
            </Typography>
          </Box>
        </Stack>

        <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={markAllRead}>
          Mark All as Read
        </Button>
      </Stack>

      {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
          {MODULE_CATEGORIES.map((cat) => (
            <Tab key={cat} label={cat} />
          ))}
        </Tabs>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <List disablePadding>
          {filteredItems.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications available for this category." />
            </ListItem>
          ) : (
            filteredItems.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, borderLeft: item.status !== "Read" ? "4px solid #1976d2" : "1px solid #e0e0e0" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography fontWeight="bold" variant="subtitle1">{item.title}</Typography>
                      <Chip size="small" label={item.category || "System"} color="primary" variant="outlined" />
                      <Chip size="small" label={item.status || "Unread"} color={item.status === "Read" ? "default" : "warning"} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                  </Box>

                  {item.status !== "Read" && (
                    <Button size="small" variant="contained" onClick={() => markRead(item.id)}>
                      Mark Read
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
