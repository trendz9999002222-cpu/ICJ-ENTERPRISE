"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

type Props = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        py: 3,
        mt: 2,
        borderTop: "1px solid #e2e8f0",
        width: "100%",
      }}
    >
      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8125rem" }}>
        Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong>–
        <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{" "}
        <strong>{totalItems}</strong> results
      </Typography>

      {/* Mobile Pagination Mode */}
      {isMobile ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            startIcon={<ChevronLeftIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "#cbd5e1",
              color: "#334155",
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              minWidth: 70,
            }}
          >
            Prev
          </Button>

          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", px: 1 }}>
            {currentPage} / {totalPages}
          </Typography>

          <Button
            size="small"
            variant="outlined"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "#cbd5e1",
              color: "#334155",
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              minWidth: 70,
            }}
          >
            Next
          </Button>
        </Stack>
      ) : (
        /* Desktop Pagination Mode */
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            startIcon={<ChevronLeftIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "#cbd5e1",
              color: "#334155",
              textTransform: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              mr: 0.5,
            }}
          >
            Previous
          </Button>

          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <Typography key={`dots-${idx}`} sx={{ px: 1, color: "#94a3b8", fontSize: "0.875rem" }}>
                  …
                </Typography>
              );
            }
            const isSelected = p === currentPage;
            return (
              <IconButton
                key={`page-${p}`}
                size="small"
                onClick={() => onPageChange(Number(p))}
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: "0.8125rem",
                  fontWeight: isSelected ? 800 : 600,
                  bgcolor: isSelected ? "#2563eb" : "transparent",
                  color: isSelected ? "#ffffff" : "#334155",
                  border: isSelected ? "none" : "1px solid #e2e8f0",
                  "&:hover": {
                    bgcolor: isSelected ? "#1d4ed8" : "#f1f5f9",
                  },
                }}
              >
                {p}
              </IconButton>
            );
          })}

          <Button
            size="small"
            variant="outlined"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "#cbd5e1",
              color: "#334155",
              textTransform: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              ml: 0.5,
            }}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  );
}
