import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { MemberService } from "../services/memberService";

export default function MemberActivity() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const list = await MemberService.getAll();
        setMembers(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to load members", error);
      }
    };

    loadMembers();
  }, []);

  const activityItems = useMemo(() => {
    const sorted = [...members].sort((a, b) => {
      const first = new Date(a.registration_date || a.created_at || 0).getTime();
      const second = new Date(b.registration_date || b.created_at || 0).getTime();
      return second - first;
    });

    return sorted.slice(0, 10);
  }, [members]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Activity
      </Typography>

      <Paper sx={{ p: 2, mt: 2 }}>
        <List disablePadding>
          {activityItems.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No member activity available yet."
                secondary="Activity will appear after members are registered or updated."
              />
            </ListItem>
          ) : (
            activityItems.map((member, index) => (
              <Box key={member.members || member.id || member.uuid || index}>
                <ListItem>
                  <ListItemText
                    primary={`${member.name || "Unknown Member"} (${member.member_type || "General"})`}
                    secondary={`Status: ${member.verification_status || "Pending"} | Date: ${member.registration_date || member.created_at ? new Date(member.registration_date || member.created_at).toLocaleString("en-IN") : "-"}`}
                  />
                </ListItem>
                {index < activityItems.length - 1 ? <Divider component="li" /> : null}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}