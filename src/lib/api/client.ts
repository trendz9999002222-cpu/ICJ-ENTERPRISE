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
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

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
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    logger.error("Network request failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApiError(
      "Unable to connect to the server.",
      0,
      {
        message: error instanceof Error ? error.message : String(error),
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
    logger.error("API request failed", {
      url,
      status: response.status,
      statusText: response.statusText,
      data,
    });

    throw new ApiError(
      "API request failed",
      response.status,
      data,
    );
  }

  return data as T;
}