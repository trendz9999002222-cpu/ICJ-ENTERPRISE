// =============================================================================
// ICJ Admin Portal — Recent Activity & URL Hit Tracker
// =============================================================================

export type TrackedActivity = {
  id: string;
  type: string;
  title: string;
  url: string;
  description: string;
  actor_name: string;
  timestamp: string;
};

const STORAGE_KEY = "icj_admin_recent_activity";
const MAX_ACTIVITIES = 10;

const ROUTE_NAME_MAP: Record<string, string> = {
  "/admin": "Admin Home",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "Users Management",
  "/admin/advocates": "Professionals List",
  "/admin/professionals": "Professionals List",
  "/admin/kyc": "KYC Verification",
  "/admin/cases": "Cases Management",
  "/admin/assistance": "Assistance Requests",
  "/admin/documents": "Documents Repository",
  "/admin/appointments": "Appointments",
  "/admin/services": "Platform Services",
  "/admin/practice-areas": "Practice Areas",
  "/admin/content": "Content Management",
  "/admin/research": "Legal Research",
  "/admin/events": "Events Management",
  "/admin/memberships": "Memberships",
  "/admin/grievances": "Grievance Portal",
  "/admin/notifications": "Notifications Center",
  "/admin/reports": "Reports & Analytics",
  "/admin/settings": "Portal Settings",
};

export function resolveUrlTitle(pathname: string): { title: string; type: string } {
  if (ROUTE_NAME_MAP[pathname]) {
    return { title: `Accessed ${ROUTE_NAME_MAP[pathname]}`, type: "page_visit" };
  }

  if (pathname.startsWith("/admin/advocates/") || pathname.startsWith("/admin/professionals/")) {
    const id = pathname.replace("/admin/advocates/", "").replace("/admin/professionals/", "");
    return { title: `Viewed Professional Application (${id.slice(0, 8)}...)`, type: "professional_view" };
  }

  if (pathname.startsWith("/admin/users/")) {
    const id = pathname.replace("/admin/users/", "");
    return { title: `Viewed User Profile (#${id})`, type: "user_view" };
  }

  if (pathname.startsWith("/admin/cases/")) {
    const id = pathname.replace("/admin/cases/", "");
    return { title: `Viewed Case (#${id.slice(0, 8)}...)`, type: "case_view" };
  }

  if (pathname.startsWith("/admin/kyc/")) {
    const id = pathname.replace("/admin/kyc/", "");
    return { title: `Viewed KYC Application (#${id.slice(0, 8)}...)`, type: "kyc_view" };
  }

  return { title: `Visited ${pathname}`, type: "page_visit" };
}

export function getTrackedActivities(): TrackedActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logAdminActivity(entry: {
  title: string;
  url: string;
  type?: string;
  description?: string;
  actor_name?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const current = getTrackedActivities();
    const newEntry: TrackedActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: entry.type || "page_visit",
      title: entry.title,
      url: entry.url,
      description: entry.description || entry.url,
      actor_name: entry.actor_name || "Super Admin",
      timestamp: new Date().toISOString(),
    };

    // Avoid duplicate entry if immediately revisiting exact same URL within 2 seconds
    if (current.length > 0 && current[0].url === entry.url) {
      const diffMs = Date.now() - new Date(current[0].timestamp).getTime();
      if (diffMs < 3000) return;
    }

    const updated = [newEntry, ...current].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not log admin activity:", err);
  }
}

export function clearTrackedActivities() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear admin activities:", err);
  }
}
