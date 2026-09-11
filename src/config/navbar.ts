/**
 * Navbar configuration — update links, labels, and visibility here only.
 * Component code reads from this file; no hardcoded nav items in UI files.
 */

export type NavbarIcon = "search" | "verify" | "login" | "phone";

export type NavbarItem = {
  id: string;
  label: string;
  href: string;
  icon?: NavbarIcon;
  variant?: "outlined" | "contained";
  color?: string;
  borderColor?: string;
  hideOn?: string[];
  showOn?: string[];
  display?: { xs?: string; sm?: string; md?: string; lg?: string };
};

export const NAVBAR_CONFIG = {
  brand: {
    title: "INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)",
    subtitle: "अखिल भारतीय विधिक सहायता एवं 140 करोड़ नागरिक डिजिटल न्याय मंच",
    homeHref: "/",
  },
  helpline: {
    label: "24x7: +91 7053002222 / 9999002222",
    icon: "phone" as NavbarIcon,
  },
  items: ([
    {
      id: "track-case",
      label: "केस ट्रैक करें",
      href: "/track-case",
      icon: "search",
      variant: "outlined",
      color: "#38bdf8",
      borderColor: "#38bdf8",
      display: { xs: "none", md: "inline-flex" },
    },
    {
      id: "verify-certificate",
      label: "सर्टिफिकेट सत्यापन",
      href: "/verify-certificate",
      icon: "verify",
      variant: "outlined",
      color: "#fbbf24",
      borderColor: "#fbbf24",
      display: { xs: "none", lg: "inline-flex" },
    },
    {
      id: "login",
      label: "लॉगिन (Sign In)",
      href: "/login",
      icon: "login",
      variant: "contained",
      hideOn: ["/login"],
    },
  ] as NavbarItem[]),
};

export function getVisibleNavbarItems(pathname: string): NavbarItem[] {
  return NAVBAR_CONFIG.items.filter((item) => {
    if (item.hideOn?.some((path) => pathname.startsWith(path))) return false;
    if (item.showOn?.length && !item.showOn.some((path) => pathname.startsWith(path))) return false;
    return true;
  });
}
