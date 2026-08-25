import { createContext, useContext, useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileBottomNav from "../components/MobileBottomNav";
import RoleTopNav from "../components/common/RoleTopNav";
import OfflineNetworkSyncBanner from "../components/common/OfflineNetworkSyncBanner";
import SessionAutoLockModal from "../components/common/SessionAutoLockModal";
import SecureWatermarkOverlay from "../components/common/SecureWatermarkOverlay";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";
import useAuth from "../hooks/useAuth";

const InsideMainLayout = createContext(false);

function MainLayout({ children }) {
  const alreadyInsideLayout = useContext(InsideMainLayout);

  if (alreadyInsideLayout) {
    return <>{children}</>;
  }

  return <MainLayoutChrome>{children}</MainLayoutChrome>;
}

function MainLayoutChrome({ children }) {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const role = String(user?.role || "member").toLowerCase();
  const userType = String(user?.user_type || "").toLowerCase();
  const isAdmin = ["admin", "super_admin", "superadmin", "employee"].includes(role);

  return (
    <Box sx={{ display: "flex", background: "#F5F7FA", minHeight: "100vh", width: "100%", overflowX: "hidden", position: "relative" }} className="mobile-app-container">
      {/* 🛡️ ANTI-LEAK BACKGROUND SECURITY WATERMARK */}
      <SecureWatermarkOverlay />

      {/* 🔐 COURTROOM SESSION INACTIVITY AUTO-LOCK MODAL */}
      <SessionAutoLockModal />

      {/* ⬅️ LEFT SIDEBAR: ONLY FOR ADMINS ON DESKTOP & MOBILE */}
      {isAdmin && (
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      )}

      {/* 📱 MOBILE-ONLY DRAWER FOR NON-ADMINS */}
      {!isAdmin && mobileNavOpen && (
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          pb: { xs: 9, md: 2 },
        }}
      >
        {/* 🌐 LIVE OFFLINE / ONLINE NETWORK RESILIENCY BANNER */}
        <OfflineNetworkSyncBanner />

        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        {/* 🔝 TOP HORIZONTAL ROLE NAVIGATION ROW FOR ADVOCATES, CLIENTS & MEMBERS */}
        {!isAdmin && <RoleTopNav />}

        <Box
          sx={{
            flex: 1,
            p: { xs: 0.8, sm: 1.5, md: 2 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <GlobalErrorBoundary componentName="MainLayoutPage">
            <InsideMainLayout.Provider value={true}>
              {children}
            </InsideMainLayout.Provider>
          </GlobalErrorBoundary>
        </Box>
        <MobileBottomNav onOpenMobileNav={() => setMobileNavOpen(true)} />
      </Box>
    </Box>
  );
}

export default MainLayout;