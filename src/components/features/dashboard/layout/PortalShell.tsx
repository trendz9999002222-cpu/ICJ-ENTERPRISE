"use client";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalHeader, { MembershipItem, ProfessionItem } from "./PortalHeader";
import PortalSidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "./PortalSidebar";

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

type Props = {
  children: React.ReactNode;
};

export default function PortalShell({ children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string>("professional");
  const [professions, setProfessions] = useState<ProfessionItem[]>([]);
  const [activeProfession, setActiveProfession] = useState<ProfessionItem | null>(null);
  const [membership, setMembership] = useState<MembershipItem | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const payload = decodeJwt(token);
    if (payload) {
      if (payload.first_name || payload.last_name) {
        setUserName(`${payload.first_name || ""} ${payload.last_name || ""}`.trim());
      } else if (payload.name) {
        setUserName(payload.name as string);
      } else if (payload.email) {
        setUserName((payload.email as string).split("@")[0]);
      }
      if (payload.email) setUserEmail(payload.email as string);

      let extractedRoles: string[] = [];
      if (Array.isArray(payload.roles) && payload.roles.length > 0) {
        extractedRoles = payload.roles as string[];
      } else if (payload.role) {
        extractedRoles = [payload.role as string];
      }
      extractedRoles = extractedRoles.map((r) => (r === "client" ? "professional" : r));
      if (extractedRoles.length === 0) extractedRoles = ["professional"];
      setRoles(extractedRoles);

      // determine active role from pathname
      if (pathname.includes("/dashboard/advocate")) {
        setActiveRole("advocate");
      } else if (pathname.includes("/dashboard/member")) {
        setActiveRole("member");
      } else if (pathname.includes("/dashboard/professional")) {
        setActiveRole("professional");
      } else {
        setActiveRole(extractedRoles[0] || "professional");
      }
    }

    // Fetch full profile and professions from /api/v1/auth/me/
    async function loadProfile() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data.professions)) {
            setProfessions(data.professions);
            const savedProfId = typeof window !== "undefined" ? localStorage.getItem("active_profession_id") : null;
            if (savedProfId) {
              const matched = data.professions.find((p: any) => p.registration_id === savedProfId);
              if (matched) setActiveProfession(matched);
              else if (data.professions.length > 0) setActiveProfession(data.professions[0]);
            } else if (data.professions.length > 0) {
              setActiveProfession(data.professions[0]);
            }
          }
          if (data.membership) {
            setMembership(data.membership);
          }
          if (Array.isArray(data.roles) && data.roles.length > 0) {
            setRoles(data.roles);
          }
        }
      } catch (err) {
        console.error("Error loading user profile in PortalShell:", err);
      }
    }

    loadProfile();
  }, [pathname, router]);

  const handleSelectProfession = (prof: ProfessionItem) => {
    setActiveProfession(prof);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_profession_id", prof.registration_id);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: "#f1f5f9",
      }}
    >
      {/* Sidebar — persistent on desktop, drawer on mobile */}
      {isMobile ? (
        <PortalSidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          variant="temporary"
          roles={roles}
          primaryRole={activeRole}
          userName={userName}
          userEmail={userEmail}
        />
      ) : (
        <PortalSidebar
          open={sidebarOpen}
          onClose={toggleSidebar}
          variant="persistent"
          roles={roles}
          primaryRole={activeRole}
          userName={userName}
          userEmail={userEmail}
        />
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <PortalHeader
          onMenuClick={toggleSidebar}
          roles={roles}
          activeRole={activeRole}
          onRoleChange={(r) => setActiveRole(r)}
          professions={professions}
          activeProfession={activeProfession}
          onSelectProfession={handleSelectProfession}
          membership={membership}
          userName={userName}
          userEmail={userEmail}
        />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2.5, sm: 3 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
