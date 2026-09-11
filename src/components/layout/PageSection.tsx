import { Box } from "@mui/material";

import { PAGE_TOP_OFFSET } from "@/constants/layout";

type Props = {
  children: React.ReactNode;
  centered?: boolean;
};

export default function PageSection({ children, centered = false }: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 6 },
        scrollMarginTop: { xs: `${PAGE_TOP_OFFSET.xs}px`, md: `${PAGE_TOP_OFFSET.md}px` },
        display: centered ? "flex" : "block",
        justifyContent: centered ? "center" : undefined,
      }}
    >
      {children}
    </Box>
  );
}
