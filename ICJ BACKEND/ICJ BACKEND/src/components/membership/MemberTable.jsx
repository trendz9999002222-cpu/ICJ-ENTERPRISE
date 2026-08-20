import { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Checkbox,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";

export default function MemberTable({
  filteredMembers = [],
  onEditMember,
  onDeleteMember,
  onBulkAction,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const getMemberId = (member) => member.id || member.member_id;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredMembers.map(getMemberId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Member ID", "Name", "Email", "Mobile", "Profession", "Level", "Status", "Verification"];
    const rows = filteredMembers.map((m) => [
      m.member_id || m.id,
      `"${m.name || m.fullName}"`,
      m.email,
      m.mobile,
      `"${m.profession || ""}"`,
      m.member_level || "Basic",
      m.status || "Active",
      m.verification_status || "Approved",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ICJ_Members_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    console.log("PRINT BUTTON CLICKED - MemberTable");
    console.log("PRINT ENGINE STARTED - MemberTable");
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (printWindow) {
      const rows = filteredMembers.map(m => `
        <tr>
          <td style="padding:6px;border:1px solid #ccc">${m.member_id || m.id}</td>
          <td style="padding:6px;border:1px solid #ccc">${m.name || m.fullName}</td>
          <td style="padding:6px;border:1px solid #ccc">${m.role || "Member"}</td>
          <td style="padding:6px;border:1px solid #ccc">${m.email || "-"}</td>
          <td style="padding:6px;border:1px solid #ccc">${m.mobile || "-"}</td>
          <td style="padding:6px;border:1px solid #ccc">${m.account_status || "Active"}</td>
        </tr>
      `).join("");

      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Member Directory Print</title>
        <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th{background:#0d47a1;color:#fff;padding:8px}</style>
        </head><body>
        <h2>INTERNATIONAL CONSORTIUM OF JURISTS — MEMBER DIRECTORY</h2>
        <p>Date: ${new Date().toLocaleDateString("en-IN")}</p>
        <table><thead><tr><th>Member ID</th><th>Name</th><th>Role</th><th>Email</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.print();window.close();<\/script>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <Paper sx={{ mt: 3, p: 3, borderRadius: 3 }}>
      {/* Table Header & Bulk Actions */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Master Member Directory ({filteredMembers.length})
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {selectedIds.length > 0 && (
            <>
              <Button size="small" variant="contained" color="success" onClick={() => onBulkAction("approve", selectedIds)}>
                Approve ({selectedIds.length})
              </Button>
              <Button size="small" variant="contained" color="warning" onClick={() => onBulkAction("block", selectedIds)}>
                Block ({selectedIds.length})
              </Button>
              <Button size="small" variant="contained" color="error" onClick={() => onBulkAction("delete", selectedIds)}>
                Delete ({selectedIds.length})
              </Button>
            </>
          )}

          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCSV}>
            Export Excel/CSV
          </Button>
          <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print
          </Button>
        </Stack>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={filteredMembers.length > 0 && selectedIds.length === filteredMembers.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < filteredMembers.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell><strong>S.No.</strong></TableCell>
            <TableCell><strong>Member ID</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Email / Mobile</strong></TableCell>
            <TableCell><strong>Profession</strong></TableCell>
            <TableCell><strong>Plan Level</strong></TableCell>
            <TableCell><strong>Account Status</strong></TableCell>
            <TableCell><strong>Verification</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">No Members Found Matching Search/Filter Criteria.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredMembers.map((member, index) => {
              const id = getMemberId(member);
              const isSelected = selectedIds.includes(id);

              return (
                <TableRow key={id} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected} onChange={() => handleSelectOne(id)} />
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{index + 1}</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight="bold">{member.member_id || id}</Typography></TableCell>
                  <TableCell>{member.name || member.fullName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.mobile}</Typography>
                  </TableCell>
                  <TableCell>{member.profession || "Advocate"}</TableCell>
                  <TableCell>
                    <Chip label={member.member_level || "Basic"} size="small" color={member.member_level === "Enterprise" ? "secondary" : "primary"} />
                  </TableCell>
                  <TableCell>
                    <Chip label={member.status || "Active"} size="small" color={member.status === "Active" ? "success" : "error"} />
                  </TableCell>
                  <TableCell>
                    <Chip label={member.verification_status || "Approved"} size="small" variant="outlined" color={member.verification_status === "Approved" ? "success" : "warning"} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View / Edit Member Profile">
                      <IconButton size="small" color="primary" onClick={() => onEditMember(member)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Member">
                      <IconButton size="small" color="error" onClick={() => onDeleteMember(id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}