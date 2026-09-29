"use client";

import {
  Gavel,
  VerifiedUser,
  Edit,
  LocationOn,
  Phone,
  Email,
  School,
  Save,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function decodeJwt(t: string) {
  try { return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
  catch { return null; }
}

export default function AdvocateProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) return;
    const p = decodeJwt(token);
    if (p?.email) setEmail(p.email as string);
    if (p?.first_name) setName(p.first_name as string);
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Avatar + basic info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Avatar
                sx={{ width: 90, height: 90, mx: "auto", mb: 2, bgcolor: "#1d4ed8", fontSize: "2rem" }}
              >
                {name[0]?.toUpperCase() ?? "A"}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{name}</Typography>
              <Typography variant="body2" color="text.secondary">{email}</Typography>
              <Chip
                icon={<VerifiedUser sx={{ fontSize: "14px !important" }} />}
                label="Verified Advocate"
                color="primary"
                size="small"
                sx={{ mt: 1.5, fontWeight: 700 }}
              />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.8} sx={{ alignItems: "flex-start" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Gavel sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2">Enrolled Advocate</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <LocationOn sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2">India</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Email sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{email}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Professional Details</Typography>
                <Button
                  startIcon={editing ? <Save /> : <Edit />}
                  variant={editing ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setEditing(!editing)}
                  sx={{ fontWeight: 700 }}
                >
                  {editing ? "Save Changes" : "Edit Profile"}
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {[
                  { label: "Full Name", value: name, icon: <Gavel fontSize="small" /> },
                  { label: "Bar Council Registration No.", value: "—", icon: <School fontSize="small" /> },
                  { label: "Enrollment Year", value: "—", icon: <School fontSize="small" /> },
                  { label: "High Court / District Court", value: "—", icon: <LocationOn fontSize="small" /> },
                  { label: "Practice Areas", value: "—", icon: <Gavel fontSize="small" /> },
                  { label: "Phone", value: "—", icon: <Phone fontSize="small" /> },
                ].map((field) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={field.label}>
                    <TextField
                      label={field.label}
                      defaultValue={field.value}
                      fullWidth
                      disabled={!editing}
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: <Box sx={{ mr: 1, color: "#64748b", display: "flex", alignItems: "center" }}>{field.icon}</Box>,
                        },
                      }}
                    />
                  </Grid>
                ))}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Professional Bio"
                    multiline
                    rows={3}
                    fullWidth
                    disabled={!editing}
                    size="small"
                    placeholder="Describe your practice, experience, and expertise..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
