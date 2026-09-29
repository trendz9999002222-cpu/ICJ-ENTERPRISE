export type HealthResponse = {
  status: "ok" | "degraded";
  database: boolean;
};

export type UserRole = "super_admin" | "admin" | "advocate" | "professional" | "client" | "member";

export type UserProfessionInfo = {
  registration_id: string;
  reference_id: string;
  category_name: string;
  group_name: string;
  profession_name: string;
  status: string;
  created_at?: string;
};

export type UserMembershipInfo = {
  application_id: string;
  reference_id: string;
  membership_type: string;
  status: string;
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
    default:
      return "/dashboard";
  }
}
