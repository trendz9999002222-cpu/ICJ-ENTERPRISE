import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AccountRecovery = lazy(() => import("../pages/AccountRecovery"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

const Membership = lazy(() => import("../pages/Membership"));
const MemberRegistration = lazy(() => import("../pages/MemberRegistration"));
const MemberDirectory = lazy(() => import("../pages/MemberDirectory"));
const MemberVerification = lazy(() => import("../pages/MemberVerification"));
const MemberDocuments = lazy(() => import("../pages/MemberDocuments"));
const MemberWallet = lazy(() => import("../pages/MemberWallet"));
const MemberKYC = lazy(() => import("../pages/MemberKYC"));
const MemberIdentity = lazy(() => import("../pages/MemberIdentity"));
const MemberCertificates = lazy(() => import("../pages/MemberCertificates"));
const MemberHistory = lazy(() => import("../pages/MemberHistory"));
const MemberActivity = lazy(() => import("../pages/MemberActivity"));
const MemberSettings = lazy(() => import("../pages/MemberSettings"));
const MemberCard = lazy(() => import("../pages/MemberCard"));
const MemberProfile = lazy(() => import("../pages/MemberProfile"));

const Wallet = lazy(() => import("../pages/Wallet"));
const Finance = lazy(() => import("../pages/Finance"));
const Token = lazy(() => import("../pages/Token"));
const Tokens = lazy(() => import("../pages/Tokens"));
const Donations = lazy(() => import("../pages/Donations"));
const Transactions = lazy(() => import("../pages/Transactions"));

const LegalCases = lazy(() => import("../pages/LegalCases"));
const Documents = lazy(() => import("../pages/Documents"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Settings = lazy(() => import("../pages/Settings"));
const ActivityLog = lazy(() => import("../pages/ActivityLog"));
const Profile = lazy(() => import("../pages/Profile"));
const AIAssistant = lazy(() => import("../pages/AIAssistant"));
const Research = lazy(() => import("../pages/Research"));
const Administration = lazy(() => import("../pages/Administration"));
const Reports = lazy(() => import("../pages/Reports"));
const DeveloperTools = lazy(() => import("../pages/DeveloperTools"));

const guard = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

const LoadingScreen = () => (
  <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
    <CircularProgress />
  </Box>
);

export default function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account-recovery" element={<AccountRecovery />} />

          <Route path="/dashboard" element={guard(<Dashboard />)} />

          <Route path="/membership" element={guard(<Membership />)} />
          <Route path="/members" element={guard(<Membership />)} />
          <Route path="/member-registration" element={guard(<MemberRegistration />)} />
          <Route path="/member-directory" element={guard(<MemberDirectory />)} />
          <Route path="/member-verification" element={guard(<MemberVerification />)} />
          <Route path="/member-documents" element={guard(<MemberDocuments />)} />
          <Route path="/member-wallet" element={guard(<MemberWallet />)} />
          <Route path="/member-kyc" element={guard(<MemberKYC />)} />
          <Route path="/member-identity" element={guard(<MemberIdentity />)} />
          <Route path="/member-certificates" element={guard(<MemberCertificates />)} />
          <Route path="/member-history" element={guard(<MemberHistory />)} />
          <Route path="/member-activity" element={guard(<MemberActivity />)} />
          <Route path="/member-settings" element={guard(<MemberSettings />)} />
          <Route path="/member-card" element={guard(<MemberCard />)} />
          <Route path="/member-profile" element={guard(<MemberProfile />)} />

          <Route path="/identity" element={guard(<MemberIdentity />)} />
          <Route path="/wallet" element={guard(<Wallet />)} />
          <Route path="/token" element={guard(<Token />)} />
          <Route path="/tokens" element={guard(<Tokens />)} />
          <Route path="/donation" element={guard(<Donations />)} />
          <Route path="/transactions" element={guard(<Transactions />)} />
          <Route path="/finance" element={guard(<Finance />)} />

          <Route path="/legal" element={guard(<LegalCases />)} />
          <Route path="/documents" element={guard(<Documents />)} />
          <Route path="/notifications" element={guard(<Notifications />)} />
          <Route path="/settings" element={guard(<Settings />)} />
          <Route path="/activity-log" element={guard(<ActivityLog />)} />
          <Route path="/profile" element={guard(<Profile />)} />
          <Route path="/ai" element={guard(<AIAssistant />)} />
          <Route path="/research" element={guard(<Research />)} />
          <Route path="/administration" element={guard(<Administration />)} />
          <Route path="/admin" element={guard(<Administration />)} />
          <Route path="/reports" element={guard(<Reports />)} />
          <Route path="/developer" element={guard(<DeveloperTools />)} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
