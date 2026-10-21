// =============================================================================
// ICJ Admin Portal — Domain Types
// =============================================================================
// All types are defined here. When Django REST API is connected, these types
// should match the API response shapes (or be mapped in the service layer).
// =============================================================================

// ---------------------------------------------------------------------------
// Shared / primitives
// ---------------------------------------------------------------------------

export type ISODateString = string;

export type PaginatedResponse<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type SortDirection = "asc" | "desc";

/** Common query params for all paginated admin list endpoints */
export type AdminListParams = {
  search?: string;
  role?: string;
  status?: string;
  category?: string;
  group?: string;
  profession?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
};


// ---------------------------------------------------------------------------
// Admin User
// ---------------------------------------------------------------------------

/** Platform roles: admin, professional, member (API may send legacy values). */
export type AdminUserRole = "admin" | "professional" | "member" | "super_admin";

export type AdminUserStatus = "active" | "inactive" | "suspended" | "pending";

export type AdminUserHierarchyItem = {
  id: string;
  name: string;
};

export type AdminUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: AdminUserRole;
  roles?: string[];
  status: AdminUserStatus;
  mobile: string;
  profile_picture_url?: string | null;
  photo_url?: string | null;
  category_name?: string | null;
  group_name?: string | null;
  profession_name?: string | null;
  categories?: AdminUserHierarchyItem[];
  groups?: AdminUserHierarchyItem[];
  professions?: AdminUserHierarchyItem[];
  date_joined: ISODateString;
  last_login: ISODateString | null;
  is_verified: boolean;
  temp_password?: string;
  password_change_required?: boolean;
};

// ---------------------------------------------------------------------------
// Admin Advocate
// ---------------------------------------------------------------------------

export type AdvocateVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "under_review";

export type AdvocateDocument = {
  id: string;
  doc_key: string;
  original_name: string;
  content_type?: string;
  size_bytes?: number;
  uploaded_at?: string;
  file_url: string | null;
};

export type AdminAdvocate = {
  id: string;
  user_id: number;
  full_name: string;
  email: string;
  mobile: string;
  photo_url?: string | null;
  category_name?: string;
  group_name?: string;
  profession_name?: string;
  categories?: string[];
  groups?: string[];
  professions?: string[];
  bar_number: string;
  enrollment_number: string;
  practice_areas: string[];
  state_bar_council: string;
  years_of_experience: number;
  verification_status: AdvocateVerificationStatus;
  profile_bio: string;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type AdminAdvocateDetail = {
  id: string;
  reference_id: string;
  email: string;
  status: AdvocateVerificationStatus;
  full_name: string;
  mobile: string;
  photo_url?: string | null;
  category_name?: string;
  group_name?: string;
  profession_name?: string;
  categories?: { id: string; name: string }[];
  groups?: { id: string; name: string; category_id?: string }[];
  professions?: { id: string; name: string; group_id?: string; category_id?: string }[];
  selected_category_ids?: string[];
  selected_group_ids?: string[];
  selected_profession_ids?: string[];
  bar_number: string;
  enrollment_number: string;
  practice_areas: string[];
  state_bar_council: string;
  years_of_experience: number;
  rejection_reason: string | null;
  reviewed_by_email: string | null;
  reviewed_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  personal_data: Record<string, any>;
  address_data: Record<string, any>;
  advocate_data: Record<string, any>;
  profession_field_values?: Record<string, any>;
  common_field_values?: Record<string, any>;
  documents: AdvocateDocument[];
};

// ---------------------------------------------------------------------------
// KYC / Onboarding Application
// ---------------------------------------------------------------------------

export type KycStatus = "pending" | "approved" | "rejected" | "under_review";

export type KycDocument = {
  id: string;
  doc_key: string;
  original_name: string;
  file_url: string | null;
};

export type AdminKycApplication = {
  id: string;
  reference_id: string;
  email: string;
  full_name: string;
  mobile: string;
  bar_number: string;
  status: KycStatus;
  rejection_reason: string | null;
  reviewed_by_email: string | null;
  reviewed_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  personal_data: Record<string, unknown>;
  address_data: Record<string, unknown>;
  advocate_data: Record<string, unknown>;
  documents: KycDocument[];
};

// ---------------------------------------------------------------------------
// Case Management
// ---------------------------------------------------------------------------

export type CaseStatus =
  | "open"
  | "in_progress"
  | "pending_hearing"
  | "closed"
  | "dismissed"
  | "settled";

export type CasePriority = "low" | "medium" | "high" | "urgent";

export type AdminCase = {
  id: string;
  case_number: string;
  title: string;
  client_name: string;
  client_email: string;
  advocate_name: string;
  advocate_email: string;
  practice_area: string;
  status: CaseStatus;
  priority: CasePriority;
  court_name: string;
  next_hearing_date: ISODateString | null;
  filed_date: ISODateString;
  closed_date: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no_show";

export type AppointmentType =
  | "consultation"
  | "hearing"
  | "document_review"
  | "follow_up";

export type AdminAppointment = {
  id: string;
  client_name: string;
  client_email: string;
  advocate_name: string;
  advocate_email: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_at: ISODateString;
  duration_minutes: number;
  notes: string | null;
  created_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type DocumentCategory =
  | "kyc"
  | "case"
  | "contract"
  | "evidence"
  | "court_order"
  | "other";

export type AdminDocument = {
  id: string;
  name: string;
  original_name: string;
  category: DocumentCategory;
  uploaded_by_name: string;
  uploaded_by_email: string;
  file_url: string | null;
  file_size_kb: number;
  mime_type: string;
  is_public: boolean;
  created_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type AdminEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  status: EventStatus;
  location: string;
  is_online: boolean;
  start_date: ISODateString;
  end_date: ISODateString;
  organizer_name: string;
  max_attendees: number | null;
  registered_count: number;
  created_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------

export type MembershipStatus = "active" | "expired" | "suspended" | "pending";
export type MembershipTier = "associate" | "member" | "senior" | "fellow";

export type AdminMembership = {
  id: string;
  member_name: string;
  member_email: string;
  tier: MembershipTier;
  status: MembershipStatus;
  start_date: ISODateString;
  expiry_date: ISODateString;
  membership_number: string;
  auto_renew: boolean;
  created_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Grievances
// ---------------------------------------------------------------------------

export type GrievanceStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "closed"
  | "rejected";

export type AdminGrievance = {
  id: string;
  reference_id: string;
  complainant_name: string;
  complainant_email: string;
  subject: string;
  description: string;
  status: GrievanceStatus;
  assigned_to_name: string | null;
  resolved_at: ISODateString | null;
  created_at: ISODateString;
};

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export type StatTrend = {
  value: number;
  direction: "up" | "down" | "neutral";
  label: string;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: number | string;
  trend: StatTrend | null;
  icon: string; // MUI icon name — used by StatCard to resolve icon
  color: string; // MUI color token e.g. "primary", "success", "warning", "error"
};

export type DashboardStats = {
  totalUsers: DashboardStat;
  totalAdvocates: DashboardStat;
  pendingKyc: DashboardStat;
  activeCases: DashboardStat;
  scheduledAppointments: DashboardStat;
  openGrievances: DashboardStat;
};

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

export type ActivityType =
  | "kyc_submitted"
  | "kyc_approved"
  | "kyc_rejected"
  | "case_filed"
  | "case_closed"
  | "appointment_scheduled"
  | "user_registered"
  | "grievance_filed";

export type RecentActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor_name: string;
  timestamp: ISODateString;
  metadata: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Services & Categories
// ---------------------------------------------------------------------------

export type AdminServiceCategory = {
  id: string;
  name: string;
  slug: string;
  value: string;
  is_active: boolean;
  display_order: number;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type AdminJusticeService = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  category: string;
  category_label: string;
  icon_name: string;
  who_it_is_for: string[];
  how_icj_helps: string[];
  available_assistance: string[];
  next_steps: string[];
  related_professionals: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: ISODateString;
  updated_at: ISODateString;
};

