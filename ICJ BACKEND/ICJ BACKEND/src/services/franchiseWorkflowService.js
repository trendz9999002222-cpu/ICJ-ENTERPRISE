/**
 * FranchiseWorkflowService — ICJ Enterprise Platform
 * Manages Franchise Applications, Admin Action Box, Meeting Notes,
 * and Live Applicant Status Tracking.
 */

const FRANCHISE_STORAGE_KEY = "icj_franchise_applications";

const getApplications = () => {
  try {
    const raw = localStorage.getItem(FRANCHISE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: "FRAN-2026-001",
        applicantName: "Rajesh Agarwal",
        city: "Lucknow",
        state: "Uttar Pradesh",
        mobile: "+91 98390 11223",
        email: "rajesh.agarwal@example.com",
        experience: "12 Years Legal Documentation & Public Service Center Owner",
        status: "PENDING_REVIEW",
        appliedAt: new Date().toISOString(),
        meetingNotes: "Awaiting Admin initial screening and interaction schedule.",
      },
    ];
  } catch {
    return [];
  }
};

const saveApplications = (apps) => {
  try {
    localStorage.setItem(FRANCHISE_STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error("Failed to save franchise applications", e);
  }
};

export const FranchiseWorkflowService = {
  /**
   * 1. Submit a new franchise request
   */
  submitApplication(formData) {
    const id = `FRAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      id,
      applicantName: formData.applicantName || "Franchise Applicant",
      city: formData.city || "Not Specified",
      state: formData.state || "Not Specified",
      mobile: formData.mobile || "",
      email: formData.email || "",
      experience: formData.experience || "Legal & Business Experience",
      status: "PENDING_REVIEW",
      appliedAt: new Date().toISOString(),
      meetingNotes: "Application submitted. Awaiting ICJ Administration review.",
    };

    const apps = getApplications();
    apps.unshift(newApp);
    saveApplications(apps);
    return newApp;
  },

  /**
   * 2. Get pending franchise applications for Admin Action Box
   */
  getPendingApplications() {
    const apps = getApplications();
    return apps.filter((a) => a.status === "PENDING_REVIEW");
  },

  /**
   * 3. Get all applications
   */
  getAllApplications() {
    return getApplications();
  },

  /**
   * 4. Admin updates franchise application status & meeting notes
   */
  updateStatus({ applicationId, newStatus, meetingNotes, adminUsername }) {
    const apps = getApplications();
    const updated = apps.map((a) => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: newStatus, // "APPROVED" | "REJECTED" | "INTERACTION_SCHEDULED" | "ACTIVE"
          meetingNotes: meetingNotes || a.meetingNotes,
          reviewedBy: adminUsername || "Admin",
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });

    saveApplications(updated);
    return { success: true, applicationId, newStatus };
  },

  /**
   * 5. Get applicant tracking view for specific applicant email/mobile
   */
  getApplicantStatus(emailOrMobile) {
    const apps = getApplications();
    return apps.find((a) => a.email === emailOrMobile || a.mobile === emailOrMobile) || null;
  },
};

export default FranchiseWorkflowService;
