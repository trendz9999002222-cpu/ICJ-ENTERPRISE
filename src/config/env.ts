const required = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ICJ Enterprise Platform",
  isProduction: process.env.NODE_ENV === "production",
};

export const getServerApiUrl = () =>
  required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
