import { env } from "@/config/env";

/** Resolve relative `/media/...` paths from the API to a browser-loadable URL. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const backendBase = env.apiUrl.replace(/\/api\/v1\/?$/i, "");
  return `${backendBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
