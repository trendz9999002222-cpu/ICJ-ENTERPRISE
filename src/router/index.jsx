import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";

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
import AdvocateResearchDirectory from "../components/admin/AdvocateResearchDirectory.jsx";
import SystemSecurityCompliance from "../components/admin/SystemSecurityCompliance.jsx";
import FeatureControlCenter from "../components/admin/FeatureControlCenter.jsx";

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
import CertificateVerification from "../pages/CertificateVerification";
import PublicLegalHomepage from "../pages/PublicLegalHomepage";
import PublicCaseTracker from "../pages/PublicCaseTracker";
import useAuth from "../hooks/useAuth";

function RootDashboard() {
  const { user } = useAuth();
  const role = String(user?.role || "member").toLowerCase();
  const userType = String(user?.user_type || "").toLowerCase();

  if (role === "advocate" || userType === "advocate") {
    return <AdvocateDashboard />;
  }

  if (role === "client" || userType === "client") {
    return <ClientPortal />;
  }

  // Only true admin roles get the Super Admin dashboard.
  if (["admin", "super_admin", "superadmin"].includes(role)) {
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
        <Suspense fallback={<LinearProgress color="primary" sx={{ height: 3, bgcolor: "rgba(59, 130, 246, 0.2)" }} />}>
          <Routes>
        {/* Universal Public Front-Door Citizen Legal Homepage (Mobile & Desktop) */}
        <Route path="/" element={<PublicLegalHomepage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Public Action & Onboarding Portals */}
        <Route path="/login" element={<Login />} />
        <Route path="/demo-leads-portal" element={<DemoLeadsPortal />} />
        <Route path="/loginAuthentication" element={<Navigate to="/login" replace />} />
        <Route path="/join" element={<PublicOnboarding />} />
        <Route path="/register" element={<Navigate to="/join" replace />} />
        <Route path="/member-register" element={<Navigate to="/join" replace />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/verify" element={<CertificateVerification />} />
        <Route path="/certificate-verify" element={<CertificateVerification />} />
        <Route path="/track-case" element={<PublicCaseTracker />} />
        <Route path="/track" element={<Navigate to="/track-case" replace />} />
        <Route path="/case-status" element={<Navigate to="/track-case" replace />} />

        {/* Authenticated Internal Workspace Router */}
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <RootDashboard />
            </ProtectedRoute>
          )}
        />

        {/* Strict Air-Gapped Super Admin Dashboard */}
        <Route
          path="/super-admin"
          element={(
            <ProtectedRoute roles={["super_admin", "admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          )}
        />
        <Route path="/super-admin-dashboard" element={<Navigate to="/super-admin" replace />} />
        <Route path="/admin" element={<Navigate to="/super-admin" replace />} />

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
        {/* System Governance & Token Routes */}
        <Route path="/token-exchange" element={<ProtectedRoute><TokenExchange /></ProtectedRoute>} />
        <Route path="/icj-token" element={<ProtectedRoute><TokenExchange /></ProtectedRoute>} />
        <Route path="/token-governance-manual" element={<ProtectedRoute><TokenGovernanceManual /></ProtectedRoute>} />
        <Route path="/token-system-faq" element={<ProtectedRoute><TokenGovernanceManual /></ProtectedRoute>} />
        <Route path="/token-manual" element={<ProtectedRoute><TokenGovernanceManual /></ProtectedRoute>} />
        <Route path="/token-faq" element={<ProtectedRoute><TokenGovernanceManual /></ProtectedRoute>} />

        {/* Platform Ecosystem Routes — sign-in required */}
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
        <Route path="/virtual-office" element={<ProtectedRoute><VirtualOffice /></ProtectedRoute>} />
        <Route path="/donation" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
        <Route path="/activity-log" element={<ProtectedRoute roles={["admin", "employee"]}><ActivityLog /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/member-profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={["admin"]}><Reports /></ProtectedRoute>} />

        <Route path="/legal" element={<ProtectedRoute><Legal /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
        <Route path="/administration" element={<ProtectedRoute roles={["admin"]}><Administration /></ProtectedRoute>} />
        <Route path="/advocate-directory" element={<ProtectedRoute roles={["admin"]}><AdvocateResearchDirectory /></ProtectedRoute>} />
        <Route path="/security-compliance" element={<ProtectedRoute roles={["admin"]}><SystemSecurityCompliance /></ProtectedRoute>} />
        <Route path="/feature-control" element={<ProtectedRoute roles={["admin"]}><FeatureControlCenter /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute roles={["admin"]}><Wallet /></ProtectedRoute>} />

        {/* AI Legal Ecosystem Routes */}
        <Route path="/advocate-dashboard" element={<ProtectedRoute roles={["advocate", "admin"]}><AdvocateDashboard /></ProtectedRoute>} />
        <Route path="/client-portal" element={<ProtectedRoute roles={["member", "client", "admin"]}><ClientPortal /></ProtectedRoute>} />
        <Route path="/trust-dashboard" element={<ProtectedRoute roles={["admin"]}><TrustDashboard /></ProtectedRoute>} />
        <Route path="/court-calendar" element={<ProtectedRoute><CourtCalendar /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute roles={["admin", "advocate"]}><BillingInvoicing /></ProtectedRoute>} />
        <Route path="/billing-invoicing" element={<ProtectedRoute roles={["admin", "advocate"]}><BillingInvoicing /></ProtectedRoute>} />
        <Route path="/master-finance" element={<ProtectedRoute roles={["admin"]}><Wallet /></ProtectedRoute>} />
        <Route path="/ai-drafter" element={<ProtectedRoute><LegalDrafter /></ProtectedRoute>} />
        <Route path="/payment-management" element={<ProtectedRoute roles={["admin"]}><PaymentManagement /></ProtectedRoute>} />
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
        <Route path="/legal-community" element={<ProtectedRoute><LegalCommunityFeed /></ProtectedRoute>} />

        {/* Unknown URLs previously rendered a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}