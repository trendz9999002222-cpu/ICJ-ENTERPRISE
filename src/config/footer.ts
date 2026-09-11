import footerData from "@/data/footer.json";

export type FooterContactItem = {
  id: string;
  label: string;
  href: string;
  icon: "web" | "phone" | "email" | "clock";
};

export type FooterLegalLink = {
  id: string;
  label: string;
  href: string;
};

export const FOOTER_BRAND = footerData.brand;

export const FOOTER_CONTACT: FooterContactItem[] = footerData.contact as FooterContactItem[];

export const FOOTER_LEGAL_LINKS: FooterLegalLink[] = footerData.legalLinks as FooterLegalLink[];

export const FOOTER_COPYRIGHT = footerData.copyright;
