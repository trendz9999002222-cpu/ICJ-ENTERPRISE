export const MEMBER_DASHBOARD_PATH = "/dashboard/member";

export const MEMBER_CHANGE_PASSWORD_QUERY = `${MEMBER_DASHBOARD_PATH}?changePassword=1`;

export function isMemberChangePasswordUrl(href: string): boolean {
  return href.includes("changePassword=1");
}
