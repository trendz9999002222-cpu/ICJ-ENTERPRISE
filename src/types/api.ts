export type HealthResponse = {
  status: "ok" | "degraded";
  database: boolean;
};

/** Canonical platform roles; legacy JWT values are normalized in `lib/roles.ts`. */
export type UserRole = "admin" | "professional" | "member" | "super_admin";

export type UserProfessionInfo = {
  registration_id: string;
  reference_id: string;
  profession_id?: string;
  category_name: string;
  group_name: string;
  profession_name: string;
  status: string;
  common_field_values?: Record<string, unknown>;
  profession_field_values?: Record<string, unknown>;
  created_at?: string;
};

export type UserMembershipInfo = {
  application_id: string;
  reference_id: string;
  membership_id?: string | null;
  membership_type: string;
  status: string;
  is_approved?: boolean;
};

export type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  roles?: UserRole[];
  professions?: UserProfessionInfo[];
  membership?: UserMembershipInfo | null;
  phone_number: string;
  mobile: string;
  profile_picture_url?: string | null;
  password_change_required: boolean;
  email_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
};

export type AuthTokens = {
  access: string;
  refresh: string;
  success?: boolean;
  message?: string;
  requires_password_change?: boolean;
  user?: User;
};

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/admin/dashboard";
    case "member":
      return "/dashboard/member";
    case "professional":
      return "/dashboard/professional";
    default:
      return "/dashboard";
  }
}
