import { useEffect, useState } from "react";
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
} from "@mui/material";
import NotificationService from "../services/notificationService";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const loadNotifications = async () => {
    const data = await NotificationService.getAll();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    NotificationService.getAll().then((data) => {
      setItems(Array.isArray(data) ? data : []);
    });
  }, []);

  const markRead = async (id) => {
    await NotificationService.markAsRead(id);
    await loadNotifications();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Notifications
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <List disablePadding>
          {items.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications available." />
            </ListItem>
          ) : (
            items.map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  item.status !== "Read" ? (
                    <Button size="small" onClick={() => markRead(item.id)}>
                      Mark Read
                    </Button>
                  ) : null
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{item.title || "Notification"}</span>
                      <Chip size="small" label={item.status || "Unread"} />
                    </Stack>
                  }
                  secondary={item.message || ""}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}

