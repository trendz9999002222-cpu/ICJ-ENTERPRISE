import React from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const COMMON_ICON_MAP = {
  GavelIcon,
  PersonIcon,
  FolderIcon,
  AccountBalanceWalletIcon,
  SettingsIcon,
  ShieldIcon,
  AutoAwesomeIcon,
};

/**
 * DynamicIcon — Fail-Safe Icon Resolver
 * Renders icons dynamically by name with an automatic fallback default,
 * ensuring zero runtime errors even for newly added icon names.
 */
function DynamicIcon({ name, iconComponent: IconComponent, fallback: Fallback = HelpOutlineIcon, sx = {}, ...props }) {
  if (IconComponent) {
    return <IconComponent sx={sx} {...props} />;
  }

  if (name && COMMON_ICON_MAP[name]) {
    const Component = COMMON_ICON_MAP[name];
    return <Component sx={sx} {...props} />;
  }

  return <Fallback sx={sx} {...props} />;
}

export default DynamicIcon;
