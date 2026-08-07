import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Chip } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { MemberService } from "../services/memberService";

export default function MemberIdentity() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    MemberService.getAll().then((rows) => {
      setMembers(Array.isArray(rows) ? rows : []);
    });
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Digital Identity
        </Typography>

        <Grid container spacing={2}>
          {members.length === 0 ? (
            <Grid xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary">No member identities available.</Typography>
              </Paper>
            </Grid>
          ) : (
            members.map((member) => (
              <Grid xs={12} md={6} lg={4} key={member.members || member.id || member.member_id}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold">{member.name || "Member"}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {member.member_id || "No Member ID"}
                  </Typography>
                  <Typography variant="body2">Email: {member.email || "-"}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>Mobile: {member.mobile || "-"}</Typography>
                  <Chip size="small" label={member.verification_status || "Pending"} color={member.verification_status === "Verified" ? "success" : "warning"} />
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </MainLayout>
  );
}
