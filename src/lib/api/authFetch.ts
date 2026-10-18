import { env } from "@/config/env";

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = 604800) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function isJwtExpired(token: string, bufferSeconds: number = 30): boolean {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    if (typeof payload.exp === "number") {
      return Date.now() >= (payload.exp - bufferSeconds) * 1000;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Ensures a valid access token is available. If expired or near expiration,
 * automatically calls /auth/refresh/ using the refresh token.
 */
export async function getFreshAccessToken(forceRefresh: boolean = false): Promise<string | null> {
  let accessToken = readCookie("icj_access_token");
  const refreshToken = readCookie("icj_refresh_token");

  if (!forceRefresh && accessToken && !isJwtExpired(accessToken)) {
    return accessToken;
  }

  // If access token is expired or forced, try to refresh
  if (refreshToken && !isJwtExpired(refreshToken)) {
    try {
      const res = await fetch(`${env.apiUrl}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const json = await res.json();
        const newAccess = json?.data?.access || json?.access;
        if (newAccess) {
          setCookie("icj_access_token", newAccess, 86400); // 1 day
          return newAccess;
        }
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
  }

  return accessToken || null;
}

/**
 * Fetch wrapper that attaches Authorization header and automatically
 * retries once on 401 Unauthorized by refreshing the token.
 */
export async function authenticatedFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  let token = await getFreshAccessToken();

  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...init,
    headers,
  });

  // If 401 Unauthorized, token might be expired. Force refresh and retry once.
  if (response.status === 401) {
    const refreshedToken = await getFreshAccessToken(true);
    if (refreshedToken && refreshedToken !== token) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, {
        ...init,
        headers,
      });
    }
  }

  return response;
}
