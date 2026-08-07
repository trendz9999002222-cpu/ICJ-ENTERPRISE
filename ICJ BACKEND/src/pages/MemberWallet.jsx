import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import { MemberService } from "../services/memberService";

export default function MemberWallet() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");

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

  const currentMember = useMemo(() => {
    return members.find((member) => {
      const id = member.members || member.id || member.uuid;
      return id === selectedMember;
    });
  }, [members, selectedMember]);

  const walletBalance = Number(currentMember?.wallet_balance || 0);
  const tokenBalance = Number(currentMember?.token_balance || 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Member Wallet
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Member
            </Typography>

            <TextField
              fullWidth
              select
              label="Member"
              value={selectedMember}
              onChange={(event) => setSelectedMember(event.target.value)}
              helperText="Choose a member to view wallet and token balances"
            >
              {members.map((member) => {
                const key = member.members || member.id || member.uuid;
                return (
                  <MenuItem key={key} value={key}>
                    {(member.name || "Unknown Member") + " - " + (member.mobile || "No Mobile")}
                  </MenuItem>
                );
              })}
            </TextField>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Balance Overview
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Wallet Balance
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              {`₹${walletBalance.toLocaleString("en-IN")}`}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Token Balance
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {tokenBalance.toLocaleString("en-IN")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
