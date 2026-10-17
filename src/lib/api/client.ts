import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** When true, failed responses are not written to the error logger (caller handles fallback). */
  suppressErrorLog?: boolean;
};

type FormDataRequestOptions = Omit<RequestInit, "body"> & {
  formData: FormData;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, suppressErrorLog, ...rest } = options;

  const url = `${env.apiUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body:
        body !== undefined
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
    });
  } catch (error) {
    logger.error("Network request failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApiError(
      "Unable to reach the API. Confirm Django is running (e.g. python manage.py runserver 8000) and that CORS allows your frontend origin (localhost and 127.0.0.1 on port 3000).",
      0,
      {
        message: error instanceof Error ? error.message : String(error),
        url,
      },
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    if (!suppressErrorLog) {
      if (response.status >= 500) {
        logger.error("API request failed (server error)", {
          url,
          status: response.status,
          statusText: response.statusText,
          data,
        });
      } else {
        logger.warn("API request failed (client error)", {
          url,
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
    }

    throw new ApiError(
      "API request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

export async function apiClientFormData<T>(
  path: string,
  options: FormDataRequestOptions,
): Promise<T> {
  const { formData, headers, ...rest } = options;
  const url = `${env.apiUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body: formData,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.error("Network request failed", { url, error: detail });
    throw new ApiError(
      "Unable to connect to the API. Check that the backend is running and CORS allows this site.",
      0,
      { message: detail },
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    if (response.status >= 500) {
      logger.error("API request failed (server error)", { url, status: response.status, data });
    } else {
      logger.warn("API request failed (client error)", { url, status: response.status, data });
    }
    throw new ApiError("API request failed", response.status, data);
  }

  return data as T;
}

export function readAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)icj_access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}