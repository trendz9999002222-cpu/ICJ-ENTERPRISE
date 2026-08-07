import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import DocumentService from "../services/documentService";

export default function MemberDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    DocumentService.getAll().then((rows) => {
      setDocuments(Array.isArray(rows) ? rows : []);
    });
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Member Documents
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document No</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No member documents found.</TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.documentNo || "-"}</TableCell>
                    <TableCell>{doc.title || "-"}</TableCell>
                    <TableCell>{doc.category || "-"}</TableCell>
                    <TableCell>{doc.owner || "-"}</TableCell>
                    <TableCell>{doc.status || "Active"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}
