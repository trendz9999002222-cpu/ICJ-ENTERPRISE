import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";

import ProtectedRoute from "./ProtectedRoute";
import PublicLegalHomepage from "../pages/PublicLegalHomepage";
import PublicOnboarding from "../pages/PublicOnboarding";
import Login from "../pages/Login";
import Recovery from "../pages/Recovery";
import CertificateVerification from "../pages/CertificateVerification";
import PublicCaseTracker from "../pages/PublicCaseTracker";
import SovereignIntermediaryTerms from "../pages/SovereignIntermediaryTerms";

// Lazy-loaded Authenticated / Heavy Dashboards for Ultra-Fast Initial Load
const Membership = lazy(() => import("../pages/Membership"));
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
const Documents = lazy(() => import("../pages/Documents"));
const Wallet = lazy(() => import("../pages/Wallet"));
const Token = lazy(() => import("../pages/Token"));
const TokenExchange = lazy(() => import("../pages/TokenExchange"));
const TokenGovernanceManual = lazy(() => import("../pages/TokenGovernanceManual"));
const Campaigns = lazy(() => import("../pages/Campaigns"));
const SubscriptionPlans = lazy(() => import("../pages/SubscriptionPlans"));
const VirtualOffice = lazy(() => import("../pages/VirtualOffice"));
const Donations = lazy(() => import("../pages/Donations"));
const Settings = lazy(() => import("../pages/Settings"));
const ActivityLog = lazy(() => import("../pages/ActivityLog"));
const Transactions = lazy(() => import("../pages/Transactions"));
const MemberProfile = lazy(() => import("../pages/MemberProfile"));
const Legal = lazy(() => import("../pages/Legal"));
const AIAssistant = lazy(() => import("../pages/AIAssistant"));
const Research = lazy(() => import("../pages/Research"));
const Administration = lazy(() => import("../pages/Administration"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Reports = lazy(() => import("../pages/Reports"));
const AdvocateResearchDirectory = lazy(() => import("../components/admin/AdvocateResearchDirectory.jsx"));
const SystemSecurityCompliance = lazy(() => import("../components/admin/SystemSecurityCompliance.jsx"));
const FeatureControlCenter = lazy(() => import("../components/admin/FeatureControlCenter.jsx"));

const SuperAdminDashboard = lazy(() => import("../pages/SuperAdminDashboard"));
const MemberPersonalDashboard = lazy(() => import("../pages/MemberPersonalDashboard"));
const AdvocateDashboard = lazy(() => import("../pages/AdvocateDashboard"));
const ClientPortal = lazy(() => import("../pages/ClientPortal"));
const TrustDashboard = lazy(() => import("../pages/TrustDashboard"));
const CourtCalendar = lazy(() => import("../pages/CourtCalendar"));
const BillingInvoicing = lazy(() => import("../pages/BillingInvoicing"));
const LegalDrafter = lazy(() => import("../pages/LegalDrafter"));
const PaymentManagement = lazy(() => import("../pages/PaymentManagement"));
const LocationMasterAdmin = lazy(() => import("../pages/LocationMasterAdmin"));
const DatabaseConfig = lazy(() => import("../pages/DatabaseConfig"));
const GovernanceCenter = lazy(() => import("../pages/GovernanceCenter"));
const APIConfigCenter = lazy(() => import("../pages/APIConfigCenter"));
const DeploymentCenter = lazy(() => import("../pages/DeploymentCenter"));
const SystemHealth = lazy(() => import("../pages/SystemHealth"));
const BareActsLibrary = lazy(() => import("../pages/BareActsLibrary"));
const PrecedentsLibrary = lazy(() => import("../pages/PrecedentsLibrary"));

const HelpdeskPortal = lazy(() => import("../pages/HelpdeskPortal"));
const LegalCommunityFeed = lazy(() => import("../pages/LegalCommunityFeed"));
const DemoLeadsPortal = lazy(() => import("../pages/DemoLeadsPortal"));

// 6 UNIFIED MASTER HUBS
const MemberOperationsHub = lazy(() => import("../pages/hubs/MemberOperationsHub"));
const FinanceBillingHub = lazy(() => import("../pages/hubs/FinanceBillingHub"));
const AILegalIntelligenceHub = lazy(() => import("../pages/hubs/AILegalIntelligenceHub"));
const LegalCourtWorkspaceHub = lazy(() => import("../pages/hubs/LegalCourtWorkspaceHub"));
const SystemAdminControlHub = lazy(() => import("../pages/hubs/SystemAdminControlHub"));
const HelpdeskSupportHub = lazy(() => import("../pages/hubs/HelpdeskSupportHub"));
const DynamicLegalImmunityWatchdog = lazy(() => import("../pages/DynamicLegalImmunityWatchdog"));

import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";
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
        <Route path="/statutory-intermediary-terms" element={<SovereignIntermediaryTerms />} />
        <Route path="/intermediary-terms" element={<Navigate to="/statutory-intermediary-terms" replace />} />
        <Route path="/legal-immunity" element={<Navigate to="/statutory-intermediary-terms" replace />} />

        {/* Authenticated Internal Workspace Router */}
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <RootDashboard />
            </ProtectedRoute>
          )}
        />

        {/* 6 UNIFIED MASTER COMMAND HUBS */}
        <Route path="/membership-hub" element={<ProtectedRoute roles={["admin", "employee"]}><MemberOperationsHub /></ProtectedRoute>} />
        <Route path="/legal-workspace" element={<ProtectedRoute><LegalCourtWorkspaceHub /></ProtectedRoute>} />
        <Route path="/ai-legal-hub" element={<ProtectedRoute><AILegalIntelligenceHub /></ProtectedRoute>} />
        <Route path="/finance-hub" element={<ProtectedRoute roles={["admin", "advocate"]}><FinanceBillingHub /></ProtectedRoute>} />
        <Route path="/admin-control-hub" element={<ProtectedRoute roles={["admin", "super_admin"]}><SystemAdminControlHub /></ProtectedRoute>} />
        <Route path="/support-hub" element={<ProtectedRoute><HelpdeskSupportHub /></ProtectedRoute>} />

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
        <Route path="/bare-acts" element={<ProtectedRoute><BareActsLibrary /></ProtectedRoute>} />
        <Route path="/bare-acts-reader" element={<Navigate to="/bare-acts" replace />} />
        <Route path="/acts" element={<Navigate to="/bare-acts" replace />} />
        <Route path="/legal-library" element={<Navigate to="/bare-acts" replace />} />
        <Route path="/precedents" element={<ProtectedRoute><PrecedentsLibrary /></ProtectedRoute>} />
        <Route path="/judgments" element={<Navigate to="/precedents" replace />} />
        <Route path="/case-laws" element={<Navigate to="/precedents" replace />} />
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
        <Route path="/dynamic-legal-watchdog" element={<ProtectedRoute roles={["admin"]}><DynamicLegalImmunityWatchdog /></ProtectedRoute>} />
        <Route path="/legal-watchdog" element={<Navigate to="/dynamic-legal-watchdog" replace />} />
        <Route path="/compliance-watchdog" element={<Navigate to="/dynamic-legal-watchdog" replace />} />

        {/* Unknown URLs previously rendered a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}