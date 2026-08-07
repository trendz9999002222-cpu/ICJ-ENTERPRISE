import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Recovery from "../pages/Recovery";

import Membership from "../pages/Membership";
import MemberDirectory from "../pages/MemberDirectory";
import MemberVerification from "../pages/MemberVerification";
import MemberDocuments from "../pages/MemberDocuments";
import MemberWallet from "../pages/MemberWallet";
import MemberKYC from "../pages/MemberKYC";
import MemberIdentity from "../pages/MemberIdentity";
import MemberCertificates from "../pages/MemberCertificates";
import MemberHistory from "../pages/MemberHistory";
import MemberActivity from "../pages/MemberActivity";
import MemberSettings from "../pages/MemberSettings";
import MemberCard from "../pages/MemberCard";
import Documents from "../pages/Documents";
import Wallet from "../pages/Wallet";
import Token from "../pages/Token";
import Donations from "../pages/Donations";
import Settings from "../pages/Settings";
import ActivityLog from "../pages/ActivityLog";
import Transactions from "../pages/Transactions";
import MemberProfile from "../pages/MemberProfile";
import Legal from "../pages/Legal";
import AIAssistant from "../pages/AIAssistant";
import Research from "../pages/Research";
import Administration from "../pages/Administration";
import Notifications from "../pages/Notifications";
import Reports from "../pages/Reports";

import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import AdvocateDashboard from "../pages/AdvocateDashboard";
import ClientPortal from "../pages/ClientPortal";
import TrustDashboard from "../pages/TrustDashboard";
import CourtCalendar from "../pages/CourtCalendar";
import BillingInvoicing from "../pages/BillingInvoicing";
import LegalDrafter from "../pages/LegalDrafter";
import PaymentManagement from "../pages/PaymentManagement";
import LocationMasterAdmin from "../pages/LocationMasterAdmin";
import DatabaseConfig from "../pages/DatabaseConfig";
import GovernanceCenter from "../pages/GovernanceCenter";
import APIConfigCenter from "../pages/APIConfigCenter";
import DeploymentCenter from "../pages/DeploymentCenter";
import SystemHealth from "../pages/SystemHealth";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";

export default function AppRouter() {
  return (
    <GlobalErrorBoundary componentName="AppRouter">
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/membership" replace />} />
        <Route path="/recovery" element={<Recovery />} />

        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/super-admin-dashboard"
          element={(
            <ProtectedRoute roles={["admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/membership"
          element={(
            <ProtectedRoute roles={["admin", "employee"]}>
              <Membership />
            </ProtectedRoute>
          )}
        />

        <Route path="/member-registration" element={<Navigate to="/membership" replace />} />
        <Route path="/member-directory" element={<ProtectedRoute roles={["admin", "employee"]}><MemberDirectory /></ProtectedRoute>} />
        <Route path="/member-verification" element={<ProtectedRoute roles={["admin", "employee"]}><MemberVerification /></ProtectedRoute>} />
        <Route path="/member-documents" element={<ProtectedRoute><MemberDocuments /></ProtectedRoute>} />
        <Route path="/member-wallet" element={<ProtectedRoute><MemberWallet /></ProtectedRoute>} />
        <Route path="/member-kyc" element={<ProtectedRoute roles={["admin", "employee"]}><MemberKYC /></ProtectedRoute>} />
        <Route path="/member-identity" element={<ProtectedRoute><MemberIdentity /></ProtectedRoute>} />
        <Route path="/member-certificates" element={<ProtectedRoute roles={["admin", "employee"]}><MemberCertificates /></ProtectedRoute>} />
        <Route path="/member-history" element={<ProtectedRoute><MemberHistory /></ProtectedRoute>} />
        <Route path="/member-activity" element={<ProtectedRoute><MemberActivity /></ProtectedRoute>} />
        <Route path="/member-settings" element={<ProtectedRoute roles={["admin", "employee"]}><MemberSettings /></ProtectedRoute>} />
        <Route path="/member-card" element={<ProtectedRoute><MemberCard /></ProtectedRoute>} />

        <Route path="/identity" element={<ProtectedRoute><MemberIdentity /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/token" element={<ProtectedRoute><Token /></ProtectedRoute>} />
        <Route path="/donation" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
        <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/member-profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={["admin", "employee"]}><Reports /></ProtectedRoute>} />

        <Route path="/legal" element={<ProtectedRoute roles={["admin", "employee"]}><Legal /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/research" element={<ProtectedRoute roles={["admin", "employee"]}><Research /></ProtectedRoute>} />
        <Route path="/administration" element={<ProtectedRoute roles={["admin"]}><Administration /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

        {/* AI Legal Ecosystem Routes */}
        <Route path="/advocate-dashboard" element={<ProtectedRoute roles={["admin", "employee"]}><AdvocateDashboard /></ProtectedRoute>} />
        <Route path="/client-portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
        <Route path="/trust-dashboard" element={<ProtectedRoute roles={["admin"]}><TrustDashboard /></ProtectedRoute>} />
        <Route path="/court-calendar" element={<ProtectedRoute><CourtCalendar /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute roles={["admin", "employee"]}><BillingInvoicing /></ProtectedRoute>} />
        <Route path="/ai-drafter" element={<ProtectedRoute><LegalDrafter /></ProtectedRoute>} />
        <Route path="/payment-management" element={<ProtectedRoute><PaymentManagement /></ProtectedRoute>} />
        <Route path="/location-master" element={<ProtectedRoute roles={["admin"]}><LocationMasterAdmin /></ProtectedRoute>} />
        <Route path="/database-config" element={<ProtectedRoute roles={["admin"]}><DatabaseConfig /></ProtectedRoute>} />
        <Route path="/governance-center" element={<ProtectedRoute roles={["admin"]}><GovernanceCenter /></ProtectedRoute>} />
        <Route path="/api-config" element={<ProtectedRoute roles={["admin"]}><APIConfigCenter /></ProtectedRoute>} />
        <Route path="/deployment-center" element={<ProtectedRoute roles={["admin"]}><DeploymentCenter /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute roles={["admin"]}><SystemHealth /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </GlobalErrorBoundary>
  );
}