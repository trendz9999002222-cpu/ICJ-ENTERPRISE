/**
 * ICJ Enterprise Platform
 * Members Page
 * Version : 1.0.0
 */

import { Box, Typography, Paper } from "@mui/material";
import MainLayout from "../layouts/MainLayout";

export default function Members() {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Members</Typography>
        <Typography color="text.secondary" mb={4}>Manage ICJ Enterprise Platform members</Typography>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography>Member management interface will appear here.</Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
}

