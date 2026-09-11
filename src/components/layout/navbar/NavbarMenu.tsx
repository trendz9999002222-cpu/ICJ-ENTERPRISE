"use client";

import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MenuIcon from "@mui/icons-material/Menu";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.matchMedia("(min-width: 1200px)").matches) setOpen(false);
    };
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  return (
    <>
      <Stack
        direction="row"
        spacing={{ lg: 1.5 }}
        sx={{
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          flexShrink: 0,
        }}
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
                color: isContained ? "#fff" : item.color,
                borderColor: item.borderColor,
                bgcolor: isContained ? (isActive ? "#1d4ed8" : "#2563eb") : "transparent",
                fontWeight: 800,
                textTransform: "none",
                fontSize: { lg: "0.875rem" },
                px: 1.5,
                py: 0.75,
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

      <IconButton
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        sx={{
          display: { xs: "inline-flex", lg: "none" },
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 2,
          width: 40,
          height: 40,
          "&:hover": { bgcolor: "rgba(56,189,248,0.12)" },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ zIndex: 1300 }}
        PaperProps={{
          sx: {
            width: { xs: "min(100%, 360px)", sm: 360 },
            bgcolor: "#0f172a",
            color: "#e2e8f0",
            backgroundImage: "none",
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>
            मेनू
          </Typography>
          <IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ px: 2, py: 2 }}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
              bgcolor: "#064e3b",
              color: "#6ee7b7",
              borderRadius: 2,
              px: 1.5,
              py: 1.25,
            }}
          >
            <HelplineIcon sx={{ color: "#34d399", fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.4 }}>
              {NAVBAR_CONFIG.helpline.label}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <List sx={{ px: 1, py: 1 }}>
          {items.map((item) => {
            const Icon = item.icon ? iconMap[item.icon] : null;
            const isActive = pathname === item.href;
            const isContained = item.variant === "contained";

            return (
              <ListItemButton
                key={item.id}
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: isContained ? "#fff" : item.color ?? "#e2e8f0",
                  bgcolor: isContained ? "#2563eb" : "transparent",
                  "&.Mui-selected": {
                    bgcolor: isContained ? "#1d4ed8" : "rgba(56,189,248,0.12)",
                  },
                  "&:hover": {
                    bgcolor: isContained ? "#1d4ed8" : "rgba(56,189,248,0.1)",
                  },
                }}
              >
                {Icon ? (
                  <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                    <Icon />
                  </ListItemIcon>
                ) : null}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 800, fontSize: "0.95rem" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
