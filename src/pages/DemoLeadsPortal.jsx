import React, { useState } from "react";
import AdvocateDashboard from "../components/admin/AdvocateDashboard";
import { Container, AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function DemoLeadsPortal() {
  // Pre-configured mock advocate for testing without credentials
  const [mockAdvocate, setMockAdvocate] = useState({
    id: "ICJ-MEMBER-050", // Adv. Harpreet Singh from seedUsers
    name: "Adv. Harpreet Singh",
    token_balance: 5000,
    unlockedLeads: []
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "#7c3aed" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            ⚖️ ICJ Lead Generation & Escrow Demo Portal (No Login Required)
          </Typography>
          <Button color="inherit" href="/login" startIcon={<HomeIcon />}>
            Sign In Portal
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <AdvocateDashboard 
          loggedInAdvocate={mockAdvocate} 
          onUpdateAdvocate={setMockAdvocate} 
        />
      </Container>
    </Box>
  );
}
