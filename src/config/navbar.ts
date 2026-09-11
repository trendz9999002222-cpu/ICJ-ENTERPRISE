import navbarData from "@/data/navbar.json";

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
  brand: navbarData.brand,
  helpline: {
    label: navbarData.helpline.label,
    icon: navbarData.helpline.icon as NavbarIcon,
  },
  items: navbarData.items as NavbarItem[],
};

export function getVisibleNavbarItems(pathname: string): NavbarItem[] {
  return NAVBAR_CONFIG.items.filter((item) => {
    if (item.hideOn?.some((path) => pathname.startsWith(path))) return false;
    if (item.showOn?.length && !item.showOn.some((path) => pathname.startsWith(path))) return false;
    return true;
  });
}
