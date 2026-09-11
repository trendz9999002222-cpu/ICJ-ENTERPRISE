export type HealthResponse = {
  status: "ok" | "degraded";
  database: boolean;
};

export type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  mobile: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};
