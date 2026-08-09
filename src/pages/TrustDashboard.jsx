import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Stack,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LegalEcosystemService from "../services/legalEcosystemService";
import MainLayout from "../layouts/MainLayout";

export default function TrustDashboard() {
  const [cases, setCases] = useState([]);
  const [advocates, setAdvocates] = useState([]);

  const loadData = () => {
    setCases(LegalEcosystemService.getCases());
    setAdvocates(LegalEcosystemService.getAdvocates());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (id, newTrustStatus) => {
    LegalEcosystemService.updateCaseStatus(id, undefined, newTrustStatus);
    loadData();
  };

  const handleAssign = (caseId, advocateId) => {
    LegalEcosystemService.assignAdvocate(caseId, advocateId);
    loadData();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <AccountBalanceIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              ICJ Trust Executive Dashboard
            </Typography>
            <Typography color="text.secondary">
              High Command Case Approvals, Panel Advocate Assignments & Governance
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
              <Typography color="text.secondary" variant="body2">Total Registered Cases</Typography>
              <Typography variant="h4" fontWeight="bold">{cases.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #2e7d32" }}>
              <Typography color="text.secondary" variant="body2">Trust Approved Cases</Typography>
              <Typography variant="h4" fontWeight="bold">
                {cases.filter((c) => c.trustApprovalStatus === "Approved").length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #ed6c02" }}>
              <Typography color="text.secondary" variant="body2">Pending Trust Approvals</Typography>
              <Typography variant="h4" fontWeight="bold">
                {cases.filter((c) => c.trustApprovalStatus !== "Approved").length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #9c27b0" }}>
              <Typography color="text.secondary" variant="body2">Empaneled Advocates</Typography>
              <Typography variant="h4" fontWeight="bold">{advocates.length}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Case Approval & Advocate Assignment Table */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Governance & Advocate Assignment Matrix
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Case ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Trust Approval</TableCell>
                <TableCell>Assign Empaneled Advocate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.caseNumber}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.clientName}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.trustApprovalStatus}
                      size="small"
                      color={c.trustApprovalStatus === "Approved" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={c.advocateId || ""}
                      onChange={(e) => handleAssign(c.id, e.target.value)}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">-- Select Advocate --</MenuItem>
                      {advocates.map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          {a.name} ({a.specialization})
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {c.trustApprovalStatus !== "Approved" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(c.id, "Approved")}
                        >
                          Approve
                        </Button>
                      )}
                      {c.trustApprovalStatus !== "Rejected" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleApprove(c.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}
