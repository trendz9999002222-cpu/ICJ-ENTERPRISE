"use client";

import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Button, Stack, Typography } from "@mui/material";

import type { DeliveryChannel } from "@/types/auth";

const OPTIONS: { id: DeliveryChannel; label: string; icon: React.ReactNode; activeBg: string }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon />, activeBg: "#16a34a" },
  { id: "sms", label: "SMS", icon: <SmsIcon />, activeBg: "#2563eb" },
  { id: "email", label: "Email", icon: <EmailIcon />, activeBg: "#7c3aed" },
];

type Props = {
  value: DeliveryChannel;
  onChange: (channel: DeliveryChannel) => void;
};

export default function DeliveryChannelSelector({ value, onChange }: Props) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e3a8a", mb: 1.5 }}>
        OTP / पासवर्ड भेजने का पसंदीदा माध्यम (Select Delivery Option):
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant={selected ? "contained" : "outlined"}
              startIcon={option.icon}
              onClick={() => onChange(option.id)}
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 auto" },
                minWidth: 110,
                fontWeight: 800,
                textTransform: "none",
                bgcolor: selected ? option.activeBg : "#fff",
                borderColor: selected ? option.activeBg : "#cbd5e1",
                color: selected ? "#fff" : "#334155",
                "&:hover": { bgcolor: selected ? option.activeBg : "#f8fafc" },
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
