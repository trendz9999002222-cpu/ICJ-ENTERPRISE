"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Box, Breadcrumbs, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
};

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  primaryAction,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        py: { xs: 3.5, sm: 4.5, md: 5 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumb row */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<ChevronRightIcon sx={{ fontSize: 14, color: "#94a3b8" }} />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.8125rem",
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Home
            </Link>

            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast || !item.href ? (
                <Typography
                  key={`crumb-${idx}`}
                  sx={{
                    color: "#0f172a",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Typography>
              ) : (
                <Link
                  key={`crumb-${idx}`}
                  href={item.href}
                  style={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Title + Actions Row */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          <Box sx={{ maxWidth: { xs: "100%", md: 800 } }}>
            {badge && (
              <Box
                sx={{
                  display: "inline-block",
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 1,
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  mb: 1,
                }}
              >
                {badge}
              </Box>
            )}

            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "1.65rem", sm: "2.1rem", md: "2.4rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                mb: subtitle ? 1 : 0,
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: "#475569",
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          {(primaryAction || secondaryAction) && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                width: { xs: "100%", sm: "auto" },
                alignItems: "stretch",
                flexShrink: 0,
              }}
            >
              {secondaryAction && (
                <Button
                  component={Link}
                  href={secondaryAction.href}
                  variant="outlined"
                  startIcon={secondaryAction.icon}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                  }}
                >
                  {secondaryAction.label}
                </Button>
              )}

              {primaryAction && (
                <Button
                  component={Link}
                  href={primaryAction.href}
                  variant="contained"
                  startIcon={primaryAction.icon}
                  sx={{
                    bgcolor: "#2563eb",
                    color: "#ffffff",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  {primaryAction.label}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
