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
  emailjs: {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_rypannl",
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_pmntrjf",
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "_afNcmKvmFJoVdlI9",
  },
};

export const getServerApiUrl = () =>
  required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
