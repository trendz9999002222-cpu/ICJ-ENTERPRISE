import { getRouteAccessMap } from "./permissions";
import { normalizeRoleCode } from "./roles";

const normalizePath = (path = "/") => {
  const cleaned = String(path || "/").trim();
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

export const hasRouteAccess = (role, path) => {
  const normalizedRole = normalizeRoleCode(role);
  const roleAccess = getRouteAccessMap();
  const allowedPaths = roleAccess[normalizedRole] || roleAccess.member;
  if (allowedPaths.includes("*")) return true;

  const normalizedPath = normalizePath(path);
  return allowedPaths.some((allowedPath) => {
    const normalizedAllowed = normalizePath(allowedPath);
    return normalizedPath === normalizedAllowed || normalizedPath.startsWith(`${normalizedAllowed}/`);
  });
};

export const getRoleAccessMap = () => getRouteAccessMap();
