import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { env } from "@/config/env";
import ThemeRegistry from "@/theme/ThemeRegistry";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: env.appName,
  icons: {
    icon: "/images/icj-logo.png",
  },
  description: "International Consortium of Jurists — Enterprise Legal Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (



    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
