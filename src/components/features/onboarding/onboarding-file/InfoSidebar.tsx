"use client";

import CheckIcon from "@mui/icons-material/Check";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Box, Link as MuiLink, Stack, Typography } from "@mui/material";

import type { Sidebar, Theme } from "@/types/registration";

import { RADIUS } from "./iconMap";

type Props = {
  sidebar: Sidebar;
  theme: Theme;
  registeringAs: string;
  contextLine: string;
  onChangeSelection: () => void;
};

function Panel({
  icon,
  title,
  bg,
  border,
  iconColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  bg: string;
  border: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ borderRadius: RADIUS.md, bgcolor: bg, border: `1px solid ${border}`, p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
        <Box sx={{ color: iconColor, display: "flex" }}>{icon}</Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{title}</Typography>
      </Stack>
      {children}
    </Box>
  );
}

export default function InfoSidebar({ sidebar, theme, registeringAs, contextLine, onChangeSelection }: Props) {
  return (
    <Stack spacing={2}>
      <Panel
        icon={<VerifiedUserIcon fontSize="small" />}
        title="You are registering as"
        bg="#ecfdf5"
        border="#bbf7d0"
        iconColor="#15803d"
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: theme.color }}>{registeringAs}</Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#475569", mt: 0.25 }}>{contextLine}</Typography>
        <MuiLink
          component="button"
          type="button"
          onClick={onChangeSelection}
          sx={{ mt: 1, fontSize: "0.83rem", fontWeight: 600, color: theme.color }}
        >
          Change selection
        </MuiLink>
      </Panel>

      <Panel
        icon={<LightbulbIcon fontSize="small" />}
        title="Guidelines"
        bg="#fffbeb"
        border="#fde68a"
        iconColor="#a16207"
      >
        <Box component="ol" sx={{ m: 0, pl: 2.25, display: "flex", flexDirection: "column", gap: 0.85 }}>
          {sidebar.guidelines.map((g) => (
            <Typography key={g} component="li" sx={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.5 }}>
              {g}
            </Typography>
          ))}
        </Box>
      </Panel>

      <Panel
        icon={<SettingsIcon fontSize="small" />}
        title="Why register with ICJ?"
        bg="#f8fafc"
        border="#e2e8f0"
        iconColor={theme.color}
      >
        <Stack spacing={1}>
          {sidebar.whyRegister.map((w) => (
            <Stack key={w} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <CheckIcon sx={{ fontSize: 17, color: "#2563eb", mt: "2px" }} />
              <Typography sx={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.5 }}>{w}</Typography>
            </Stack>
          ))}
        </Stack>
      </Panel>

      <Panel
        icon={<LockIcon fontSize="small" />}
        title="Your data is secure"
        bg="#eff6ff"
        border="#bfdbfe"
        iconColor="#1d4ed8"
      >
        <Typography sx={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.55 }}>{sidebar.security}</Typography>
      </Panel>
    </Stack>
  );
}
