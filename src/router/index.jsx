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
import TokenExchange from "../pages/TokenExchange";
import TokenGovernanceManual from "../pages/TokenGovernanceManual";
import Campaigns from "../pages/Campaigns";
import SubscriptionPlans from "../pages/SubscriptionPlans";
import VirtualOffice from "../pages/VirtualOffice";
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
import MemberPersonalDashboard from "../pages/MemberPersonalDashboard";
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

import HelpdeskPortal from "../pages/HelpdeskPortal";
import LegalCommunityFeed from "../pages/LegalCommunityFeed";
import PublicOnboarding from "../pages/PublicOnboarding";
import DemoLeadsPortal from "../pages/DemoLeadsPortal";
import useAuth from "../hooks/useAuth";

function RootDashboard() {
  const { user } = useAuth();
  const role = String(user?.role || "member").toLowerCase();

  if (role === "advocate") {
    return <AdvocateDashboard />;
  }

  const isCustomAdmin = (r) => {
    const roleStr = String(r || "").toLowerCase();
    const DYNAMIC_ADMIN_ROLES = ["admin", "super_admin", "superadmin", "trustee", "volunteer", "employee", "branch_admin"];
    return DYNAMIC_ADMIN_ROLES.includes(roleStr);
  };

  if (isCustomAdmin(role)) {
    return <SuperAdminDashboard />;
  }
  return <MemberPersonalDashboard />;
}

export default function AppRouter() {
  // Clean old virtual office localStorage cache containing mock junior staff
  if (typeof window !== "undefined" && window.localStorage) {
    if (window.localStorage.getItem("icj_virtual_offices_cleaned_v1") !== "true") {
      window.localStorage.removeItem("icj_virtual_offices");
      window.localStorage.setItem("icj_virtual_offices_cleaned_v1", "true");
    }
  }

  return (
    <GlobalErrorBoundary componentName="AppRouter">
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/demo-leads-portal" element={<DemoLeadsPortal />} />
        <Route path="/loginAuthentication" element={<Navigate to="/login" replace />} />
        <Route path="/join" element={<PublicOnboarding />} />
        <Route path="/register" element={<Navigate to="/join" replace />} />
        <Route path="/member-register" element={<Navigate to="/join" replace />} />
        <Route path="/recovery" element={<Recovery />} />

        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <RootDashboard />
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

        {/* /admin alias — same as /super-admin-dashboard */}
        <Route
          path="/admin"
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
        <Route path="/wallet" element={<ProtectedRoute><MemberWallet /></ProtectedRoute>} />
        <Route path="/token" element={<Token />} />
        {/* Token Exchange Public Portal — visible to all, exchange requires login */}
        <Route path="/token-exchange" element={<TokenExchange />} />
        <Route path="/icj-token" element={<TokenExchange />} />
        {/* System Governance Manual & FAQ Knowledgebase Module */}
        <Route path="/token-governance-manual" element={<TokenGovernanceManual />} />
        <Route path="/token-system-faq" element={<TokenGovernanceManual />} />
        <Route path="/token-manual" element={<TokenGovernanceManual />} />
        <Route path="/token-faq" element={<TokenGovernanceManual />} />

        {/* Unlocked Platform Ecosystem Routes */}
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route path="/virtual-office" element={<VirtualOffice />} />
        <Route path="/donation" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
        <Route path="/activity-log" element={<ProtectedRoute roles={["admin", "employee"]}><ActivityLog /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/member-profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reports" element={<Reports />} />

        <Route path="/legal" element={<ProtectedRoute><Legal /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
        <Route path="/administration" element={<ProtectedRoute roles={["admin"]}><Administration /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute roles={["admin"]}><Wallet /></ProtectedRoute>} />

        {/* AI Legal Ecosystem Routes */}
        <Route path="/advocate-dashboard" element={<ProtectedRoute roles={["advocate", "admin"]}><AdvocateDashboard /></ProtectedRoute>} />
        <Route path="/client-portal" element={<ProtectedRoute roles={["member", "client", "admin"]}><ClientPortal /></ProtectedRoute>} />
        <Route path="/trust-dashboard" element={<TrustDashboard />} />
        <Route path="/court-calendar" element={<CourtCalendar />} />
        <Route path="/billing" element={<BillingInvoicing />} />
        <Route path="/billing-invoicing" element={<BillingInvoicing />} />
        <Route path="/master-finance" element={<Wallet />} />
        <Route path="/ai-drafter" element={<LegalDrafter />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
        <Route path="/location-master" element={<ProtectedRoute roles={["admin"]}><LocationMasterAdmin /></ProtectedRoute>} />
        <Route path="/database-config" element={<ProtectedRoute roles={["admin"]}><DatabaseConfig /></ProtectedRoute>} />
        <Route path="/governance-center" element={<ProtectedRoute roles={["admin"]}><GovernanceCenter /></ProtectedRoute>} />
        <Route path="/api-config" element={<ProtectedRoute roles={["admin"]}><APIConfigCenter /></ProtectedRoute>} />
        <Route path="/deployment-center" element={<ProtectedRoute roles={["admin"]}><DeploymentCenter /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute roles={["admin"]}><SystemHealth /></ProtectedRoute>} />
        <Route path="/helpdesk" element={<ProtectedRoute><HelpdeskPortal /></ProtectedRoute>} />
        <Route path="/customer-care" element={<ProtectedRoute><HelpdeskPortal /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><LegalCommunityFeed /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><LegalCommunityFeed /></ProtectedRoute>} />
        <Route path="/legal-tribe" element={<ProtectedRoute><LegalCommunityFeed /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </GlobalErrorBoundary>
  );
}