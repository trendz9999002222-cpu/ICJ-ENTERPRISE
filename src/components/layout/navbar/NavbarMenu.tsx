"use client";

import LockOpenIcon from "@mui/icons-material/LockOpen";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Button, Chip, Stack } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVBAR_CONFIG, getVisibleNavbarItems, type NavbarIcon } from "@/config/navbar";

const iconMap: Record<NavbarIcon, React.ElementType> = {
  search: SearchIcon,
  verify: VerifiedUserIcon,
  login: LockOpenIcon,
  phone: PhoneInTalkIcon,
};

export default function NavbarMenu() {
  const pathname = usePathname();
  const items = getVisibleNavbarItems(pathname);
  const HelplineIcon = iconMap[NAVBAR_CONFIG.helpline.icon];

  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.75, sm: 1, md: 1, lg: 1.5 }}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      <Chip
        icon={<HelplineIcon sx={{ color: "#34d399 !important" }} />}
        label={NAVBAR_CONFIG.helpline.label}
        sx={{
          bgcolor: "#064e3b",
          color: "#6ee7b7",
          fontWeight: 800,
          display: { xs: "none", xl: "inline-flex" },
          fontSize: "0.78rem",
        }}
      />
      {items.map((item) => {
        const Icon = item.icon ? iconMap[item.icon] : null;
        const isActive = pathname === item.href;
        const isContained = item.variant === "contained";

        return (
          <Button
            key={item.id}
            component={Link}
            href={item.href}
            variant={item.variant ?? "outlined"}
            size="small"
            startIcon={Icon ? <Icon /> : undefined}
            sx={{
              display: item.display ?? "inline-flex",
              color: isContained ? "#fff" : item.color,
              borderColor: item.borderColor,
              bgcolor: isContained ? (isActive ? "#1d4ed8" : "#2563eb") : "transparent",
              fontWeight: 800,
              textTransform: "none",
              fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.8rem", lg: "0.875rem" },
              px: { xs: 1, sm: 1.25, md: 1.5 },
              py: { xs: 0.5, md: 0.75 },
              minWidth: "auto",
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: item.borderColor,
                bgcolor: isContained ? "#1d4ed8" : "rgba(56, 189, 248, 0.08)",
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );
}
