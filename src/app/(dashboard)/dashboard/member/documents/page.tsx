"use client";

import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { env } from "@/config/env";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function MemberDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const token = readCookie("icj_access_token");
        const res = await fetch(`${env.apiUrl}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const json = await res.json();
          const data = json.data || json;
          setMembership(data.membership);
          const allFiles: any[] = [];
          if (Array.isArray(data.professions)) {
            for (const p of data.professions) {
              if (Array.isArray(p.files)) {
                p.files.forEach((f: any) => allFiles.push({ ...f, source: p.profession_name || "Registration" }));
              }
            }
          }
          setFiles(allFiles);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  return (
    <PortalPageShell
      title="Documents & Credentials Vault"
      subtitle="Secure repository for your verified registration documents, bar licenses, certificates, and ID records."
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Documents Card */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              p: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Verified Vault Files ({files.length})
            </Typography>

            {files.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <FolderOpenIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No uploaded files found in your vault.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {files.map((file, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id || idx}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <DescriptionIcon sx={{ color: "#2563eb", fontSize: 24 }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {file.original_name || file.document_key}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {file.source}
                          </Typography>
                        </Box>
                      </Stack>
                      {file.url && (
                        <Button
                          component="a"
                          href={file.url}
                          target="_blank"
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          sx={{
                            textTransform: "none",
                            borderColor: "#cbd5e1",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#2563eb",
                            "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                          }}
                        >
                          View / Download
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>
        </Stack>
      )}
    </PortalPageShell>
  );
}
