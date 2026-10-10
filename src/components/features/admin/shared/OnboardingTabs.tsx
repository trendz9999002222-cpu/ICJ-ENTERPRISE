"use client";

import { Tab, Tabs, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OnboardingTabs({ type }: { type: "professional" | "membership" | "honorable" }) {
  const pathname = usePathname();

  let tabs = [];
  if (type === "professional") {
    tabs = [
      { label: "Common Fields", href: "/admin/professional-onboarding/common-fields" },
      { label: "Categories", href: "/admin/professional-onboarding/categories" },
      { label: "Groups", href: "/admin/professional-onboarding/groups" },
      { label: "Professions", href: "/admin/professional-onboarding/professions" },
      { label: "Profession Fields", href: "/admin/professional-onboarding/profession-fields" },
      { label: "Documents", href: "/admin/professional-onboarding/documents" },
    ];
  } else if (type === "membership") {
    tabs = [
      { label: "Common Fields", href: "/admin/membership-onboarding/common-fields" },
      { label: "Additional Fields", href: "/admin/membership-onboarding/form-builder" },
    ];
  } else if (type === "honorable") {
    tabs = [
      { label: "Common Fields", href: "/admin/honorable-advisory-onboarding/common-fields" },
      { label: "Additional Fields", href: "/admin/honorable-advisory-onboarding" },
    ];
  }

  let activeTab = tabs[0].href;
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
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={activeTab}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            minHeight: 40,
            py: 1,
            px: 3,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            marginRight: 0.5,
            bgcolor: "#f8fafc",
            color: "#64748b",
            transition: "all 0.2s",
            border: "1px solid transparent",
            borderBottom: "none",
            "&.Mui-selected": {
              bgcolor: "#fff",
              color: "#0f172a",
              borderTop: "3px solid #2563eb",
              borderLeft: "1px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
              boxShadow: "0 -2px 5px rgba(0,0,0,0.02)",
            },
            "&:hover:not(.Mui-selected)": {
              bgcolor: "#e2e8f0",
            },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.href}
            label={tab.label}
            value={tab.href}
            component={Link}
            href={tab.href}
          />
        ))}
      </Tabs>
    </Box>
  );
}
