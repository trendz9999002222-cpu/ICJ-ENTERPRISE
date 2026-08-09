import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { MemberService } from "../services/memberService";

const getMemberId = (m) => m.member_id || m.memberId || m.id || m.uuid;
const getMemberName = (m) => m.fullName || m.full_name || m.name || "Unnamed Member";


export default function MemberCard() {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Cards
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {members.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">
                No members available to generate cards.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          members.map((member) => (
            <Grid item xs={12} md={6} lg={4} key={getMemberId(member)}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {getMemberName(member)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    ID: {getMemberId(member) || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Mobile: {member.mobile || "-"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    City: {member.city || "-"}
                  </Typography>

                  <Chip
                    size="small"
                    label={member.verification_status || "Pending"}
                    color={member.verification_status === "Verified" ? "success" : "warning"}
                    sx={{ width: "fit-content" }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      const w = window.open("", "_blank");
                      w.document.write(`<html><head><title>Member Card - ${getMemberName(member)}</title></head><body style="font-family:sans-serif;padding:40px"><h2>ICJ Enterprise Platform</h2><h3>Member Identity Card</h3><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border:1px solid #ccc"><b>Name</b></td><td style="padding:8px;border:1px solid #ccc">${getMemberName(member)}</td></tr><tr><td style="padding:8px;border:1px solid #ccc"><b>Member ID</b></td><td style="padding:8px;border:1px solid #ccc">${getMemberId(member)}</td></tr><tr><td style="padding:8px;border:1px solid #ccc"><b>Mobile</b></td><td style="padding:8px;border:1px solid #ccc">${member.mobile || "-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc"><b>City</b></td><td style="padding:8px;border:1px solid #ccc">${member.city || "-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc"><b>Status</b></td><td style="padding:8px;border:1px solid #ccc">${member.verification_status || "Pending"}</td></tr></table><script>window.print();<\/script></body></html>`);
                      w.document.close();
                    }}
                  >
                    Print Card
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
