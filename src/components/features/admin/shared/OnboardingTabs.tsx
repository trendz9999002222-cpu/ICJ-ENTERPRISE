"use client";

import React, { type ReactElement } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import BadgeIcon from "@mui/icons-material/Badge";
import BallotIcon from "@mui/icons-material/Ballot";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import DynamicFormIcon from "@mui/icons-material/DynamicForm";

interface OnboardingTabConfig {
  label: string;
  href: string;
  icon?: ReactElement;
}

export default function OnboardingTabs({ type }: { type: "professional" | "membership" | "honorable" | "assistance" }) {
  const pathname = usePathname();

  let tabs: OnboardingTabConfig[] = [];
  if (type === "professional") {
    tabs = [
      { label: "Common Fields", href: "/admin/professional-onboarding/common-fields", icon: <DescriptionIcon fontSize="small" /> },
      { label: "Wings (Categories)", href: "/admin/professional-onboarding/categories", icon: <CategoryIcon fontSize="small" /> },
      { label: "Groups", href: "/admin/professional-onboarding/groups", icon: <GroupWorkIcon fontSize="small" /> },
      { label: "Roles / Designations", href: "/admin/professional-onboarding/professions", icon: <BadgeIcon fontSize="small" /> },
      { label: "Wing Fields", href: "/admin/professional-onboarding/profession-fields", icon: <BallotIcon fontSize="small" /> },
      { label: "Documents", href: "/admin/professional-onboarding/documents", icon: <FolderSharedIcon fontSize="small" /> },
    ];
  } else if (type === "membership") {
    tabs = [
      { label: "Common Fields", href: "/admin/membership-onboarding/common-fields", icon: <DescriptionIcon fontSize="small" /> },
      { label: "Additional Fields", href: "/admin/membership-onboarding/form-builder", icon: <DynamicFormIcon fontSize="small" /> },
    ];
  } else if (type === "honorable") {
    tabs = [
      { label: "Common Fields", href: "/admin/honorable-advisory-onboarding/common-fields", icon: <DescriptionIcon fontSize="small" /> },
      { label: "Additional Fields", href: "/admin/honorable-advisory-onboarding", icon: <DynamicFormIcon fontSize="small" /> },
    ];
  } else if (type === "assistance") {
    tabs = [
      { label: "Citizen Details", href: "/admin/assistance-onboarding/common-fields", icon: <PersonIcon fontSize="small" /> },
      { label: "Legal Matter Information", href: "/admin/assistance-onboarding/legal-matter", icon: <GavelIcon fontSize="small" /> },
      { label: "Supporting Documents", href: "/admin/assistance-onboarding/documents", icon: <FolderSharedIcon fontSize="small" /> },
    ];
  }

  let activeTab = tabs[0]?.href || "";
  let maxMatchLength = 0;
  for (const t of tabs) {
    if (pathname === t.href || pathname.startsWith(t.href + "/")) {
      if (t.href.length > maxMatchLength) {
        maxMatchLength = t.href.length;
        activeTab = t.href;
      }
    }
  }

  return (
    <Box sx={{ borderBottom: "1px solid #e2e8f0", mb: 3 }}>
      <Tabs
        value={activeTab}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            minHeight: 44,
            px: 2.5,
            color: "#475569",
            "&.Mui-selected": {
              color: "primary.main",
              fontWeight: 700,
            },
            "&:hover": {
              color: "#1e293b",
            },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            bgcolor: "primary.main",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.href}
            label={tab.label}
            value={tab.href}
            icon={tab.icon}
            iconPosition="start"
            component={Link}
            href={tab.href}
          />
        ))}
      </Tabs>
    </Box>
  );
}
