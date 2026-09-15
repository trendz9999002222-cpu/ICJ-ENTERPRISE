/**
 * ICJ Contact Page — Data Source
 * All strings isolated here for future i18n / translator API integration.
 * Icons are identified by string keys and resolved in the component.
 */

export type ContactIconKey = "phone" | "email" | "location" | "time";

export interface OfficeDetail {
  iconKey: ContactIconKey;
  label: string;
  value: string;
}

export interface ContactData {
  pageTitle: string;
  pageSubtitle: string;
  officeName: string;
  officeDetails: OfficeDetail[];
  formTitle: string;
  formSubtitle: string;
  successTitle: string;
  successMessage: string;
}

export const CONTACT_DATA: ContactData = {
  pageTitle: "Contact Us",
  pageSubtitle:
    "Reach the ICJ National Secretariat for membership, legal assistance, academic inquiries, grievances, or institutional communications.",
  officeName: "ICJ National Secretariat — New Delhi",
  officeDetails: [
    {
      iconKey: "phone",
      label: "Main Helpline",
      value: "+91-9999002222",
    },
    {
      iconKey: "email",
      label: "General Inquiries",
      value: "consortiumofjurists@gmail.com",
    },
    {
      iconKey: "phone",
      label: "Connect Us",
      value: "+91-9717166436",
    },
    {
      iconKey: "location",
      label: "Address",
      value: "Shankar vihar Vikas Marg Delhi 110092",
    },
    {
      iconKey: "time",
      label: "Office Hours",
      value: "Mon – Sat: 11:00 AM – 6:00 PM",
    },
  ],
  formTitle: "Send Us a Message",
  formSubtitle:
    "Fill in the form below and the appropriate department will respond within 2 working days.",
  successTitle: "Message Received — Thank You",
  successMessage:
    "Your inquiry has been forwarded to the appropriate department. We will respond within 2 working days.",
};
