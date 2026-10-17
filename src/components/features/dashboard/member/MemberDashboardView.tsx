"use client";

import {
  ArrowForward,
  CalendarToday,
  CardMembership,
  CheckCircle,
  Download,
  Gavel,
  Person,
  QrCode,
  Support,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";

import ChangePasswordDialog from "@/components/features/dashboard/member/ChangePasswordDialog";
import SetInitialPasswordDialog from "@/components/features/dashboard/member/SetInitialPasswordDialog";
import { env } from "@/config/env";
import { MEMBER_DASHBOARD_PATH } from "@/lib/memberDashboard";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { UserMembershipInfo } from "@/types/api";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

type MemberAction = {
  label: string;
  href: string;
  icon: ReactNode;
  requiresApproval: boolean;
  openPasswordDialog?: boolean;
};

const ALL_MEMBER_ACTIONS: MemberAction[] = [
  { label: "Find & Book Advocate", href: "/dashboard/member/find-advocate", icon: <Gavel fontSize="small" />, requiresApproval: true },
  { label: "Track My Application", href: "/dashboard/member/application", icon: <CalendarToday fontSize="small" />, requiresApproval: true },
  { label: "Download Documents", href: "/dashboard/member/documents", icon: <Download fontSize="small" />, requiresApproval: true },
  { label: "Update Profile", href: "/dashboard/profile", icon: <Person fontSize="small" />, requiresApproval: false },
  { label: "Change Password", href: MEMBER_DASHBOARD_PATH, icon: <Person fontSize="small" />, requiresApproval: false, openPasswordDialog: true },
  { label: "Contact Support", href: "/dashboard/member/support", icon: <Support fontSize="small" />, requiresApproval: true },
];

const membershipDetails = [
  { label: "Plan Type", value: "Standard Membership" },
  { label: "Join Date", value: new Date().toLocaleDateString("en-IN") },
  { label: "Valid Until", value: "Lifetime" },
  { label: "Benefits", value: "Legal Aid, Directory Access, Events" },
];

function MemberDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [setInitialPasswordOpen, setSetInitialPasswordOpen] = useState(false);

  const [name, setName] = useState("Member");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) return;
    const p = decodeJwt(token);
    if (p?.first_name) setName(p.first_name as string);
    if (p?.email) setEmail(p.email as string);
    if (p?.user_id) setUserId(String(p.user_id));

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (data?.membership) setMembership(data.membership as UserMembershipInfo);
        if (data?.first_name) setName(data.first_name as string);
        setProfilePictureUrl((data?.profile_picture_url as string) ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Only right after membership onboarding: check if user just onboarded for the first time
    const isFirstTimeOnboarded =
      searchParams.get("setPassword") === "1" ||
      (typeof window !== "undefined" && sessionStorage.getItem("icj_just_onboarded_membership") === "1");

    if (isFirstTimeOnboarded) {
      setSetInitialPasswordOpen(true);
    }
  }, [searchParams]);

  const closeSetInitialPasswordDialog = () => {
    setSetInitialPasswordOpen(false);
    try {
      sessionStorage.removeItem("icj_just_onboarded_membership");
    } catch {
      // ignore
    }
    if (searchParams.get("setPassword")) {
      router.replace(MEMBER_DASHBOARD_PATH);
    }
  };

  useEffect(() => {
    if (searchParams.get("changePassword") === "1") {
      setPasswordDialogOpen(true);
    }
  }, [searchParams]);

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    if (searchParams.get("changePassword")) {
      router.replace(MEMBER_DASHBOARD_PATH);
    }
  };

  const memberApproved = membership?.is_approved || membership?.status === "approved";
  const memberActions = useMemo(
    () => ALL_MEMBER_ACTIONS.filter((a) => memberApproved || !a.requiresApproval),
    [memberApproved],
  );

  const actionButtonSx = {
    justifyContent: "flex-start",
    borderColor: "#e2e8f0",
    color: "#1e293b",
    fontWeight: 600,
    "&:hover": { borderColor: "#059669", color: "#059669", bgcolor: "#f0fdf4" },
  };

  return (
    <Box>
      <SetInitialPasswordDialog
        open={setInitialPasswordOpen}
        onClose={closeSetInitialPasswordDialog}
        onSuccess={closeSetInitialPasswordDialog}
      />
      <ChangePasswordDialog open={passwordDialogOpen} onClose={closePasswordDialog} />

      <Box
        sx={{
          background: "linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)",
          borderRadius: 3,
          p: { xs: 2.5, sm: 4 },
          mb: 3,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.08 }}>
          <CardMembership sx={{ fontSize: 180 }} />
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar
            src={resolveMediaUrl(profilePictureUrl) || undefined}
            sx={{ width: 56, height: 56, bgcolor: "rgba(255,255,255,0.2)", fontSize: "1.5rem" }}
          >
            {name[0]?.toUpperCase() ?? "M"}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Welcome, {name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.3 }}>{email}</Typography>
            <Chip
              label={memberApproved ? "Active Member" : "Pending admin approval"}
              size="small"
              icon={<CheckCircle sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
              sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}
            />
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              borderRadius: 3,
              color: "#fff",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 2, fontSize: "0.6rem" }}>
                    INTERNATIONAL CONSORTIUM OF JURISTS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>Membership Card</Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 1 }}>
                  <QrCode sx={{ fontSize: 36, opacity: 0.8 }} />
                </Box>
              </Stack>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>Member Name</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{name}</Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Member ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {membership?.membership_id || (memberApproved ? "—" : "After approval")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#86efac" }}>
                      {memberApproved ? "Active" : "Pending"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Member Services</Typography>
              <Stack spacing={1.5}>
                {memberActions.map((a) =>
                  a.openPasswordDialog ? (
                    <Button
                      key={a.label}
                      type="button"
                      variant="outlined"
                      startIcon={a.icon}
                      endIcon={<ArrowForward fontSize="small" />}
                      fullWidth
                      onClick={() => setPasswordDialogOpen(true)}
                      sx={actionButtonSx}
                    >
                      {a.label}
                    </Button>
                  ) : (
                    <Button
                      key={a.label}
                      component={Link}
                      href={a.href}
                      variant="outlined"
                      startIcon={a.icon}
                      endIcon={<ArrowForward fontSize="small" />}
                      fullWidth
                      sx={actionButtonSx}
                    >
                      {a.label}
                    </Button>
                  ),
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Membership Details</Typography>
              <Grid container spacing={2}>
                {membershipDetails.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
                    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.3 }}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function MemberDashboardView() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      <MemberDashboardInner />
    </Suspense>
  );
}
