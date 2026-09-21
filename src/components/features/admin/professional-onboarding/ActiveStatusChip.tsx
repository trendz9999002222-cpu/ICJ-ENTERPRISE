"use client";

import { Chip } from "@mui/material";

type Props = { active: boolean };

export default function ActiveStatusChip({ active }: Props) {
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Inactive"}
      color={active ? "success" : "default"}
      variant={active ? "filled" : "outlined"}
      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
    />
  );
}
