import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";

export default function MemberHistory() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const timeline = useMemo(() => {
    return [...members]
      .map((member) => ({
        id: member.members || member.id || member.member_id,
        name: member.name || "Member",
        memberId: member.member_id || "-",
        when: member.created_at || member.createdAt || member.registration_date || null,
      }))
      .sort((a, b) => new Date(b.when || 0).getTime() - new Date(a.when || 0).getTime());
  }, [members]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member History
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            {timeline.length === 0 ? (
              <Typography color="text.secondary">No member history available.</Typography>
            ) : (
              timeline.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member ID: {item.memberId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {item.when ? new Date(item.when).toLocaleString("en-IN") : "Unknown"}
                  </Typography>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
}
