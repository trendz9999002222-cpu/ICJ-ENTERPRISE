"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Link, Stack, Typography } from "@mui/material";

import { FOOTER_CONTACT, type FooterContactItem } from "@/config/footer";

const iconMap = {
  web: LanguageIcon,
  phone: PhoneIcon,
  email: EmailIcon,
  clock: AccessTimeIcon,
};

function ContactRow({ item }: { item: FooterContactItem }) {
  const Icon = iconMap[item.icon];
  const isExternal = item.href.startsWith("http") || item.href.startsWith("mailto:") || item.href.startsWith("tel:");

  return (
    <Link
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      underline="hover"
      sx={{ display: "flex", alignItems: "center", gap: 1, color: "#cbd5e1", fontSize: "0.9rem" }}
    >
      <Icon sx={{ fontSize: 18, color: "#38bdf8" }} />
      {item.label}
    </Link>
  );
}

export default function FooterContact() {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>
        त्वरित संपर्क व सहायता
      </Typography>
      <Stack spacing={1.2}>
        {FOOTER_CONTACT.map((item) => (
          <ContactRow key={item.id} item={item} />
        ))}
      </Stack>
    </Box>
  );
}
